"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import Editor from "@/components/editor/editor";
import { ArrowLeft, Save } from "lucide-react";
import { toast } from "sonner";

export default function NewNotePageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const folderId = searchParams.get("folderId");
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("<p></p>");
  const [saving, setSaving] = useState(false);

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

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <Link href={folderId ? `/notes/${folderId}` : "/notes"} className="text-gray-600 hover:text-gray-900 flex items-center">
                <ArrowLeft size={20} className="mr-2" />
                {folderId ? "Back to Folder" : "Back to Notes"}
              </Link>
            </div>
            <button
              onClick={handleSave}
              disabled={saving}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Save size={18} className="mr-2" />
              {saving ? "Saving..." : "Create Note"}
            </button>
          </div>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="mb-6">
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Note title..."
            className="w-full text-3xl font-bold border-none focus:outline-none focus:ring-0 bg-transparent placeholder-gray-400 text-gray-900"
          />
        </div>

        <Editor content={content} onChange={setContent} placeholder="Start writing your note..." />
      </div>
    </div>
  );
}
