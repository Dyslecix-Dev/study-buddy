"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import DashboardNav from "@/components/dashboard-nav";
import { LoadingSpinner } from "@/components/loading-spinner";
import { Plus } from "lucide-react";
import DeckList from "@/components/flashcards/deck-list";
import { toast } from "sonner";
import DeleteConfirmModal from "@/components/ui/delete-confirm-modal";

interface Deck {
  id: string;
  name: string;
  description: string | null;
  color: string | null;
  _count: {
    Flashcard: number;
  };
  createdAt: Date;
  updatedAt: Date;
}

export default function FlashcardsPage() {
  const router = useRouter();
  const [decks, setDecks] = useState<Deck[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingDeck, setEditingDeck] = useState<Deck | null>(null);
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
    fetchDecks();
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

  const fetchDecks = async () => {
    try {
      const response = await fetch("/api/decks");
      if (response.ok) {
        const data = await response.json();
        setDecks(data);
      }
    } catch (error) {
      console.error("Error fetching decks:", error);
      toast.error("Failed to load decks");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateDeck = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      toast.error("Please enter a deck name");
      return;
    }

    try {
      console.log("Creating deck with data:", formData);
      const response = await fetch("/api/decks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      console.log("Response status:", response.status);
      const responseData = await response.json();
      console.log("Response data:", responseData);

      if (response.ok) {
        toast.success("Deck created successfully");
        setShowForm(false);
        setFormData({ name: "", description: "", color: "" });
        await fetchDecks();
      } else {
        console.error("Failed to create deck. Status:", response.status, "Error:", responseData);
        toast.error(responseData.error || "Failed to create deck");
      }
    } catch (error) {
      console.error("Error creating deck:", error);
      toast.error("Failed to create deck");
    }
  };

  const handleUpdateDeck = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!editingDeck) return;

    try {
      console.log("Updating deck with ID:", editingDeck.id);
      console.log("Update data:", formData);

      const response = await fetch(`/api/decks/${editingDeck.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      console.log("Response status:", response.status);
      const responseData = await response.json();
      console.log("Response data:", responseData);

      if (response.ok) {
        toast.success("Deck updated successfully");
        setEditingDeck(null);
        setFormData({ name: "", description: "", color: "" });
        await fetchDecks();
      } else {
        console.error("Failed to update deck. Status:", response.status, "Error:", responseData);
        toast.error(responseData.error || "Failed to update deck");
      }
    } catch (error) {
      console.error("Error updating deck:", error);
      toast.error("Failed to update deck");
    }
  };

  const handleDeleteDeck = async (id: string) => {
    setDeleteConfirm(id);
  };

  const confirmDelete = async () => {
    if (!deleteConfirm) return;

    try {
      const response = await fetch(`/api/decks/${deleteConfirm}`, {
        method: "DELETE",
      });

      if (response.ok) {
        toast.success("Deck deleted successfully");
        await fetchDecks();
      } else {
        toast.error("Failed to delete deck");
      }
    } catch (error) {
      console.error("Error deleting deck:", error);
      toast.error("Failed to delete deck");
    } finally {
      setDeleteConfirm(null);
    }
  };

  const handleEdit = (deck: Deck) => {
    setEditingDeck(deck);
    setFormData({
      name: deck.name,
      description: deck.description || "",
      color: deck.color || "",
    });
    setShowForm(false);
  };

  const handleCancelForm = () => {
    setShowForm(false);
    setEditingDeck(null);
    setFormData({ name: "", description: "", color: "" });
  };

  if (loading) {
    return (
      <div className="min-h-screen" style={{ backgroundColor: "var(--background)" }}>
        <DashboardNav />
        <LoadingSpinner message="Loading decks..." />
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: "var(--background)" }}>
      <DashboardNav />

      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold" style={{ color: "var(--text-primary)" }}>
              My Decks
            </h1>
            <p className="mt-2 text-sm" style={{ color: "var(--text-secondary)" }}>
              {decks.length} {decks.length === 1 ? "deck" : "decks"}
            </p>
          </div>
          <button
            onClick={() => {
              setEditingDeck(null);
              setFormData({ name: "", description: "", color: "" });
              setShowForm(true);
            }}
            className="flex items-center gap-2 px-4 py-2 text-black rounded-md transition-all duration-300 cursor-pointer"
            style={{ backgroundColor: "var(--primary)" }}
            onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.9")}
            onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
          >
            <Plus size={18} />
            New Deck
          </button>
        </div>

        {/* Deck Form */}
        {(showForm || editingDeck) && (
          <form onSubmit={editingDeck ? handleUpdateDeck : handleCreateDeck} className="rounded-lg shadow p-6 mb-6" style={{ backgroundColor: "var(--surface)" }}>
            <h3 className="text-lg font-semibold mb-4" style={{ color: "var(--text-primary)" }}>
              {editingDeck ? "Edit Deck" : "Create New Deck"}
            </h3>

            <div className="space-y-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium mb-1" style={{ color: "var(--text-secondary)" }}>
                  Deck Name *
                </label>
                <input
                  id="name"
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g., Spanish Vocabulary"
                  className="w-full px-3 py-2 rounded-md focus:outline-none focus:ring-2"
                  style={{
                    backgroundColor: "var(--background)",
                    borderColor: "var(--border)",
                    color: "var(--text-primary)",
                    borderWidth: "1px",
                  }}
                />
              </div>

              <div>
                <label htmlFor="description" className="block text-sm font-medium mb-1" style={{ color: "var(--text-secondary)" }}>
                  Description
                </label>
                <textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={2}
                  placeholder="Optional description..."
                  className="w-full px-3 py-2 rounded-md focus:outline-none focus:ring-2 resize-none"
                  style={{
                    backgroundColor: "var(--background)",
                    borderColor: "var(--border)",
                    color: "var(--text-primary)",
                    borderWidth: "1px",
                  }}
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

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={handleCancelForm}
                  className="px-4 py-2 rounded-md text-sm font-medium transition-all duration-300 cursor-pointer"
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
                <button
                  type="submit"
                  className="px-4 py-2 text-black rounded-md text-sm font-medium transition-all duration-300 cursor-pointer"
                  style={{ backgroundColor: "var(--primary)" }}
                  onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.9")}
                  onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
                >
                  {editingDeck ? "Save Changes" : "Create Deck"}
                </button>
              </div>
            </div>
          </form>
        )}

        <DeckList decks={decks} onEdit={handleEdit} onDelete={handleDeleteDeck} />
      </div>

      <DeleteConfirmModal
        isOpen={!!deleteConfirm}
        onClose={() => setDeleteConfirm(null)}
        onConfirm={confirmDelete}
        title="Delete Deck?"
        description="Are you sure you want to delete this deck? All flashcards will be deleted."
      />
    </div>
  );
}

