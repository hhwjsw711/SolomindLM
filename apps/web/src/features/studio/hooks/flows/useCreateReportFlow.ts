import { useCallback } from "react";
import { useTranslation } from "react-i18next";
import { useToast } from "@/shared/contexts/useToast";
import type { Note } from "@/shared/types/index";
import { getReportSubtitle } from "@/shared/types/reportTypes";
import { useCreateReport } from "../../services/reportsApi";
import { useStudioGenerationCatch } from "../useStudioGenerationCatch";
import { getStudioGenerationBlocker } from "./studioGenerationGuard";
import type { CreateFlowContext } from "./types";

export function useCreateReportFlow(ctx: CreateFlowContext) {
  const createReport = useCreateReport();
  const catchGenerationError = useStudioGenerationCatch();
  const { error: showErrorToast } = useToast();
  const { t } = useTranslation("studio");

  return useCallback(
    async (formatId: string, customPrompt?: string) => {
      const selectedDocumentIds = ctx.sources.filter((s) => s.selected).map((s) => s.id);
      if (selectedDocumentIds.length === 0) {
        if (ctx.confirm) {
          await ctx.confirm(t("noSourcesSelected"), t("selectSourceForReport"), {
            variant: "warning",
          });
        }
        return;
      }
      const blocker = getStudioGenerationBlocker(ctx);
      if (blocker) {
        showErrorToast(blocker);
        return;
      }

      const titles: Record<string, string> = {
        briefing: t("flows.reportTitles.briefing"),
        study_guide: t("flows.reportTitles.study_guide"),
        blog_post: t("flows.reportTitles.blog_post"),
        summary: t("flows.reportTitles.summary"),
        technical_report: t("flows.reportTitles.technical_report"),
        concept_explainer: t("flows.reportTitles.concept_explainer"),
        methodology_overview: t("flows.reportTitles.methodology_overview"),
        custom: t("flows.reportTitles.custom"),
      };

      const placeholderId = Math.random().toString(36).slice(2, 11);
      const newNote: Note = {
        id: placeholderId,
        title: titles[formatId] || t("flows.defaultTitles.report"),
        preview: getReportSubtitle(formatId),
        type: "report",
        content: "",
        status: "generating",
        metadata: { reportType: formatId, documentIds: selectedDocumentIds },
      };

      ctx.onAddNote(newNote);

      try {
        const { note } = await createReport({
          notebookId: ctx.notebookId!,
          documentIds: selectedDocumentIds,
          reportType: formatId,
          customPrompt,
        });

        if (ctx.onUpdateNoteFull) {
          ctx.onUpdateNoteFull(placeholderId, note);
        }
      } catch (error) {
        await catchGenerationError(error, {
          placeholderId,
          onDeleteNote: ctx.onDeleteNote,
          toastMessage: t("flows.toast.reportFailed"),
          devLabel: "Failed to create report",
        });
      }
    },
    [ctx, createReport, catchGenerationError, showErrorToast]
  );
}
