"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight, Check, X as XIcon } from "lucide-react";
import Flashcard from "./flashcard";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

interface FlashcardData {
  id: string;
  front: string;
  back: string;
}

interface StudySessionProps {
  deckId: string;
  flashcards: FlashcardData[];
}

type RatingType = "wrong" | "hard" | "good" | "easy";

interface CardRating {
  rating: number;
  type: RatingType;
}

export default function StudySession({ deckId, flashcards }: StudySessionProps) {
  const router = useRouter();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const [studiedCards, setStudiedCards] = useState<Set<number>>(new Set());
  const [ratings, setRatings] = useState<Map<string, CardRating>>(new Map());

  const currentCard = flashcards[currentIndex];
  const progress = ((currentIndex + 1) / flashcards.length) * 100;
  const correctCount = Array.from(ratings.values()).filter((r) => r.rating >= 3).length;
  const totalReviewed = ratings.size;

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
      setShowAnswer(false);
    }
  };

  const handleNext = () => {
    if (currentIndex < flashcards.length - 1) {
      setStudiedCards(new Set(studiedCards).add(currentIndex));
      setCurrentIndex(currentIndex + 1);
      setShowAnswer(false);
    }
  };

  const handleRating = async (rating: number, type: RatingType) => {
    // Record the rating
    setRatings(new Map(ratings).set(currentCard.id, { rating, type }));
    setStudiedCards(new Set(studiedCards).add(currentIndex));

    // Send to API
    try {
      await fetch(`/api/decks/${deckId}/flashcards/${currentCard.id}/review`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rating }),
      });
    } catch (error) {
      console.error("Error recording review:", error);
      toast.error("Failed to record review");
    }

    // Move to next card
    if (currentIndex < flashcards.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setShowAnswer(false);
    }
  };

  const getRatingColor = (type: RatingType) => {
    switch (type) {
      case "wrong":
        return "#ef4444"; // red-500
      case "hard":
        return "#eab308"; // yellow-500
      case "good":
        return "#22c55e"; // green-500
      case "easy":
        return "#3b82f6"; // blue-500
    }
  };

  const getRatingLabel = (type: RatingType) => {
    switch (type) {
      case "wrong":
        return "Wrong";
      case "hard":
        return "Hard";
      case "good":
        return "Good";
      case "easy":
        return "Easy";
    }
  };

  const handleFinish = () => {
    router.push(`/flashcards/${deckId}`);
  };

  if (flashcards.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">No flashcards to study in this deck.</p>
      </div>
    );
  }

  const isLastCard = currentIndex === flashcards.length - 1;
  const allReviewed = studiedCards.size === flashcards.length || ratings.size === flashcards.length;

  return (
    <div className="max-w-3xl mx-auto">
      {/* Card Indicators */}
      <div className="mb-6">
        <div className="flex gap-2 flex-wrap mb-4">
          {flashcards.map((card, idx) => {
            const cardRating = ratings.get(card.id);
            const isCurrentCard = idx === currentIndex;
            return (
              <button
                key={card.id}
                onClick={() => {
                  setCurrentIndex(idx);
                  setShowAnswer(false);
                }}
                className={`w-10 h-10 rounded-lg font-medium text-sm transition-all duration-300 cursor-pointer flex items-center justify-center ${
                  isCurrentCard ? "ring-2 ring-offset-2" : ""
                }`}
                style={{
                  backgroundColor: "var(--surface-secondary)",
                  color: "var(--text-primary)",
                  borderColor: cardRating ? getRatingColor(cardRating.type) : "var(--border)",
                  borderWidth: "3px",
                  borderStyle: "solid",
                }}
                title={cardRating ? `Card ${idx + 1}: ${getRatingLabel(cardRating.type)}` : `Card ${idx + 1}: Not reviewed`}
              >
                {idx + 1}
              </button>
            );
          })}
        </div>
        <div className="flex items-center justify-between text-sm mb-2" style={{ color: "var(--text-secondary)" }}>
          <span>
            Card {currentIndex + 1} of {flashcards.length}
          </span>
          <span>{totalReviewed > 0 && `${correctCount}/${totalReviewed} correct`}</span>
        </div>
        <div className="w-full rounded-full h-2" style={{ backgroundColor: "var(--border)" }}>
          <div className="h-2 rounded-full transition-all duration-300" style={{ width: `${progress}%`, backgroundColor: "var(--primary)" }} />
        </div>
      </div>

      {/* Flashcard */}
      <div className="mb-6">
        <Flashcard front={currentCard.front} back={currentCard.back} showAnswer={showAnswer} />
      </div>

      {/* Rating Buttons */}
      {!allReviewed && (
        <div className="rounded-lg shadow p-6 mb-4" style={{ backgroundColor: "var(--surface)" }}>
          <p className="text-sm mb-3 text-center" style={{ color: "var(--text-secondary)" }}>
            How well did you know this?
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <button
              onClick={() => handleRating(0, "wrong")}
              className="px-4 py-3 bg-red-100 text-red-700 rounded-md hover:bg-red-200 transition-colors duration-300 font-medium text-sm cursor-pointer"
            >
              Wrong
            </button>
            <button
              onClick={() => handleRating(2, "hard")}
              className="px-4 py-3 bg-yellow-100 text-yellow-700 rounded-md hover:bg-yellow-200 transition-colors duration-300 font-medium text-sm cursor-pointer"
            >
              Hard
            </button>
            <button
              onClick={() => handleRating(3, "good")}
              className="px-4 py-3 bg-green-100 text-green-700 rounded-md hover:bg-green-200 transition-colors duration-300 font-medium text-sm cursor-pointer"
            >
              Good
            </button>
            <button
              onClick={() => handleRating(5, "easy")}
              className="px-4 py-3 bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200 transition-colors duration-300 font-medium text-sm cursor-pointer"
            >
              Easy
            </button>
          </div>
        </div>
      )}

      {/* Navigation */}
      <div className="flex items-center justify-between">
        <button
          onClick={handlePrevious}
          disabled={currentIndex === 0}
          className="flex items-center gap-2 px-4 py-2 rounded-md cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-300 border"
          style={{
            backgroundColor: "var(--surface)",
            borderColor: "var(--border)",
            color: "var(--text-primary)",
          }}
        >
          <ChevronLeft size={18} />
          Previous
        </button>

        {allReviewed ? (
          <button
            onClick={handleFinish}
            className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors duration-300 font-medium cursor-pointer"
          >
            Finish Session
          </button>
        ) : (
          <button
            onClick={handleNext}
            disabled={isLastCard}
            className="flex items-center gap-2 px-4 py-2 rounded-md cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-300"
            style={{ backgroundColor: "var(--secondary)", color: "white" }}
          >
            Next
            <ChevronRight size={18} />
          </button>
        )}
      </div>

      {/* Session Summary (shown when all reviewed) */}
      {allReviewed && (
        <div className="mt-6 bg-green-50 border border-green-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-green-900 mb-2">Session Complete!</h3>
          <div className="text-green-800">
            <p className="mb-1">
              You reviewed <span className="font-semibold">{flashcards.length}</span> cards
            </p>
            <p className="mb-1">
              Correct answers: <span className="font-semibold">{correctCount}</span> ({Math.round((correctCount / totalReviewed) * 100)}%)
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

