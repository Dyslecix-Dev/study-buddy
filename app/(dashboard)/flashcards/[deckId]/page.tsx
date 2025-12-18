"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import DashboardNav from "@/components/dashboard-nav";
import { Plus, Trash2, Edit2, Play } from "lucide-react";
import FlashcardForm from "@/components/flashcards/flashcard-form";
import { toast } from "sonner";
import DeleteConfirmModal from "@/components/ui/delete-confirm-modal";

interface Flashcard {
  id: string;
  front: string;
  back: string;
  createdAt: Date;
}

interface Deck {
  id: string;
  name: string;
  description: string | null;
  Flashcard: Flashcard[];
}

export default function DeckDetailPage({ params }: { params: Promise<{ deckId: string }> }) {
  const { deckId } = use(params);
  const router = useRouter();
  const [deck, setDeck] = useState<Deck | null>(null);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingCard, setEditingCard] = useState<Flashcard | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  useEffect(() => {
    checkAuth();
  }, []);

  useEffect(() => {
    if (deckId) {
      fetchDeck();
    }
  }, [deckId]);

  const checkAuth = async () => {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      router.push("/login");
    }
  };

  const fetchDeck = async () => {
    try {
      const response = await fetch(`/api/decks/${deckId}`);
      if (response.ok) {
        const data = await response.json();
        setDeck(data);
      } else {
        toast.error("Failed to load deck");
        router.push("/flashcards");
      }
    } catch (error) {
      console.error("Error fetching deck:", error);
      toast.error("Failed to load deck");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateFlashcard = async (data: { front: string; back: string }) => {
    try {
      const response = await fetch(`/api/decks/${deckId}/flashcards`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        toast.success("Flashcard created successfully");
        setShowForm(false);
        await fetchDeck();
      } else {
        toast.error("Failed to create flashcard");
      }
    } catch (error) {
      console.error("Error creating flashcard:", error);
      toast.error("Failed to create flashcard");
    }
  };

  const handleUpdateFlashcard = async (data: { front: string; back: string }) => {
    if (!editingCard) return;

    try {
      const response = await fetch(`/api/decks/${deckId}/flashcards/${editingCard.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        toast.success("Flashcard updated successfully");
        setEditingCard(null);
        await fetchDeck();
      } else {
        toast.error("Failed to update flashcard");
      }
    } catch (error) {
      console.error("Error updating flashcard:", error);
      toast.error("Failed to update flashcard");
    }
  };

  const handleDeleteFlashcard = async (id: string) => {
    setDeleteConfirm(id);
  };

  const confirmDelete = async () => {
    if (!deleteConfirm) return;

    try {
      const response = await fetch(`/api/decks/${deckId}/flashcards/${deleteConfirm}`, {
        method: "DELETE",
      });

      if (response.ok) {
        toast.success("Flashcard deleted successfully");
        await fetchDeck();
      } else {
        toast.error("Failed to delete flashcard");
      }
    } catch (error) {
      console.error("Error deleting flashcard:", error);
      toast.error("Failed to delete flashcard");
    } finally {
      setDeleteConfirm(null);
    }
  };

  const handleEdit = (card: Flashcard) => {
    setEditingCard(card);
    setShowForm(false);
  };

  const handleCancelForm = () => {
    setShowForm(false);
    setEditingCard(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: "var(--background)" }}>
        <p style={{ color: "var(--text-secondary)" }}>Loading deck...</p>
      </div>
    );
  }

  if (!deck) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: "var(--background)" }}>
        <p style={{ color: "var(--text-secondary)" }}>Deck not found</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: "var(--background)" }}>
      <DashboardNav />

      <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="mb-6">
          <Link
            href="/flashcards"
            className="text-sm transition-colors duration-300"
            style={{ color: "var(--text-secondary)" }}
            onMouseEnter={(e) => (e.currentTarget.style.color = "var(--text-primary)")}
            onMouseLeave={(e) => (e.currentTarget.style.color = "var(--text-secondary)")}
          >
            ← Back to Decks
          </Link>
        </div>

        <div className="mb-6">
          <h2 className="text-2xl font-bold" style={{ color: "var(--text-primary)" }}>
            {deck.name}
          </h2>
          {deck.description && (
            <p className="mt-2" style={{ color: "var(--text-secondary)" }}>
              {deck.description}
            </p>
          )}
        </div>

        <div className="flex justify-between items-center mb-6">
          <h1 className="text-xl font-semibold" style={{ color: "var(--text-primary)" }}>
            Flashcards ({deck.Flashcard.length})
          </h1>
          <div className="flex gap-3">
            {deck.Flashcard.length > 0 && (
              <Link
                href={`/flashcards/${deckId}/study`}
                className="flex items-center gap-2 px-4 py-2 text-white rounded-md transition-all duration-300"
                style={{ backgroundColor: "var(--secondary)" }}
                onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.9")}
                onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
              >
                <Play size={18} />
                Study Now
              </Link>
            )}
            <button
              onClick={() => {
                setEditingCard(null);
                setShowForm(true);
              }}
              className="flex items-center gap-2 px-4 py-2 text-black rounded-md transition-all duration-300 cursor-pointer"
              style={{ backgroundColor: "var(--primary)" }}
              onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.9")}
              onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
            >
              <Plus size={18} />
              Add Card
            </button>
          </div>
        </div>

        {/* Flashcard Form */}
        {(showForm || editingCard) && (
          <FlashcardForm
            onSubmit={editingCard ? handleUpdateFlashcard : handleCreateFlashcard}
            onCancel={handleCancelForm}
            initialData={editingCard ? { front: editingCard.front, back: editingCard.back } : undefined}
            isEdit={!!editingCard}
          />
        )}

        {/* Flashcards List */}
        {deck.Flashcard.length === 0 ? (
          <div className="text-center py-12 rounded-lg shadow" style={{ backgroundColor: "var(--surface)" }}>
            <p className="mb-4" style={{ color: "var(--text-secondary)" }}>
              No flashcards in this deck yet.
            </p>
            <button
              onClick={() => setShowForm(true)}
              className="font-medium transition-all duration-300 cursor-pointer"
              style={{ color: "var(--primary)" }}
              onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.8")}
              onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
            >
              Create your first flashcard
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {deck.Flashcard.map((card) => (
              <div
                key={card.id}
                className="rounded-lg shadow-sm p-4 hover:shadow-md transition-shadow duration-300"
                style={{ backgroundColor: "var(--surface)", borderColor: "var(--border)", borderWidth: "1px" }}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="mb-3">
                      <p className="text-xs mb-1 uppercase" style={{ color: "var(--text-muted)" }}>
                        Front
                      </p>
                      <p style={{ color: "var(--text-primary)" }}>{card.front}</p>
                    </div>
                    <div>
                      <p className="text-xs mb-1 uppercase" style={{ color: "var(--text-muted)" }}>
                        Back
                      </p>
                      <p style={{ color: "var(--text-primary)" }}>{card.back}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleEdit(card)}
                      className="transition-colors duration-300 cursor-pointer"
                      style={{ color: "var(--text-muted)" }}
                      onMouseEnter={(e) => (e.currentTarget.style.color = "var(--primary)")}
                      onMouseLeave={(e) => (e.currentTarget.style.color = "var(--text-muted)")}
                      title="Edit flashcard"
                    >
                      <Edit2 size={16} />
                    </button>
                    <button
                      onClick={() => handleDeleteFlashcard(card.id)}
                      className="transition-colors duration-300 cursor-pointer"
                      style={{ color: "var(--text-muted)" }}
                      onMouseEnter={(e) => (e.currentTarget.style.color = "#dc2626")}
                      onMouseLeave={(e) => (e.currentTarget.style.color = "var(--text-muted)")}
                      title="Delete flashcard"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
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
        title="Delete Flashcard?"
        description="Are you sure you want to delete this flashcard? This action cannot be undone."
      />
    </div>
  );
}

