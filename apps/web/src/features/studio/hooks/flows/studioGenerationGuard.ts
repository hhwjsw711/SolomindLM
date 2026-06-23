import i18next from "@/i18n";
import type { CreateFlowContext } from "./types";

/** Returns a user-facing message when generation cannot start, or null if ready. */
export function getStudioGenerationBlocker(
  ctx: Pick<CreateFlowContext, "isAuthenticated" | "notebookId">
): string | null {
  if (!ctx.isAuthenticated) {
    return i18next.t("studio:guard.signIn");
  }
  if (!ctx.notebookId) {
    return i18next.t("studio:guard.openNotebook");
  }
  return null;
}
