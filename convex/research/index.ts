import { v } from "convex/values";
import { query, mutation, internalMutation, internalQuery, internalAction } from "../_generated/server";
import { internal } from "../_generated/api";
import type { Id } from "../_generated/dataModel";

// ============================================================
// QUERIES
// ============================================================

export const getPlan = query({
  args: { planId: v.id("researchPlans") },
  handler: async (ctx, args) => {
    const plan = await ctx.db.get(args.planId);
    if (!plan) return null;
    return plan;
  },
});

export const getRunStatus = query({
  args: { runId: v.id("researchRuns") },
  handler: async (ctx, args) => {
    const run = await ctx.db.get(args.runId);
    if (!run) return null;
    return run;
  },
});

export const getRunEvidence = query({
  args: { runId: v.id("researchRuns") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("researchEvidence")
      .withIndex("by_run", (q) => q.eq("runId", args.runId))
      .collect();
  },
});

// ============================================================
// INTERNAL QUERIES (for use by actions)
// ============================================================

export const getPlanInternal = internalQuery({
  args: { planId: v.id("researchPlans") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.planId);
  },
});

export const getRunInternal = internalQuery({
  args: { runId: v.id("researchRuns") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.runId);
  },
});

// ============================================================
// MUTATIONS
// ============================================================

export const createResearchPlan = internalMutation({
  args: {
    userId: v.string(),
    notebookId: v.id("notebooks"),
    conversationId: v.id("conversations"),
    messageId: v.id("messages"),
    query: v.string(),
    sourcePolicy: v.object({
      channels: v.array(v.string()),
      domainAllowlist: v.optional(v.array(v.string())),
      dateRange: v.optional(v.object({ start: v.number(), end: v.number() })),
      maxResultsPerChannel: v.optional(v.number()),
      credibilityTier: v.optional(v.string()),
      requirePrimarySources: v.optional(v.boolean()),
      recencyDays: v.optional(v.number()),
      dedupeStrategy: v.optional(v.string()),
    }),
    subQuestions: v.array(
      v.object({
        id: v.string(),
        question: v.string(),
        searchQueries: v.array(v.string()),
        sourceChannels: v.array(v.string()),
      })
    ),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    return await ctx.db.insert("researchPlans", {
      userId: args.userId as Id<"users">,
      notebookId: args.notebookId,
      conversationId: args.conversationId,
      messageId: args.messageId,
      query: args.query,
      subQuestions: args.subQuestions.map((sq) => ({
        ...sq,
        status: "pending" as const,
      })),
      sourcePolicy: args.sourcePolicy,
      status: "draft",
      createdAt: now,
      updatedAt: now,
    });
  },
});

export const approveResearchPlan = mutation({
  args: {
    planId: v.id("researchPlans"),
    modifiedSubQuestions: v.optional(
      v.array(
        v.object({
          id: v.string(),
          question: v.string(),
          searchQueries: v.array(v.string()),
          sourceChannels: v.array(v.string()),
        })
      )
    ),
  },
  handler: async (ctx, args) => {
    const plan = await ctx.db.get(args.planId);
    if (!plan) throw new Error("Plan not found");

    const subQuestions = args.modifiedSubQuestions
      ? args.modifiedSubQuestions.map((sq) => ({ ...sq, status: "pending" as const }))
      : plan.subQuestions;

    await ctx.db.patch(args.planId, {
      subQuestions,
      status: "approved",
      updatedAt: Date.now(),
    });

    return args.planId;
  },
});

export const rejectResearchPlan = mutation({
  args: { planId: v.id("researchPlans") },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.planId, {
      status: "rejected",
      updatedAt: Date.now(),
    });
  },
});

export const createResearchRun = internalMutation({
  args: {
    planId: v.id("researchPlans"),
    userId: v.string(),
    notebookId: v.id("notebooks"),
    conversationId: v.id("conversations"),
    streamId: v.string(),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    return await ctx.db.insert("researchRuns", {
      planId: args.planId,
      userId: args.userId as Id<"users">,
      notebookId: args.notebookId,
      conversationId: args.conversationId,
      status: "pending",
      currentIteration: 0,
      maxIterations: 2,
      streamId: args.streamId,
      startedAt: now,
      createdAt: now,
      updatedAt: now,
    });
  },
});

export const updateRunProgress = internalMutation({
  args: {
    runId: v.id("researchRuns"),
    status: v.optional(v.string()),
    currentIteration: v.optional(v.number()),
    error: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const updates: Record<string, unknown> = { updatedAt: Date.now() };
    if (args.status) updates.status = args.status;
    if (args.currentIteration !== undefined) updates.currentIteration = args.currentIteration;
    if (args.error) updates.error = args.error;
    if (args.status === "completed" || args.status === "failed") {
      updates.completedAt = Date.now();
    }
    await ctx.db.patch(args.runId, updates);
  },
});

export const saveEvidence = internalMutation({
  args: {
    runId: v.id("researchRuns"),
    evidence: v.array(
      v.object({
        subQuestionId: v.string(),
        sourceType: v.string(),
        sourceTitle: v.string(),
        sourceUrl: v.optional(v.string()),
        content: v.string(),
        relevanceScore: v.optional(v.number()),
        credibilityTier: v.optional(v.string()),
        iteration: v.number(),
        metadata: v.optional(
          v.object({
            documentId: v.optional(v.id("documents")),
            chunkIndex: v.optional(v.number()),
            domain: v.optional(v.string()),
            publishedAt: v.optional(v.number()),
          })
        ),
      })
    ),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    for (const entry of args.evidence) {
      await ctx.db.insert("researchEvidence", {
        runId: args.runId,
        ...entry,
        createdAt: now,
      });
    }
  },
});
