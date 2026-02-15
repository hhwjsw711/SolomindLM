"use node";
/**
 * Cached LLM Service
 *
 * Provides caching for deterministic LLM calls (temperature=0).
 * Non-deterministic calls bypass cache and go directly to the LLM.
 */

import { internalAction } from "../../../_generated/server";
import { v } from "convex/values";
import { createCachedAction } from "../../cachedAgent";
import { CACHE_TTL, withJitter } from "../../cache";
import { hashInput } from "../../cacheCrypto";
import { internal } from "../../../_generated/api";
import { env } from "../../helpers/env";

// ============================================================
// Types
// ============================================================

export interface LLMMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

export interface LLMOptions {
  model: string;
  messages: LLMMessage[];
  temperature: number;
  maxTokens?: number;
  responseFormat?: { type: "text" | "json_object" };
}

export interface LLMResponse {
  content: string;
  usage?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
}

// ============================================================
// Internal Action (makes actual API call)
// ============================================================

export const llmInternal = internalAction({
  args: {
    model: v.string(),
    messages: v.array(v.object({
      role: v.string(),
      content: v.string(),
    })),
    temperature: v.number(),
    maxTokens: v.optional(v.number()),
    responseFormat: v.optional(v.object({ type: v.string() })),
  },
  handler: async (_, args) => {
    const apiKey = env.TOGETHER_AI_API_KEY;
    if (!apiKey) {
      throw new Error("TOGETHER_AI_API_KEY is not configured");
    }

    const response = await fetch("https://api.together.xyz/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: args.model,
        messages: args.messages,
        temperature: args.temperature,
        max_tokens: args.maxTokens,
        response_format: args.responseFormat,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`LLM API error: ${response.status} - ${error}`);
    }

    const data = await response.json() as any;

    return {
      content: data.choices[0]?.message?.content ?? "",
      usage: data.usage ? {
        promptTokens: data.usage.prompt_tokens,
        completionTokens: data.usage.completion_tokens,
        totalTokens: data.usage.total_tokens,
      } : undefined,
    };
  },
});

// ============================================================
// Cached Wrapper
// ============================================================

const llmCache = createCachedAction(
  internal.lib.agents.shared.cachedLlm.llmInternal,
  { ttl: withJitter(CACHE_TTL.generatedContent, 0.1), name: "llm-deterministic" }
);

// ============================================================
// Public Functions
// ============================================================

/**
 * Cached LLM call - only caches when temperature=0 (deterministic)
 * 
 * @param ctx - Convex context
 * @param options - LLM options including model, messages, temperature
 * @returns LLM response with content and usage stats
 */
export async function cachedLlmCall(
  ctx: any,
  options: LLMOptions
): Promise<LLMResponse> {
  // Skip caching for non-deterministic calls
  if (options.temperature > 0) {
    console.log(`[CachedLLM] Skipping cache for non-deterministic call (temp=${options.temperature})`);
    return uncachedLlmCall(options);
  }

  // Build cache key for logging
  const messagesHash = hashInput(
    options.messages.map((m) => `${m.role}:${m.content}`).join("|")
  );
  console.log(`[CachedLLM] Cached call: model=${options.model}, messagesHash=${messagesHash}`);

  // Use cached action
  return llmCache.fetch(ctx, {
    model: options.model,
    messages: options.messages,
    temperature: options.temperature,
    maxTokens: options.maxTokens,
    responseFormat: options.responseFormat,
  });
}

/**
 * Uncached LLM call (for non-deterministic or streaming calls)
 */
export async function uncachedLlmCall(options: LLMOptions): Promise<LLMResponse> {
  const apiKey = env.TOGETHER_AI_API_KEY;
  if (!apiKey) {
    throw new Error("TOGETHER_AI_API_KEY is not configured");
  }

  const response = await fetch("https://api.together.xyz/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: options.model,
      messages: options.messages,
      temperature: options.temperature,
      max_tokens: options.maxTokens,
      response_format: options.responseFormat,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`LLM API error: ${response.status} - ${error}`);
  }

  const data = await response.json() as any;

  return {
    content: data.choices[0]?.message?.content ?? "",
    usage: data.usage
      ? {
          promptTokens: data.usage.prompt_tokens,
          completionTokens: data.usage.completion_tokens,
          totalTokens: data.usage.total_tokens,
        }
      : undefined,
  };
}

/**
 * Check if a call should be cached (temperature=0)
 */
export function shouldCache(temperature: number): boolean {
  return temperature === 0;
}
