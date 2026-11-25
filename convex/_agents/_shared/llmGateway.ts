"use node";

/**
 * Convex AI Gateway routing for Together-hosted chat models (CHAT_VIA_GATEWAY=1).
 * The gateway serves the same OpenAI-compatible chat/completions shape, so the existing
 * request-body builder and response parsing carry over; only the endpoint, auth (a
 * short-lived deployment service token minted per request, no stored provider key), and
 * the model id namespace (`Qwen/Qwen3.5-9B` → `qwen/qwen3.5-9b`) change. While
 * TOGETHER_AI_API_KEY is still set, a gateway failure falls back to the direct Together
 * call (Together as the backstop); with no key the gateway is the only route and its
 * errors propagate. Flag unset (self-hosted default) keeps the direct Together path.
 */

import { getServiceToken } from "convex/server";
import { createServiceLogger } from "../../_lib/logging/serviceLogger";

export const GATEWAY_API_BASE = "https://ai-gateway.convex.dev/v1";
export const GATEWAY_CHAT_COMPLETIONS_URL = `${GATEWAY_API_BASE}/chat/completions`;

/** Read per request (not via the static env object) so tests can stub it. */
export function chatViaGateway(): boolean {
  return /^(1|true|yes)$/i.test(process.env.CHAT_VIA_GATEWAY ?? "");
}

/**
 * Together model-id prefixes → gateway provider prefixes; unmapped prefixes lowercase.
 * Covers every id selectable in the chat model picker
 * (apps/web/src/shared/constants/models.ts) plus the studio LLM env defaults.
 */
const MODEL_PREFIX_MAP: Record<string, string> = {
  Qwen: "qwen",
  "deepseek-ai": "deepseek",
  openai: "openai",
  "meta-llama": "meta-llama",
  mistralai: "mistralai",
  togethercomputer: "togethercomputer",
  // Together namespace ≠ gateway namespace for these providers.
  MiniMaxAI: "minimax",
  "zai-org": "z-ai",
};

export function mapGatewayModelId(model: string): string {
  const slash = model.indexOf("/");
  if (slash === -1) return model;
  const prefix = model.slice(0, slash);
  // Gateway ids are all-lowercase (`qwen/qwen3.5-9b`, `deepseek/deepseek-v4.1-flash`).
  const mapped = MODEL_PREFIX_MAP[prefix] ?? prefix.toLowerCase();
  return `${mapped}${model.slice(slash).toLowerCase()}`;
}

/** Mint a short-lived gateway token; only callable inside an action. */
export async function gatewayServiceToken(): Promise<string> {
  return getServiceToken("ai-gateway");
}

/**
 * LangChain-compatible fetch for chat requests: route through the gateway with the
 * gateway model id, and when the gateway fails (non-2xx or network error) retry the same
 * request directly against Together with the original model id — while a Together API
 * key is available. The client keeps the original Together model id; this fetch rewrites
 * the body's `model` field per route, so no inverse mapping is needed.
 */
export function createGatewayChatFetch(
  originalModel: string,
  togetherApiKey: () => string
): (input: RequestInfo | URL, init?: RequestInit) => Promise<Response> {
  const logger = createServiceLogger("ai-gateway", "createGatewayChatFetch");

  /** Rewrite the body's model field, or pass the body through when it is not JSON. */
  const withModel = (body: unknown, model: string): BodyInit | null | undefined => {
    if (typeof body !== "string") return body as BodyInit | null | undefined;
    try {
      const parsed = JSON.parse(body) as Record<string, unknown>;
      if (parsed && typeof parsed === "object" && "model" in parsed) {
        return JSON.stringify({ ...parsed, model });
      }
    } catch {
      // Non-JSON body: send as-is.
    }
    return body;
  };

  const togetherFetch = async (input: RequestInfo | URL, init: RequestInit) => {
    const apiKey = togetherApiKey();
    if (!apiKey) return null;
    const url = new URL(String(input));
    url.host = "api.together.xyz";
    const headers = new Headers(init.headers);
    headers.set("Authorization", `Bearer ${apiKey}`);
    return fetch(url, { ...init, headers, body: withModel(init.body, originalModel) });
  };

  return async (input: RequestInfo | URL, init?: RequestInit) => {
    const requestInit = init ?? {};
    try {
      const token = await gatewayServiceToken();
      const headers = new Headers(requestInit.headers);
      headers.set("Authorization", `Bearer ${token}`);
      const response = await fetch(input, {
        ...requestInit,
        headers,
        body: withModel(requestInit.body, mapGatewayModelId(originalModel)),
      });
      if (response.ok || !togetherApiKey()) return response;
    } catch (error) {
      if (!togetherApiKey()) throw error;
    }
    // Gateway failed and a Together key is available: retry the same request direct.
    logger.warn("Gateway chat request failed; falling back to the direct Together API", {
      model: originalModel,
    });
    const retried = await togetherFetch(input, requestInit);
    if (retried) return retried;
    // togetherApiKey() became empty between checks — surface a clean error.
    throw new Error("ai-gateway chat request failed with no Together fallback available");
  };
}

/** POST a chat-completions body to the gateway. Streaming and non-streaming (JSON or SSE). */
export async function gatewayChatCompletions(
  body: Record<string, unknown>,
  opts: { signal?: AbortSignal } = {}
): Promise<Response> {
  const token = await gatewayServiceToken();
  return fetch(GATEWAY_CHAT_COMPLETIONS_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(body),
    signal: opts.signal,
  });
}

/** One parsed SSE chunk: OpenAI streaming shape (`choices[].delta.content`, final `usage`). */
export type GatewayStreamChunk = {
  choices?: Array<{ delta?: { content?: string } }>;
  usage?: unknown;
};

/**
 * Stream a chat completion from the gateway as parsed SSE chunks. Same iteration shape
 * as the Together SDK's `chat.completions.create({stream: true})` — usage arrives on a
 * final chunk when `stream_options.include_usage` is set — so callers can swap the two.
 * Non-2xx responses throw with the status and a body snippet.
 */
export async function* streamGatewayChatCompletions(
  body: Record<string, unknown>,
  opts: { signal?: AbortSignal } = {}
): AsyncGenerator<GatewayStreamChunk> {
  const response = await gatewayChatCompletions(body, opts);
  if (!response.ok) {
    const text = await response.text().catch(() => "");
    throw new Error(`ai-gateway chat stream failed: HTTP ${response.status} ${text.slice(0, 200)}`);
  }
  if (!response.body) {
    throw new Error("ai-gateway chat stream returned no body");
  }
  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffered = "";
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    buffered += decoder.decode(value, { stream: true });
    const lines = buffered.split("\n");
    buffered = lines.pop() ?? "";
    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed.startsWith("data:")) continue;
      const data = trimmed.slice(5).trim();
      if (!data || data === "[DONE]") continue;
      try {
        yield JSON.parse(data) as GatewayStreamChunk;
      } catch {
        // Skip keepalives and non-JSON server comments.
      }
    }
  }
}
