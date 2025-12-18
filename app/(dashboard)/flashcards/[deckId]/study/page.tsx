"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import DashboardNav from "@/components/dashboard-nav";
import StudySession from "@/components/flashcards/study-session";
import { toast } from "sonner";

interface Flashcard {
  id: string;
  front: string;
  back: string;
}

interface Deck {
  id: string;
  name: string;
  Flashcard: Flashcard[];
}

export default function StudyPage({ params }: { params: Promise<{ deckId: string }> }) {
  const { deckId } = use(params);
  const router = useRouter();
  const [deck, setDeck] = useState<Deck | null>(null);
  const [loading, setLoading] = useState(true);
  const [cardCount, setCardCount] = useState<number>(5);
  const [sessionStarted, setSessionStarted] = useState(false);

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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: "var(--background)" }}>
        <p style={{ color: "var(--text-secondary)" }}>Loading study session...</p>
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

  const selectedCards = deck.Flashcard.slice(0, cardCount);

  return (
    <div className="min-h-screen" style={{ backgroundColor: "var(--background)" }}>
      <DashboardNav />

      <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="mb-6">
          <Link
            href={`/flashcards/${deckId}`}
            className="text-sm transition-colors duration-300"
            style={{ color: "var(--text-secondary)" }}
            onMouseEnter={(e) => (e.currentTarget.style.color = "var(--text-primary)")}
            onMouseLeave={(e) => (e.currentTarget.style.color = "var(--text-secondary)")}
          >
            ← Back to Deck
          </Link>
        </div>

        <h2 className="text-2xl font-bold mb-6" style={{ color: "var(--text-primary)" }}>
          Study: {deck.name}
        </h2>

        {!sessionStarted ? (
          <div className="rounded-lg shadow-lg p-8" style={{ backgroundColor: "var(--surface)" }}>
            <h3 className="text-xl font-semibold mb-4" style={{ color: "var(--text-primary)" }}>
              Configure Study Session
            </h3>
            <p className="mb-6" style={{ color: "var(--text-secondary)" }}>
              Choose how many flashcards you want to study in this session.
            </p>

            <div className="mb-6">
              <label className="block text-sm font-medium mb-2" style={{ color: "var(--text-primary)" }}>
                Number of cards: {cardCount}
              </label>
              <input
                type="range"
                min="1"
                max={deck.Flashcard.length}
                value={cardCount}
                onChange={(e) => setCardCount(parseInt(e.target.value))}
                className="w-full h-2 rounded-lg appearance-none cursor-pointer"
                style={{
                  background: `linear-gradient(to right, var(--primary) 0%, var(--primary) ${((cardCount - 1) / (deck.Flashcard.length - 1)) * 100}%, var(--border) ${((cardCount - 1) / (deck.Flashcard.length - 1)) * 100}%, var(--border) 100%)`,
                }}
              />
              <div className="flex justify-between text-xs mt-2" style={{ color: "var(--text-muted)" }}>
                <span>1 card</span>
                <span>{deck.Flashcard.length} cards (all)</span>
              </div>
            </div>

            <div className="rounded-lg p-4 mb-6" style={{ backgroundColor: "var(--surface-secondary)" }}>
              <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
                You will study <span className="font-semibold" style={{ color: "var(--text-primary)" }}>{cardCount}</span> out of{" "}
                <span className="font-semibold" style={{ color: "var(--text-primary)" }}>{deck.Flashcard.length}</span> available flashcards.
              </p>
            </div>

            <button
              onClick={() => setSessionStarted(true)}
              className="w-full px-6 py-3 rounded-md font-medium transition-all duration-300 cursor-pointer"
              style={{ backgroundColor: "var(--primary)", color: "#1a1a1a" }}
              onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.9")}
              onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
            >
              Start Study Session
            </button>
          </div>
        ) : (
          <StudySession deckId={deckId} flashcards={selectedCards} />
        )}
      </div>
    </div>
  );
}

