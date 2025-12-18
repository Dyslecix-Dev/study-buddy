"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import Editor from "@/components/editor/editor";
import DashboardNav from "@/components/dashboard-nav";
import { Save } from "lucide-react";
import { toast } from "sonner";
import DeleteConfirmModal from "@/components/ui/delete-confirm-modal";

export default function NewNotePageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const folderId = searchParams.get("folderId");
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("<p></p>");
  const [saving, setSaving] = useState(false);
  const [showUnsavedWarning, setShowUnsavedWarning] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  // Track if user has made any changes
  useEffect(() => {
    const hasChanges = title.trim() !== "" || content !== "<p></p>";
    setHasUnsavedChanges(hasChanges);
  }, [title, content]);

  // Warn user before leaving page with unsaved changes
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasUnsavedChanges) {
        e.preventDefault();
        e.returnValue = "";
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [hasUnsavedChanges]);

  const handleSave = async () => {
    if (!title.trim()) {
      toast.error("Please enter a title");
      return;
    }

    setSaving(true);

    try {
      const response = await fetch("/api/notes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, content, folderId }),
      });

      if (!response.ok) {
        throw new Error("Failed to create note");
      }

      const { note } = await response.json();
      setHasUnsavedChanges(false); // Mark as saved
      toast.success("Note created successfully");
      // If we came from a folder, go back to that folder
      if (folderId) {
        router.push(`/notes/${folderId}`);
      } else {
        router.push("/notes");
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to save note");
    } finally {
      setSaving(false);
    }
  };

  const handleBackClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (hasUnsavedChanges) {
      e.preventDefault();
      setShowUnsavedWarning(true);
    }
  };

  const handleConfirmLeave = () => {
    setHasUnsavedChanges(false);
    if (folderId) {
      router.push(`/notes/${folderId}`);
    } else {
      router.push("/notes");
    }
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: "var(--background)" }}>
      <DashboardNav />

      <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="mb-6 flex justify-between items-center">
          <Link
            href={folderId ? `/notes/${folderId}` : "/notes"}
            onClick={handleBackClick}
            className="text-sm transition-colors duration-300"
            style={{ color: "var(--text-secondary)" }}
            onMouseEnter={(e) => (e.currentTarget.style.color = "var(--text-primary)")}
            onMouseLeave={(e) => (e.currentTarget.style.color = "var(--text-secondary)")}
          >
            ← {folderId ? "Back to Folder" : "Back to Notes"}
          </Link>
          <button
            onClick={handleSave}
            disabled={saving}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-black transition-all duration-300 cursor-pointer focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
            style={{ backgroundColor: "var(--primary)" }}
            onMouseEnter={(e) => !saving && (e.currentTarget.style.opacity = "0.9")}
            onMouseLeave={(e) => !saving && (e.currentTarget.style.opacity = "1")}
          >
            <Save size={18} className="mr-2" />
            {saving ? "Saving..." : "Create Note"}
          </button>
        </div>

        <div className="mb-6">
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Note title..."
            className="w-full text-3xl font-bold border-none focus:outline-none focus:ring-0 bg-transparent"
            style={{
              color: "var(--text-primary)",
              caretColor: "var(--text-primary)",
            }}
          />
        </div>

        <Editor content={content} onChange={setContent} placeholder="Start writing your note..." />
      </div>

      <DeleteConfirmModal
        isOpen={showUnsavedWarning}
        onClose={() => setShowUnsavedWarning(false)}
        onConfirm={handleConfirmLeave}
        title="Unsaved Changes"
        description="You have unsaved changes. Are you sure you want to leave? Your work will be lost."
        confirmText="Leave Without Saving"
        cancelText="Stay on Page"
      />
    </div>
  );
}
