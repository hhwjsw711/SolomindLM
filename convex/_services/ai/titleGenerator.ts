"use node";
import { internalAction } from "../../_generated/server";
import { v } from "convex/values";
import { uncachedLlmCall } from "../../_agents/_shared/cachedLlm";
import { env } from "../../_lib/env";

/**
 * Generate a short title from a text chunk via Together (uncachedLlmCall includes transient retries).
 * Tries env.FAST_LLM first, then env.SMART_LLM if the fast path fails.
 */
export const generateTitle = internalAction({
  args: {
    chunk: v.string(),
    model: v.optional(v.string()),
  },
  handler: async (_ctx, args) => {
    const apiKey = process.env.TOGETHER_AI_API_KEY;
    if (!apiKey) {
      throw new Error("TOGETHER_AI_API_KEY environment variable is not set");
    }

    const truncatedContent =
      args.chunk.length > 500
        ? args.chunk.substring(0, 500) + "..."
        : args.chunk;

    const prompt = `Generate a single, concise title (max 10 words) for the following content. Output ONLY the title with no preamble, no list, no introduction, and no quotation marks.

Content:
${truncatedContent}

Title:`;

    async function titleFromModel(model: string): Promise<string> {
      const response = await uncachedLlmCall({
        model,
        messages: [{ role: "user", content: prompt }],
        temperature: 0.3,
        maxTokens: 50,
        reasoningEnabled: false,
        toolChoice: "none",
      });
      let title = response.content.trim();
      title = title.replace(/^["']|["']$/g, "");
      return title;
    }

    try {
      let title: string;
      try {
        title = await titleFromModel(env.FAST_LLM);
      } catch (firstError) {
        if (env.SMART_LLM !== env.FAST_LLM) {
          console.warn(
            "[TitleGenerator] fast model failed, retrying with smart model:",
            firstError,
          );
          title = await titleFromModel(env.SMART_LLM);
        } else {
          throw firstError;
        }
      }
      console.log("[TitleGenerator] Generated title:", title);
      return title;
    } catch (error) {
      console.error("[TitleGenerator] Error:", error);
      throw new Error("Failed to generate title");
    }
  },
});
