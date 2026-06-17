import { Loader2, Save, X } from "lucide-react";
import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { AudioPlayer } from "@/features/audio/components/AudioPlayer";
import type { ReportNote } from "@/shared/types/index";
import {
  isAudioNote,
  isAudioOverviewNote,
  isFlashcardNote,
  isInfographicNote,
  isMindMapNote,
  isQuizNote,
  isReportNote,
  isSpreadsheetNote,
  isUserNote,
  isWrittenQuestionsNote,
  Note,
} from "@/shared/types/index";
import { FlashcardView } from "./views/FlashcardView";
import type { InfographicViewControls } from "./views/InfographicView";
import { InfographicView } from "./views/InfographicView";
import { MindMapView } from "./views/MindMapView";
import { QuizView } from "./views/QuizView";
import { ReportView } from "./views/ReportView";
import { SpreadsheetView } from "./views/SpreadsheetView";
import { UserNoteView } from "./views/UserNoteView";
import { WrittenQuestionsView } from "./views/WrittenQuestionsView";

interface ReportMarkdownEditorProps {
  note: ReportNote;
  onSave: (reportId: string, content: string) => void | Promise<void>;
  onCancel: () => void;
}

const ReportMarkdownEditor: React.FC<ReportMarkdownEditorProps> = ({ note, onSave, onCancel }) => {
  const { t } = useTranslation("studio");
  const [draftContent, setDraftContent] = useState(note.content ?? "");
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    setDraftContent(note.content ?? "");
  }, [note.id, note.content]);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await onSave(note.id, draftContent);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-background">
      <div className="flex items-center justify-end gap-2 p-3 border-b border-border bg-card/50 shrink-0">
        <button
          type="button"
          onClick={onCancel}
          disabled={isSaving}
          className="px-3 py-1.5 text-sm font-medium text-muted-foreground hover:text-foreground border border-transparent hover:border-border rounded-md bg-transparent hover:bg-secondary/50 transition-colors disabled:opacity-50"
        >
          {t("activeNoteView.cancel")}
        </button>
        <button
          type="button"
          onClick={handleSave}
          disabled={isSaving}
          className="inline-flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-primary-foreground bg-primary hover:bg-primary/90 rounded-md transition-colors disabled:opacity-50"
        >
          <Save className="w-4 h-4" />
          {isSaving ? t("activeNoteView.saving") : t("activeNoteView.save")}
        </button>
      </div>
      <div className="flex-1 min-h-0 p-4">
        <textarea
          value={draftContent}
          onChange={(e) => setDraftContent(e.target.value)}
          className="w-full h-full min-h-[200px] p-4 rounded-lg border border-border bg-card text-foreground font-mono text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
          placeholder={t("activeNoteView.reportPlaceholder")}
          spellCheck={false}
        />
      </div>
    </div>
  );
};

interface ActiveNoteViewProps {
  activeNote: Note;
  isMindMapExpanded: boolean;
  onToggleMindMap: () => void;
  onUpdateNoteFull?: (id: string, note: Note) => void;
  isMobile: boolean;
  onBack: () => void;
  isEditingReportContent?: boolean;
  onSaveReportContent?: (reportId: string, content: string) => void | Promise<void>;
  onCancelEditReport?: () => void;
  registerInfographicControls?: (controls: InfographicViewControls | null) => void;
  onInfographicFullscreenChange?: (isFullscreen: boolean) => void;
}

export const ActiveNoteView: React.FC<ActiveNoteViewProps> = ({
  activeNote,
  isMindMapExpanded,
  onToggleMindMap,
  onUpdateNoteFull,
  isMobile,
  onBack,
  isEditingReportContent,
  onSaveReportContent,
  onCancelEditReport,
  registerInfographicControls,
  onInfographicFullscreenChange,
}) => {
  const { t } = useTranslation("studio");

  // Report view or report markdown editor
  if (isReportNote(activeNote)) {
    if (isEditingReportContent && onSaveReportContent && onCancelEditReport) {
      return (
        <ReportMarkdownEditor
          note={activeNote}
          onSave={onSaveReportContent}
          onCancel={onCancelEditReport}
        />
      );
    }
    return <ReportView note={activeNote} onBack={undefined} />;
  }

  // Flashcard view
  if (isFlashcardNote(activeNote)) {
    return <FlashcardView note={activeNote} onBack={undefined} />;
  }

  // Quiz view
  if (isQuizNote(activeNote)) {
    return (
      <QuizView
        note={activeNote}
        onNoteUpdate={(updatedNote) => onUpdateNoteFull?.(activeNote.id, updatedNote)}
        onBack={undefined}
      />
    );
  }

  // MindMap view
  if (isMindMapNote(activeNote)) {
    return (
      <MindMapView
        note={activeNote}
        isExpanded={isMindMapExpanded}
        onToggleExpanded={onToggleMindMap}
        onBack={isMobile ? onBack : undefined}
      />
    );
  }

  // Audio view
  if (isAudioNote(activeNote)) {
    if (activeNote.status === "completed" && activeNote.metadata.audioUrl) {
      return (
        <AudioPlayer
          audioUrl={activeNote.metadata.audioUrl}
          transcript={activeNote.content}
          title={activeNote.title}
          onBack={isMobile ? onBack : undefined}
        />
      );
    }

    if (activeNote.status === "failed") {
      return (
        <div className="flex flex-col items-center justify-center h-full text-center space-y-4">
          <div className="w-12 h-12 rounded-xl bg-destructive/10 flex items-center justify-center">
            <X className="w-6 h-6 text-destructive" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-destructive">
              {t("activeNoteView.generationFailed")}
            </h3>
            <p className="text-sm text-muted-foreground mt-1">
              {typeof activeNote.metadata.error === "object"
                ? (activeNote.metadata.error as { message?: string }).message ||
                  t("activeNoteView.audioError")
                : activeNote.metadata.error || t("activeNoteView.audioError")}
            </p>
          </div>
        </div>
      );
    }
  }

  // Studio audio overview
  if (isAudioOverviewNote(activeNote)) {
    const url = activeNote.audioUrl?.trim() ?? "";
    if (activeNote.status === "completed") {
      if (!url) {
        return (
          <div className="flex flex-col items-center justify-center h-full text-center space-y-4 px-4">
            <div className="w-12 h-12 rounded-xl bg-muted flex items-center justify-center">
              <X className="w-6 h-6 text-muted-foreground" />
            </div>
            <div>
              <h3 className="text-lg font-semibold">{t("activeNoteView.audioUnavailable")}</h3>
              <p className="text-sm text-muted-foreground mt-1">
                {t("activeNoteView.audioUnavailableDesc")}
              </p>
            </div>
          </div>
        );
      }
      return (
        <AudioPlayer
          audioUrl={url}
          audioOverviewId={activeNote.id}
          transcript={activeNote.transcript}
          title={activeNote.title}
          onBack={isMobile ? onBack : undefined}
        />
      );
    }
    if (activeNote.status === "failed") {
      const metaErr = activeNote.metadata?.error;
      const message =
        typeof metaErr === "object" && metaErr !== null && "message" in metaErr
          ? String((metaErr as { message?: unknown }).message ?? "")
          : typeof metaErr === "string"
            ? metaErr
            : "";
      return (
        <div className="flex flex-col items-center justify-center h-full text-center space-y-4">
          <div className="w-12 h-12 rounded-xl bg-destructive/10 flex items-center justify-center">
            <X className="w-6 h-6 text-destructive" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-destructive">
              {t("activeNoteView.generationFailed")}
            </h3>
            <p className="text-sm text-muted-foreground mt-1">
              {message || t("activeNoteView.audioError")}
            </p>
          </div>
        </div>
      );
    }
    return (
      <div className="flex flex-col items-center justify-center h-full text-center space-y-4 px-4">
        <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
          <Loader2 className="w-6 h-6 text-primary animate-spin" />
        </div>
        <div>
          <h3 className="text-lg font-semibold">{t("activeNoteView.generatingAudioOverview")}</h3>
          <p className="text-sm text-muted-foreground mt-1">
            {t("activeNoteView.generatingAudioDesc")}
          </p>
        </div>
      </div>
    );
  }

  // Written questions view
  if (isWrittenQuestionsNote(activeNote)) {
    return (
      <WrittenQuestionsView
        note={activeNote}
        onNoteUpdate={(updatedNote) => onUpdateNoteFull?.(activeNote.id, updatedNote)}
        onBack={undefined}
      />
    );
  }

  // Infographic view
  if (isInfographicNote(activeNote)) {
    return (
      <InfographicView
        note={activeNote}
        onNoteUpdate={(updatedNote) => onUpdateNoteFull?.(activeNote.id, updatedNote)}
        registerControls={registerInfographicControls}
        onFullscreenChange={onInfographicFullscreenChange}
      />
    );
  }

  // Spreadsheet view
  if (isSpreadsheetNote(activeNote)) {
    return <SpreadsheetView note={activeNote} onBack={undefined} />;
  }

  // User note view
  if (isUserNote(activeNote)) {
    return <UserNoteView note={activeNote} onBack={isMobile ? onBack : undefined} />;
  }

  // Fallback for unknown note types
  return (
    <div className="flex flex-col items-center justify-center h-full text-center space-y-4">
      <div className="w-12 h-12 rounded-xl bg-muted flex items-center justify-center">
        <X className="w-6 h-6 text-muted-foreground" />
      </div>
      <div>
        <h3 className="text-lg font-semibold">{t("activeNoteView.unknownNoteType")}</h3>
        <p className="text-sm text-muted-foreground mt-1">
          {t("activeNoteView.unknownNoteTypeDesc")}
        </p>
      </div>
    </div>
  );
};
