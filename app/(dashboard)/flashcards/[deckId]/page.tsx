"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import DashboardNav from "@/components/dashboard-nav";
import { Plus, Trash2, Edit2, Play, Clock, FileText } from "lucide-react";
import FlashcardForm from "@/components/flashcards/flashcard-form";
import { toast } from "sonner";
import DeleteConfirmModal from "@/components/ui/delete-confirm-modal";
import { isDueForReview, getIntervalDescription } from "@/lib/spaced-repetition";
import { Tag } from "@/lib/tag-utils";
import TagBadge from "@/components/tags/tag-badge";
import TagFilter from "@/components/tags/tag-filter";

interface Flashcard {
  id: string;
  front: string;
  back: string;
  createdAt: Date;
  easeFactor: number;
  interval: number;
  repetitions: number;
  nextReview: Date | null;
  lastReviewed: Date | null;
  Tag?: Tag[];
}

interface Deck {
  id: string;
  name: string;
  description: string | null;
  Flashcard: Flashcard[];
}

// Helper function to filter cards by status
function filterByStatus(card: Flashcard, filterStatus: string) {
  if (filterStatus === "all") return true;
  if (filterStatus === "new") {
    return card.repetitions === 0 && card.lastReviewed === null;
  }
  if (filterStatus === "due") {
    const isDue = isDueForReview(card.nextReview);
    const isRelearning = card.repetitions === 0 && card.lastReviewed !== null;
    const isLaterToday = card.nextReview && !isDue && Math.ceil((new Date(card.nextReview).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)) <= 1;
    return isDue || isRelearning || isLaterToday;
  }
  if (filterStatus === "week") {
    if (!card.nextReview || isDueForReview(card.nextReview)) return false;
    const daysUntil = Math.ceil((new Date(card.nextReview).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
    return daysUntil > 1 && daysUntil <= 7;
  }
  if (filterStatus === "month") {
    if (!card.nextReview || isDueForReview(card.nextReview)) return false;
    const daysUntil = Math.ceil((new Date(card.nextReview).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
    return daysUntil > 7 && daysUntil <= 30;
  }
  return true;
}

// Helper function to filter cards by tags
function filterByTags(card: Flashcard, tagFilter: string[]) {
  if (tagFilter.length === 0) return true;
  if (!card.Tag || card.Tag.length === 0) return false;
  return tagFilter.some((tagId) => card.Tag!.some((tag) => tag.id === tagId));
}

// Helper function to get card status and colors
function getCardStatus(card: Flashcard) {
  const isDue = isDueForReview(card.nextReview);
  const now = new Date();

  // Check if card has been studied but not successfully recalled
  const hasBeenStudied = card.lastReviewed !== null;

  // If card has 0 repetitions but has been studied, it's due for review (relearning)
  if (card.repetitions === 0 && hasBeenStudied) {
    return {
      label: "Due Now",
      color: "#dc2626", // red
      bgColor: "#fef2f2",
      borderColor: "#fca5a5",
    };
  }

  // If card has never been studied, it's new
  if (card.repetitions === 0 && !hasBeenStudied) {
    return {
      label: "New",
      color: "#3b82f6", // blue
      bgColor: "#eff6ff",
      borderColor: "#93c5fd",
    };
  }

  if (!card.nextReview) {
    return {
      label: "New",
      color: "#3b82f6", // blue
      bgColor: "#eff6ff",
      borderColor: "#93c5fd",
    };
  }

  if (isDue) {
    return {
      label: "Due Now",
      color: "#dc2626", // red
      bgColor: "#fef2f2",
      borderColor: "#fca5a5",
    };
  }

  const daysUntilReview = Math.ceil((new Date(card.nextReview).getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

  if (daysUntilReview <= 1) {
    return {
      label: "Later Today",
      color: "#ea580c", // orange
      bgColor: "#fff7ed",
      borderColor: "#fdba74",
    };
  } else if (daysUntilReview <= 7) {
    return {
      label: `In ${daysUntilReview} days`,
      color: "#ca8a04", // yellow
      bgColor: "#fefce8",
      borderColor: "#fde047",
    };
  } else if (daysUntilReview <= 30) {
    return {
      label: getIntervalDescription(new Date(card.nextReview)),
      color: "#16a34a", // green
      bgColor: "#f0fdf4",
      borderColor: "#86efac",
    };
  } else if (daysUntilReview <= 365) {
    return {
      label: getIntervalDescription(new Date(card.nextReview)),
      color: "#0891b2", // cyan
      bgColor: "#ecfeff",
      borderColor: "#67e8f9",
    };
  } else {
    return {
      label: getIntervalDescription(new Date(card.nextReview)),
      color: "#7c3aed", // purple
      bgColor: "#faf5ff",
      borderColor: "#c4b5fd",
    };
  }
}

export default function DeckDetailPage({ params }: { params: Promise<{ deckId: string }> }) {
  const { deckId } = use(params);
  const router = useRouter();
  const [deck, setDeck] = useState<Deck | null>(null);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingCard, setEditingCard] = useState<Flashcard | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [tagFilter, setTagFilter] = useState<string[]>([]);

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

        <div className="mb-6">
          <div className="flex justify-between items-center mb-4">
            <h1 className="text-xl font-semibold" style={{ color: "var(--text-primary)" }}>
              Flashcards ({deck.Flashcard.length})
            </h1>
            <div className="flex gap-3">
              {(() => {
                // Calculate filtered cards count
                const filteredCards = deck.Flashcard.filter((card) => {
                  return filterByStatus(card, filterStatus) && filterByTags(card, tagFilter);
                });

                const hasCards = filteredCards.length > 0;
                const buttonLabel = filterStatus === "all" ? "Study All" : `Study ${filterStatus.charAt(0).toUpperCase() + filterStatus.slice(1)}`;

                return hasCards ? (
                  <Link
                    href={`/flashcards/${deckId}/study?filter=${filterStatus}`}
                    className="flex items-center gap-2 px-4 py-2 text-white rounded-md transition-all duration-300"
                    style={{ backgroundColor: "var(--secondary)" }}
                    onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.9")}
                    onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
                  >
                    <Play size={18} />
                    {buttonLabel} ({filteredCards.length})
                  </Link>
                ) : deck.Flashcard.length > 0 ? (
                  <button
                    disabled
                    className="flex items-center gap-2 px-4 py-2 text-white rounded-md opacity-50 cursor-not-allowed"
                    style={{ backgroundColor: "var(--secondary)" }}
                    title={`No ${filterStatus} cards to study`}
                  >
                    <Play size={18} />
                    {buttonLabel} (0)
                  </button>
                ) : null;
              })()}
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

          {/* Filter Buttons */}
          {deck.Flashcard.length > 0 && (
            <div className="space-y-3">
              <div className="flex flex-wrap gap-2">
                {["all", "new", "due", "week", "month"].map((status) => {
                  const isActive = filterStatus === status;
                  const count =
                    status === "all"
                      ? deck.Flashcard.length
                      : status === "new"
                      ? deck.Flashcard.filter((c) => c.repetitions === 0 && c.lastReviewed === null).length
                      : status === "due"
                      ? deck.Flashcard.filter((c) => {
                          const isDue = isDueForReview(c.nextReview);
                          const isRelearning = c.repetitions === 0 && c.lastReviewed !== null;
                          const isLaterToday = c.nextReview && !isDue && Math.ceil((new Date(c.nextReview).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)) <= 1;
                          return isDue || isRelearning || isLaterToday;
                        }).length
                      : status === "week"
                      ? deck.Flashcard.filter((c) => {
                          if (!c.nextReview || isDueForReview(c.nextReview)) return false;
                          const daysUntil = Math.ceil((new Date(c.nextReview).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
                          return daysUntil > 1 && daysUntil <= 7;
                        }).length
                      : deck.Flashcard.filter((c) => {
                          if (!c.nextReview || isDueForReview(c.nextReview)) return false;
                          const daysUntil = Math.ceil((new Date(c.nextReview).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
                          return daysUntil > 7 && daysUntil <= 30;
                        }).length;

                  return (
                    <button
                      key={status}
                      onClick={() => setFilterStatus(status)}
                      className="px-3 py-1.5 rounded-md text-sm font-medium transition-all duration-300 cursor-pointer"
                      style={{
                        backgroundColor: isActive ? "var(--primary)" : "var(--surface)",
                        color: isActive ? "black" : "var(--text-secondary)",
                        borderWidth: "1px",
                        borderColor: isActive ? "var(--primary)" : "var(--border)",
                      }}
                    >
                      {status.charAt(0).toUpperCase() + status.slice(1)} ({count})
                    </button>
                  );
                })}
              </div>

              {/* Color Legend */}
              <div className="flex flex-wrap gap-3 text-xs">
                <div className="flex items-center gap-1.5">
                  <div className="w-3 h-3 rounded" style={{ backgroundColor: "#3b82f6" }} />
                  <span style={{ color: "var(--text-secondary)" }}>New</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-3 h-3 rounded" style={{ backgroundColor: "#dc2626" }} />
                  <span style={{ color: "var(--text-secondary)" }}>Due Now</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-3 h-3 rounded" style={{ backgroundColor: "#ea580c" }} />
                  <span style={{ color: "var(--text-secondary)" }}>Later Today</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-3 h-3 rounded" style={{ backgroundColor: "#ca8a04" }} />
                  <span style={{ color: "var(--text-secondary)" }}>This Week</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-3 h-3 rounded" style={{ backgroundColor: "#16a34a" }} />
                  <span style={{ color: "var(--text-secondary)" }}>This Month</span>
                </div>
              </div>

              {/* Tag Filter */}
              <div className="mt-3">
                <TagFilter selectedTagIds={tagFilter} onTagsChange={setTagFilter} label="Filter by tags" />
              </div>
            </div>
          )}
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

        {/* Flashcards Grid */}
        {deck.Flashcard.length === 0 ? (
          <div className="text-center py-12 rounded-lg shadow" style={{ backgroundColor: "var(--surface)" }}>
            <FileText className="mx-auto h-12 w-12" style={{ color: "var(--text-muted)" }} />
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {deck.Flashcard.filter((card) => {
              return filterByStatus(card, filterStatus) && filterByTags(card, tagFilter);
            }).map((card) => {
              const status = getCardStatus(card);
              return (
                <div
                  key={card.id}
                  className="rounded-lg shadow-sm p-4 hover:shadow-md transition-all duration-300 flex flex-col"
                  style={{
                    backgroundColor: status.bgColor,
                    borderColor: status.borderColor,
                    borderWidth: "2px",
                    borderStyle: "solid",
                  }}
                >
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <div className="flex items-center gap-2">
                      <span
                        className="text-xs font-bold px-2 py-1 rounded"
                        style={{
                          backgroundColor: status.color,
                          color: "white",
                        }}
                      >
                        {status.label}
                      </span>
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
                  <div className="flex-1">
                    <div className="mb-3">
                      <p className="text-xs mb-1 uppercase font-semibold" style={{ color: status.color }}>
                        Front
                      </p>
                      <p className="text-sm text-black line-clamp-3">{card.front}</p>
                    </div>
                    <div className="mb-3">
                      <p className="text-xs mb-1 uppercase font-semibold" style={{ color: status.color }}>
                        Back
                      </p>
                      <p className="text-sm text-black line-clamp-3">{card.back}</p>
                    </div>
                    {card.Tag && card.Tag.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {card.Tag.map((tag) => (
                          <TagBadge key={tag.id} tag={tag} size="sm" />
                        ))}
                      </div>
                    )}
                  </div>
                  {card.nextReview && (
                    <div className="mt-3 pt-3 border-t flex items-center gap-2" style={{ borderColor: status.borderColor }}>
                      <Clock size={14} style={{ color: status.color }} />
                      <span className="text-xs" style={{ color: status.color }}>
                        {status.label === "New" ? "Never reviewed" : `Next: ${status.label}`}
                      </span>
                    </div>
                  )}
                </div>
              );
            })}
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

