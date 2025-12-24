"use client";

import { useState, useEffect } from "react";
import { Link2, X } from "lucide-react";
import { toast } from "sonner";

interface UnlinkedMention {
  noteId: string;
  noteTitle: string;
  count: number;
}

interface UnlinkedMentionsProps {
  currentNoteId: string;
  content: string;
  onLinkAll: (noteId: string, noteTitle: string) => void;
}

export function UnlinkedMentions({ currentNoteId, content, onLinkAll }: UnlinkedMentionsProps) {
  const [mentions, setMentions] = useState<UnlinkedMention[]>([]);
  const [loading, setLoading] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);

  useEffect(() => {
    const findMentions = async () => {
      if (!content || content === "<p></p>") return;

      setLoading(true);
      try {
        // Fetch all notes
        const response = await fetch("/api/notes");
        if (!response.ok) throw new Error("Failed to fetch notes");

        const { notes } = await response.json();

        // Find unlinked mentions
        const unlinked: UnlinkedMention[] = [];

        // Remove existing note links from content for analysis
        const plainContent = content
          .replace(/<span[^>]*data-type="note-link"[^>]*>.*?<\/span>/g, "")
          .replace(/<[^>]+>/g, " ") // Remove all HTML tags
          .toLowerCase();

        notes.forEach((note: { id: string; title: string }) => {
          // Skip current note
          if (note.id === currentNoteId) return;

          // Skip very short titles
          if (note.title.length < 3) return;

          // Count occurrences of this note title
          const regex = new RegExp(note.title.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "gi");
          const matches = plainContent.match(regex);
          const count = matches ? matches.length : 0;

          if (count > 0) {
            unlinked.push({
              noteId: note.id,
              noteTitle: note.title,
              count,
            });
          }
        });

        // Sort by count descending
        unlinked.sort((a, b) => b.count - a.count);

        setMentions(unlinked);
      } catch (error) {
        console.error("Error finding unlinked mentions:", error);
      } finally {
        setLoading(false);
      }
    };

    // Debounce the search
    const timeoutId = setTimeout(findMentions, 1000);
    return () => clearTimeout(timeoutId);
  }, [content, currentNoteId]);

  const handleLinkAll = async (noteId: string, noteTitle: string) => {
    try {
      onLinkAll(noteId, noteTitle);
      toast.success(`Linked all mentions of "${noteTitle}"`);
      // Remove this mention from the list
      setMentions((prev) => prev.filter((m) => m.noteId !== noteId));
    } catch (error) {
      toast.error("Failed to link mentions");
    }
  };

  if (loading || mentions.length === 0) {
    return null;
  }

  return (
    <div className="mt-6 border rounded-lg p-4" style={{ borderColor: "var(--border)", backgroundColor: "var(--surface)" }}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Link2 size={18} style={{ color: "var(--primary)" }} />
          <h3 className="font-semibold" style={{ color: "var(--text-primary)" }}>
            Unlinked Mentions ({mentions.length})
          </h3>
        </div>
        <button onClick={() => setIsCollapsed(!isCollapsed)} className="text-sm transition-colors cursor-pointer" style={{ color: "var(--text-secondary)" }}>
          {isCollapsed ? "Show" : "Hide"}
        </button>
      </div>

      {!isCollapsed && (
        <>
          <p className="text-sm mb-3" style={{ color: "var(--text-muted)" }}>
            These note titles appear in your text but aren't linked yet
          </p>
          <div className="space-y-2">
            {mentions.slice(0, 5).map((mention) => (
              <div
                key={mention.noteId}
                className="flex items-center justify-between p-3 rounded-md border"
                style={{
                  borderColor: "var(--border-light)",
                  backgroundColor: "var(--background)",
                }}
              >
                <div className="flex-1">
                  <div className="font-medium text-sm" style={{ color: "var(--text-primary)" }}>
                    {mention.noteTitle}
                  </div>
                  <div className="text-xs" style={{ color: "var(--text-muted)" }}>
                    {mention.count} {mention.count === 1 ? "mention" : "mentions"}
                  </div>
                </div>
                <button
                  onClick={() => handleLinkAll(mention.noteId, mention.noteTitle)}
                  className="px-3 py-1.5 text-xs font-medium rounded transition-colors cursor-pointer"
                  style={{
                    backgroundColor: "var(--primary)",
                    color: "#000",
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.9")}
                  onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
                >
                  Link All
                </button>
              </div>
            ))}
          </div>
          {mentions.length > 5 && (
            <p className="text-xs mt-2" style={{ color: "var(--text-muted)" }}>
              + {mentions.length - 5} more
            </p>
          )}
        </>
      )}
    </div>
  );
}

