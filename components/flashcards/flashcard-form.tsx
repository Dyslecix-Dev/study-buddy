"use client";

import { useState } from "react";
import { X } from "lucide-react";
import { Tag } from "@/lib/tag-utils";
import TagInput from "@/components/tags/tag-input";
import Editor from "@/components/editor/editor";
import Button from "@/components/ui/button";

interface FlashcardFormProps {
  onSubmit: (data: { front: string; back: string; tagIds?: string[] }) => Promise<void>;
  onCancel: () => void;
  initialData?: { front: string; back: string; Tag?: Tag[]; id?: string };
  isEdit?: boolean;
}

export default function FlashcardForm({ onSubmit, onCancel, initialData, isEdit = false }: FlashcardFormProps) {
  // Helper to convert string to TipTap JSON or keep JSON as-is
  const convertToEditorFormat = (content: string | any): string => {
    if (typeof content === 'string') {
      // Legacy string format - convert to HTML for TipTap
      return `<p>${content}</p>`;
    }
    // Already in JSON/HTML format from TipTap
    return content;
  };

  const [front, setFront] = useState(convertToEditorFormat(initialData?.front || ""));
  const [back, setBack] = useState(convertToEditorFormat(initialData?.back || ""));
  const [selectedTags, setSelectedTags] = useState<Tag[]>(initialData?.Tag || []);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ front?: string; back?: string }>({});

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate - check if content is empty (just <p></p> or similar)
    const newErrors: { front?: string; back?: string } = {};
    const frontText = front.replace(/<[^>]*>/g, '').trim();
    const backText = back.replace(/<[^>]*>/g, '').trim();

    if (!frontText) newErrors.front = "Front is required";
    if (!backText) newErrors.back = "Back is required";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setLoading(true);
    setErrors({});

    try {
      await onSubmit({
        front,
        back,
        tagIds: selectedTags.map((tag) => tag.id),
      });
      setFront("<p></p>");
      setBack("<p></p>");
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
          <label className="block text-sm font-medium mb-2" style={{ color: "var(--text-primary)" }}>
            Front (Question) *
          </label>
          <Editor
            content={front}
            onChange={setFront}
            placeholder="Enter the question or prompt..."
            entityType="flashcard"
            entityId={initialData?.id || 'new'}
            flashcardSide="front"
          />
          {errors.front && <p className="mt-1 text-sm text-red-600">{errors.front}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium mb-2" style={{ color: "var(--text-primary)" }}>
            Back (Answer) *
          </label>
          <Editor
            content={back}
            onChange={setBack}
            placeholder="Enter the answer..."
            entityType="flashcard"
            entityId={initialData?.id || 'new'}
            flashcardSide="back"
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
          <Button type="button" onClick={onCancel} disabled={loading} variant="secondary">
            Cancel
          </Button>
          <Button type="submit" isLoading={loading} variant="primary">
            {isEdit ? "Save Changes" : "Add Flashcard"}
          </Button>
        </div>
      </div>
    </form>
  );
}
