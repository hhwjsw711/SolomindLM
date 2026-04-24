/**
 * Wiki mutations and queries - Public and internal functions.
 */

import { v } from "convex/values";
import { mutation, query, internalMutation, internalQuery } from "../../_generated/server";
import { internal } from "../../_generated/api";
import { getAuthUserId } from "../../auth";

import {
  createWiki,
  deleteWiki,
  getWiki,
  getWikiByNotebook,
  getWikiArticleByPath,
  getWikiArticles,
  updateWikiStatus,
  updateWikiMetadata,
  createWikiArticle,
  updateWikiArticle,
} from "../../_model/wiki";
import * as scheduler from "./scheduler";

// ============================================================
// PUBLIC QUERIES
// ============================================================

/**
 * Get wiki by notebook ID
 */
export const get = query({
  args: {
    notebookId: v.id("notebooks"),
  },
  handler: async (ctx: any, args: any) => {
    const wiki = await getWikiByNotebook(ctx, args.notebookId);
    if (!wiki) {
      return null;
    }

    // Get articles for this wiki
    const articles = await getWikiArticles(ctx, wiki._id);

    return {
      ...wiki,
      articles,
    };
  },
});

/**
 * Get specific article by path
 */
export const getArticle = query({
  args: {
    notebookId: v.id("notebooks"),
    path: v.string(),
  },
  handler: async (ctx: any, args: any) => {
    const wiki = await getWikiByNotebook(ctx, args.notebookId);
    if (!wiki) {
      return null;
    }

    const article = await getWikiArticleByPath(ctx, wiki._id, args.path);
    return article;
  },
});

// ============================================================
// PUBLIC MUTATIONS
// ============================================================

/**
 * Create a new wiki for a notebook
 */
export const create = mutation({
  args: {
    notebookId: v.id("notebooks"),
  },
  handler: async (ctx: any, args: any) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("User must be authenticated");
    }

    // Check if wiki already exists
    const existing = await getWikiByNotebook(ctx, args.notebookId);
    if (existing) {
      throw new Error("Wiki already exists for this notebook");
    }

    // Create wiki
    const wikiId = await createWiki(ctx, {
      userId,
      notebookId: args.notebookId,
      title: "Knowledge Base",
      status: "draft",
    });

    return {
      wikiId,
      status: "draft",
    };
  },
});

/**
 * Refresh (regenerate) a wiki
 */
export const refresh = mutation({
  args: {
    wikiId: v.id("wikis"),
  },
  handler: async (ctx: any, args: any) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("User must be authenticated");
    }

    const wiki = await getWiki(ctx, args.wikiId);
    if (!wiki) {
      throw new Error("Wiki not found");
    }

    // Note: We're not doing auth check for now since the schema doesn't have userId on wikis
    // if (wiki.userId !== userId) {
    //   throw new Error("Not authorized to refresh this wiki");
    // }

    const nextRun = (wiki.generationRunId ?? 0) + 1;
    await ctx.db.patch(args.wikiId, {
      status: "generating",
      generationRunId: nextRun,
      error: undefined,
    });

    await ctx.scheduler.runAfter(0, internal.studio.wiki.job.regenerateWiki, {
      wikiId: args.wikiId,
      notebookId: wiki.notebookId,
      userId,
      runId: nextRun,
    });

    return {
      wikiId: args.wikiId,
      status: "generating",
    };
  },
});

/**
 * Stop an in-flight wiki generation (best-effort; graph may finish its current step).
 */
export const cancelGeneration = mutation({
  args: {
    wikiId: v.id("wikis"),
  },
  handler: async (ctx: any, args: any) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("User must be authenticated");
    }

    const wiki = await getWiki(ctx, args.wikiId);
    if (!wiki) {
      throw new Error("Wiki not found");
    }

    if (wiki.status !== "generating") {
      return { cancelled: false as const };
    }

    const nextRun = (wiki.generationRunId ?? 0) + 1;
    await ctx.db.patch(args.wikiId, {
      status: "failed",
      error: "Generation cancelled",
      generationRunId: nextRun,
    });

    return { cancelled: true as const };
  },
});

/**
 * Toggle auto-update setting for a wiki
 */
export const setAutoUpdate = mutation({
  args: {
    wikiId: v.id("wikis"),
    autoUpdate: v.boolean(),
  },
  handler: async (ctx: any, args: any) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("User must be authenticated");
    }

    const wiki = await getWiki(ctx, args.wikiId);
    if (!wiki) {
      throw new Error("Wiki not found");
    }

    await ctx.db.patch(args.wikiId, {
      autoUpdate: args.autoUpdate,
    });

    return { wikiId: args.wikiId, autoUpdate: args.autoUpdate };
  },
});

// ============================================================
// INTERNAL MUTATIONS (called from jobs)
// ============================================================

/**
 * Create wiki record internally (from job)
 */
export const createInternal = internalMutation({
  args: {
    userId: v.id("users"),
    notebookId: v.id("notebooks"),
    title: v.string(),
    status: v.string(),
  },
  handler: async (ctx: any, args: any) => {
    const wikiId = await createWiki(ctx, args);
    return wikiId;
  },
});

/**
 * Update wiki status internally
 */
export const updateStatusInternal = internalMutation({
  args: {
    wikiId: v.id("wikis"),
    status: v.string(),
    error: v.optional(v.string()),
  },
  handler: async (ctx: any, args: any) => {
    await updateWikiStatus(ctx, args.wikiId, args.status, args.error);
  },
});

/**
 * Update wiki metadata internally
 */
export const updateMetadataInternal = internalMutation({
  args: {
    wikiId: v.id("wikis"),
    metadata: v.any(),
  },
  handler: async (ctx: any, args: any) => {
    await updateWikiMetadata(ctx, args.wikiId, args.metadata);
  },
});

/**
 * Create wiki article internally
 */
export const createArticleInternal = internalMutation({
  args: {
    wikiId: v.id("wikis"),
    path: v.string(),
    type: v.union(
      v.literal("concept"),
      v.literal("connection"),
      v.literal("qa"),
      v.literal("index"),
      v.literal("log")
    ),
    title: v.string(),
    content: v.string(),
    sources: v.array(v.id("documents")),
    frontmatter: v.optional(v.any()),
    wordCount: v.optional(v.number()),
  },
  handler: async (ctx: any, args: any) => {
    const articleId = await createWikiArticle(ctx, args);
    return articleId;
  },
});

/**
 * Update wiki article internally
 */
export const updateArticleInternal = internalMutation({
  args: {
    articleId: v.id("wikiArticles"),
    content: v.optional(v.string()),
    frontmatter: v.optional(v.any()),
    wordCount: v.optional(v.number()),
  },
  handler: async (ctx: any, args: any) => {
    await updateWikiArticle(ctx, args.articleId, args);
  },
});

/**
 * Delete wiki articles internally
 */
export const deleteArticlesInternal = internalMutation({
  args: {
    wikiId: v.id("wikis"),
  },
  handler: async (ctx: any, args: any) => {
    const articles = await getWikiArticles(ctx, args.wikiId);

    for (const article of articles) {
      await ctx.db.delete(article._id);
    }
  },
});

/**
 * Get wiki internal
 */
export const getInternal = internalQuery({
  args: {
    wikiId: v.id("wikis"),
  },
  handler: async (ctx: any, args: any) => {
    return await getWiki(ctx, args.wikiId);
  },
});

/**
 * Get wiki by notebook ID (internal, no auth check)
 */
export const getInternalByNotebook = internalQuery({
  args: {
    notebookId: v.id("notebooks"),
  },
  handler: async (ctx: any, args: any) => {
    return await getWikiByNotebook(ctx, args.notebookId);
  },
});

/**
 * Get wiki articles internal
 */
export const getArticlesInternal = internalQuery({
  args: {
    wikiId: v.id("wikis"),
  },
  handler: async (ctx: any, args: any) => {
    return await getWikiArticles(ctx, args.wikiId);
  },
});

const claimRegenerationRunResultValidator = v.union(
  v.object({
    ok: v.literal(true),
    mode: v.union(v.literal("already_active"), v.literal("claimed_debounced")),
  }),
  v.object({
    ok: v.literal(false),
    reason: v.string(),
  })
);

/**
 * Ensure this regeneration run is allowed to proceed: either the wiki was
 * already marked generating (manual refresh path) or we claim a debounced
 * auto-update run by transitioning to generating with this runId.
 */
export const claimRegenerationRun = internalMutation({
  args: {
    wikiId: v.id("wikis"),
    runId: v.number(),
  },
  returns: claimRegenerationRunResultValidator,
  handler: async (ctx, args) => {
    const wiki = await ctx.db.get(args.wikiId);
    if (!wiki) {
      return { ok: false as const, reason: "wiki_not_found" };
    }

    if (wiki.status === "generating" && wiki.generationRunId === args.runId) {
      return { ok: true as const, mode: "already_active" as const };
    }

    if (wiki.status === "generating" && wiki.generationRunId !== args.runId) {
      return { ok: false as const, reason: "superseded" };
    }

    const nextRun = (wiki.generationRunId ?? 0) + 1;
    if (args.runId !== nextRun) {
      if (wiki.pendingJobId && args.runId < nextRun) {
        await ctx.db.patch(args.wikiId, { pendingJobId: undefined });
      }
      return { ok: false as const, reason: "stale_run" };
    }

    if (!wiki.autoUpdate) {
      if (wiki.pendingJobId) {
        await ctx.db.patch(args.wikiId, { pendingJobId: undefined });
      }
      return { ok: false as const, reason: "auto_update_disabled" };
    }

    if (!wiki.pendingJobId) {
      return { ok: false as const, reason: "not_debounced" };
    }

    await ctx.db.patch(args.wikiId, {
      status: "generating",
      generationRunId: args.runId,
      error: undefined,
    });

    return { ok: true as const, mode: "claimed_debounced" as const };
  },
});

// ============================================================
// SCHEDULER EXPORTS
// ============================================================

export const scheduleWikiUpdate = scheduler.scheduleWikiUpdate;
export const clearPendingJob = scheduler.clearPendingJob;
