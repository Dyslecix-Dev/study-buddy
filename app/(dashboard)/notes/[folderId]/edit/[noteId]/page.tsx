"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Editor from "@/components/editor/editor";
import DashboardNav from "@/components/dashboard-nav";
import { LoadingSpinner } from "@/components/loading-spinner";
import { Trash2, Check } from "lucide-react";
import DeleteConfirmModal from "@/components/ui/delete-confirm-modal";
import { toast } from "sonner";
import { Tag } from "@/lib/tag-utils";
import TagInput from "@/components/tags/tag-input";
import { BacklinksPanel } from "@/components/notes/backlinks-panel";
import { UnlinkedMentions } from "@/components/notes/unlinked-mentions";
import { BrokenLinksWarning } from "@/components/notes/broken-links-warning";

interface LinkedNote {
  id: string;
  title: string;
}

export default function NoteEditorPage({ params }: { params: Promise<{ folderId: string; noteId: string }> }) {
  const { folderId, noteId } = use(params);
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("<p></p>");
  const [selectedTags, setSelectedTags] = useState<Tag[]>([]);
  const [noteLinks, setNoteLinks] = useState<string[]>([]);
  const [linkedNotes, setLinkedNotes] = useState<LinkedNote[]>([]);
  const [backlinks, setBacklinks] = useState<LinkedNote[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(true);
  const [deleteConfirm, setDeleteConfirm] = useState(false);
  const [showUnsavedWarning, setShowUnsavedWarning] = useState(false);
  const [pendingNavigationNoteId, setPendingNavigationNoteId] = useState<string | null>(null);

  // Fetch note on mount
  useEffect(() => {
    const fetchNote = async () => {
      try {
        const response = await fetch(`/api/notes/${noteId}`);
        if (!response.ok) {
          throw new Error("Failed to fetch note");
        }
        const { note } = await response.json();
        setTitle(note.title);
        setContent(note.content);
        setSelectedTags(note.Tag || []);
        setLinkedNotes(note.linkedNotes || []);
        setBacklinks(note.backlinks || []);
      } catch (err: any) {
        toast.error(err.message || "Failed to load note");
      } finally {
        setLoading(false);
      }
    };

    fetchNote();
  }, [noteId]);

  // Warn user before leaving page with unsaved changes
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (!saved) {
        e.preventDefault();
        e.returnValue = "";
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [saved]);

  // Auto-save with debounce
  useEffect(() => {
    if (loading || saved) return;

    const timeoutId = setTimeout(async () => {
      setSaving(true);
      try {
        const response = await fetch(`/api/notes/${noteId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            title,
            content,
            tagIds: selectedTags.map(tag => tag.id),
            noteLinks,
          }),
        });

        if (!response.ok) {
          throw new Error("Failed to save note");
        }

        const { note } = await response.json();

        // Update linked notes and backlinks after save
        setLinkedNotes(note.linkedNotes || []);
        setBacklinks(note.backlinks || []);

        setSaved(true);
      } catch (err: any) {
        toast.error(err.message || "Failed to auto-save");
      } finally {
        setSaving(false);
      }
    }, 2000); // Auto-save after 2 seconds of no changes

    return () => clearTimeout(timeoutId);
  }, [title, content, selectedTags, noteLinks, noteId, loading, saved]);

  const handleTitleChange = (newTitle: string) => {
    setTitle(newTitle);
    setSaved(false);
  };

  const handleContentChange = (newContent: string) => {
    setContent(newContent);
    setSaved(false);
  };

  const handleTagsChange = (newTags: Tag[]) => {
    setSelectedTags(newTags);
    setSaved(false);
  };

  const handleNoteLinksChange = (newNoteLinks: string[]) => {
    setNoteLinks(newNoteLinks);
    setSaved(false);
  };

  const handleLinkAllMentions = (noteIdToLink: string, noteTitleToLink: string) => {
    // Create a temporary div to parse HTML
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = content;

    // Function to process text nodes
    const processTextNodes = (node: Node) => {
      if (node.nodeType === Node.TEXT_NODE) {
        const text = node.textContent || '';
        const regex = new RegExp(`\\b${noteTitleToLink.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'gi');

        if (regex.test(text)) {
          const span = document.createElement('span');
          span.innerHTML = text.replace(regex, (match) => {
            return `<span data-type="note-link" data-note-id="${noteIdToLink}" data-note-title="${match}" class="note-link bg-blue-50 text-blue-700 px-1 py-0.5 rounded cursor-pointer hover:bg-blue-100 transition-colors">[[${match}]]</span>`;
          });

          node.parentNode?.replaceChild(span, node);

          // Unwrap the temporary span
          while (span.firstChild) {
            span.parentNode?.insertBefore(span.firstChild, span);
          }
          span.remove();
        }
      } else if (node.nodeType === Node.ELEMENT_NODE) {
        // Don't process existing note links or code blocks
        const element = node as HTMLElement;
        if (element.getAttribute('data-type') === 'note-link' ||
            element.tagName === 'CODE' ||
            element.tagName === 'PRE') {
          return;
        }

        // Process child nodes
        const children = Array.from(node.childNodes);
        children.forEach(processTextNodes);
      }
    };

    processTextNodes(tempDiv);
    const newContent = tempDiv.innerHTML;

    setContent(newContent);
    setSaved(false);
  };

  const handleRemoveBrokenLinks = async () => {
    try {
      // Extract note IDs and their titles from content
      const noteLinksMap = new Map<string, string>();
      const linkRegex = /<span[^>]*data-type="note-link"[^>]*data-note-id="([^"]*)"[^>]*data-note-title="([^"]*)"[^>]*>.*?<\/span>/g;
      let match;

      while ((match = linkRegex.exec(content)) !== null) {
        const noteId = match[1];
        const noteTitle = match[2];
        if (!noteLinksMap.has(noteId)) {
          noteLinksMap.set(noteId, noteTitle);
        }
      }

      if (noteLinksMap.size === 0) {
        toast.info('No note links found');
        return;
      }

      // Check which notes exist
      const brokenNoteIds = new Set<string>();
      for (const noteId of noteLinksMap.keys()) {
        try {
          const response = await fetch(`/api/notes/${noteId}`);
          if (!response.ok) {
            brokenNoteIds.add(noteId);
          }
        } catch (error) {
          brokenNoteIds.add(noteId);
        }
      }

      if (brokenNoteIds.size === 0) {
        toast.info('No broken links found');
        return;
      }

      // Create a temporary div to parse HTML properly
      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = content;

      // Find and remove broken link spans
      const linkSpans = tempDiv.querySelectorAll('span[data-type="note-link"]');
      linkSpans.forEach((span) => {
        const noteId = span.getAttribute('data-note-id');
        if (noteId && brokenNoteIds.has(noteId)) {
          // Get the title from the data attribute or the text content
          const noteTitle = span.getAttribute('data-note-title') || span.textContent?.replace(/^\[\[|\]\]$/g, '') || '';
          // Replace the span with just the title text
          const textNode = document.createTextNode(noteTitle);
          span.parentNode?.replaceChild(textNode, span);
        }
      });

      const newContent = tempDiv.innerHTML;
      setContent(newContent);
      setSaved(false);
      toast.success(`Removed ${brokenNoteIds.size} broken link${brokenNoteIds.size > 1 ? 's' : ''}`);
    } catch (error) {
      toast.error('Failed to remove broken links');
    }
  };

  const handleBackClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (!saved) {
      e.preventDefault();
      setShowUnsavedWarning(true);
    }
  };

  const handleConfirmLeave = () => {
    setSaved(true); // Prevent beforeunload from firing

    // If there's a pending navigation to another note, go there
    if (pendingNavigationNoteId) {
      router.push(`/notes/${folderId}/edit/${pendingNavigationNoteId}`);
      setPendingNavigationNoteId(null);
    } else {
      // Otherwise, go back to folder
      router.push(`/notes/${folderId}`);
    }
  };

  const handleNoteLinkClick = async (linkedNoteId: string, noteTitle: string) => {
    if (!saved) {
      // Show unsaved warning and store the note ID to navigate to after confirmation
      setPendingNavigationNoteId(linkedNoteId);
      setShowUnsavedWarning(true);
    } else {
      // Navigate immediately if there are no unsaved changes
      router.push(`/notes/${folderId}/edit/${linkedNoteId}`);
    }
  };

  const handleDelete = async () => {
    try {
      const response = await fetch(`/api/notes/${noteId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete note");
      }

      toast.success("Note deleted successfully");
      router.push(`/notes/${folderId}`);
    } catch (err: any) {
      toast.error(err.message || "Failed to delete note");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen" style={{ backgroundColor: "var(--background)" }}>
        <DashboardNav />
        <LoadingSpinner message="Loading note..." />
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: "var(--background)" }}>
      <DashboardNav />

      <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="mb-6 flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <Link
              href={`/notes/${folderId}`}
              onClick={handleBackClick}
              className="text-sm transition-colors duration-300"
              style={{ color: "var(--text-secondary)" }}
              onMouseEnter={(e) => (e.currentTarget.style.color = "var(--text-primary)")}
              onMouseLeave={(e) => (e.currentTarget.style.color = "var(--text-secondary)")}
            >
              ← Back to Folder
            </Link>
            <div className="flex items-center text-sm" style={{ color: "var(--text-muted)" }}>
              {saving && "Saving..."}
              {!saving && saved && (
                <span className="flex items-center" style={{ color: "var(--primary)" }}>
                  <Check size={16} className="mr-1" />
                  Saved
                </span>
              )}
              {!saving && !saved && "Unsaved changes"}
            </div>
          </div>
          <button onClick={() => setDeleteConfirm(true)} className="flex items-center text-sm text-red-600 hover:text-red-700 transition-colors duration-300 cursor-pointer">
            <Trash2 size={18} className="mr-1" />
            Delete
          </button>
        </div>

        <div className="mb-6">
          <input
            type="text"
            value={title}
            onChange={(e) => handleTitleChange(e.target.value)}
            placeholder="Note title..."
            className="w-full text-3xl font-bold border-none focus:outline-none focus:ring-0 bg-transparent"
            style={{
              color: "var(--text-primary)",
              caretColor: "var(--text-primary)",
            }}
          />
        </div>

        <div className="mb-6">
          <label className="block text-sm font-medium mb-2" style={{ color: "var(--text-secondary)" }}>
            Tags
          </label>
          <TagInput selectedTags={selectedTags} onTagsChange={handleTagsChange} placeholder="Add tags to organize..." />
        </div>

        <Editor
          content={content}
          onChange={handleContentChange}
          onNoteLinksChange={handleNoteLinksChange}
          onNoteLinkClick={handleNoteLinkClick}
          currentNoteId={noteId}
          placeholder="Start writing your note..."
        />

        <BrokenLinksWarning
          content={content}
          onFix={handleRemoveBrokenLinks}
        />

        <UnlinkedMentions
          currentNoteId={noteId}
          content={content}
          onLinkAll={handleLinkAllMentions}
        />

        <BacklinksPanel
          backlinks={backlinks}
          linkedNotes={linkedNotes}
          folderId={folderId}
        />
      </div>

      <DeleteConfirmModal
        isOpen={deleteConfirm}
        onClose={() => setDeleteConfirm(false)}
        onConfirm={handleDelete}
        title="Delete Note?"
        description="Are you sure you want to delete this note? This action cannot be undone."
      />

      <DeleteConfirmModal
        isOpen={showUnsavedWarning}
        onClose={() => {
          setShowUnsavedWarning(false);
          setPendingNavigationNoteId(null);
        }}
        onConfirm={handleConfirmLeave}
        title="Unsaved Changes"
        description="You have unsaved changes. Are you sure you want to leave? Your changes will be lost."
        confirmText="Leave Without Saving"
        cancelText="Stay on Page"
      />
    </div>
  );
}
