import { useCallback } from "react";
import { useTranslation } from "react-i18next";
import { useToast } from "@/shared/contexts/useToast";
import type { Note, WrittenQuestionsNote } from "@/shared/types/index";
import type { WrittenQuestionsConfig } from "../../components/CustomizeWrittenQuestionsModal";
import { useCreateWrittenQuestions } from "../../services/writtenQuestionsApi";
import { useStudioGenerationCatch } from "../useStudioGenerationCatch";
import { getStudioGenerationBlocker } from "./studioGenerationGuard";
import type { CreateFlowContext } from "./types";

const WQ_COUNT_MAP = { fewer: 5, standard: 10, more: 15 };

export function useCreateWrittenQuestionsFlow(ctx: CreateFlowContext) {
  const createWrittenQuestions = useCreateWrittenQuestions();
  const catchGenerationError = useStudioGenerationCatch();
  const { error: showErrorToast } = useToast();
  const { t } = useTranslation("studio");

  return useCallback(
    async (config: WrittenQuestionsConfig) => {
      const selectedDocumentIds = ctx.sources.filter((s) => s.selected).map((s) => s.id);
      if (selectedDocumentIds.length === 0) {
        if (ctx.confirm) {
          await ctx.confirm(t("noSourcesSelected"), t("selectSourceForWrittenQuestions"), {
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

      const questionCount = WQ_COUNT_MAP[config.count];
      const placeholderId = Math.random().toString(36).slice(2, 11);
      const newNote: Note = {
        id: placeholderId,
        title: t("flows.defaultTitles.writtenQuestions"),
        preview: `${questionCount} ${t("preview.question_other")} • ${config.questionType}`,
        type: "writtenQuestions",
        questions: [],
        status: "generating",
        metadata: {
          questionCount,
          difficulty: config.difficulty,
          questionType: config.questionType,
          focusArea: config.focus,
        },
      };

      ctx.onAddNote(newNote);

      try {
        const resWQ = await createWrittenQuestions({
          notebookId: ctx.notebookId!,
          documentIds: selectedDocumentIds,
          questionCount: config.count,
          difficulty: config.difficulty,
          questionType: config.questionType,
          focus: config.focus || undefined,
        });
        const writtenQuestionsId =
          (resWQ as { writtenQuestionsId?: string }).writtenQuestionsId ??
          (resWQ as { noteId?: string }).noteId!;
        const apiNote = (resWQ as { note?: { _id: string; title: string; status: string } }).note;
        const initialNote: WrittenQuestionsNote = {
          id: writtenQuestionsId,
          title: apiNote?.title ?? t("flows.defaultTitles.writtenQuestions"),
          preview: `${questionCount} ${t("preview.question_other")} • ${config.questionType}`,
          type: "writtenQuestions",
          questions: [],
          status: (apiNote?.status ?? resWQ.status) as WrittenQuestionsNote["status"],
          metadata: {
            questionCount,
            difficulty: config.difficulty,
            questionType: config.questionType,
            focusArea: config.focus,
          },
        };

        if (ctx.onUpdateNoteFull) {
          ctx.onUpdateNoteFull(placeholderId, initialNote);
        }
      } catch (error) {
        await catchGenerationError(error, {
          placeholderId,
          onDeleteNote: ctx.onDeleteNote,
          toastMessage: t("flows.toast.writtenQuestionsFailed"),
          devLabel: "Failed to create written questions",
        });
      }
    },
    [ctx, createWrittenQuestions, catchGenerationError, showErrorToast]
  );
}
