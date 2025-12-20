"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Command } from "cmdk";
import Fuse from "fuse.js";
import { FileText, CheckSquare, Brain, X, Folder, Library, Hash } from "lucide-react";
import { Tag } from "@/lib/tag-utils";
import TagBadge from "@/components/tags/tag-badge";

interface Folder {
  id: string;
  name: string;
  description: string | null;
  color: string | null;
}

interface Note {
  id: string;
  title: string;
  content: any;
  folderId: string | null;
  Tag?: Tag[];
}

interface Task {
  id: string;
  title: string;
  description: string | null;
  dueDate: Date | null;
  priority: number;
  completed: boolean;
  Tag?: Tag[];
}

interface Flashcard {
  id: string;
  front: string;
  back: string;
  Tag?: Tag[];
}

interface Deck {
  id: string;
  name: string;
  Flashcard: Flashcard[];
}

interface TagWithCount extends Tag {
  _count?: {
    Note: number;
    Task: number;
    Flashcard: number;
  };
}

interface SearchData {
  folders: Folder[];
  notes: Note[];
  tasks: Task[];
  decks: Deck[];
  tags: TagWithCount[];
}

export default function CommandPalette() {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [searchData, setSearchData] = useState<SearchData | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  // Fetch all searchable content
  useEffect(() => {
    const fetchSearchData = async () => {
      try {
        setLoading(true);
        const response = await fetch("/api/search");
        if (response.ok) {
          const data = await response.json();
          setSearchData(data);
        }
      } catch (error) {
        console.error("Error fetching search data:", error);
      } finally {
        setLoading(false);
      }
    };

    if (open && !searchData) {
      fetchSearchData();
    }
  }, [open, searchData]);

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

  // Perform fuzzy search
  const getSearchResults = useCallback(() => {
    if (!searchData || !search) return [];

    // Helper to extract text from Tiptap JSON content
    const extractTextFromContent = (content: any): string => {
      if (typeof content === "string") return content;
      if (!content) return "";

      let text = "";
      const traverse = (node: any) => {
        if (node.type === "text") {
          text += node.text + " ";
        }
        if (node.content) {
          node.content.forEach(traverse);
        }
      };
      traverse(content);
      return text.trim();
    };

    // Prepare searchable items
    const folderItems = searchData.folders.map((folder) => ({
      type: "folder" as const,
      id: folder.id,
      title: folder.name,
      content: folder.description || "",
      url: `/notes/${folder.id}`,
    }));

    const noteItems = searchData.notes.map((note) => ({
      type: "note" as const,
      id: note.id,
      title: note.title,
      content: extractTextFromContent(note.content),
      url: note.folderId ? `/notes/${note.folderId}/edit/${note.id}` : `/notes/${note.id}`,
      tags: note.Tag || [],
      tagNames: note.Tag?.map((tag) => tag.name).join(" ") || "",
    }));

    const taskItems = searchData.tasks.map((task) => ({
      type: "task" as const,
      id: task.id,
      title: task.title,
      content: task.description || "",
      url: `/tasks`,
      completed: task.completed,
      tags: task.Tag || [],
      tagNames: task.Tag?.map((tag) => tag.name).join(" ") || "",
    }));

    const deckItems = searchData.decks.map((deck) => ({
      type: "deck" as const,
      id: deck.id,
      title: deck.name,
      content: `${deck.Flashcard.length} cards`,
      url: `/flashcards/${deck.id}`,
    }));

    const flashcardItems: Array<{
      type: "flashcard";
      id: string;
      title: string;
      content: string;
      url: string;
      deckId: string;
      deckName: string;
      tags: Tag[];
      tagNames: string;
    }> = [];

    searchData.decks.forEach((deck) => {
      deck.Flashcard.forEach((card) => {
        flashcardItems.push({
          type: "flashcard" as const,
          id: card.id,
          title: card.front,
          content: card.back,
          url: `/flashcards/${deck.id}`,
          deckId: deck.id,
          deckName: deck.name,
          tags: card.Tag || [],
          tagNames: card.Tag?.map((tag) => tag.name).join(" ") || "",
        });
      });
    });

    const tagItems = searchData.tags.map((tag) => {
      const totalCount = (tag._count?.Note || 0) + (tag._count?.Task || 0) + (tag._count?.Flashcard || 0);
      return {
        type: "tag" as const,
        id: tag.id,
        title: tag.name,
        content: `Used in ${totalCount} items`,
        url: `/tags`,
        color: tag.color,
      };
    });

    const allItems = [...folderItems, ...noteItems, ...taskItems, ...deckItems, ...flashcardItems, ...tagItems];

    // Fuzzy search with Fuse.js - include tagNames in search keys
    const fuse = new Fuse(allItems, {
      keys: ["title", "content", "tagNames"],
      threshold: 0.3,
      includeScore: true,
    });

    const results = fuse.search(search);
    const items = results.map((result) => result.item);
    return items;
  }, [searchData, search]);

  const results = getSearchResults();

  const handleSelect = (url: string) => {
    setOpen(false);
    setSearch("");
    router.push(url);
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/50" onClick={() => setOpen(false)}>
      <div className="fixed left-1/2 top-1/4 -translate-x-1/2 w-full max-w-2xl" onClick={(e) => e.stopPropagation()}>
        <Command shouldFilter={false} className="rounded-lg border shadow-lg" style={{ backgroundColor: "var(--surface)", borderColor: "var(--border)" }}>
          <div className="flex items-center border-b px-3" style={{ borderColor: "var(--border)" }}>
            <Command.Input
              value={search}
              onValueChange={setSearch}
              placeholder="Search folders, notes, tasks, decks, flashcards, and tags..."
              className="flex h-12 w-full rounded-md bg-transparent py-3 text-sm outline-none disabled:cursor-not-allowed disabled:opacity-50"
              style={{ color: "var(--text-primary)", caretColor: "var(--text-primary)" }}
            />
            <button
              onClick={() => setOpen(false)}
              className="p-2 transition-colors duration-300 rounded cursor-pointer"
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
                Loading...
              </div>
            )}
            {!loading && search && results.length === 0 && (
              <div className="py-6 text-center text-sm" style={{ color: "var(--text-secondary)" }}>
                No results found.
              </div>
            )}
            {!loading && !search && (
              <div className="py-6 text-center text-sm" style={{ color: "var(--text-secondary)" }}>
                Type to search across all your content...
              </div>
            )}
            {!loading &&
              results.map((item) => {
                const contentPreview = item.content.length > 60 ? item.content.substring(0, 60) + "..." : item.content;
                const itemTags = "tags" in item ? item.tags : [];

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
                      {item.type === "folder" && (
                        <div className="p-2 rounded" style={{ backgroundColor: "#fef3c7" }}>
                          <Folder size={16} style={{ color: "#ca8a04" }} />
                        </div>
                      )}
                      {item.type === "note" && (
                        <div className="p-2 rounded" style={{ backgroundColor: "#dbeafe" }}>
                          <FileText size={16} style={{ color: "#2563eb" }} />
                        </div>
                      )}
                      {item.type === "task" && (
                        <div className="p-2 rounded" style={{ backgroundColor: "#dcfce7" }}>
                          <CheckSquare size={16} style={{ color: "#16a34a" }} />
                        </div>
                      )}
                      {item.type === "deck" && (
                        <div className="p-2 rounded" style={{ backgroundColor: "#e0e7ff" }}>
                          <Library size={16} style={{ color: "#4f46e5" }} />
                        </div>
                      )}
                      {item.type === "flashcard" && (
                        <div className="p-2 rounded" style={{ backgroundColor: "#f3e8ff" }}>
                          <Brain size={16} style={{ color: "#9333ea" }} />
                        </div>
                      )}
                      {item.type === "tag" && (
                        <div className="p-2 rounded" style={{ backgroundColor: "#fef2f2" }}>
                          <Hash size={16} style={{ color: "#dc2626" }} />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-sm truncate" style={{ color: "var(--text-primary)" }}>
                        {item.title}
                      </div>
                      <div className="text-xs truncate" style={{ color: "var(--text-secondary)" }}>
                        {item.type === "flashcard" && "deckName" in item ? `${item.deckName} • ${contentPreview}` : contentPreview}
                      </div>
                      {itemTags.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-1">
                          {itemTags.slice(0, 3).map((tag) => (
                            <TagBadge key={tag.id} tag={tag} size="sm" />
                          ))}
                          {itemTags.length > 3 && (
                            <span className="text-xs" style={{ color: "var(--text-muted)" }}>
                              +{itemTags.length - 3}
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                    <div className="text-xs flex-shrink-0" style={{ color: "var(--text-muted)" }}>
                      {item.type === "folder" && "Folder"}
                      {item.type === "note" && "Note"}
                      {item.type === "task" && "Task"}
                      {item.type === "deck" && "Deck"}
                      {item.type === "flashcard" && "Flashcard"}
                      {item.type === "tag" && "Tag"}
                    </div>
                  </Command.Item>
                );
              })}
          </Command.List>
        </Command>
      </div>
    </div>
  );
}
