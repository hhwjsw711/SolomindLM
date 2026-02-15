import { v } from "convex/values";
import { internalMutation } from "./_generated/server";

/**
 * Log a cache hit or miss event for observability
 * This mutation is called from createCachedAction in cachedAgent.ts
 */
export const log = internalMutation({
  args: {
    operation: v.string(),
    status: v.string(), // 'hit' or 'miss'
    duration: v.number(),
  },
  handler: async (ctx, { operation, status, duration }) => {
    const now = Date.now();
    const isHit = status === "hit";

    // Try to find existing metrics record for this operation
    const existing = await ctx.db
      .query("cacheMetrics")
      .withIndex("by_agent", (q) => q.eq("agentType", operation))
      .first();

    if (existing) {
      // Update existing record
      await ctx.db.patch(existing._id, {
        hits: existing.hits + (isHit ? 1 : 0),
        misses: existing.misses + (isHit ? 0 : 1),
        lastHitAt: isHit ? now : existing.lastHitAt,
        lastMissAt: isHit ? existing.lastMissAt : now,
        updatedAt: now,
      });
    } else {
      // Create new record
      await ctx.db.insert("cacheMetrics", {
        cacheType: "action",
        agentType: operation,
        hits: isHit ? 1 : 0,
        misses: isHit ? 0 : 1,
        lastHitAt: isHit ? now : undefined,
        lastMissAt: isHit ? undefined : now,
        createdAt: now,
        updatedAt: now,
      });
    }
  },
});

/**
 * Get cache hit rate for a specific operation
 */
export const getHitRate = internalMutation({
  args: {
    operation: v.string(),
  },
  handler: async (ctx, { operation }) => {
    const metrics = await ctx.db
      .query("cacheMetrics")
      .withIndex("by_agent", (q) => q.eq("agentType", operation))
      .first();

    if (!metrics || metrics.hits + metrics.misses === 0) {
      return { operation, hitRate: 0, total: 0, hits: 0, misses: 0 };
    }

    const total = metrics.hits + metrics.misses;
    const hitRate = metrics.hits / total;

    return {
      operation,
      hitRate,
      total,
      hits: metrics.hits,
      misses: metrics.misses,
    };
  },
});

/**
 * Get all cache metrics summary
 */
export const getAllMetrics = internalMutation({
  args: {},
  handler: async (ctx) => {
    const allMetrics = await ctx.db
      .query("cacheMetrics")
      .withIndex("by_type", (q) => q.eq("cacheType", "action"))
      .collect();

    return allMetrics.map((m) => ({
      operation: m.agentType ?? "unknown",
      hits: m.hits,
      misses: m.misses,
      total: m.hits + m.misses,
      hitRate: m.hits + m.misses > 0 ? m.hits / (m.hits + m.misses) : 0,
      lastHitAt: m.lastHitAt,
      lastMissAt: m.lastMissAt,
    }));
  },
});
