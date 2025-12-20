"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import FolderList from "@/components/folders/folder-list";
import DashboardNav from "@/components/dashboard-nav";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import DeleteConfirmModal from "@/components/ui/delete-confirm-modal";

interface Folder {
  id: string;
  name: string;
  description: string | null;
  color: string | null;
  _count: {
    notes: number;
  };
}

export default function NotesPage() {
  const router = useRouter();
  const [folders, setFolders] = useState<Folder[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingFolder, setEditingFolder] = useState<Folder | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    color: "",
  });
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  useEffect(() => {
    checkAuth();
  }, []);

  useEffect(() => {
    fetchFolders();
  }, []);

  const checkAuth = async () => {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      router.push("/login");
    }
  };

  const fetchFolders = async () => {
    try {
      const response = await fetch("/api/folders");
      if (response.ok) {
        const data = await response.json();
        setFolders(data);
      }
    } catch (error) {
      console.error("Error fetching folders:", error);
      toast.error("Failed to load folders");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      toast.error("Folder name is required");
      return;
    }

    try {
      const url = editingFolder ? `/api/folders/${editingFolder.id}` : "/api/folders";
      const method = editingFolder ? "PATCH" : "POST";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        toast.success(editingFolder ? "Folder updated successfully" : "Folder created successfully");
        setShowCreateForm(false);
        setEditingFolder(null);
        setFormData({ name: "", description: "", color: "" });
        fetchFolders();
      } else {
        toast.error(editingFolder ? "Failed to update folder" : "Failed to create folder");
      }
    } catch (error) {
      console.error("Error saving folder:", error);
      toast.error("An error occurred");
    }
  };

  const handleEdit = (folder: Folder) => {
    setEditingFolder(folder);
    setFormData({
      name: folder.name,
      description: folder.description || "",
      color: folder.color || "",
    });
    setShowCreateForm(true);
  };

  const handleDelete = async (id: string) => {
    setDeleteConfirm(id);
  };

  const confirmDelete = async () => {
    if (!deleteConfirm) return;

    try {
      const response = await fetch(`/api/folders/${deleteConfirm}`, {
        method: "DELETE",
      });

      if (response.ok) {
        toast.success("Folder deleted successfully");
        fetchFolders();
      } else {
        toast.error("Failed to delete folder");
      }
    } catch (error) {
      console.error("Error deleting folder:", error);
      toast.error("An error occurred");
    } finally {
      setDeleteConfirm(null);
    }
  };

  const handleCancel = () => {
    setShowCreateForm(false);
    setEditingFolder(null);
    setFormData({ name: "", description: "", color: "" });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: "var(--background)" }}>
        <p style={{ color: "var(--text-secondary)" }}>Loading folders...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: "var(--background)" }}>
      <DashboardNav />

      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold" style={{ color: "var(--text-primary)" }}>
              My Folders
            </h1>
            <p className="mt-2 text-sm" style={{ color: "var(--text-secondary)" }}>
              {folders.length} {folders.length === 1 ? "folder" : "folders"}
            </p>
          </div>
          <button
            onClick={() => setShowCreateForm(!showCreateForm)}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-black focus:outline-none focus:ring-2 focus:ring-offset-2 transition-all duration-300 cursor-pointer"
            style={{ backgroundColor: "var(--primary)" }}
            onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.9")}
            onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
          >
            <Plus className="mr-2" size={18} />
            New Folder
          </button>
        </div>

        {/* Create/Edit Form */}
        {showCreateForm && (
          <div className="rounded-lg shadow p-6 mb-8" style={{ backgroundColor: "var(--surface)" }}>
            <h2 className="text-xl font-semibold mb-4" style={{ color: "var(--text-primary)" }}>
              {editingFolder ? "Edit Folder" : "Create New Folder"}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium mb-1" style={{ color: "var(--text-secondary)" }}>
                  Folder Name *
                </label>
                <input
                  type="text"
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 rounded-md focus:outline-none focus:ring-2"
                  style={{
                    backgroundColor: "var(--background)",
                    borderColor: "var(--border)",
                    color: "var(--text-primary)",
                    borderWidth: "1px",
                  }}
                  placeholder="Enter folder name"
                  required
                />
              </div>

              <div>
                <label htmlFor="description" className="block text-sm font-medium mb-1" style={{ color: "var(--text-secondary)" }}>
                  Description (optional)
                </label>
                <textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-2 rounded-md focus:outline-none focus:ring-2"
                  style={{
                    backgroundColor: "var(--background)",
                    borderColor: "var(--border)",
                    color: "var(--text-primary)",
                    borderWidth: "1px",
                  }}
                  placeholder="Enter folder description"
                  rows={3}
                />
              </div>

              <div>
                <label htmlFor="color" className="block text-sm font-medium mb-1" style={{ color: "var(--text-secondary)" }}>
                  Color
                </label>
                <select
                  id="color"
                  value={formData.color}
                  onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                  className="w-full px-3 py-2 rounded-md focus:outline-none focus:ring-2 cursor-pointer"
                  style={{
                    backgroundColor: "var(--background)",
                    borderColor: "var(--border)",
                    color: "var(--text-primary)",
                    borderWidth: "1px",
                  }}
                >
                  <option value="">Default</option>
                  <option value="blue">Blue</option>
                  <option value="green">Green</option>
                  <option value="purple">Purple</option>
                  <option value="yellow">Yellow</option>
                  <option value="red">Red</option>
                  <option value="pink">Pink</option>
                </select>
              </div>

              <div className="flex gap-3">
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-black focus:outline-none focus:ring-2 focus:ring-offset-2 transition-all duration-300 cursor-pointer"
                  style={{ backgroundColor: "var(--primary)" }}
                  onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.9")}
                  onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
                >
                  {editingFolder ? "Update Folder" : "Create Folder"}
                </button>
                <button
                  type="button"
                  onClick={handleCancel}
                  className="px-4 py-2 rounded-md shadow-sm text-sm font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors duration-300 cursor-pointer"
                  style={{
                    borderColor: "var(--border)",
                    color: "var(--text-secondary)",
                    backgroundColor: "var(--surface)",
                    borderWidth: "1px",
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "var(--surface-hover)")}
                  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "var(--surface)")}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Folders List */}
        <FolderList folders={folders} onEdit={handleEdit} onDelete={handleDelete} />
      </div>

      <DeleteConfirmModal
        isOpen={!!deleteConfirm}
        onClose={() => setDeleteConfirm(null)}
        onConfirm={confirmDelete}
        title="Delete Folder?"
        description="Are you sure you want to delete this folder? Notes inside will not be deleted."
      />
    </div>
  );
}

