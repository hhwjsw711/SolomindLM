import {
  Brain,
  Check,
  FileText,
  ListOrdered,
  Loader2,
  PenLine,
  Search,
  Sparkles,
} from "lucide-react";
import React from "react";
import i18next from "@/i18n";

export function getStatusIcon(status?: string): React.ReactNode {
  switch (status) {
    case "searching":
      return <Search className="w-3.5 h-3.5" />;
    case "reading":
      return <FileText className="w-3.5 h-3.5" />;
    case "planning":
      return <Brain className="w-3.5 h-3.5" />;
    case "thinking":
      return <Brain className="w-3.5 h-3.5" />;
    case "generating":
      return <Loader2 className="w-3.5 h-3.5 animate-spin" />;
    case "writing":
      return <PenLine className="w-3.5 h-3.5 text-foreground/70" />;
    case "retrieving":
      return <Search className="w-3.5 h-3.5" />;
    case "embedding":
      return <Sparkles className="w-3.5 h-3.5" />;
    case "ranking":
      return <ListOrdered className="w-3.5 h-3.5" />;
    case "completed":
      return <Check className="w-3.5 h-3.5 text-vintage-green-700 dark:text-vintage-green-600" />;
    default:
      return status ? <Brain className="w-3.5 h-3.5" /> : null;
  }
}

export function getStatusMessage(status?: string): string | null {
  switch (status) {
    case "searching":
      return i18next.t("chat:status.searching");
    case "reading":
      return i18next.t("chat:status.reading");
    case "planning":
      return i18next.t("chat:status.planning");
    case "thinking":
      return i18next.t("chat:status.thinking");
    case "generating":
      return i18next.t("chat:status.generating");
    case "writing":
      return i18next.t("chat:status.writing");
    case "retrieving":
      return i18next.t("chat:status.retrieving");
    case "embedding":
      return i18next.t("chat:status.embedding");
    case "ranking":
      return i18next.t("chat:status.ranking");
    case "completed":
      return i18next.t("chat:status.completed");
    default:
      return status ? status.replace(/_/g, " ") : null;
  }
}

const STATUS_DETAIL_KEY_MAP: Record<string, string> = {
  "Generating response...": "chat:status.detail.generating_response",
  "Planning searches\u2026": "chat:status.detail.planning_searches",
  "Searching your materials\u2026": "chat:status.detail.searching_materials",
  "Formulating answer...": "chat:status.detail.formulating_answer",
  "Running approved research\u2026": "chat:status.detail.running_research",
  "Searching...": "chat:status.detail.searching",
};

export function getStatusDetailMessage(detail?: string | null): string | null {
  if (!detail?.trim()) return null;
  const key = STATUS_DETAIL_KEY_MAP[detail];
  return key ? i18next.t(key) : detail;
}
