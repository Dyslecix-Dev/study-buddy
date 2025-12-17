"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Command } from "cmdk";
import Fuse from "fuse.js";
import { FileText, CheckSquare, Brain, X } from "lucide-react";

interface Note {
  id: string;
  title: string;
  content: any;
}

interface Task {
  id: string;
  title: string;
  description: string | null;
  dueDate: Date | null;
  priority: number;
  completed: boolean;
}

interface Flashcard {
  id: string;
  front: string;
  back: string;
}

interface Deck {
  id: string;
  name: string;
  flashcards: Flashcard[];
}

interface SearchData {
  notes: Note[];
  tasks: Task[];
  decks: Deck[];
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
    const noteItems = searchData.notes.map((note) => ({
      type: "note" as const,
      id: note.id,
      title: note.title,
      content: extractTextFromContent(note.content),
      url: `/notes/${note.id}`,
    }));

    const taskItems = searchData.tasks.map((task) => ({
      type: "task" as const,
      id: task.id,
      title: task.title,
      content: task.description || "",
      url: `/tasks`,
      completed: task.completed,
    }));

    const flashcardItems: Array<{
      type: "flashcard";
      id: string;
      title: string;
      content: string;
      url: string;
      deckId: string;
      deckName: string;
    }> = [];

    searchData.decks.forEach((deck) => {
      deck.flashcards.forEach((card) => {
        flashcardItems.push({
          type: "flashcard" as const,
          id: card.id,
          title: card.front,
          content: card.back,
          url: `/flashcards/${deck.id}`,
          deckId: deck.id,
          deckName: deck.name,
        });
      });
    });

    const allItems = [...noteItems, ...taskItems, ...flashcardItems];

    // Fuzzy search with Fuse.js
    const fuse = new Fuse(allItems, {
      keys: ["title", "content"],
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
        <Command shouldFilter={false} className="rounded-lg border shadow-lg bg-white">
          <div className="flex items-center border-b px-3">
            <Command.Input
              value={search}
              onValueChange={setSearch}
              placeholder="Search notes, tasks, and flashcards..."
              className="flex h-12 w-full rounded-md bg-transparent py-3 text-sm outline-none placeholder:text-gray-400 disabled:cursor-not-allowed disabled:opacity-50 text-gray-900"
            />
            <button onClick={() => setOpen(false)} className="p-2 hover:bg-gray-100 rounded">
              <X size={18} className="text-gray-500" />
            </button>
          </div>
          <Command.List className="max-h-[400px] overflow-y-auto p-2">
            {loading && <div className="py-6 text-center text-sm text-gray-500">Loading...</div>}
            {!loading && search && results.length === 0 && <div className="py-6 text-center text-sm text-gray-500">No results found.</div>}
            {!loading && !search && <div className="py-6 text-center text-sm text-gray-500">Type to search across all your content...</div>}
            {!loading &&
              results.map((item) => {
                const contentPreview = item.content.length > 60 ? item.content.substring(0, 60) + "..." : item.content;

                return (
                  <Command.Item
                    key={`${item.type}-${item.id}`}
                    value={`${item.title} ${item.content}`}
                    onSelect={() => handleSelect(item.url)}
                    className="flex items-center gap-3 px-3 py-2 rounded cursor-pointer hover:bg-gray-100 aria-selected:bg-gray-100 text-gray-900"
                  >
                    <div className="flex-shrink-0">
                      {item.type === "note" && (
                        <div className="p-2 bg-blue-100 rounded">
                          <FileText size={16} className="text-blue-600" />
                        </div>
                      )}
                      {item.type === "task" && (
                        <div className="p-2 bg-green-100 rounded">
                          <CheckSquare size={16} className="text-green-600" />
                        </div>
                      )}
                      {item.type === "flashcard" && (
                        <div className="p-2 bg-purple-100 rounded">
                          <Brain size={16} className="text-purple-600" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-sm truncate">{item.title}</div>
                      <div className="text-xs text-gray-500 truncate">{item.type === "flashcard" && "deckName" in item ? `${item.deckName} • ${contentPreview}` : contentPreview}</div>
                    </div>
                    <div className="text-xs text-gray-400 flex-shrink-0">
                      {item.type === "note" && "Note"}
                      {item.type === "task" && "Task"}
                      {item.type === "flashcard" && "Flashcard"}
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

