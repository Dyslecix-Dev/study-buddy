"use client";

import { useState } from "react";
import { X } from "lucide-react";
import { Tag } from "@/lib/tag-utils";
import TagInput from "@/components/tags/tag-input";

interface FlashcardFormProps {
  onSubmit: (data: { front: string; back: string; tagIds?: string[] }) => Promise<void>;
  onCancel: () => void;
  initialData?: { front: string; back: string; Tag?: Tag[] };
  isEdit?: boolean;
}

export default function FlashcardForm({ onSubmit, onCancel, initialData, isEdit = false }: FlashcardFormProps) {
  const [front, setFront] = useState(initialData?.front || "");
  const [back, setBack] = useState(initialData?.back || "");
  const [selectedTags, setSelectedTags] = useState<Tag[]>(initialData?.Tag || []);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ front?: string; back?: string }>({});

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate
    const newErrors: { front?: string; back?: string } = {};
    if (!front.trim()) newErrors.front = "Front is required";
    if (!back.trim()) newErrors.back = "Back is required";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setLoading(true);
    setErrors({});

    try {
      await onSubmit({
        front: front.trim(),
        back: back.trim(),
        tagIds: selectedTags.map((tag) => tag.id),
      });
      setFront("");
      setBack("");
      setSelectedTags([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="rounded-lg shadow p-6 mb-6" style={{ backgroundColor: "var(--surface)" }}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold" style={{ color: "var(--text-primary)" }}>
          {isEdit ? "Edit Flashcard" : "New Flashcard"}
        </h3>
        <button type="button" onClick={onCancel} className="text-gray-400 hover:text-gray-600 transition-colors duration-300 cursor-pointer">
          <X size={20} />
        </button>
      </div>

      <div className="space-y-4">
        <div>
          <label htmlFor="front" className="block text-sm font-medium mb-1" style={{ color: "var(--text-primary)" }}>
            Front (Question) *
          </label>
          <textarea
            id="front"
            value={front}
            onChange={(e) => setFront(e.target.value)}
            rows={3}
            placeholder="Enter the question or prompt..."
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            style={{ color: "var(--text-primary)" }}
          />
          {errors.front && <p className="mt-1 text-sm text-red-600">{errors.front}</p>}
        </div>

        <div>
          <label htmlFor="back" className="block text-sm font-medium mb-1" style={{ color: "var(--text-primary)" }}>
            Back (Answer) *
          </label>
          <textarea
            id="back"
            value={back}
            onChange={(e) => setBack(e.target.value)}
            rows={3}
            placeholder="Enter the answer..."
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            style={{ color: "var(--text-primary)" }}
          />
          {errors.back && <p className="mt-1 text-sm text-red-600">{errors.back}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium mb-1" style={{ color: "var(--text-primary)" }}>
            Tags
          </label>
          <TagInput selectedTags={selectedTags} onTagsChange={setSelectedTags} placeholder="Add tags to organize..." />
        </div>

        <div className="flex justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={onCancel}
            disabled={loading}
            className="px-4 py-2 rounded-md text-sm font-medium transition-colors duration-300 disabled:opacity-50 cursor-pointer"
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
            disabled={loading}
            className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700 transition-colors duration-300 disabled:opacity-50 cursor-pointer"
          >
            {loading ? "Saving..." : isEdit ? "Save Changes" : "Add Flashcard"}
          </button>
        </div>
      </div>
    </form>
  );
}
