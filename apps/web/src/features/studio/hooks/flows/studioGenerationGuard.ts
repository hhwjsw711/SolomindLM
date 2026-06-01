import type { CreateFlowContext } from "./types";

/** Returns a user-facing message when generation cannot start, or null if ready. */
export function getStudioGenerationBlocker(
  ctx: Pick<CreateFlowContext, "isAuthenticated" | "notebookId">
): string | null {
  if (!ctx.isAuthenticated) {
    return "Please sign in to continue.";
  }
  if (!ctx.notebookId) {
    return "Open a notebook before creating studio content.";
  }
  return null;
}
