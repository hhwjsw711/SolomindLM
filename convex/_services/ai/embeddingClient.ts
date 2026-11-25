"use node";

import { getServiceToken } from "convex/server";
import { v } from "convex/values";
import { invokeWithHttpRetry } from "../../_agents/_shared/retry";
import { internal } from "../../_generated/api";
import { action, internalAction } from "../../_generated/server";
import {
  EMBEDDING_BATCH_SIZE,
  EMBEDDING_DIMENSIONS,
  EMBEDDING_MODEL,
} from "../../_lib/embeddingConfig";
import { createExternalServiceErrorFromResponse } from "../../_lib/errors";
import { createServiceLogger } from "../../_lib/logging/serviceLogger";
import { getAuthUserId } from "../../auth";
import { CACHE_TTL } from "../cache/cache";
import { createCachedAction } from "../cache/cachedAgent";

/** Convex AI Gateway embeddings endpoint (OpenAI-compatible request/response shape). */
const GATEWAY_EMBEDDINGS_URL = "https://ai-gateway.convex.dev/v1/embeddings";

/**
 * Whether embeddings route through the Convex AI Gateway instead of OpenAI directly
 * (`EMBEDDINGS_VIA_GATEWAY=1`). The gateway serves `openai/${EMBEDDING_MODEL}` with the same
 * OpenAI embeddings shape (dimensions is a forwarded field), so vectors stay 1536-dim for the
 * `documentChunks.by_embedding` index. Auth is a short-lived deployment token minted inside
 * the action (`getServiceToken`), so no provider key is stored — requires `convex` 1.45+ and
 * a Convex team with AI Gateway access; self-hosted deployments leave it unset and use the
 * OPENAI_API_KEY path.
 */
function embeddingsViaGateway(): boolean {
  return /^(1|true|yes)$/i.test(process.env.EMBEDDINGS_VIA_GATEWAY ?? "");
}

/** Parse an OpenAI-shaped embeddings body into vectors in request order. */
function parseEmbeddingsResponse(
  data: { data?: Array<{ index: number; embedding: number[] }> },
  inputs: string[]
): number[][] {
  if (!Array.isArray(data.data) || data.data.length !== inputs.length) {
    throw new Error(
      `embeddings API returned ${data.data?.length ?? 0} vectors, expected ${inputs.length}`
    );
  }
  return [...data.data].sort((a, b) => a.index - b.index).map((d) => d.embedding);
}

/** Embeddings via the Convex AI Gateway, authenticated with a per-request service token. */
async function callGatewayEmbeddings(inputs: string[]): Promise<number[][]> {
  return await invokeWithHttpRetry(async () => {
    // Minted per attempt: the runtime caches the token and refreshes it near expiry, and a
    // long action that outlives one token gets a fresh one. Only callable mid-action.
    const token = await getServiceToken("ai-gateway");
    const response = await fetch(GATEWAY_EMBEDDINGS_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        model: `openai/${EMBEDDING_MODEL}`,
        input: inputs,
        dimensions: EMBEDDING_DIMENSIONS,
      }),
    });

    if (!response.ok) {
      const errBody = await response.text();
      throw createExternalServiceErrorFromResponse(
        "ai-gateway",
        response.status,
        "/v1/embeddings",
        errBody.slice(0, 400)
      );
    }

    return parseEmbeddingsResponse(await response.json(), inputs);
  }, "ai_gateway_embedding");
}

/**
 * The one implementation of "call OpenAI's embeddings endpoint." Everything
 * else in this file (the direct-use class and the cacheable Convex actions)
 * calls into this. Returns vectors in the same order as `inputs`.
 *
 * With `EMBEDDINGS_VIA_GATEWAY` set, routes through the Convex AI Gateway first and falls
 * back to the direct OpenAI call while an API key is available, so ingestion survives a
 * gateway outage. `apiKey` may be empty: then the gateway is the only route and its failures
 * propagate.
 */
export async function callOpenAIEmbeddings(inputs: string[], apiKey: string): Promise<number[][]> {
  if (inputs.length === 0) {
    return [];
  }

  if (embeddingsViaGateway()) {
    try {
      return await callGatewayEmbeddings(inputs);
    } catch (error) {
      if (!apiKey) throw error;
      createServiceLogger("ai_gateway", "callOpenAIEmbeddings").warn(
        "Gateway embeddings failed; falling back to the direct OpenAI API key",
        { vectors: inputs.length, error: error instanceof Error ? error.message : String(error) }
      );
    }
  }

  if (!apiKey) {
    throw new Error(
      "OPENAI_API_KEY is not set (or set EMBEDDINGS_VIA_GATEWAY=1 to route embeddings through the Convex AI Gateway)"
    );
  }

  return await invokeWithHttpRetry(async () => {
    const response = await fetch("https://api.openai.com/v1/embeddings", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: EMBEDDING_MODEL,
        input: inputs,
        dimensions: EMBEDDING_DIMENSIONS,
      }),
    });

    if (!response.ok) {
      const errBody = await response.text();
      throw createExternalServiceErrorFromResponse(
        "openai",
        response.status,
        "/v1/embeddings",
        errBody.slice(0, 400)
      );
    }

    return parseEmbeddingsResponse(await response.json(), inputs);
  }, "openai_embedding");
}

/** Direct-use client for `"use node"` actions (chat, search, research, migrations). */
export class EmbeddingService {
  private readonly apiKey: string;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  async embedText(text: string): Promise<number[]> {
    const [vector] = await callOpenAIEmbeddings([text.trim()], this.apiKey);
    return vector;
  }

  async embedBatch(texts: string[]): Promise<number[][]> {
    const embeddings: number[][] = [];
    for (let i = 0; i < texts.length; i += EMBEDDING_BATCH_SIZE) {
      const batch = texts.slice(i, i + EMBEDDING_BATCH_SIZE).map((t) => t.trim());
      embeddings.push(...(await callOpenAIEmbeddings(batch, this.apiKey)));
    }
    return embeddings;
  }
}

// ============================================================
// Convex action layer — kept as real actions because
// @convex-dev/action-cache wraps a FunctionReference, not a
// plain function.
// ============================================================

export const generateEmbeddingInternal = internalAction({
  args: { text: v.string() },
  handler: async (_, { text }): Promise<number[]> => {
    const logger = createServiceLogger("openai", "generateEmbeddingInternal");
    // May be empty with EMBEDDINGS_VIA_GATEWAY=1: the gateway route needs no key, and
    // callOpenAIEmbeddings throws only when neither route is available.
    const apiKey = process.env.OPENAI_API_KEY || "";
    logger.operationStart({ inputChars: text.length });
    try {
      const [embedding] = await callOpenAIEmbeddings([text], apiKey);
      logger.operationComplete({ dims: embedding.length });
      return embedding;
    } catch (error) {
      logger.operationError(error);
      throw error;
    }
  },
});

export const generateEmbeddingsBatchInternal = internalAction({
  args: { texts: v.array(v.string()) },
  handler: async (_, { texts }): Promise<number[][]> => {
    if (texts.length === 0) {
      return [];
    }
    const logger = createServiceLogger("openai", "generateEmbeddingsBatchInternal");
    // May be empty with EMBEDDINGS_VIA_GATEWAY=1: see generateEmbeddingInternal.
    const apiKey = process.env.OPENAI_API_KEY || "";
    logger.operationStart({ batchSize: texts.length });
    try {
      const vectors = await callOpenAIEmbeddings(texts, apiKey);
      logger.operationComplete({ count: vectors.length, dims: vectors[0]?.length });
      return vectors;
    } catch (error) {
      logger.operationError(error);
      throw error;
    }
  },
});

const embeddingCache = createCachedAction(
  internal._services.ai.embeddingClient.generateEmbeddingInternal,
  {
    ttl: CACHE_TTL.embedding,
    // Bumped from the E5-era "embeddingsV4-e5-900cap" so no stale E5-cached
    // vector can leak through this cache path after the provider cutover.
    name: "embeddingsV5-openai-3small-1536",
  }
);

export const generateEmbedding = action({
  args: { text: v.string() },
  handler: async (ctx, args): Promise<number[]> => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Unauthenticated");
    }
    const normalizedText = args.text.trim();
    const result = await embeddingCache.fetch(ctx, { text: normalizedText });
    return result as number[];
  },
});

export const generateEmbeddingsBatch = action({
  args: { texts: v.array(v.string()) },
  handler: async (ctx, args): Promise<number[][]> => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Unauthenticated");
    }
    const normalizedTexts = args.texts.map((text) => text.trim());
    const uniqueTexts = Array.from(new Set(normalizedTexts));

    const textToIndex = new Map<string, number[]>();
    normalizedTexts.forEach((text, idx) => {
      if (!textToIndex.has(text)) {
        textToIndex.set(text, []);
      }
      textToIndex.get(text)!.push(idx);
    });

    const uniqueEmbeddings: number[][] = [];
    for (let off = 0; off < uniqueTexts.length; off += EMBEDDING_BATCH_SIZE) {
      const batch = uniqueTexts.slice(off, off + EMBEDDING_BATCH_SIZE);
      const part = await ctx.runAction(
        internal._services.ai.embeddingClient.generateEmbeddingsBatchInternal,
        { texts: batch }
      );
      uniqueEmbeddings.push(...part);
    }

    if (uniqueEmbeddings.length !== uniqueTexts.length) {
      throw new Error(
        `embeddings length mismatch: got ${uniqueEmbeddings.length}, expected ${uniqueTexts.length}`
      );
    }

    const results: number[][] = new Array(normalizedTexts.length);
    uniqueTexts.forEach((text, uniqueIdx) => {
      const originalIndices = textToIndex.get(text)!;
      const embedding = uniqueEmbeddings[uniqueIdx]!;
      originalIndices.forEach((idx) => {
        results[idx] = embedding;
      });
    });

    return results;
  },
});
