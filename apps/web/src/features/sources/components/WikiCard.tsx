import React, { useState, useMemo, useLayoutEffect, useCallback } from "react";
import {
  BookOpen,
  RefreshCw,
  Loader2,
  Square,
  ChevronDown,
  ChevronRight,
} from "lucide-react";
import type { Wiki, WikiArticle } from "../services/wikiApi";
import { useSetAutoUpdate } from "../services/wikiApi";

interface WikiCardProps {
  wiki: Wiki | null | undefined;
  isPending?: boolean;
  onCreateWiki: () => void;
  onRegenerateWiki?: () => void;
  onCancelGeneration?: () => void;
  onOpenArticle?: (path: string) => void;
}

type CategoryTab = "concepts" | "connections" | "qa" | "index";

const TAB_LABELS: Record<CategoryTab, string> = {
  concepts: "Concepts",
  connections: "Connections",
  qa: "Q&A",
  index: "Index",
};

const expandedStorageKey = (wikiId: string) => `wiki-card-expanded:${wikiId}`;

const ArticleRow: React.FC<{
  article: WikiArticle;
  onOpen: (path: string) => void;
}> = ({ article, onOpen }) => {
  const connectionCount = article.frontmatter?.relatedConcepts?.length ?? 0;
  const sourceCount = article.sources?.length ?? 0;

  return (
    <button
      type="button"
      onClick={() => onOpen(article.path)}
      className="w-full text-left px-2.5 py-2 rounded-md hover:bg-secondary/50 transition-colors group"
    >
      <div className="flex items-start gap-2">
        <p className="text-sm text-foreground leading-snug truncate flex-1">{article.title}</p>
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
          {connectionCount > 0 && (
            <span className="flex items-center gap-0.5" title={`Connected to ${connectionCount} concept${connectionCount > 1 ? 's' : ''}`}>
              <span className="w-1.5 h-1.5 rounded-full bg-blue-500" aria-hidden />
              {connectionCount}
            </span>
          )}
          {sourceCount > 0 && (
            <span className="flex items-center gap-0.5" title={`Built from ${sourceCount} source${sourceCount > 1 ? 's' : ''}`}>
              <span className="w-1.5 h-1.5 rounded-full bg-green-500" aria-hidden />
              {sourceCount}
            </span>
          )}
        </div>
      </div>
      {article.frontmatter?.summary && (
        <p className="text-xs text-muted-foreground leading-relaxed line-clamp-1 mt-0.5">
          {article.frontmatter.summary}
        </p>
      )}
    </button>
  );
};

export const WikiCard: React.FC<WikiCardProps> = ({
  wiki,
  isPending,
  onCreateWiki,
  onRegenerateWiki,
  onCancelGeneration,
  onOpenArticle,
}) => {
  const [activeTab, setActiveTab] = useState<CategoryTab>("concepts");
  const [isExpanded, setIsExpanded] = useState(false);
  const [optimisticAutoUpdate, setOptimisticAutoUpdate] = useState<boolean | undefined>(undefined);
  const setAutoUpdateMutation = useSetAutoUpdate();

  const wikiId = wiki?._id;

  useLayoutEffect(() => {
    if (!wikiId) return;
    try {
      const s = sessionStorage.getItem(expandedStorageKey(wikiId));
      if (s === "true") setIsExpanded(true);
      else if (s === "false") setIsExpanded(false);
    } catch {
      // ignore
    }
  }, [wikiId]);

  const setExpanded = useCallback(
    (value: boolean | ((prev: boolean) => boolean)) => {
      setIsExpanded((prev) => {
        const next = typeof value === "function" ? (value as (p: boolean) => boolean)(prev) : value;
        if (wikiId) {
          try {
            sessionStorage.setItem(expandedStorageKey(wikiId), next ? "true" : "false");
          } catch {
            // ignore
          }
        }
        return next;
      });
    },
    [wikiId]
  );

  const currentAutoUpdate = optimisticAutoUpdate ?? wiki?.autoUpdate ?? false;

  const articlesByCategory = useMemo(() => {
    if (!wiki?.articles) return { concepts: [], connections: [], qa: [], index: [] };
    return {
      concepts: wiki.articles.filter((a) => a.type === "concept"),
      connections: wiki.articles.filter((a) => a.type === "connection"),
      qa: wiki.articles.filter((a) => a.type === "qa"),
      index: wiki.articles.filter((a) => a.type === "index" || a.type === "log"),
    };
  }, [wiki?.articles]);

  const availableTabs = useMemo(
    () =>
      (Object.keys(articlesByCategory) as CategoryTab[]).filter(
        (k) => articlesByCategory[k].length > 0
      ),
    [articlesByCategory]
  );

  const resolvedTab =
    availableTabs.includes(activeTab) ? activeTab : (availableTabs[0] ?? "concepts");

  const handleAutoUpdateToggle = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!wiki) return;
    const next = !currentAutoUpdate;
    setOptimisticAutoUpdate(next);
    try {
      await setAutoUpdateMutation(wiki._id, next);
    } catch {
      setOptimisticAutoUpdate(undefined);
    }
  };

  // ── Empty state ──────────────────────────────────────────────────────────
  if (!wiki) {
    return (
      <button
        type="button"
        onClick={onCreateWiki}
        className="w-full group flex items-center gap-3 py-3 px-3 bg-card border border-dashed border-border rounded-lg hover:border-primary/40 hover:bg-secondary/20 transition-colors text-left"
      >
        <BookOpen className="w-5 h-5 text-muted-foreground group-hover:text-primary shrink-0 transition-colors" />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-foreground leading-snug">Knowledge Base</p>
          <p className="text-xs text-muted-foreground uppercase tracking-wide font-sans mt-0.5">
            Click to generate
          </p>
        </div>
        <ChevronRight className="w-4 h-4 text-muted-foreground/40 shrink-0 group-hover:text-muted-foreground transition-colors" />
      </button>
    );
  }

  const isDraft = wiki.status === "draft";
  const isGenerating = wiki.status === "generating" || Boolean(isPending);
  const isCompleted = wiki.status === "completed";
  const isFailed = wiki.status === "failed";

  const totalArticles = wiki.metadata?.articleCounts?.total ?? wiki.articles?.length ?? 0;
  const lastRefreshed = wiki.lastRefreshedAt
    ? new Date(wiki.lastRefreshedAt).toLocaleDateString(undefined, {
        month: "short",
        day: "numeric",
      })
    : null;

  return (
    <div
      className={`bg-card border rounded-lg overflow-hidden transition-colors ${
        isGenerating ? "border-primary/40" : "border-border"
      }`}
      aria-busy={isGenerating}
    >
      {/* Header row */}
      <div
        role={isCompleted || isFailed ? "button" : undefined}
        tabIndex={isCompleted || isFailed ? 0 : undefined}
        onClick={() => (isCompleted || isFailed) && setExpanded((v) => !v)}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            if (isCompleted || isFailed) setExpanded((v) => !v);
          }
        }}
        className={`flex items-center gap-3 py-3 px-3 ${
          isCompleted || isFailed
            ? "cursor-pointer hover:bg-secondary/30 transition-colors"
            : ""
        }`}
      >
        <div className="text-primary shrink-0">
          {isGenerating ? (
            <Loader2 className="w-5 h-5 animate-spin" aria-hidden />
          ) : (
            <BookOpen className="w-5 h-5" aria-hidden />
          )}
        </div>

        <div className="flex-1 min-w-0">
          <h4 className="text-sm font-medium text-foreground leading-snug">
            {wiki.title || "Knowledge Base"}
          </h4>
          <div className="text-xs text-muted-foreground uppercase tracking-wide font-sans mt-0.5">
            {isGenerating && <span className="text-primary">Building wiki…</span>}
            {!isGenerating && isFailed && "Generation failed"}
            {!isGenerating && isDraft && "Not generated yet"}
            {!isGenerating && isCompleted && (
              <>
                {totalArticles > 0 ? `${totalArticles} articles` : "Ready"}
                {lastRefreshed && <span className="ml-2 opacity-60">· {lastRefreshed}</span>}
                {currentAutoUpdate && (
                  <span className="ml-2 text-primary">· Auto-update on</span>
                )}
                {wiki.pendingJobId && !currentAutoUpdate && (
                  <span className="ml-2 text-primary">· Update scheduled</span>
                )}
              </>
            )}
          </div>
        </div>

        <div
          className="flex items-center gap-1 shrink-0"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Auto-update toggle */}
          {!isDraft && (
            <button
              type="button"
              role="switch"
              aria-checked={currentAutoUpdate}
              title={currentAutoUpdate ? "Disable auto-update" : "Enable auto-update"}
              onClick={handleAutoUpdateToggle}
              className={`relative h-4 w-7 shrink-0 rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 ${
                currentAutoUpdate ? "bg-primary" : "bg-muted"
              }`}
            >
              <span
                className={`pointer-events-none absolute top-0.5 block h-3 w-3 rounded-full bg-background shadow-sm ring-1 ring-black/10 transition-transform dark:ring-white/10 ${
                  currentAutoUpdate ? "left-[calc(100%-0.875rem)]" : "left-0.5"
                }`}
                aria-hidden
              />
            </button>
          )}

          {/* Stop generation */}
          {isGenerating && onCancelGeneration && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onCancelGeneration();
              }}
              className="p-1.5 rounded-md hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors"
              title="Stop generation"
            >
              <Square className="w-3.5 h-3.5 fill-current" />
            </button>
          )}

          {/* Regenerate */}
          {!isGenerating && onRegenerateWiki && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onRegenerateWiki();
              }}
              className="p-1.5 rounded-md hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors"
              title={isDraft ? "Generate wiki" : "Regenerate wiki"}
            >
              <RefreshCw className="w-3.5 h-3.5" />
            </button>
          )}

          {/* Expand chevron */}
          {(isCompleted || isFailed) && (
            <div className="text-muted-foreground pointer-events-none">
              {isExpanded ? (
                <ChevronDown className="w-4 h-4" />
              ) : (
                <ChevronRight className="w-4 h-4" />
              )}
            </div>
          )}
        </div>
      </div>

      {/* Generating progress */}
      {isGenerating && (
        <div className="px-3 pb-3 space-y-2">
          <div className="h-1 rounded-full bg-muted overflow-hidden">
            <div
              className="h-full w-1/2 rounded-full bg-primary/70 animate-pulse motion-reduce:animate-none"
              style={{ animationDuration: "1.4s" }}
            />
          </div>
          <p className="text-xs text-muted-foreground text-center">
            Compiling articles from your sources…
          </p>
        </div>
      )}

      {/* Error */}
      {!isGenerating && isFailed && isExpanded && wiki.error && (
        <div className="px-3 pb-3">
          <p className="text-xs text-destructive/80 leading-relaxed line-clamp-3 mb-2">
            {wiki.error}
          </p>
          {onRegenerateWiki && (
            <button
              type="button"
              onClick={onRegenerateWiki}
              className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              <RefreshCw className="w-3 h-3" />
              Try again
            </button>
          )}
        </div>
      )}

      {/* Article browser */}
      {isCompleted && isExpanded && (
        <div className="border-t border-border">
          {availableTabs.length > 0 ? (
            <>
              {/* Tabs */}
              <div className="flex border-b border-border px-1 pt-1">
                {availableTabs.map((tab) => {
                  const isActive = resolvedTab === tab;
                  const count = articlesByCategory[tab].length;
                  return (
                    <button
                      key={tab}
                      type="button"
                      onClick={() => setActiveTab(tab)}
                      className={`px-2.5 py-1.5 text-xs font-medium transition-colors border-b-2 -mb-px ${
                        isActive
                          ? "border-primary text-foreground"
                          : "border-transparent text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      {TAB_LABELS[tab]}{" "}
                      <span className={isActive ? "text-primary" : "text-muted-foreground/60"}>
                        {count}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Article list */}
              <div className="p-1.5 max-h-96 overflow-y-auto space-y-0.5">
                {articlesByCategory[resolvedTab].map((article) => (
                  <ArticleRow
                    key={article.path}
                    article={article}
                    onOpen={onOpenArticle ?? (() => {})}
                  />
                ))}
              </div>
            </>
          ) : (
            <div className="px-3 py-5 text-center">
              <p className="text-xs text-muted-foreground">No articles yet</p>
              {onRegenerateWiki && (
                <button
                  type="button"
                  onClick={onRegenerateWiki}
                  className="mt-2 text-xs text-primary hover:underline"
                >
                  Generate now
                </button>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
