"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import LogoutButton from "@/components/logout-button";
import SearchTrigger from "@/components/search/search-trigger";
import { ArrowLeft, Plus, FileText, Edit2, Trash2 } from "lucide-react";
import { toast } from "sonner";
import DeleteConfirmModal from "@/components/ui/delete-confirm-modal";

interface Note {
  id: string;
  title: string;
  content: any;
  createdAt: Date;
  updatedAt: Date;
}

interface Folder {
  id: string;
  name: string;
  description: string | null;
  color: string | null;
  Note: Note[];
}

export default function FolderDetailPage() {
  const router = useRouter();
  const params = useParams();
  const folderId = params.folderId as string;
  const [folder, setFolder] = useState<Folder | null>(null);
  const [loading, setLoading] = useState(true);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  useEffect(() => {
    checkAuth();
  }, []);

  useEffect(() => {
    if (folderId) {
      fetchFolder();
    }
  }, [folderId]);

  const checkAuth = async () => {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      router.push("/login");
    }
  };

  const fetchFolder = async () => {
    try {
      const response = await fetch(`/api/folders/${folderId}`);
      if (response.ok) {
        const data = await response.json();
        setFolder(data);
      } else if (response.status === 404) {
        toast.error("Folder not found");
        router.push("/notes");
      }
    } catch (error) {
      console.error("Error fetching folder:", error);
      toast.error("Failed to load folder");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteNote = async (noteId: string) => {
    setDeleteConfirm(noteId);
  };

  const confirmDelete = async () => {
    if (!deleteConfirm) return;

    try {
      const response = await fetch(`/api/notes/${deleteConfirm}`, {
        method: "DELETE",
      });

      if (response.ok) {
        toast.success("Note deleted successfully");
        fetchFolder();
      } else {
        toast.error("Failed to delete note");
      }
    } catch (error) {
      console.error("Error deleting note:", error);
      toast.error("An error occurred");
    } finally {
      setDeleteConfirm(null);
    }
  };

  const getPlainText = (content: any) => {
    if (typeof content === "string") {
      return content.replace(/<[^>]*>/g, "").substring(0, 150);
    }
    if (content && typeof content === "object" && content.type === "doc") {
      let text = "";
      const extractText = (node: any) => {
        if (node.text) {
          text += node.text;
        }
        if (node.content) {
          node.content.forEach(extractText);
        }
      };
      extractText(content);
      return text.substring(0, 150);
    }
    return "";
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
    }).format(new Date(date));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-600">Loading folder...</p>
      </div>
    );
  }

  if (!folder) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-600">Folder not found</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center h-16">
            <Link href="/notes" className="text-gray-600 hover:text-gray-900 mr-4">
              <ArrowLeft size={20} />
            </Link>
            <h2 className="text-xl font-semibold text-gray-900">{folder.name}</h2>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {folder.description && <p className="text-gray-600 mb-6">{folder.description}</p>}

        <div className="flex justify-between items-start mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Notes ({folder.Note.length})</h1>
          <Link
            href={`/notes/new?folderId=${folderId}`}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <Plus className="mr-2" size={18} />
            New Note
          </Link>
        </div>

        {folder.Note.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg shadow">
            <FileText className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No notes in this folder</h3>
            <p className="mt-1 text-sm text-gray-500">Get started by creating a new note.</p>
            <div className="mt-6">
              <Link
                href={`/notes/new?folderId=${folderId}`}
                className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
              >
                <Plus className="mr-2" size={18} />
                New Note
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {folder.Note.map((note) => (
              <div key={note.id} className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow overflow-hidden">
                <Link href={`/notes/${folderId}/edit/${note.id}`} className="block p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2 truncate">{note.title || "Untitled"}</h3>
                  <p className="text-sm text-gray-600 mb-4 line-clamp-3">{getPlainText(note.content) || "No content"}</p>
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <span>Updated</span>
                    <span>{formatDate(note.updatedAt)}</span>
                  </div>
                </Link>
                <div className="px-6 pb-4 flex gap-2">
                  <Link
                    href={`/notes/${folderId}/edit/${note.id}`}
                    className="flex-1 inline-flex items-center justify-center px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors"
                  >
                    <Edit2 size={16} className="mr-1" />
                    Edit
                  </Link>
                  <button
                    onClick={() => handleDeleteNote(note.id)}
                    className="inline-flex items-center justify-center px-3 py-2 border border-red-300 rounded-md text-sm font-medium text-red-700 bg-white hover:bg-red-50 transition-colors"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <DeleteConfirmModal
        isOpen={!!deleteConfirm}
        onClose={() => setDeleteConfirm(null)}
        onConfirm={confirmDelete}
        title="Delete Note?"
        description="Are you sure you want to delete this note? This action cannot be undone."
      />
    </div>
  );
}

