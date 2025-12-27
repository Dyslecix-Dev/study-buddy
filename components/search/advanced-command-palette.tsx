"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Command } from "cmdk";
import { FileText, CheckSquare, Brain, X, Folder, Library, Hash, Filter, Clock } from "lucide-react";
import { SearchFilters } from "@/lib/advanced-search";
import SearchFiltersComponent from "./search-filters";
import TagBadge from "@/components/tags/tag-badge";

interface Tag {
  id: string;
  name: string;
  color: string | null;
}

interface SearchResult {
  type: "note" | "task" | "flashcard" | "folder" | "tag";
  id: string;
  title: string;
  content?: string;
  url: string;
  tags?: string[];
  metadata?: Record<string, any>;
  highlight?: {
    title?: string;
    content?: string;
  };
}

interface SearchHistoryItem {
  id: string;
  query: string;
  filters: SearchFilters | null;
  resultCount: number;
  createdAt: string;
}

interface AdvancedCommandPaletteProps {
  availableTags?: Array<{ id: string; name: string; color: string | null }>;
  availableFolders?: Array<{ id: string; name: string }>;
  availableDecks?: Array<{ id: string; name: string }>;
}

export default function AdvancedCommandPalette({
  availableTags = [],
  availableFolders = [],
  availableDecks = [],
}: AdvancedCommandPaletteProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [searchHistory, setSearchHistory] = useState<SearchHistoryItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState<SearchFilters>({ type: "all" });
  const [showHistory, setShowHistory] = useState(false);
  const router = useRouter();

  // Fetch search history
  useEffect(() => {
    const fetchSearchHistory = async () => {
      try {
        const response = await fetch("/api/search/history");
        if (response.ok) {
          const data = await response.json();
          setSearchHistory(data.history || []);
        }
      } catch (error) {
        console.error("Error fetching search history:", error);
      }
    };

    if (open) {
      fetchSearchHistory();
    }
  }, [open]);

  // Listen for Cmd+K / Ctrl+K
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };

    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  // Perform advanced search
  const performSearch = useCallback(
    async (query: string, searchFilters: SearchFilters) => {
      if (!query && searchFilters.type === "all") {
        setResults([]);
        setShowHistory(true);
        return;
      }

      try {
        setLoading(true);
        setShowHistory(false);

        // Build query params
        const params = new URLSearchParams();
        if (query) params.set("q", query);
        if (searchFilters.type && searchFilters.type !== "all") params.set("type", searchFilters.type);
        if (searchFilters.tags) params.set("tags", searchFilters.tags.join(","));
        if (searchFilters.completed !== undefined) params.set("completed", String(searchFilters.completed));
        if (searchFilters.priority !== undefined) params.set("priority", String(searchFilters.priority));
        if (searchFilters.folderId) params.set("folderId", searchFilters.folderId);
        if (searchFilters.deckId) params.set("deckId", searchFilters.deckId);

        const response = await fetch(`/api/search/advanced?${params.toString()}`);
        if (response.ok) {
          const data = await response.json();
          setResults(data.results || []);

          // Save to search history if query is not empty
          if (query) {
            await fetch("/api/search/history", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                query,
                filters: searchFilters,
                resultCount: data.count || 0,
              }),
            });
          }
        }
      } catch (error) {
        console.error("Error performing search:", error);
      } finally {
        setLoading(false);
      }
    },
    []
  );

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      performSearch(search, filters);
    }, 300);

    return () => clearTimeout(timer);
  }, [search, filters, performSearch]);

  const handleSelect = (url: string) => {
    setOpen(false);
    setSearch("");
    setFilters({ type: "all" });
    router.push(url);
  };

  const handleHistoryClick = (historyItem: SearchHistoryItem) => {
    setSearch(historyItem.query);
    if (historyItem.filters) {
      setFilters(historyItem.filters);
    }
    setShowHistory(false);
  };

  const getIconForType = (type: string) => {
    switch (type) {
      case "folder":
        return <Folder size={16} style={{ color: "#ca8a04" }} />;
      case "note":
        return <FileText size={16} style={{ color: "#2563eb" }} />;
      case "task":
        return <CheckSquare size={16} style={{ color: "#16a34a" }} />;
      case "deck":
        return <Library size={16} style={{ color: "#4f46e5" }} />;
      case "flashcard":
        return <Brain size={16} style={{ color: "#9333ea" }} />;
      case "tag":
        return <Hash size={16} style={{ color: "#dc2626" }} />;
      default:
        return null;
    }
  };

  const getBackgroundForType = (type: string) => {
    switch (type) {
      case "folder":
        return "#fef3c7";
      case "note":
        return "#dbeafe";
      case "task":
        return "#dcfce7";
      case "deck":
        return "#e0e7ff";
      case "flashcard":
        return "#f3e8ff";
      case "tag":
        return "#fef2f2";
      default:
        return "var(--surface-hover)";
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/50" onClick={() => setOpen(false)}>
      <div className="fixed left-1/2 top-1/4 -translate-x-1/2 w-full max-w-3xl" onClick={(e) => e.stopPropagation()}>
        <Command shouldFilter={false} className="rounded-lg border shadow-lg" style={{ backgroundColor: "var(--surface)", borderColor: "var(--border)" }}>
          <div className="flex items-center border-b px-3" style={{ borderColor: "var(--border)" }}>
            <Command.Input
              value={search}
              onValueChange={setSearch}
              placeholder="Search with filters (e.g., 'tag:math type:note due:today')..."
              className="flex h-12 w-full rounded-md bg-transparent py-3 text-sm outline-none disabled:cursor-not-allowed disabled:opacity-50"
              style={{ color: "var(--text-primary)", caretColor: "var(--text-primary)" }}
            />
            <SearchFiltersComponent filters={filters} onFiltersChange={setFilters} availableTags={availableTags} availableFolders={availableFolders} availableDecks={availableDecks} />
            <button
              onClick={() => setOpen(false)}
              className="p-2 ml-2 transition-colors duration-300 rounded cursor-pointer"
              style={{ color: "var(--text-muted)" }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "var(--surface-hover)")}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
            >
              <X size={18} />
            </button>
          </div>

          <Command.List className="max-h-[400px] overflow-y-auto p-2">
            {loading && (
              <div className="py-6 text-center text-sm" style={{ color: "var(--text-secondary)" }}>
                Searching...
              </div>
            )}

            {!loading && showHistory && searchHistory.length > 0 && (
              <>
                <div className="px-3 py-2 text-xs font-semibold" style={{ color: "var(--text-muted)" }}>
                  Recent Searches
                </div>
                {searchHistory.slice(0, 5).map((item) => (
                  <div
                    key={item.id}
                    onClick={() => handleHistoryClick(item)}
                    className="flex items-center gap-3 px-3 py-2 rounded cursor-pointer transition-colors duration-300"
                    style={{ color: "var(--text-primary)" }}
                    onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "var(--surface-hover)")}
                    onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
                  >
                    <div className="p-2 rounded" style={{ backgroundColor: "var(--surface-hover)" }}>
                      <Clock size={16} style={{ color: "var(--text-muted)" }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-sm truncate" style={{ color: "var(--text-primary)" }}>
                        {item.query}
                      </div>
                      <div className="text-xs" style={{ color: "var(--text-secondary)" }}>
                        {item.resultCount} results
                      </div>
                    </div>
                  </div>
                ))}
              </>
            )}

            {!loading && !showHistory && search && results.length === 0 && (
              <div className="py-6 text-center text-sm" style={{ color: "var(--text-secondary)" }}>
                No results found. Try adjusting your search or filters.
              </div>
            )}

            {!loading && !showHistory && !search && results.length === 0 && (
              <div className="py-6 text-center text-sm" style={{ color: "var(--text-secondary)" }}>
                Type to search or use filters to find content...
              </div>
            )}

            {!loading &&
              !showHistory &&
              results.map((item) => {
                const contentPreview = item.content && item.content.length > 60 ? item.content.substring(0, 60) + "..." : item.content || "";

                return (
                  <Command.Item
                    key={`${item.type}-${item.id}`}
                    value={`${item.title} ${item.content}`}
                    onSelect={() => handleSelect(item.url)}
                    className="flex items-center gap-3 px-3 py-2 rounded cursor-pointer transition-colors duration-300"
                    style={{ color: "var(--text-primary)" }}
                    onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "var(--surface-hover)")}
                    onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
                  >
                    <div className="flex-shrink-0">
                      <div className="p-2 rounded" style={{ backgroundColor: getBackgroundForType(item.type) }}>
                        {getIconForType(item.type)}
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-sm truncate" style={{ color: "var(--text-primary)" }}>
                        {item.highlight?.title ? <span dangerouslySetInnerHTML={{ __html: item.highlight.title }} /> : item.title}
                      </div>
                      <div className="text-xs truncate" style={{ color: "var(--text-secondary)" }}>
                        {item.metadata?.deckName ? `${item.metadata.deckName} • ` : ""}
                        {item.highlight?.content ? <span dangerouslySetInnerHTML={{ __html: item.highlight.content }} /> : contentPreview}
                      </div>
                      {item.tags && item.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-1">
                          {item.tags.slice(0, 3).map((tagName) => {
                            const tag = availableTags.find((t) => t.name === tagName);
                            return tag ? <TagBadge key={tag.id} tag={tag} size="sm" /> : null;
                          })}
                          {item.tags.length > 3 && (
                            <span className="text-xs" style={{ color: "var(--text-muted)" }}>
                              +{item.tags.length - 3}
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                    <div className="text-xs flex-shrink-0 capitalize" style={{ color: "var(--text-muted)" }}>
                      {item.type}
                    </div>
                  </Command.Item>
                );
              })}
          </Command.List>

          {/* Search tips */}
          <div className="border-t px-3 py-2 text-xs" style={{ borderColor: "var(--border)", color: "var(--text-muted)" }}>
            <div className="flex items-center gap-4 flex-wrap">
              <span>Tips:</span>
              <code className="px-1 py-0.5 rounded" style={{ backgroundColor: "var(--surface-hover)" }}>
                type:note
              </code>
              <code className="px-1 py-0.5 rounded" style={{ backgroundColor: "var(--surface-hover)" }}>
                tag:math
              </code>
              <code className="px-1 py-0.5 rounded" style={{ backgroundColor: "var(--surface-hover)" }}>
                due:today
              </code>
              <code className="px-1 py-0.5 rounded" style={{ backgroundColor: "var(--surface-hover)" }}>
                completed:false
              </code>
            </div>
          </div>
        </Command>
      </div>
    </div>
  );
}
