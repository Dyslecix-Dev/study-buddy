"use client";

import { useState, useEffect, useRef, KeyboardEvent } from "react";
import { Plus, Hash } from "lucide-react";
import { Tag, getRandomTagColor } from "@/lib/tag-utils";
import TagBadge from "./tag-badge";
import { toast } from "sonner";

interface TagInputProps {
  selectedTags: Tag[];
  onTagsChange: (tags: Tag[]) => void;
  placeholder?: string;
}

export default function TagInput({ selectedTags, onTagsChange, placeholder = "Add tags..." }: TagInputProps) {
  const [inputValue, setInputValue] = useState("");
  const [suggestions, setSuggestions] = useState<Tag[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [allTags, setAllTags] = useState<Tag[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);

  // Fetch all tags on mount
  useEffect(() => {
    fetchTags();
  }, []);

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

  // Filter suggestions based on input
  useEffect(() => {
    if (inputValue.trim()) {
      const filtered = allTags.filter((tag) => tag.name.toLowerCase().includes(inputValue.toLowerCase()) && !selectedTags.some((selected) => selected.id === tag.id));
      setSuggestions(filtered);
      setShowSuggestions(filtered.length > 0);
      setSelectedIndex(0);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  }, [inputValue, allTags, selectedTags]);

  const handleAddTag = async (tag?: Tag) => {
    const tagToAdd = tag || (await createNewTag());

    if (tagToAdd && !selectedTags.some((t) => t.id === tagToAdd.id)) {
      onTagsChange([...selectedTags, tagToAdd]);
      setInputValue("");
      setShowSuggestions(false);
      inputRef.current?.focus();
    }
  };

  const createNewTag = async (): Promise<Tag | null> => {
    const tagName = inputValue.trim();
    if (!tagName) return null;

    // Check if tag already exists locally
    const existingTag = allTags.find((tag) => tag.name.toLowerCase() === tagName.toLowerCase());
    if (existingTag) {
      // Tag already exists, just add it
      return existingTag;
    }

    try {
      const response = await fetch("/api/tags", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: tagName, color: getRandomTagColor() }),
      });

      if (response.ok) {
        const newTag = await response.json();
        // Check if this tag is actually new or already existed
        const wasCreated = response.status === 201;
        if (wasCreated) {
          setAllTags([...allTags, newTag]);
          toast.success(`Tag "${tagName}" created`);
        }
        return newTag;
      } else {
        toast.error("Failed to create tag");
        return null;
      }
    } catch (error) {
      console.error("Error creating tag:", error);
      toast.error("Failed to create tag");
      return null;
    }
  };

  const handleRemoveTag = (tagId: string) => {
    onTagsChange(selectedTags.filter((tag) => tag.id !== tagId));
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && inputValue.trim()) {
      e.preventDefault();
      if (showSuggestions && suggestions[selectedIndex]) {
        handleAddTag(suggestions[selectedIndex]);
      } else {
        handleAddTag();
      }
    } else if (e.key === "ArrowDown" && showSuggestions) {
      e.preventDefault();
      setSelectedIndex((prev) => Math.min(prev + 1, suggestions.length - 1));
    } else if (e.key === "ArrowUp" && showSuggestions) {
      e.preventDefault();
      setSelectedIndex((prev) => Math.max(prev - 1, 0));
    } else if (e.key === "Escape") {
      setShowSuggestions(false);
    } else if (e.key === "Backspace" && !inputValue && selectedTags.length > 0) {
      handleRemoveTag(selectedTags[selectedTags.length - 1].id);
    }
  };

  return (
    <div className="w-full">
      <div className="flex flex-wrap gap-2 p-2 border rounded-md focus-within:ring-2 focus-within:ring-blue-500 transition-all" style={{ borderColor: "var(--border)" }}>
        {selectedTags.map((tag) => (
          <TagBadge key={tag.id} tag={tag} onRemove={handleRemoveTag} showRemove size="sm" />
        ))}
        <div className="relative flex-1 min-w-[120px]">
          <input
            ref={inputRef}
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            onFocus={() => inputValue.trim() && setShowSuggestions(suggestions.length > 0)}
            placeholder={selectedTags.length === 0 ? placeholder : ""}
            className="w-full outline-none bg-transparent text-sm"
            style={{ color: "var(--text-primary)" }}
          />
          {showSuggestions && suggestions.length > 0 && (
            <div
              ref={suggestionsRef}
              className="absolute z-10 w-full mt-1 border rounded-md shadow-lg max-h-60 overflow-auto"
              style={{ backgroundColor: "var(--background)", borderColor: "var(--border)" }}
            >
              {suggestions.map((tag, index) => (
                <button
                  key={tag.id}
                  type="button"
                  onClick={() => handleAddTag(tag)}
                  className="w-full flex items-center gap-2 px-3 py-2 text-left text-sm transition-colors duration-300 cursor-pointer"
                  style={{
                    backgroundColor: index === selectedIndex ? "var(--surface-hover)" : "transparent",
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "var(--surface-hover)")}
                  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = index === selectedIndex ? "var(--surface-hover)" : "transparent")}
                >
                  <Hash className="h-3 w-3" style={{ color: "var(--text-secondary)" }} />
                  <span style={{ color: "var(--text-primary)" }}>{tag.name}</span>
                </button>
              ))}
            </div>
          )}
        </div>
        {inputValue.trim() && (
          <button
            type="button"
            onClick={() => handleAddTag()}
            className="flex items-center gap-1 px-2 py-1 text-black rounded text-xs font-medium transition-all duration-300 cursor-pointer"
            style={{ backgroundColor: "var(--primary)" }}
            onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.9")}
            onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
          >
            <Plus className="h-3 w-3" />
            Add Tag
          </button>
        )}
      </div>
    </div>
  );
}

