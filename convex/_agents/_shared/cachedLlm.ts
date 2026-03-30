"use node";
/**
 * Cached LLM Service
 *
 * Provides caching for deterministic LLM calls (temperature=0).
 * Non-deterministic calls bypass cache and go directly to the LLM.
 */

import { internalAction } from "../../_generated/server";
import { v } from "convex/values";
import { createCachedAction } from "../../_services/cache/cachedAgent";
import { CACHE_TTL, withJitter } from "../../_services/cache/cache";
import { hashInput } from "../../_services/cache/cacheCrypto";
import { internal } from "../../_generated/api";
import { env } from "../../_lib/env";

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
  /**
   * Together hybrid models (e.g. Qwen3.5-9B): set false so reasoning tokens do not
   * consume the whole `max_tokens` budget and leave `message.content` empty.
   */
  reasoningEnabled?: boolean;
  /**
   * OpenAI-style. `"none"` prevents spurious tool_calls when no tools are provided.
   */
  toolChoice?: "none" | "auto" | "required";
}

export interface LLMResponse {
  content: string;
  usage?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
}

/** Normalize OpenAI-style message.content (string or multimodal parts) to plain text. */
function messageContentToString(message: { content?: unknown } | undefined): string {
  const c = message?.content;
  if (c == null) return "";
  if (typeof c === "string") return c;
  if (Array.isArray(c)) {
    return c
      .map((part: unknown) => {
        if (typeof part === "string") return part;
        if (
          part &&
          typeof part === "object" &&
          "text" in part &&
          typeof (part as { text: unknown }).text === "string"
        ) {
          return (part as { text: string }).text;
        }
        return "";
      })
      .join("");
  }
  return "";
}

/**
 * Best-effort assistant text from a Together / OpenAI-style chat completion choice.
 * Some responses use legacy `text`; hybrid models may place a JSON payload only in `reasoning`.
 */
function togetherChoiceAssistantText(choice: any): string {
  if (!choice) return "";
  const msg = choice.message;
  if (!msg) {
    return typeof choice.text === "string" ? choice.text : "";
  }
  const fromMessage = messageContentToString(msg);
  if (fromMessage.trim()) return fromMessage;
  if (typeof choice.text === "string" && choice.text.trim()) return choice.text;
  const reasoning = (msg as { reasoning?: unknown }).reasoning;
  if (typeof reasoning === "string" && reasoning.trim().startsWith("{")) {
    return reasoning;
  }
  return "";
}

function logEmptyTogetherAssistant(
  model: string,
  choice: any,
): void {
  const msg = choice?.message;
  console.warn("[Together LLM] empty assistant text", {
    model,
    finishReason: choice?.finish_reason,
    messageKeys:
      msg && typeof msg === "object" ? Object.keys(msg as object) : [],
    refusal:
      msg && typeof (msg as { refusal?: unknown }).refusal === "string"
        ? (msg as { refusal: string }).refusal
        : undefined,
  });
}

function togetherChatRequestBody(options: LLMOptions): Record<string, unknown> {
  const body: Record<string, unknown> = {
    model: options.model,
    messages: options.messages,
    temperature: options.temperature,
    max_tokens: options.maxTokens,
  };
  if (options.responseFormat) {
    body.response_format = options.responseFormat;
  }
  if (options.reasoningEnabled === false) {
    body.chat_template_kwargs = { thinking: false };
  }
  if (options.toolChoice !== undefined) {
    body.tool_choice = options.toolChoice;
  }
  return body;
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
    reasoningEnabled: v.optional(v.boolean()),
    toolChoice: v.optional(v.string()),
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
      body: JSON.stringify(
        togetherChatRequestBody({
          model: args.model,
          messages: args.messages as LLMMessage[],
          temperature: args.temperature,
          maxTokens: args.maxTokens,
          responseFormat: args.responseFormat as LLMOptions["responseFormat"],
          reasoningEnabled: args.reasoningEnabled,
          toolChoice: args.toolChoice as LLMOptions["toolChoice"],
        }),
      ),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`LLM API error: ${response.status} - ${error}`);
    }

    const data = await response.json() as any;

    const choice = data.choices?.[0];
    const content = togetherChoiceAssistantText(choice);
    if (!content.trim()) {
      logEmptyTogetherAssistant(args.model, choice);
    }

    return {
      content,
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
  internal._agents._shared.cachedLlm.llmInternal,
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
    reasoningEnabled: options.reasoningEnabled,
    toolChoice: options.toolChoice,
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
    body: JSON.stringify(togetherChatRequestBody(options)),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`LLM API error: ${response.status} - ${error}`);
  }

  const data = await response.json() as any;

  const choice = data.choices?.[0];
  const content = togetherChoiceAssistantText(choice);
  if (!content.trim()) {
    logEmptyTogetherAssistant(options.model, choice);
  }

  return {
    content,
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
