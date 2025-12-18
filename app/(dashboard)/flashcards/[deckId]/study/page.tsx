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

        <StudySession deckId={deckId} flashcards={deck.Flashcard} />
      </div>
    </div>
  );
}

