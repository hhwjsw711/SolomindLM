import i18next from "@/i18n";

/** Sidebar/toolbar label for chat-generated literature report artifacts. */
export function literatureReportToolbarLabel(
  literatureReviewSessionId: string | undefined
): string {
  return literatureReviewSessionId
    ? i18next.t("studio:literatureReportLabels.literatureReport")
    : i18next.t("studio:literatureReportLabels.deepResearch");
}
