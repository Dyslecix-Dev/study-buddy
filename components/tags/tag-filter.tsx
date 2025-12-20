"use client";

import { useEffect, useState } from "react";
import { Tag } from "@/lib/tag-utils";
import TagBadge from "./tag-badge";
import { Filter, X } from "lucide-react";

interface TagFilterProps {
  selectedTagIds: string[];
  onTagsChange: (tagIds: string[]) => void;
  label?: string;
}

export default function TagFilter({ selectedTagIds, onTagsChange, label = "Filter by tags" }: TagFilterProps) {
  const [allTags, setAllTags] = useState<Tag[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);

  useEffect(() => {
    const fetchTags = async () => {
      try {
        const response = await fetch("/api/tags");
        if (response.ok) {
          const tags = await response.json();
          setAllTags(tags);
        }
      } catch (error) {
        console.error("Error fetching tags:", error);
      }
    };

    fetchTags();
  }, []);

  const handleToggleTag = (tagId: string) => {
    if (selectedTagIds.includes(tagId)) {
      onTagsChange(selectedTagIds.filter((id) => id !== tagId));
    } else {
      onTagsChange([...selectedTagIds, tagId]);
    }
  };

  const handleClearAll = () => {
    onTagsChange([]);
    setShowDropdown(false);
  };

  const selectedTags = allTags.filter((tag) => selectedTagIds.includes(tag.id));

  return (
    <div className="relative">
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => setShowDropdown(!showDropdown)}
          className="flex items-center gap-2 px-3 py-2 border rounded-md text-sm font-medium transition-colors duration-300 cursor-pointer"
          style={{ borderColor: "var(--border)", color: "var(--text-primary)", backgroundColor: "var(--surface)" }}
          onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "var(--surface-hover)")}
          onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "var(--surface)")}
        >
          <Filter className="h-4 w-4" />
          {label}
          {selectedTagIds.length > 0 && (
            <span className="px-2 py-0.5 rounded-full text-xs font-bold" style={{ backgroundColor: "var(--primary)", color: "white" }}>
              {selectedTagIds.length}
            </span>
          )}
        </button>

        {selectedTagIds.length > 0 && (
          <button
            type="button"
            onClick={handleClearAll}
            className="p-2 rounded-md transition-colors duration-300 cursor-pointer"
            style={{ backgroundColor: "var(--surface)" }}
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "var(--surface-hover)")}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "var(--surface)")}
            title="Clear all filters"
          >
            <X className="h-4 w-4" style={{ color: "var(--text-secondary)" }} />
          </button>
        )}
      </div>

      {selectedTags.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-2">
          {selectedTags.map((tag) => (
            <TagBadge key={tag.id} tag={tag} onRemove={(tagId) => handleToggleTag(tagId)} showRemove size="sm" />
          ))}
        </div>
      )}

      {showDropdown && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setShowDropdown(false)} />
          <div className="absolute z-20 mt-2 w-64 border rounded-md shadow-lg max-h-96 overflow-auto" style={{ backgroundColor: "var(--background)", borderColor: "var(--border)" }}>
            {allTags.length === 0 ? (
              <div className="px-4 py-3 text-sm text-center" style={{ color: "var(--text-secondary)" }}>
                No tags available
              </div>
            ) : (
              <div className="py-2">
                {allTags.map((tag) => {
                  const isSelected = selectedTagIds.includes(tag.id);
                  return (
                    <button
                      key={tag.id}
                      type="button"
                      onClick={() => handleToggleTag(tag.id)}
                      className="w-full flex items-center gap-2 px-4 py-2 text-left text-sm transition-colors duration-300 cursor-pointer"
                      style={{ backgroundColor: "transparent" }}
                      onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "var(--surface-hover)")}
                      onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
                    >
                      <input type="checkbox" checked={isSelected} onChange={() => {}} className="rounded" style={{ accentColor: "var(--primary)" }} />
                      <TagBadge tag={tag} size="sm" />
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}

