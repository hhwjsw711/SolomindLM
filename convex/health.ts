import { query } from "./_generated/server";
import { v } from "convex/values";

/**
 * Lightweight health check query for deployment verification.
 * Returns basic system status without exposing sensitive data.
 */
export const check = query({
  args: {},
  returns: v.object({
    status: v.literal("ok"),
    timestamp: v.number(),
    version: v.string(),
  }),
  handler: async () => {
    return {
      status: "ok" as const,
      timestamp: Date.now(),
      version: "1.0.0", // Bump this when making breaking changes
    };
  },
});
