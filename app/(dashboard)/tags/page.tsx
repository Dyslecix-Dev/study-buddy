"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import DashboardNav from "@/components/dashboard-nav";
import { Plus, Edit2, Trash2, Hash } from "lucide-react";
import TagBadge from "@/components/tags/tag-badge";
import { Tag, TAG_COLORS, getRandomTagColor } from "@/lib/tag-utils";
import { toast } from "sonner";
import Button from "@/components/ui/button";
import DeleteConfirmModal from "@/components/ui/delete-confirm-modal";

interface TagWithCounts extends Tag {
  _count?: {
    Note: number;
    Task: number;
    Flashcard: number;
  };
}

export default function TagsPage() {
  const router = useRouter();
  const [tags, setTags] = useState<TagWithCounts[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingTag, setEditingTag] = useState<TagWithCounts | null>(null);
  const [deleteTag, setDeleteTag] = useState<TagWithCounts | null>(null);
  const [formData, setFormData] = useState({ name: "", color: getRandomTagColor() });

  useEffect(() => {
    checkAuth();
    fetchTags();
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

  const fetchTags = async () => {
    try {
      const response = await fetch("/api/tags");
      if (response.ok) {
        const data = await response.json();
        setTags(data);
      }
    } catch (error) {
      toast.error("Failed to load tags");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTag = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      toast.error("Tag name is required");
      return;
    }

    try {
      const response = await fetch("/api/tags", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        toast.success("Tag created successfully");
        setShowForm(false);
        setFormData({ name: "", color: getRandomTagColor() });
        await fetchTags();
      } else {
        toast.error("Failed to create tag");
      }
    } catch (error) {
      toast.error("Failed to create tag");
    }
  };

  const handleUpdateTag = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!editingTag || !formData.name.trim()) {
      toast.error("Tag name is required");
      return;
    }

    try {
      const response = await fetch(`/api/tags/${editingTag.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        toast.success("Tag updated successfully");
        setEditingTag(null);
        setFormData({ name: "", color: getRandomTagColor() });
        await fetchTags();
      } else {
        const data = await response.json();
        toast.error(data.error || "Failed to update tag");
      }
    } catch (error) {
      console.error("Error updating tag:", error);
      toast.error("Failed to update tag");
    }
  };

  const handleDeleteTag = async () => {
    if (!deleteTag) return;

    try {
      const response = await fetch(`/api/tags/${deleteTag.id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        toast.success("Tag deleted successfully");
        setDeleteTag(null);
        await fetchTags();
      } else {
        toast.error("Failed to delete tag");
      }
    } catch (error) {
      console.error("Error deleting tag:", error);
      toast.error("Failed to delete tag");
    }
  };

  const startEdit = (tag: TagWithCounts) => {
    setEditingTag(tag);
    setFormData({ name: tag.name, color: tag.color || getRandomTagColor() });
    setShowForm(false);
  };

  const cancelEdit = () => {
    setEditingTag(null);
    setFormData({ name: "", color: getRandomTagColor() });
  };

  const getTotalUsage = (tag: TagWithCounts) => {
    if (!tag._count) return 0;
    return tag._count.Note + tag._count.Task + tag._count.Flashcard;
  };

  if (loading) {
    return (
      <div className="min-h-screen" style={{ backgroundColor: "var(--background)" }}>
        <DashboardNav />
        <div className="flex items-center justify-center py-12">
          <div style={{ color: "var(--text-secondary)" }}>Loading...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: "var(--background)" }}>
      <DashboardNav />

      <div className="max-w-6xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold" style={{ color: "var(--text-primary)" }}>
              Tag Management
            </h1>
            <p className="mt-2 text-sm" style={{ color: "var(--text-secondary)" }}>
              Organize your notes, tasks, and flashcards with tags
            </p>
          </div>
          <button
            onClick={() => {
              setShowForm(!showForm);
              setEditingTag(null);
              setFormData({ name: "", color: getRandomTagColor() });
            }}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            <Plus size={20} />
            New Tag
          </button>
        </div>

        {(showForm || editingTag) && (
          <form
            onSubmit={editingTag ? handleUpdateTag : handleCreateTag}
            className="rounded-lg shadow p-6 mb-6"
            style={{ backgroundColor: "var(--surface)" }}
          >
            <h3 className="text-lg font-semibold mb-4" style={{ color: "var(--text-primary)" }}>
              {editingTag ? "Edit Tag" : "Create New Tag"}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1" style={{ color: "var(--text-primary)" }}>
                  Tag Name *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g., Important, Work, Study"
                  className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  style={{ borderColor: "var(--border)", color: "var(--text-primary)" }}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1" style={{ color: "var(--text-primary)" }}>
                  Color
                </label>
                <div className="flex flex-wrap gap-2">
                  {TAG_COLORS.map((colorOption) => (
                    <button
                      key={colorOption.value}
                      type="button"
                      onClick={() => setFormData({ ...formData, color: colorOption.value })}
                      className={`w-8 h-8 rounded-full border-2 transition-all ${
                        formData.color === colorOption.value ? "ring-2 ring-offset-2 ring-blue-500" : ""
                      }`}
                      style={{ backgroundColor: colorOption.value, borderColor: colorOption.value }}
                      title={colorOption.name}
                    />
                  ))}
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-4">
              <button
                type="button"
                onClick={editingTag ? cancelEdit : () => setShowForm(false)}
                className="px-4 py-2 border rounded-md text-sm font-medium hover:bg-gray-50 transition-colors"
                style={{ borderColor: "var(--border)", color: "var(--text-secondary)" }}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700 transition-colors"
              >
                {editingTag ? "Update Tag" : "Create Tag"}
              </button>
            </div>
          </form>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {tags.length === 0 ? (
            <div className="col-span-full text-center py-12">
              <Hash className="mx-auto h-12 w-12 mb-4" style={{ color: "var(--text-muted)" }} />
              <p className="text-lg font-medium mb-2" style={{ color: "var(--text-primary)" }}>
                No tags yet
              </p>
              <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
                Create your first tag to start organizing your content
              </p>
            </div>
          ) : (
            tags.map((tag) => (
              <div
                key={tag.id}
                className="rounded-lg shadow p-4 hover:shadow-md transition-shadow"
                style={{ backgroundColor: "var(--surface)" }}
              >
                <div className="flex items-start justify-between mb-3">
                  <TagBadge tag={tag} size="md" />
                  <div className="flex gap-1">
                    <button
                      onClick={() => startEdit(tag)}
                      className="p-1 rounded hover:bg-gray-100 transition-colors"
                      title="Edit tag"
                    >
                      <Edit2 size={16} style={{ color: "var(--text-muted)" }} />
                    </button>
                    <button
                      onClick={() => setDeleteTag(tag)}
                      className="p-1 rounded hover:bg-red-50 transition-colors"
                      title="Delete tag"
                    >
                      <Trash2 size={16} className="text-red-600" />
                    </button>
                  </div>
                </div>
                {tag._count && (
                  <div className="text-sm space-y-1" style={{ color: "var(--text-secondary)" }}>
                    <div className="flex justify-between">
                      <span>Notes:</span>
                      <span className="font-medium">{tag._count.Note}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Tasks:</span>
                      <span className="font-medium">{tag._count.Task}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Flashcards:</span>
                      <span className="font-medium">{tag._count.Flashcard}</span>
                    </div>
                    <div className="flex justify-between pt-2 border-t" style={{ borderColor: "var(--border)" }}>
                      <span className="font-semibold">Total:</span>
                      <span className="font-semibold">{getTotalUsage(tag)}</span>
                    </div>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>

      <DeleteConfirmModal
        isOpen={!!deleteTag}
        onClose={() => setDeleteTag(null)}
        onConfirm={handleDeleteTag}
        title="Delete Tag?"
        description={`Are you sure you want to delete the tag "${deleteTag?.name}"? This will remove the tag from all associated items.`}
      />
    </div>
  );
}
