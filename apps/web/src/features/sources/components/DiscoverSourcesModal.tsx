import React, { useState, useEffect, useRef } from "react";
import {
  X,
  Search,
  Globe,
  Plus,
  Loader2,
  ExternalLink,
  Newspaper,
  GraduationCap,
  TrendingUp,
  SlidersHorizontal,
  List,
  LayoutGrid,
  BookOpen,
  Quote,
  Check,
  FileStack,
} from "lucide-react";
import { Source, UnifiedDiscoveryResult } from "@/shared/types/index";
import { useUnifiedDiscovery, useCreateDocument } from "../services/documentsApi";
import { useToast } from "@/shared/contexts/ToastContext";
import { useSessionStorage } from "@/hooks/useSessionStorage";

interface DiscoverSourcesModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddSource: (source: Source) => void;
  isAtLimit: boolean;
  userId?: string | null;
  noteId?: string | null;
  onDocumentUploaded?: (documentId: string) => void;
  /** Same pattern as "Discover sources" in Add source modal — return to the add-sources flow */
  onAddSourcesClick?: () => void;
}

interface FilterState {
  sourceTypes: ("web" | "news" | "academic" | "finance")[];
  timeRange?: "day" | "week" | "month" | "year";
  academic: {
    minCitations?: number;
    openAccessOnly?: boolean;
    hasFullText?: boolean;
  };
  sortBy: "relevance" | "date" | "citations";
  maxResults: number;
}

const DEFAULT_FILTERS: FilterState = {
  sourceTypes: ["web"],
  sortBy: "relevance",
  maxResults: 20,
  academic: {},
};

/** Tavily Search caps `max_results` at 20; discovery total budget matches that ceiling. */
const MAX_DISCOVERY_TOTAL_RESULTS = 20;

/** Subtle active state — avoids bright per-type pastels; uses theme tokens only */
const SOURCE_TYPE_ACTIVE = "bg-secondary text-foreground border-border/80 shadow-sm ring-1 ring-border/50";

const SOURCE_TYPE_CONFIG = {
  web: { label: "Web", icon: Globe, activeClass: SOURCE_TYPE_ACTIVE },
  news: { label: "News", icon: Newspaper, activeClass: SOURCE_TYPE_ACTIVE },
  academic: { label: "Academic", icon: GraduationCap, activeClass: SOURCE_TYPE_ACTIVE },
  finance: { label: "Finance", icon: TrendingUp, activeClass: SOURCE_TYPE_ACTIVE },
} as const;

type SourceType = keyof typeof SOURCE_TYPE_CONFIG;

function getHostname(url: string): string {
  try {
    return new URL(url).hostname;
  } catch {
    return url;
  }
}

function getScoreBadge(score: number) {
  if (score >= 0.8) return { label: "high relevance", className: "bg-secondary text-muted-foreground" };
  if (score >= 0.6) return { label: "medium relevance", className: "bg-muted/80 text-muted-foreground" };
  return null;
}

export const DiscoverSourcesModal: React.FC<DiscoverSourcesModalProps> = ({
  isOpen,
  onClose,
  onAddSource,
  isAtLimit,
  userId,
  noteId,
  onDocumentUploaded,
  onAddSourcesClick,
}) => {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<UnifiedDiscoveryResult[]>([]);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [addingIds, setAddingIds] = useState<Set<string>>(new Set());
  const [addedUrls, setAddedUrls] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [viewMode, setViewMode] = useState<"list" | "grid">("list");
  const [filters, setFilters] = useSessionStorage<FilterState>("discovery-filters", DEFAULT_FILTERS);

  useEffect(() => {
    setFilters((prev) =>
      prev.maxResults > MAX_DISCOVERY_TOTAL_RESULTS
        ? { ...prev, maxResults: MAX_DISCOVERY_TOTAL_RESULTS }
        : prev
    );
    // One-time clamp for session keys saved when the slider allowed 50.
    // eslint-disable-next-line react-hooks/exhaustive-deps -- run once on mount
  }, []);

  const discover = useUnifiedDiscovery();
  const createDocument = useCreateDocument();
  const { error: showError } = useToast();
  const filterRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Close filter popover on outside click
  useEffect(() => {
    if (!showFilters) return;
    const handleClick = (e: MouseEvent) => {
      if (filterRef.current && !filterRef.current.contains(e.target as Node)) {
        setShowFilters(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [showFilters]);

  // Keyboard navigation
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && showFilters) {
        setShowFilters(false);
        return;
      }
      if (e.key === "Escape") {
        onClose();
        return;
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, showFilters, onClose]);

  const handleSearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!query.trim()) return;

    setIsLoading(true);
    setError(null);
    setResults([]);
    setSelectedIds(new Set());

    try {
      const response = await discover({
        query: query.trim(),
        sourceTypes: filters.sourceTypes,
        timeRange: filters.timeRange,
        academicFilters: filters.academic,
        maxResults: filters.maxResults,
        sortBy: filters.sortBy,
      });

      setResults(response.sources);
      if (response.sources.length === 0) {
        setError("No sources found. Try a different query or adjust your filters.");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Search failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddSingle = async (result: UnifiedDiscoveryResult) => {
    if (isAtLimit || !userId || !noteId || addedUrls.has(result.url)) return;

    setAddingIds((prev) => new Set(prev).add(result.id));

    try {
      await addResult(result);
      setAddedUrls((prev) => new Set(prev).add(result.url));
      setSelectedIds((prev) => {
        const next = new Set(prev);
        next.delete(result.id);
        return next;
      });
    } catch (err) {
      showError(err instanceof Error ? err.message : "Failed to add source");
    } finally {
      setAddingIds((prev) => {
        const next = new Set(prev);
        next.delete(result.id);
        return next;
      });
    }
  };

  const handleAddSelected = async () => {
    if (isAtLimit || !userId || !noteId) return;

    const toAdd = results.filter(
      (r) => selectedIds.has(r.id) && !addedUrls.has(r.url) && !addingIds.has(r.id)
    );
    if (toAdd.length === 0) return;

    setAddingIds((prev) => {
      const next = new Set(prev);
      toAdd.forEach((r) => next.add(r.id));
      return next;
    });

    let succeeded = 0;
    for (const result of toAdd) {
      try {
        await addResult(result);
        setAddedUrls((prev) => new Set(prev).add(result.url));
        succeeded++;
      } catch (err) {
        showError(err instanceof Error ? err.message : "Failed to add source");
      }
    }

    setAddingIds((prev) => {
      const next = new Set(prev);
      toAdd.forEach((r) => next.delete(r.id));
      return next;
    });
    setSelectedIds(new Set());
  };

  const addResult = async (result: UnifiedDiscoveryResult) => {
    const response = await createDocument({
      notebookId: noteId!,
      type: "url",
      source: result.url,
      fileName: result.title || result.url,
    });

    const newSource: Source = {
      id: response.documentId,
      title: result.title,
      type: "WEB",
      date: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric" }),
      selected: true,
      status: "pending",
      url: result.url,
      remoteRefreshKind: "url",
    };

    onAddSource(newSource);
    onDocumentUploaded?.(response.documentId);
  };

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleSourceType = (type: SourceType) => {
    setFilters((prev) => {
      const types = prev.sourceTypes.includes(type)
        ? prev.sourceTypes.filter((t) => t !== type)
        : [...prev.sourceTypes, type];
      return { ...prev, sourceTypes: types.length > 0 ? types : ["web"] };
    });
  };

  const clearSelection = () => setSelectedIds(new Set());

  const selectedCount = selectedIds.size;

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-100 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-5xl bg-card text-card-foreground rounded-xl shadow-2xl border border-border flex flex-col max-h-[90vh] min-h-0 font-sans"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header — matches AddSourceModal */}
        <div className="flex items-center justify-between p-6 border-b border-border/50 bg-card">
          <div className="flex items-center gap-2">
            <div className="flex items-center justify-center">
              <FileStack className="w-5 h-5 text-primary" />
            </div>
            <h2 className="text-xl font-bold">SolomindLM</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-secondary/50 rounded-xl transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* No overflow-hidden here — it would clip the Filters popover; scrolling lives in the results panel */}
        <div className="flex flex-1 min-h-0 flex-col">
          <div className="relative z-10 flex-shrink-0 p-6 md:p-10 space-y-6 bg-card/50 border-b border-border/30">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <h3 className="text-2xl font-medium">Discover sources</h3>
              {onAddSourcesClick && (
                <button
                  type="button"
                  onClick={onAddSourcesClick}
                  className="hidden sm:inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl border border-border hover:bg-secondary/50 transition-colors text-sm font-medium"
                >
                  <FileStack className="w-4 h-4 shrink-0" />
                  Add sources
                </button>
              )}
            </div>

            <div className="border border-border/50 rounded-xl p-5 bg-card shadow-sm">
              <form onSubmit={handleSearch} className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  ref={inputRef}
                  autoFocus
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search for articles, papers, or websites..."
                  className="w-full pl-10 pr-28 py-3 bg-secondary/20 border border-border rounded-lg text-sm focus:outline-none focus:border-primary transition-colors placeholder:text-muted-foreground/50"
                />
                <button
                  type="submit"
                  disabled={isLoading || !query.trim()}
                  className="absolute right-1.5 top-1/2 -translate-y-1/2 h-9 px-5 bg-primary text-primary-foreground text-sm font-medium rounded-lg hover:bg-primary/90 disabled:opacity-50 transition-all inline-flex items-center gap-1.5"
                >
                  {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Search"}
                </button>
              </form>
            </div>

            <div className="border border-border/50 rounded-xl p-4 bg-card shadow-sm flex flex-wrap items-center gap-2">
              {(Object.entries(SOURCE_TYPE_CONFIG) as [SourceType, (typeof SOURCE_TYPE_CONFIG)[SourceType]][]).map(
                ([key, config]) => {
                  const Icon = config.icon;
                  const isActive = filters.sourceTypes.includes(key);
                  return (
                    <button
                      key={key}
                      type="button"
                      onClick={() => toggleSourceType(key)}
                      className={`inline-flex h-9 items-center gap-1.5 px-3.5 rounded-lg border text-sm font-medium transition-all ${
                        isActive
                          ? config.activeClass
                          : "border-transparent bg-secondary/30 text-muted-foreground hover:bg-secondary/50 hover:border-border"
                      }`}
                    >
                      <Icon className="w-3.5 h-3.5 shrink-0" />
                      {config.label}
                    </button>
                  );
                }
              )}

              <div className="flex-1 min-w-[1rem]" />

              <div ref={filterRef} className="relative">
                <button
                  type="button"
                  onClick={() => setShowFilters(!showFilters)}
                  className={`inline-flex h-9 items-center gap-2 px-3 rounded-lg border text-sm font-medium transition-all ${
                    showFilters
                      ? "border-border bg-secondary/50 text-foreground"
                      : "border-transparent bg-secondary/30 text-muted-foreground hover:bg-secondary/50 hover:border-border"
                  }`}
                >
                  <SlidersHorizontal className="w-3.5 h-3.5 shrink-0" />
                  Filters
                </button>
                {showFilters && (
              <div className="absolute right-0 top-full mt-2 bg-card border border-border rounded-xl shadow-lg p-4 w-56 z-20 animate-in fade-in slide-in-from-top-2 duration-150">
                {/* Time range */}
                <label className="block text-[11px] font-medium text-muted-foreground uppercase tracking-wide mb-1.5">
                  Time range
                </label>
                <select
                  value={filters.timeRange || ""}
                  onChange={(e) =>
                    setFilters((prev) => ({
                      ...prev,
                      timeRange: (e.target.value || undefined) as FilterState["timeRange"],
                    }))
                  }
                  className="w-full px-2.5 py-1.5 bg-background border border-border rounded-md text-sm mb-3 focus:outline-none focus:border-primary"
                >
                  <option value="">All time</option>
                  <option value="day">Past day</option>
                  <option value="week">Past week</option>
                  <option value="month">Past month</option>
                  <option value="year">Past year</option>
                </select>

                {/* Sort */}
                <label className="block text-[11px] font-medium text-muted-foreground uppercase tracking-wide mb-1.5">
                  Sort by
                </label>
                <select
                  value={filters.sortBy}
                  onChange={(e) =>
                    setFilters((prev) => ({ ...prev, sortBy: e.target.value as FilterState["sortBy"] }))
                  }
                  className="w-full px-2.5 py-1.5 bg-background border border-border rounded-md text-sm mb-3 focus:outline-none focus:border-primary"
                >
                  <option value="relevance">Relevance</option>
                  <option value="date">Date</option>
                  <option value="citations">Citations</option>
                </select>

                {/* Total result budget, split across selected source types */}
                <label className="block text-[11px] font-medium text-muted-foreground uppercase tracking-wide mb-1.5">
                  Total results: {filters.maxResults}
                </label>
                <input
                  type="range"
                  min="5"
                  max={MAX_DISCOVERY_TOTAL_RESULTS}
                  step="5"
                  value={filters.maxResults}
                  onChange={(e) =>
                    setFilters((prev) => ({ ...prev, maxResults: parseInt(e.target.value) }))
                  }
                  className="w-full"
                />

                {/* Academic filters */}
                {filters.sourceTypes.includes("academic") && (
                  <>
                    <div className="border-t border-border/50 my-3" />
                    <label className="block text-[11px] font-medium text-muted-foreground uppercase tracking-wide mb-1.5">
                      Academic
                    </label>
                    <select
                      value={filters.academic.minCitations || ""}
                      onChange={(e) =>
                        setFilters((prev) => ({
                          ...prev,
                          academic: {
                            ...prev.academic,
                            minCitations: e.target.value ? parseInt(e.target.value) : undefined,
                          },
                        }))
                      }
                      className="w-full px-2.5 py-1.5 bg-background border border-border rounded-md text-sm mb-2 focus:outline-none focus:border-primary"
                    >
                      <option value="">Any citations</option>
                      <option value="10">10+</option>
                      <option value="50">50+</option>
                      <option value="100">100+</option>
                      <option value="500">500+</option>
                    </select>
                    <label className="flex items-center gap-2 cursor-pointer text-sm mb-1">
                      <input
                        type="checkbox"
                        checked={filters.academic.openAccessOnly || false}
                        onChange={(e) =>
                          setFilters((prev) => ({
                            ...prev,
                            academic: { ...prev.academic, openAccessOnly: e.target.checked || undefined },
                          }))
                        }
                        className="w-3.5 h-3.5 rounded border-border"
                      />
                      Open access only
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer text-sm">
                      <input
                        type="checkbox"
                        checked={filters.academic.hasFullText || false}
                        onChange={(e) =>
                          setFilters((prev) => ({
                            ...prev,
                            academic: { ...prev.academic, hasFullText: e.target.checked || undefined },
                          }))
                        }
                        className="w-3.5 h-3.5 rounded border-border"
                      />
                      Has full text
                    </label>
                  </>
                )}

                {/* Reset */}
                <button
                  type="button"
                  onClick={() => setFilters(DEFAULT_FILTERS)}
                  className="w-full mt-3 px-3 py-1.5 text-xs text-muted-foreground hover:text-destructive transition-colors border border-border rounded-md hover:border-destructive/30"
                >
                  Reset filters
                </button>
              </div>
                )}
              </div>

              <button
                type="button"
                onClick={() => setViewMode((v) => (v === "list" ? "grid" : "list"))}
                className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-transparent bg-secondary/30 text-muted-foreground hover:bg-secondary/50 hover:border-border transition-colors shrink-0"
                title={viewMode === "list" ? "Grid view" : "List view"}
              >
                {viewMode === "list" ? (
                  <LayoutGrid className="w-4 h-4" />
                ) : (
                  <List className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>

          {results.length > 0 && (
            <div className="flex-shrink-0 flex items-center justify-between px-6 md:px-10 py-2 border-b border-border/40 text-xs text-muted-foreground bg-card/50">
              <span>
                {results.length} result{results.length !== 1 ? "s" : ""} &middot;{" "}
                {filters.sourceTypes.map((t) => SOURCE_TYPE_CONFIG[t].label).join(", ")}
              </span>
              <span>{selectedCount} selected</span>
            </div>
          )}

          <div
            className={`flex-1 min-h-0 overflow-y-auto overflow-x-hidden bg-card/50 px-6 md:px-10 ${selectedCount > 0 ? "pb-0" : "pb-6"}`}
          >
          {isLoading ? (
            <div className="flex flex-col items-center justify-center min-h-80 text-center space-y-3">
              <Loader2 className="w-8 h-8 text-primary animate-spin" />
              <div>
                <p className="font-medium text-sm">Searching across sources...</p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Finding the most relevant sources for you.
                </p>
              </div>
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center min-h-80 text-center p-6">
              <p className="text-destructive font-medium text-sm mb-0.5">Search encountered an issue</p>
              <p className="text-muted-foreground text-xs">{error}</p>
            </div>
          ) : results.length > 0 ? (
            viewMode === "list" ? (
              <div className="divide-y divide-border/30">
                {results.map((result) => (
                  <ResultRow
                    key={result.id}
                    result={result}
                    isSelected={selectedIds.has(result.id)}
                    isAdding={addingIds.has(result.id)}
                    isAdded={addedUrls.has(result.url)}
                    isAtLimit={isAtLimit}
                    onToggleSelect={() => toggleSelect(result.id)}
                    onAdd={() => handleAddSingle(result)}
                  />
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6 py-4">
                {results.map((result) => (
                  <ResultCard
                    key={result.id}
                    result={result}
                    isAdding={addingIds.has(result.id)}
                    isAdded={addedUrls.has(result.url)}
                    isAtLimit={isAtLimit}
                    onAdd={() => handleAddSingle(result)}
                  />
                ))}
              </div>
            )
          ) : (
            <div className="flex flex-col items-center justify-center min-h-80 text-center opacity-40">
              <Search className="w-8 h-8 mb-3" />
              <p className="text-sm italic">Enter a topic to discover related sources</p>
            </div>
          )}
        </div>
        </div>

        {selectedCount > 0 && (
          <div className="flex items-center justify-between p-4 bg-secondary/10 border-t border-border gap-3 shrink-0 rounded-b-xl animate-in slide-in-from-bottom-2 duration-200">
            <span className="text-sm text-muted-foreground font-medium">
              {selectedCount} selected
            </span>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={clearSelection}
                className="px-3 py-1.5 text-xs font-medium text-muted-foreground border border-border rounded-md hover:border-border/80 transition-colors"
              >
                Clear
              </button>
              <button
                type="button"
                onClick={handleAddSelected}
                disabled={isAtLimit}
                className="px-4 py-1.5 text-xs font-semibold bg-primary/10 text-primary rounded-md hover:bg-primary hover:text-primary-foreground transition-all disabled:opacity-50"
              >
                Add selected
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// ── List row ────────────────────────────────────────────────────────────────

interface ResultRowProps {
  result: UnifiedDiscoveryResult;
  isSelected: boolean;
  isAdding: boolean;
  isAdded: boolean;
  isAtLimit: boolean;
  onToggleSelect: () => void;
  onAdd: () => void;
}

const ResultRow: React.FC<ResultRowProps> = ({
  result,
  isSelected,
  isAdding,
  isAdded,
  isAtLimit,
  onToggleSelect,
  onAdd,
}) => {
  const badge = getScoreBadge(result.score);

  return (
    <div
      onClick={onToggleSelect}
      className={`flex items-start gap-3 py-2.5 cursor-pointer transition-colors ${
        isSelected ? "bg-primary/5" : "hover:bg-secondary/40"
      }`}
    >
      {/* Checkbox */}
      <div
        className={`w-4 h-4 mt-0.5 rounded flex-shrink-0 flex items-center justify-center border transition-colors ${
          isSelected ? "bg-primary border-primary" : "border-border"
        }`}
      >
        {isSelected && <Check className="w-2.5 h-2.5 text-primary-foreground" />}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-foreground leading-snug truncate">
          {result.title}
        </p>
        <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2 leading-relaxed">
          {result.snippet}
        </p>
        <div className="flex items-center gap-2 mt-1">
          <span className="text-[11px] text-muted-foreground">
            {result.metadata.domain || getHostname(result.url)}
          </span>
          {badge && (
            <span className={`text-[11px] px-1.5 py-px rounded-full ${badge.className}`}>
              {badge.label}
            </span>
          )}
          {result.sourceType === "academic" && result.metadata.openAccess && (
            <span className="text-[11px] px-1.5 py-px rounded-full bg-secondary text-muted-foreground inline-flex items-center gap-0.5">
              <BookOpen className="w-2.5 h-2.5" />
              open access
            </span>
          )}
          {result.sourceType === "academic" && result.metadata.citationCount !== undefined && (
            <span className="text-[11px] text-muted-foreground inline-flex items-center gap-0.5">
              <Quote className="w-2.5 h-2.5" />
              {result.metadata.citationCount}
            </span>
          )}
          <a
            href={result.url}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="text-muted-foreground hover:text-primary transition-colors"
          >
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      </div>

      {/* Add button */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          if (isAdded) return;
          onAdd();
        }}
        disabled={isAdded || isAdding || isAtLimit}
        className={`flex-shrink-0 text-xs px-2.5 py-1 rounded-md border transition-all mt-0.5 ${
          isAdded
            ? "border-border text-muted-foreground cursor-default"
            : isAdding
              ? "border-primary/30 text-primary cursor-wait"
              : "border-border text-muted-foreground hover:border-primary/40 hover:text-primary"
        }`}
        title={isAtLimit ? "Source limit reached" : undefined}
      >
        {isAdding ? (
          <Loader2 className="w-3 h-3 animate-spin" />
        ) : isAdded ? (
          "Added"
        ) : isAtLimit ? (
          "Limit"
        ) : (
          "+ Add"
        )}
      </button>
    </div>
  );
};

// ── Grid card (fallback view) ───────────────────────────────────────────────

interface ResultCardProps {
  result: UnifiedDiscoveryResult;
  isAdding: boolean;
  isAdded: boolean;
  isAtLimit: boolean;
  onAdd: () => void;
}

const ResultCard: React.FC<ResultCardProps> = ({ result, isAdding, isAdded, isAtLimit, onAdd }) => {
  const badge = getScoreBadge(result.score);
  const config = SOURCE_TYPE_CONFIG[result.sourceType];
  const Icon = config.icon;

  return (
    <div className="group border border-border/50 rounded-xl p-5 bg-card shadow-sm hover:shadow-md hover:border-primary/20 transition-all flex flex-col justify-between">
      <div className="space-y-2">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
            <Icon className="w-3 h-3" />
            {config.label}
          </div>
          <a
            href={result.url}
            target="_blank"
            rel="noopener noreferrer"
            className="p-1 hover:bg-secondary rounded text-muted-foreground hover:text-primary transition-colors"
          >
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>

        <h3 className="font-medium text-sm leading-snug line-clamp-2 group-hover:text-primary transition-colors">
          {result.title}
        </h3>

        <p className="text-xs text-muted-foreground line-clamp-3 leading-relaxed">
          {result.snippet}
        </p>

        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-[11px] text-muted-foreground">
            {result.metadata.domain || getHostname(result.url)}
          </span>
          {badge && (
            <span className={`text-[11px] px-1.5 py-px rounded-full ${badge.className}`}>
              {badge.label}
            </span>
          )}
          {result.sourceType === "academic" && result.metadata.citationCount !== undefined && (
            <span className="text-[11px] text-muted-foreground inline-flex items-center gap-0.5">
              <Quote className="w-2.5 h-2.5" />
              {result.metadata.citationCount}
            </span>
          )}
        </div>
      </div>

      <div className="mt-3 pt-2 border-t border-border/30 flex justify-end">
        <button
          type="button"
          onClick={onAdd}
          disabled={isAdded || isAdding || isAtLimit}
          className={`px-3 py-1 rounded-md text-xs font-medium transition-all flex items-center gap-1.5 ${
            isAdded || isAtLimit
              ? "bg-secondary text-muted-foreground cursor-default"
              : isAdding
                ? "bg-primary/50 text-primary-foreground cursor-wait"
                : "bg-primary/10 text-primary hover:bg-primary hover:text-primary-foreground"
          }`}
          title={isAtLimit ? "Source limit reached" : undefined}
        >
          {isAdding ? (
            <Loader2 className="w-3 h-3 animate-spin" />
          ) : isAdded ? (
            "Added"
          ) : isAtLimit ? (
            "Limit"
          ) : (
            <>
              <Plus className="w-3 h-3" />
              Add
            </>
          )}
        </button>
      </div>
    </div>
  );
};
