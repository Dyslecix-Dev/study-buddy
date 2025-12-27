"use client";

import { useState, useEffect } from "react";
import { X, Sparkles, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface GenerateFlashcardsModalProps {
  isOpen: boolean;
  onClose: () => void;
  noteId: string;
  noteTitle: string;
  onSuccess?: (deckId: string) => void;
}

interface Deck {
  id: string;
  name: string;
  color?: string | null;
}

export default function GenerateFlashcardsModal({
  isOpen,
  onClose,
  noteId,
  noteTitle,
  onSuccess,
}: GenerateFlashcardsModalProps) {
  const [count, setCount] = useState(10);
  const [deckOption, setDeckOption] = useState<"new" | "existing">("new");
  const [newDeckName, setNewDeckName] = useState(`${noteTitle} - Flashcards`);
  const [selectedDeckId, setSelectedDeckId] = useState("");
  const [decks, setDecks] = useState<Deck[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingDecks, setLoadingDecks] = useState(false);

  // Fetch existing decks when modal opens
  useEffect(() => {
    if (isOpen) {
      fetchDecks();
    }
  }, [isOpen]);

  const fetchDecks = async () => {
    setLoadingDecks(true);
    try {
      const response = await fetch("/api/decks");
      if (!response.ok) throw new Error("Failed to fetch decks");
      const data = await response.json();
      setDecks(data.decks || []);
    } catch (error: any) {
      console.error("Error fetching decks:", error);
      toast.error("Failed to load decks");
    } finally {
      setLoadingDecks(false);
    }
  };

  const handleGenerate = async () => {
    // Validation
    if (deckOption === "new" && !newDeckName.trim()) {
      toast.error("Please enter a deck name");
      return;
    }

    if (deckOption === "existing" && !selectedDeckId) {
      toast.error("Please select a deck");
      return;
    }

    if (count < 1 || count > 50) {
      toast.error("Please enter a number between 1 and 50");
      return;
    }

    setLoading(true);

    try {
      const requestBody: any = { count };

      if (deckOption === "new") {
        requestBody.deckName = newDeckName.trim();
      } else {
        requestBody.deckId = selectedDeckId;
      }

      const response = await fetch(`/api/notes/${noteId}/generate-flashcards`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestBody),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to generate flashcards");
      }

      toast.success(`Successfully generated ${data.count} flashcards!`);

      if (onSuccess) {
        onSuccess(data.deck.id);
      }

      onClose();
    } catch (error: any) {
      console.error("Error generating flashcards:", error);
      toast.error(error.message || "Failed to generate flashcards");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />

      {/* Modal */}
      <div
        className="relative w-full max-w-md mx-4 rounded-lg shadow-xl p-6"
        style={{ backgroundColor: "var(--card-bg)" }}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-2">
            <Sparkles className="w-6 h-6" style={{ color: "var(--primary)" }} />
            <h2 className="text-xl font-semibold" style={{ color: "var(--text-primary)" }}>
              Generate Flashcards with AI
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            disabled={loading}
          >
            <X className="w-5 h-5" style={{ color: "var(--text-secondary)" }} />
          </button>
        </div>

        {/* Form */}
        <div className="space-y-4">
          {/* Note info */}
          <div className="p-3 rounded-md" style={{ backgroundColor: "var(--background)" }}>
            <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
              Generating flashcards from:
            </p>
            <p className="font-medium" style={{ color: "var(--text-primary)" }}>
              {noteTitle}
            </p>
          </div>

          {/* Number of flashcards */}
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: "var(--text-secondary)" }}>
              Number of flashcards
            </label>
            <input
              type="number"
              min="1"
              max="50"
              value={count}
              onChange={(e) => setCount(parseInt(e.target.value) || 10)}
              className="w-full px-3 py-2 rounded-md border focus:outline-none focus:ring-2"
              style={{
                backgroundColor: "var(--background)",
                borderColor: "var(--border)",
                color: "var(--text-primary)",
              }}
              disabled={loading}
            />
            <p className="text-xs mt-1" style={{ color: "var(--text-muted)" }}>
              Between 1 and 50 flashcards
            </p>
          </div>

          {/* Deck selection */}
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: "var(--text-secondary)" }}>
              Target deck
            </label>

            <div className="space-y-3">
              {/* New deck option */}
              <label className="flex items-start space-x-3 cursor-pointer">
                <input
                  type="radio"
                  name="deck-option"
                  checked={deckOption === "new"}
                  onChange={() => setDeckOption("new")}
                  className="mt-1"
                  disabled={loading}
                  style={{ accentColor: "var(--primary)" }}
                />
                <div className="flex-1">
                  <p className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>
                    Create new deck
                  </p>
                  {deckOption === "new" && (
                    <input
                      type="text"
                      value={newDeckName}
                      onChange={(e) => setNewDeckName(e.target.value)}
                      placeholder="Enter deck name..."
                      className="w-full mt-2 px-3 py-2 rounded-md border focus:outline-none focus:ring-2"
                      style={{
                        backgroundColor: "var(--background)",
                        borderColor: "var(--border)",
                        color: "var(--text-primary)",
                      }}
                      disabled={loading}
                    />
                  )}
                </div>
              </label>

              {/* Existing deck option */}
              <label className="flex items-start space-x-3 cursor-pointer">
                <input
                  type="radio"
                  name="deck-option"
                  checked={deckOption === "existing"}
                  onChange={() => setDeckOption("existing")}
                  className="mt-1"
                  disabled={loading}
                  style={{ accentColor: "var(--primary)" }}
                />
                <div className="flex-1">
                  <p className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>
                    Add to existing deck
                  </p>
                  {deckOption === "existing" && (
                    <div className="mt-2">
                      {loadingDecks ? (
                        <p className="text-sm" style={{ color: "var(--text-muted)" }}>
                          Loading decks...
                        </p>
                      ) : decks.length === 0 ? (
                        <p className="text-sm" style={{ color: "var(--text-muted)" }}>
                          No decks found. Create a new deck instead.
                        </p>
                      ) : (
                        <select
                          value={selectedDeckId}
                          onChange={(e) => setSelectedDeckId(e.target.value)}
                          className="w-full px-3 py-2 rounded-md border focus:outline-none focus:ring-2"
                          style={{
                            backgroundColor: "var(--background)",
                            borderColor: "var(--border)",
                            color: "var(--text-primary)",
                          }}
                          disabled={loading}
                        >
                          <option value="">Select a deck...</option>
                          {decks.map((deck) => (
                            <option key={deck.id} value={deck.id}>
                              {deck.name}
                            </option>
                          ))}
                        </select>
                      )}
                    </div>
                  )}
                </div>
              </label>
            </div>
          </div>

          {/* Warning */}
          <div className="p-3 rounded-md bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
            <p className="text-xs text-blue-800 dark:text-blue-300">
              AI-generated flashcards will be created based on the content of your note. You can edit them
              afterward if needed.
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="mt-6 flex justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-md text-sm font-medium transition-colors"
            style={{ color: "var(--text-secondary)" }}
            disabled={loading}
          >
            Cancel
          </button>
          <button
            onClick={handleGenerate}
            disabled={loading}
            className="px-4 py-2 rounded-md text-sm font-medium text-white transition-colors flex items-center space-x-2"
            style={{ backgroundColor: "var(--primary)" }}
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Generating...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>Generate Flashcards</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
