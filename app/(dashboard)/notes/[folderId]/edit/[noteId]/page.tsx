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

export default function NoteEditorPage({ params }: { params: Promise<{ folderId: string; noteId: string }> }) {
  const { folderId, noteId } = use(params);
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("<p></p>");
  const [selectedTags, setSelectedTags] = useState<Tag[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(true);
  const [deleteConfirm, setDeleteConfirm] = useState(false);
  const [showUnsavedWarning, setShowUnsavedWarning] = useState(false);

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
          }),
        });

        if (!response.ok) {
          throw new Error("Failed to save note");
        }

        setSaved(true);
      } catch (err: any) {
        toast.error(err.message || "Failed to auto-save");
      } finally {
        setSaving(false);
      }
    }, 2000); // Auto-save after 2 seconds of no changes

    return () => clearTimeout(timeoutId);
  }, [title, content, selectedTags, noteId, loading, saved]);

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

  const handleBackClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (!saved) {
      e.preventDefault();
      setShowUnsavedWarning(true);
    }
  };

  const handleConfirmLeave = () => {
    setSaved(true); // Prevent beforeunload from firing
    router.push(`/notes/${folderId}`);
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

        <Editor content={content} onChange={handleContentChange} placeholder="Start writing your note..." />
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
        onClose={() => setShowUnsavedWarning(false)}
        onConfirm={handleConfirmLeave}
        title="Unsaved Changes"
        description="You have unsaved changes. Are you sure you want to leave? Your changes will be lost."
        confirmText="Leave Without Saving"
        cancelText="Stay on Page"
      />
    </div>
  );
}
