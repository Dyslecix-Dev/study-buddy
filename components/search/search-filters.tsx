"use client";

import { useState } from "react";
import { Filter, X, Calendar, Tag, CheckSquare, FileText, Brain, Folder } from "lucide-react";
import { SearchFilters } from "@/lib/advanced-search";

interface SearchFiltersProps {
  filters: SearchFilters;
  onFiltersChange: (filters: SearchFilters) => void;
  availableTags?: Array<{ id: string; name: string; color: string | null }>;
  availableFolders?: Array<{ id: string; name: string }>;
  availableDecks?: Array<{ id: string; name: string }>;
}

export default function SearchFiltersComponent({
  filters,
  onFiltersChange,
  availableTags = [],
  availableFolders = [],
  availableDecks = [],
}: SearchFiltersProps) {
  const [isOpen, setIsOpen] = useState(false);

  const updateFilter = (key: keyof SearchFilters, value: any) => {
    onFiltersChange({ ...filters, [key]: value });
  };

  const clearFilters = () => {
    onFiltersChange({ type: "all" });
  };

  const activeFilterCount = Object.keys(filters).filter(
    (key) => key !== "type" && filters[key as keyof SearchFilters] !== undefined
  ).length;

  return (
    <div className="relative">
      {/* Filter Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 text-sm rounded-md transition-colors duration-300"
        style={{
          backgroundColor: isOpen ? "var(--surface-hover)" : "transparent",
          color: "var(--text-primary)",
        }}
        onMouseEnter={(e) => !isOpen && (e.currentTarget.style.backgroundColor = "var(--surface-hover)")}
        onMouseLeave={(e) => !isOpen && (e.currentTarget.style.backgroundColor = "transparent")}
      >
        <Filter size={16} />
        <span>Filters</span>
        {activeFilterCount > 0 && (
          <span
            className="px-2 py-0.5 text-xs rounded-full"
            style={{
              backgroundColor: "var(--primary)",
              color: "white",
            }}
          >
            {activeFilterCount}
          </span>
        )}
      </button>

      {/* Filter Panel */}
      {isOpen && (
        <div
          className="absolute top-full left-0 mt-2 w-80 rounded-lg shadow-lg border p-4 z-50"
          style={{
            backgroundColor: "var(--surface)",
            borderColor: "var(--border)",
          }}
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold" style={{ color: "var(--text-primary)" }}>
              Search Filters
            </h3>
            <div className="flex items-center gap-2">
              {activeFilterCount > 0 && (
                <button
                  onClick={clearFilters}
                  className="text-xs px-2 py-1 rounded transition-colors duration-300"
                  style={{ color: "var(--text-muted)" }}
                  onMouseEnter={(e) => (e.currentTarget.style.color = "var(--text-primary)")}
                  onMouseLeave={(e) => (e.currentTarget.style.color = "var(--text-muted)")}
                >
                  Clear all
                </button>
              )}
              <button
                onClick={() => setIsOpen(false)}
                className="p-1 rounded transition-colors duration-300"
                style={{ color: "var(--text-muted)" }}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "var(--surface-hover)")}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
              >
                <X size={16} />
              </button>
            </div>
          </div>

          <div className="space-y-4">
            {/* Content Type Filter */}
            <div>
              <label className="text-sm font-medium mb-2 block" style={{ color: "var(--text-primary)" }}>
                Content Type
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { value: "all", label: "All", icon: Filter },
                  { value: "note", label: "Notes", icon: FileText },
                  { value: "task", label: "Tasks", icon: CheckSquare },
                  { value: "flashcard", label: "Cards", icon: Brain },
                  { value: "folder", label: "Folders", icon: Folder },
                  { value: "tag", label: "Tags", icon: Tag },
                ].map((type) => {
                  const Icon = type.icon;
                  const isActive = filters.type === type.value;
                  return (
                    <button
                      key={type.value}
                      onClick={() => updateFilter("type", type.value)}
                      className="flex items-center justify-center gap-1 px-2 py-2 text-xs rounded transition-colors duration-300"
                      style={{
                        backgroundColor: isActive ? "var(--primary)" : "var(--surface-hover)",
                        color: isActive ? "white" : "var(--text-primary)",
                      }}
                    >
                      <Icon size={14} />
                      <span>{type.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Tags Filter */}
            {availableTags.length > 0 && (
              <div>
                <label className="text-sm font-medium mb-2 block" style={{ color: "var(--text-primary)" }}>
                  Tags
                </label>
                <select
                  multiple
                  value={filters.tags || []}
                  onChange={(e) => {
                    const selectedTags = Array.from(e.target.selectedOptions, (option) => option.value);
                    updateFilter("tags", selectedTags.length > 0 ? selectedTags : undefined);
                  }}
                  className="w-full px-3 py-2 text-sm rounded border"
                  style={{
                    backgroundColor: "var(--surface)",
                    borderColor: "var(--border)",
                    color: "var(--text-primary)",
                  }}
                  size={4}
                >
                  {availableTags.map((tag) => (
                    <option key={tag.id} value={tag.name}>
                      {tag.name}
                    </option>
                  ))}
                </select>
                <p className="text-xs mt-1" style={{ color: "var(--text-muted)" }}>
                  Hold Ctrl/Cmd to select multiple
                </p>
              </div>
            )}

            {/* Task-specific Filters */}
            {(filters.type === "task" || filters.type === "all") && (
              <>
                <div>
                  <label className="text-sm font-medium mb-2 block" style={{ color: "var(--text-primary)" }}>
                    Status
                  </label>
                  <div className="flex gap-2">
                    <button
                      onClick={() => updateFilter("completed", filters.completed === false ? undefined : false)}
                      className="flex-1 px-3 py-2 text-xs rounded transition-colors duration-300"
                      style={{
                        backgroundColor: filters.completed === false ? "var(--primary)" : "var(--surface-hover)",
                        color: filters.completed === false ? "white" : "var(--text-primary)",
                      }}
                    >
                      Active
                    </button>
                    <button
                      onClick={() => updateFilter("completed", filters.completed === true ? undefined : true)}
                      className="flex-1 px-3 py-2 text-xs rounded transition-colors duration-300"
                      style={{
                        backgroundColor: filters.completed === true ? "var(--primary)" : "var(--surface-hover)",
                        color: filters.completed === true ? "white" : "var(--text-primary)",
                      }}
                    >
                      Completed
                    </button>
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block" style={{ color: "var(--text-primary)" }}>
                    Priority
                  </label>
                  <div className="grid grid-cols-4 gap-2">
                    {[
                      { value: undefined, label: "All" },
                      { value: 0, label: "None" },
                      { value: 1, label: "Low" },
                      { value: 2, label: "Medium" },
                      { value: 3, label: "High" },
                    ].map((priority) => {
                      const isActive = filters.priority === priority.value;
                      return (
                        <button
                          key={priority.label}
                          onClick={() => updateFilter("priority", priority.value)}
                          className="px-2 py-2 text-xs rounded transition-colors duration-300"
                          style={{
                            backgroundColor: isActive ? "var(--primary)" : "var(--surface-hover)",
                            color: isActive ? "white" : "var(--text-primary)",
                          }}
                        >
                          {priority.label}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </>
            )}

            {/* Note-specific Filters */}
            {(filters.type === "note" || filters.type === "all") && availableFolders.length > 0 && (
              <div>
                <label className="text-sm font-medium mb-2 block" style={{ color: "var(--text-primary)" }}>
                  Folder
                </label>
                <select
                  value={filters.folderId || ""}
                  onChange={(e) => updateFilter("folderId", e.target.value || undefined)}
                  className="w-full px-3 py-2 text-sm rounded border"
                  style={{
                    backgroundColor: "var(--surface)",
                    borderColor: "var(--border)",
                    color: "var(--text-primary)",
                  }}
                >
                  <option value="">All Folders</option>
                  {availableFolders.map((folder) => (
                    <option key={folder.id} value={folder.id}>
                      {folder.name}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Flashcard-specific Filters */}
            {(filters.type === "flashcard" || filters.type === "all") && availableDecks.length > 0 && (
              <div>
                <label className="text-sm font-medium mb-2 block" style={{ color: "var(--text-primary)" }}>
                  Deck
                </label>
                <select
                  value={filters.deckId || ""}
                  onChange={(e) => updateFilter("deckId", e.target.value || undefined)}
                  className="w-full px-3 py-2 text-sm rounded border"
                  style={{
                    backgroundColor: "var(--surface)",
                    borderColor: "var(--border)",
                    color: "var(--text-primary)",
                  }}
                >
                  <option value="">All Decks</option>
                  {availableDecks.map((deck) => (
                    <option key={deck.id} value={deck.id}>
                      {deck.name}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
