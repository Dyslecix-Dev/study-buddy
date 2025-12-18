"use client";

import Link from "next/link";
import { Folder as FolderIcon, Trash2, Edit2, Play } from "lucide-react";

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

interface DeckListProps {
  decks: Deck[];
  onEdit: (deck: Deck) => void;
  onDelete: (id: string) => Promise<void>;
}

const colorClasses = {
  blue: "bg-blue-100 border-blue-300",
  green: "bg-green-100 border-green-300",
  purple: "bg-purple-100 border-purple-300",
  yellow: "bg-yellow-100 border-yellow-300",
  red: "bg-red-100 border-red-300",
  pink: "bg-pink-100 border-pink-300",
};

export default function DeckList({ decks, onEdit, onDelete }: DeckListProps) {
  if (decks.length === 0) {
    return (
      <div className="text-center py-12 rounded-lg shadow" style={{ backgroundColor: "var(--surface-secondary)", borderColor: "var(--border)" }}>
        <FolderIcon className="mx-auto h-12 w-12 text-gray-400 mb-4" />
        <p className="text-gray-500">No decks yet. Create one to organize your flashcards!</p>
      </div>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {decks.map((deck) => (
        <div
          key={deck.id}
          className={`rounded-lg border-2 p-6 hover:shadow-lg transition-shadow duration-300 ${
            deck.color && deck.color in colorClasses ? colorClasses[deck.color as keyof typeof colorClasses] : "bg-white border-gray-200"
          }`}
        >
          <div className="flex items-start justify-between mb-3">
            <div className="flex-1 min-w-0">
              <h3 className="text-lg font-semibold text-gray-900 truncate">{deck.name}</h3>
              {deck.description && <p className="text-sm text-gray-600 mt-1 line-clamp-2">{deck.description}</p>}
            </div>
            <div className="flex items-center gap-2 ml-2">
              <button onClick={() => onEdit(deck)} className="text-gray-400 hover:text-blue-600 transition-colors duration-300 cursor-pointer" title="Edit deck">
                <Edit2 size={16} />
              </button>
              <button onClick={() => onDelete(deck.id)} className="text-gray-400 hover:text-red-600 transition-colors duration-300 cursor-pointer" title="Delete deck">
                <Trash2 size={16} />
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-300">
            <div className="text-sm text-gray-600">
              <span className="font-medium">{deck._count.Flashcard}</span> cards
            </div>
            <div className="flex gap-2">
              <Link
                href={`/flashcards/${deck.id}`}
                className="px-3 py-1.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors duration-300"
              >
                View
              </Link>
              {deck._count.Flashcard > 0 && (
                <Link
                  href={`/flashcards/${deck.id}/study`}
                  className="px-3 py-1.5 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 transition-colors duration-300 flex items-center gap-1"
                >
                  <Play size={14} />
                  Study
                </Link>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

