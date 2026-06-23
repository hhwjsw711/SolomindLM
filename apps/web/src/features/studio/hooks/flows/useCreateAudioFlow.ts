import { useCallback } from "react";
import { useTranslation } from "react-i18next";
import { useToast } from "@/shared/contexts/useToast";
import type { AudioOverviewNote, Note } from "@/shared/types/index";
import type { AudioConfig } from "../../components/CustomizeAudioModal";
import { useCreateAudioOverview } from "../../services/audioApi";
import { useStudioGenerationCatch } from "../useStudioGenerationCatch";
import { getStudioGenerationBlocker } from "./studioGenerationGuard";
import type { CreateFlowContext } from "./types";

export function useCreateAudioFlow(ctx: CreateFlowContext) {
  const createAudioOverview = useCreateAudioOverview();
  const catchGenerationError = useStudioGenerationCatch();
  const { error: showErrorToast } = useToast();
  const { t } = useTranslation("studio");

  return useCallback(
    async (config: AudioConfig) => {
      const selectedDocumentIds = ctx.sources.filter((s) => s.selected).map((s) => s.id);
      if (selectedDocumentIds.length === 0) {
        if (ctx.confirm) {
          await ctx.confirm(t("noSourcesSelected"), t("selectSourceForAudio"), {
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

      const placeholderId = Math.random().toString(36).slice(2, 11);
      const formatTitle = config.formatId
        .replace("_", " ")
        .replace(/\b\w/g, (l) => l.toUpperCase());
      const newNote: Note = {
        id: placeholderId,
        title: t("flows.defaultTitles.audioOverview"),
        preview: `${t("flows.defaultTitles.audioOverview")} • ${formatTitle} • ${config.length}`,
        type: "audioOverview",
        audioUrl: "",
        transcript: "",
        status: "generating",
        metadata: {
          audioType: config.formatId,
          length: config.length,
          focus: config.focus,
        },
      };

      ctx.onAddNote(newNote);

      try {
        const { audioOverviewId } = await createAudioOverview({
          notebookId: ctx.notebookId!,
          documentIds: selectedDocumentIds,
          title: `${t("flows.defaultTitles.audioOverview")} • ${formatTitle}`,
          audioType: config.formatId,
          length: config.length,
          focus: config.focus,
        });

        const initialNote: AudioOverviewNote = {
          ...newNote,
          id: audioOverviewId,
          metadata: { ...newNote.metadata, audioOverviewId },
        } as AudioOverviewNote;

        if (ctx.onUpdateNoteFull) {
          ctx.onUpdateNoteFull(placeholderId, initialNote);
        }
      } catch (error) {
        await catchGenerationError(error, {
          placeholderId,
          onDeleteNote: ctx.onDeleteNote,
          toastMessage: t("flows.toast.audioFailed"),
          devLabel: "Failed to create audio overview",
        });
      }
    },
    [ctx, createAudioOverview, catchGenerationError, showErrorToast]
  );
}
