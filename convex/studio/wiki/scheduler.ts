/**
 * Wiki auto-update scheduler
 *
 * Schedules debounced wiki regeneration when sources are added.
 */

import { v } from "convex/values";
import { internalMutation } from "../../_generated/server";
import { internal } from "../../_generated/api";
import type { Id } from "../../_generated/dataModel";

/**
 * Schedule a debounced wiki update after sources are added.
 *
 * Cancels any pending job and schedules a new one after 3 minutes.
 * This prevents excessive regeneration during bulk imports while
 * keeping the wiki automatically up-to-date.
 */
const scheduleWikiUpdateReturns = v.object({
  scheduled: v.boolean(),
  pendingJobId: v.optional(v.string()),
  reason: v.optional(v.string()),
});

export const scheduleWikiUpdate = internalMutation({
  args: {
    notebookId: v.id("notebooks"),
  },
  returns: scheduleWikiUpdateReturns,
  handler: async (
    ctx,
    args
  ): Promise<{ scheduled: boolean; pendingJobId?: string; reason?: string }> => {
    // Find wiki for this notebook
    const wiki = await ctx.db
      .query("wikis")
      .withIndex("by_notebook", (q) => q.eq("notebookId", args.notebookId))
      .first();

    // No wiki exists or auto-update is disabled
    if (!wiki?.autoUpdate) {
      return { scheduled: false };
    }

    // Don't schedule if already generating (will refresh after completion)
    if (wiki.status === "generating") {
      return { scheduled: false, reason: "already_generating" };
    }

    // Cancel any pending job for this notebook
    if (wiki.pendingJobId) {
      try {
        await ctx.scheduler.cancel(wiki.pendingJobId as Id<"_scheduled_functions">);
      } catch {
        // Job might have already fired, ignore
      }
    }

    // Schedule full rebuild after 3 minute debounce
    const pendingJobId: Id<"_scheduled_functions"> = await ctx.scheduler.runAfter(
      3 * 60 * 1000, // 3 minutes in milliseconds
      internal.studio.wiki.job.regenerateWiki,
      {
        wikiId: wiki._id,
        notebookId: args.notebookId,
        userId: wiki.userId,
        runId: (wiki.generationRunId ?? 0) + 1,
      }
    );

    // Update wiki with pending job ID
    const pendingIdStr = String(pendingJobId);
    await ctx.db.patch(wiki._id, {
      pendingJobId: pendingIdStr,
    });

    return { scheduled: true, pendingJobId: pendingIdStr };
  },
});

/**
 * Clear pending job ID (called when job executes or is cancelled)
 */
export const clearPendingJob = internalMutation({
  args: {
    wikiId: v.id("wikis"),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    await ctx.db.patch(args.wikiId, {
      pendingJobId: undefined,
    });
    return null;
  },
});
