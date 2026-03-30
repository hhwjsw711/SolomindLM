"use node";
/**
 * Source Suggestions Generator
 *
 * Generates a source summary + study prompts based on uploaded documents.
 * Uses env.FAST_LLM (Together AI; default Qwen/Qwen3.5-9B). Hybrid Qwen can spend the whole
 * `max_tokens` budget on `reasoning` + spurious `tool_calls`, leaving `content` empty — we disable both.
 */

import { internalAction } from "../../_generated/server";
import { v } from "convex/values";
import { api } from "../../_generated/api";
import { uncachedLlmCall } from "../_shared/cachedLlm";
import { env } from "../../_lib/env";

function parseSuggestionsPayload(raw: string): {
  summary: string;
  suggestions: string[];
} {
  let text = raw.trim();
  if (!text) {
    throw new Error("empty LLM content");
  }

  // Qwen-style reasoning blocks before the answer (angle-bracket tags)
  text = text.replace(/\x3Cthink\x3E[\s\S]*?\x3C\/think\x3E/gi, "").trim();

  const fence = text.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (fence) {
    text = fence[1].trim();
  }

  const start = text.indexOf("{");
  const end = text.lastIndexOf("}");
  if (start === -1 || end <= start) {
    throw new Error("no JSON object in LLM output");
  }
  text = text.slice(start, end + 1);

  const parsed = JSON.parse(text) as { summary?: unknown; suggestions?: unknown };

  if (!parsed.summary || !Array.isArray(parsed.suggestions)) {
    throw new Error("Invalid response structure");
  }

  return {
    summary: String(parsed.summary),
    suggestions: parsed.suggestions.map(String).filter(Boolean),
  };
}

export const generateSuggestionsInternal = internalAction({
  args: {
    notebookId: v.id("notebooks"),
    documentSignature: v.string(),
  },
  handler: async (ctx, args) => {
    const documents = await ctx.runQuery(api.documents.index.list, {
      notebookId: args.notebookId,
    });

    const completed: any[] = (documents as any[]).filter(
      (d: any) => d.status === "completed"
    );

    if (completed.length === 0) {
      return null;
    }

    // Build compact document summary for LLM
    const docLines = completed
      .slice(0, 20)
      .map((d: any) => {
        const flags: string[] = [];
        if (d.metadata?.hasMathNotation) flags.push("math");
        if (d.metadata?.hasCodeBlocks) flags.push("code");
        const type =
          d.fileType === "youtube"
            ? "YouTube video"
            : d.fileType === "url"
              ? "webpage"
              : d.fileType === "text"
                ? "text note"
                : d.fileName?.split(".").pop()?.toUpperCase() || "document";
        return `- "${d.fileName || "Untitled"}" (${type}${flags.length ? `, ${flags.join(", ")}` : ""})`;
      })
      .join("\n");

    const prompt = `You are an AI study assistant. A student has uploaded these sources to a notebook:

${docLines}

Generate a JSON response with:
- "summary": a one-line summary of what these sources cover (max 15 words)
- "suggestions": an array of exactly 3 study-focused questions the student could ask about this material

Keep suggestions short (under 10 words each) and varied. Output a single JSON object only — no markdown fences, no commentary before or after the object.`;

    try {
      const response = await uncachedLlmCall({
        model: env.FAST_LLM,
        messages: [
          {
            role: "system",
            content:
              "You output only a single JSON object. Keys: summary (string), suggestions (string array, length 3). No tools, no markdown, no explanation.",
          },
          { role: "user", content: prompt },
        ],
        temperature: 0.5,
        maxTokens: 512,
        reasoningEnabled: false,
        toolChoice: "none",
      });

      const parsed = parseSuggestionsPayload(response.content);

      if (parsed.suggestions.length === 0) {
        throw new Error("Invalid response structure");
      }

      return {
        sourceCount: completed.length,
        summary: parsed.summary.slice(0, 100),
        suggestions: parsed.suggestions.slice(0, 3),
        documentSignature: args.documentSignature,
      };
    } catch (error) {
      console.warn("[sourceSuggestions] LLM parse failed:", error);
      return {
        sourceCount: completed.length,
        summary: null,
        suggestions: null,
        documentSignature: args.documentSignature,
      };
    }
  },
});
