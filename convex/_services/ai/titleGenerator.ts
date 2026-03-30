"use node";
import { internalAction } from "../../_generated/server";
import { v } from "convex/values";

/**
 * Generate a title for content based on a text chunk
 * This action uses env.FAST_LLM (Together AI) with reasoning disabled.
 */
export const generateTitle = internalAction({
  args: {
    chunk: v.string(),
    model: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    "use node";

    const apiKey = process.env.TOGETHER_AI_API_KEY;
    if (!apiKey) {
      throw new Error("TOGETHER_AI_API_KEY environment variable is not set");
    }

    const { uncachedLlmCall } = await import("../../_agents/_shared/cachedLlm");
    const { env } = await import("../../_lib/env");

    const model = args.model || env.FAST_LLM;
    const prompt = `Generate a single, concise title (max 10 words) for the following content. Output ONLY the title with no preamble, no list, no introduction, and no quotation marks.\n\nContent:\n${args.chunk}\n\nTitle:`;

    try {
      const response = await uncachedLlmCall({
        model,
        messages: [{ role: "user", content: prompt }],
        temperature: 0.3,
        maxTokens: 30,
        reasoningEnabled: false,
        toolChoice: "none",
      });
      let title = response.content.trim();
      title = title.replace(/^["']|["']$/g, "");
      console.log("[TitleGenerator] Generated title:", title);
      return title;
    } catch (error) {
      console.error("[TitleGenerator] Error:", error);
      throw new Error("Failed to generate title");
    }
  },
});
