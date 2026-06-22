import i18next from "@/i18n";
import type { ChatActivityPhase } from "@/shared/types/index";

export function researchProgressToStreamingActivity(progress: {
  phase: string;
  subQuestionId?: string;
  sourcesFound?: number;
}): { phase: ChatActivityPhase; detail: string } {
  const n = progress.sourcesFound ?? 0;
  if (progress.phase === "writing") {
    return { phase: "writing", detail: i18next.t("chat:status.detail.synthesizing_report") };
  }
  if (progress.phase === "retrieving_notebook") {
    const found =
      n > 0
        ? i18next.t("chat:status.detail.notebook_search_found", { count: n })
        : i18next.t("chat:status.detail.searching_notebook");
    return { phase: "retrieving", detail: found };
  }
  return {
    phase: "thinking",
    detail: progress.phase.replace(/_/g, " "),
  };
}

/** Only render messages for the explicitly selected thread (never the notebook primary fallback). */
export function resolveConversationMessages<T>(
  activeConversationId: string | null,
  chatBundle: { messages: T[] } | undefined
): T[] {
  if (!activeConversationId) return [];
  if (!chatBundle) return [];
  return chatBundle.messages;
}

/** Ignore stream callbacks after the user switches to another conversation. */
export function isStreamStillRelevant(
  streamConversationId: string | null,
  activeConversationId: string | null
): boolean {
  return streamConversationId === activeConversationId;
}

export function computeRemoteGenerationBlocksSend(
  chatRemoteGenerating: boolean,
  messages: Array<{ role: string }>
): boolean {
  if (!chatRemoteGenerating) return false;
  const last = messages[messages.length - 1];
  return last?.role !== "assistant";
}
