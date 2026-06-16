import React, { useMemo } from "react";
import { useTranslation } from "react-i18next";

import { getNotebookLucideIcon } from "@/shared/notebook/notebookLucideIcon";

/** Clears the absolute composer (input shell + disclaimer + bottom offset). */
const COMPOSER_SCROLL_PADDING = "pb-[calc(12.5rem+env(safe-area-inset-bottom,0px))]";

interface ChatEmptyStateProps {
  onSendMessage: (text: string) => void;
  disabled?: boolean;
  sourceCount?: number;
  sourceSummary?: string | null;
  suggestions?: string[] | null;
  isLoadingSuggestions?: boolean;
  notebookIcon?: string | null;
  notebookCoverColor?: string | null;
  notebookTitle?: string;
}

export const ChatEmptyState: React.FC<ChatEmptyStateProps> = ({
  onSendMessage,
  disabled,
  sourceCount = 0,
  sourceSummary,
  suggestions,
  isLoadingSuggestions,
  notebookIcon,
  notebookCoverColor,
  notebookTitle,
}) => {
  const { t } = useTranslation("chat");
  const hasSources = sourceCount > 0;

  const STARTER_PROMPTS = useMemo(
    () => [t("empty.starter1"), t("empty.starter2"), t("empty.starter3"), t("empty.starter4")],
    [t]
  );

  const displaySuggestions = useMemo(() => {
    const raw = hasSources && suggestions?.length ? suggestions : STARTER_PROMPTS;
    const seen = new Set<string>();
    return raw.filter((text) => {
      const trimmed = text.trim();
      if (!trimmed || seen.has(trimmed)) return false;
      seen.add(trimmed);
      return true;
    });
  }, [hasSources, suggestions, STARTER_PROMPTS]);
  const notebookGlyph = getNotebookLucideIcon(notebookIcon);
  const iconTintClass = notebookCoverColor?.length
    ? notebookCoverColor.replace("bg-", "text-")
    : "text-primary";
  const iconBgClass = notebookCoverColor?.length
    ? notebookCoverColor.replace("-300", "-50").replace("-400", "-50").replace("-600", "-100")
    : "bg-primary/10";
  const heading =
    notebookTitle?.trim() ||
    (hasSources ? t("empty.hasSourcesHeading") : t("empty.noSourcesHeading"));

  return (
    <div className={`box-border w-full min-h-full px-6 pt-6 sm:pt-10 ${COMPOSER_SCROLL_PADDING}`}>
      <div className="mx-auto flex w-full max-w-xl flex-col items-center gap-8 sm:gap-10">
        <div className="flex w-full flex-col items-center gap-5 text-center">
          <div
            className={`flex size-16 items-center justify-center rounded-2xl ${iconBgClass} ring-1 ring-border shadow-sm`}
            aria-hidden
          >
            {React.createElement(notebookGlyph, {
              className: `size-8 ${iconTintClass}`,
              strokeWidth: 1.6,
            })}
          </div>

          <h2 className="font-serif text-pretty text-2xl font-semibold tracking-tight text-foreground sm:text-3xl sm:leading-tight">
            {heading}
          </h2>

          {hasSources && sourceSummary ? (
            <p className="font-serif text-pretty text-base leading-relaxed text-muted-foreground sm:text-lg max-w-sm">
              {sourceSummary}
            </p>
          ) : !hasSources ? (
            <p className="font-serif text-pretty text-base leading-relaxed text-muted-foreground sm:text-lg max-w-sm">
              {t("empty.addSources")}
            </p>
          ) : null}
        </div>

        <div className="flex w-full items-center gap-3">
          <div className="h-px flex-1 bg-border" />
          <span className="shrink-0 text-xs font-medium tracking-widest text-muted-foreground uppercase">
            {t("empty.tryAsking")}
          </span>
          <div className="h-px flex-1 bg-border" />
        </div>

        <div className="flex w-full flex-wrap justify-center gap-2.5">
          {isLoadingSuggestions ? (
            <>
              {[38, 52, 44, 48].map((w, i) => (
                <div
                  key={i}
                  className="h-10 animate-pulse rounded-xl border border-border bg-muted/70"
                  style={{ width: `${w}%` }}
                />
              ))}
            </>
          ) : (
            displaySuggestions.map((prompt, index) => (
              <button
                key={`suggestion-${index}`}
                type="button"
                disabled={disabled}
                onClick={() => onSendMessage(prompt)}
                className="inline-flex items-center rounded-xl border border-border bg-card px-4 py-2 font-serif text-sm leading-relaxed text-foreground shadow-sm transition-colors hover:bg-accent hover:border-primary/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-50"
              >
                {prompt}
              </button>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
