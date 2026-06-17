import { ExternalLink, Globe, GraduationCap, Newspaper, Plus, TrendingUp, X } from "lucide-react";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { Favicon } from "@/shared/components/Favicon";

export interface ExternalSource {
  title: string;
  url: string;
  snippet: string;
  sourceType: string;
  score?: number;
}

const SOURCE_TYPE_ICON: Record<string, React.ElementType> = {
  web: Globe,
  academic: GraduationCap,
  news: Newspaper,
  finance: TrendingUp,
};

interface SourceSuggestionPromptProps {
  sources: ExternalSource[];
  onAddSelected: (sources: ExternalSource[]) => void;
  onDismiss: () => void;
}

export const SourceSuggestionPrompt: React.FC<SourceSuggestionPromptProps> = ({
  sources,
  onAddSelected,
  onDismiss,
}) => {
  const { t } = useTranslation();
  const listFingerprint = useMemo(
    () => JSON.stringify(sources.map((s) => [s.url, s.title, s.snippet])),
    [sources]
  );

  const [selected, setSelected] = useState<Set<number>>(() => new Set());

  useEffect(() => {
    setSelected(new Set());
  }, [listFingerprint, sources.length]);

  const toggleIndex = useCallback((index: number) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(index)) next.delete(index);
      else next.add(index);
      return next;
    });
  }, []);

  const allSelected = sources.length > 0 && selected.size === sources.length;
  const selectAll = useCallback(() => {
    setSelected(new Set(sources.map((_, i) => i)));
  }, [sources]);

  const deselectAll = useCallback(() => {
    setSelected(new Set());
  }, []);

  if (sources.length === 0) return null;

  const handleAdd = () => {
    const chosen = sources.filter((_, i) => selected.has(i));
    if (chosen.length > 0) onAddSelected(chosen);
  };

  return (
    <div className="bg-card border-2 border-primary/30 rounded-xl p-4 space-y-3">
      <div className="flex items-center justify-between gap-2">
        <div className="min-w-0">
          <h4 className="font-semibold text-sm text-primary">
            {t("sourceSuggestion.foundSources", { count: sources.length })}
          </h4>
          <p className="text-xs text-muted-foreground mt-0.5">{t("sourceSuggestion.selectHint")}</p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={allSelected ? deselectAll : selectAll}
            className="text-xs font-medium text-primary hover:underline"
          >
            {allSelected ? t("sourceSuggestion.deselectAll") : t("sourceSuggestion.selectAll")}
          </button>
          <button
            type="button"
            onClick={onDismiss}
            className="p-1.5 rounded-lg hover:bg-muted/80 transition-colors"
            title={t("sourceSuggestion.dismiss")}
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="space-y-2 max-h-60 overflow-y-auto">
        {sources.map((source, index) => {
          const Icon = SOURCE_TYPE_ICON[source.sourceType] ?? Globe;
          const isChecked = selected.has(index);
          return (
            <div
              key={index}
              className="flex gap-2.5 items-start p-2 rounded-lg hover:bg-muted/50 transition-colors"
            >
              <input
                type="checkbox"
                className="mt-1 h-3.5 w-3.5 shrink-0 rounded border-border text-primary focus-visible:ring-2 focus-visible:ring-primary/30 focus-visible:ring-offset-2 focus-visible:ring-offset-background cursor-pointer"
                checked={isChecked}
                onChange={() => toggleIndex(index)}
                aria-label={t("sourceSuggestion.includeSource", { title: source.title })}
              />
              {source.sourceType === "web" ? (
                <Favicon url={source.url} size={16} className="mt-0.5" />
              ) : (
                <Icon className="w-4 h-4 shrink-0 mt-0.5 text-muted-foreground" />
              )}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  <a
                    href={source.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm font-medium text-foreground hover:text-primary transition-colors truncate"
                  >
                    {source.title}
                  </a>
                  <ExternalLink className="w-3 h-3 shrink-0 text-muted-foreground" />
                </div>
                {source.snippet && (
                  <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
                    {source.snippet}
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <div className="flex items-center gap-2 pt-2 border-t border-border">
        <button
          type="button"
          onClick={handleAdd}
          disabled={selected.size === 0}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:pointer-events-none"
        >
          <Plus className="w-4 h-4" />
          {selected.size === 0
            ? t("sourceSuggestion.addToNotebook")
            : t("sourceSuggestion.addCountToNotebook", { count: selected.size })}
        </button>
        <button
          type="button"
          onClick={onDismiss}
          className="px-4 py-2 border border-border rounded-lg text-sm font-medium hover:bg-muted/80 transition-colors"
        >
          {t("sourceSuggestion.skip")}
        </button>
      </div>
    </div>
  );
};
