import { useCallback } from "react";
import { useTranslation } from "react-i18next";
import { useToast } from "@/shared/contexts/useToast";
import type { MindMapNote, Note } from "@/shared/types/index";
import { useCreateMindMap } from "../../services/mindMapApi";
import { useStudioGenerationCatch } from "../useStudioGenerationCatch";
import { getStudioGenerationBlocker } from "./studioGenerationGuard";
import type { CreateFlowContext } from "./types";

export function useCreateMindMapFlow(ctx: CreateFlowContext) {
  const createMindMap = useCreateMindMap();
  const catchGenerationError = useStudioGenerationCatch();
  const { error: showErrorToast } = useToast();
  const { t } = useTranslation("studio");

  return useCallback(async () => {
    const selectedDocumentIds = ctx.sources.filter((s) => s.selected).map((s) => s.id);
    if (selectedDocumentIds.length === 0) {
      if (ctx.confirm) {
        await ctx.confirm(t("noSourcesSelected"), t("selectSourceForMindmap"), {
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
    const newNote: Note = {
      id: placeholderId,
      title: t("flows.defaultTitles.mindMap"),
      preview: t("flows.defaultTitles.mindMap"),
      type: "mindmap",
      content: "",
      mindMapData: { nodeData: { id: "root", topic: "", children: [] } },
      status: "generating",
      metadata: {},
    };

    ctx.onAddNote(newNote);

    try {
      const { mindMapId, mindmap } = await createMindMap({
        notebookId: ctx.notebookId!,
        documentIds: selectedDocumentIds,
        title: t("flows.defaultTitles.mindMap"),
      });

      const initialNote: MindMapNote = {
        id: mindmap.id ?? mindMapId,
        title: mindmap.title,
        preview: t("flows.defaultTitles.mindMap"),
        type: "mindmap",
        content: typeof mindmap.content === "string" ? mindmap.content : "",
        status: (mindmap.status ?? "generating") as MindMapNote["status"],
        metadata: mindmap.metadata ?? {},
        mindMapData: mindmap.mindMapData ?? { nodeData: { id: "root", topic: "", children: [] } },
      };

      if (ctx.onUpdateNoteFull) {
        ctx.onUpdateNoteFull(placeholderId, initialNote);
      }
    } catch (error) {
      await catchGenerationError(error, {
        placeholderId,
        onDeleteNote: ctx.onDeleteNote,
        toastMessage: t("flows.toast.mindMapFailed"),
        devLabel: "Failed to create mind map",
      });
    }
  }, [ctx, createMindMap, catchGenerationError, showErrorToast]);
}
