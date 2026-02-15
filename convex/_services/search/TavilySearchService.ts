"use node";

import { action, internalAction } from "../../_generated/server";
import { v } from "convex/values";
import { createCachedAction } from "../cache/cachedAgent";
import { CACHE_TTL, withJitter } from "../cache/cache";
import { internal } from "../../_generated/api";
import { env } from "../../_lib/env";

/**
 * Source discovery result from Tavily
 */
export interface DiscoveredSource {
  title: string;
  url: string;
  snippet: string;
  score: number;
}

/**
 * Options for source discovery
 */
export interface DiscoveryOptions {
  query: string;
  scoreThreshold?: number;
  excludeDomains?: string[];
  maxResults?: number;
}

// ============================================================
// Internal Action (makes actual API call)
// ============================================================

export const searchInternal = internalAction({
  args: {
    query: v.string(),
    maxResults: v.number(),
    scoreThreshold: v.number(),
    excludeDomains: v.optional(v.array(v.string())),
  },
  handler: async (_, { query, maxResults, scoreThreshold, excludeDomains }) => {
    const apiKey = env.TAVILY_API_KEY;
    if (!apiKey) {
      throw new Error("TAVILY_API_KEY is not configured");
    }

    const response = await fetch("https://api.tavily.com/search", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        api_key: apiKey,
        query,
        search_depth: "basic",
        include_answer: false,
        include_raw_content: false,
        max_results: maxResults,
        exclude_domains: excludeDomains && excludeDomains.length > 0 ? excludeDomains : undefined,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(`Tavily API error: ${response.status} - ${JSON.stringify(errorData)}`);
    }

    const data = await response.json() as { results?: any[] };

    // Extract and transform results
    let sources: DiscoveredSource[] = (data.results || []).map((result: any) => ({
      title: result.title || "Untitled",
      url: result.url,
      snippet: result.content || "",
      score: result.score || 0,
    }));

    // Filter by score threshold
    sources = sources.filter(source => source.score >= scoreThreshold);

    // Sort by score (descending)
    sources.sort((a, b) => b.score - a.score);

    return sources;
  },
});

// ============================================================
// Cached Wrapper
// ============================================================

const searchCache = createCachedAction(
  internal._services.search.TavilySearchService.searchInternal,
  { ttl: withJitter(CACHE_TTL.search, 0.15), name: "tavily-search" }
);

/**
 * Normalize query for better cache hits
 * - Lowercase
 * - Trim whitespace
 * - Normalize multiple spaces to single space
 */
function normalizeQuery(query: string): string {
  return query
    .toLowerCase()
    .trim()
    .replace(/\s+/g, " ");
}

// ============================================================
// Public Cached Action
// ============================================================

/**
 * Discover web sources using Tavily Search API with caching
 * This action is cached to reduce API costs and improve latency
 */
export const discoverSources = action({
  args: {
    query: v.string(),
    maxResults: v.optional(v.number()),
    scoreThreshold: v.optional(v.number()),
    excludeDomains: v.optional(v.array(v.string())),
  },
  handler: async (ctx, args) => {
    // Normalize query for better cache hits
    const normalizedQuery = normalizeQuery(args.query);

    return searchCache.fetch(ctx, {
      query: normalizedQuery,
      maxResults: args.maxResults ?? 10,
      scoreThreshold: args.scoreThreshold ?? 0.5,
      excludeDomains: args.excludeDomains,
    });
  },
});

// ============================================================
// Legacy Class Export (for backward compatibility)
// ============================================================

/**
 * TavilySearchService handles web source discovery using Tavily Search API
 * Optimized for AI/RAG workflows with relevance scoring
 * 
 * @deprecated Use discoverSources action directly for caching support
 */
export class TavilySearchService {
  private apiKey: string;
  private baseUrl = "https://api.tavily.com/search";

  constructor() {
    this.apiKey = env.TAVILY_API_KEY;

    if (!this.apiKey) {
      throw new Error("TAVILY_API_KEY is not configured");
    }
  }

  /**
   * Search for relevant web sources based on query
   *
   * @param options - Search options including query and filters
   * @returns Array of discovered sources sorted by relevance score
   * @deprecated Use discoverSources action for caching support
   */
  async discoverSources(options: DiscoveryOptions): Promise<DiscoveredSource[]> {
    const {
      query,
      scoreThreshold = 0.5,
      excludeDomains = [],
      maxResults = 10,
    } = options;

    console.log(`[Tavily] Searching for sources: "${query}"`);

    try {
      const response = await fetch(this.baseUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          api_key: this.apiKey,
          query: query,
          search_depth: "basic",
          include_answer: false,
          include_raw_content: false,
          max_results: maxResults,
          exclude_domains: excludeDomains.length > 0 ? excludeDomains : undefined,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(`Tavily API error: ${response.status} - ${JSON.stringify(errorData)}`);
      }

      const data = await response.json() as { results?: any[] };

      // Extract and transform results
      let sources: DiscoveredSource[] = (data.results || []).map((result: any) => ({
        title: result.title || "Untitled",
        url: result.url,
        snippet: result.content || "",
        score: result.score || 0,
      }));

      // Filter by score threshold
      sources = sources.filter(source => source.score >= scoreThreshold);

      // Sort by score (descending)
      sources.sort((a, b) => b.score - a.score);

      console.log(`[Tavily] Found ${sources.length} sources (threshold: ${scoreThreshold})`);

      return sources;

    } catch (error) {
      console.error("[Tavily] Search failed:", error);

      if (error instanceof Error) {
        throw new Error(`Source discovery failed: ${error.message}`);
      }

      throw new Error("Source discovery failed: Unknown error");
    }
  }
}
