"use client";

import { useState, useEffect } from "react";
import { X, Sparkles, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface GenerateExamModalProps {
  isOpen: boolean;
  onClose: () => void;
  noteId: string;
  noteTitle: string;
  onSuccess?: (examId: string) => void;
}

interface Exam {
  id: string;
  name: string;
  color?: string | null;
}

export default function GenerateExamModal({
  isOpen,
  onClose,
  noteId,
  noteTitle,
  onSuccess,
}: GenerateExamModalProps) {
  const [questionCount, setQuestionCount] = useState(10);
  const [examOption, setExamOption] = useState<"new" | "existing">("new");
  const [newExamName, setNewExamName] = useState(`${noteTitle} - Exam`);
  const [selectedExamId, setSelectedExamId] = useState("");
  const [exams, setExams] = useState<Exam[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingExams, setLoadingExams] = useState(false);
  const [selectedQuestionTypes, setSelectedQuestionTypes] = useState({
    multiple_choice: true,
    select_all: true,
    true_false: true,
  });

  // Fetch existing exams when modal opens
  useEffect(() => {
    if (isOpen) {
      fetchExams();
    }
  }, [isOpen]);

  const fetchExams = async () => {
    setLoadingExams(true);
    try {
      const response = await fetch("/api/exams");
      if (!response.ok) throw new Error("Failed to fetch exams");
      const data = await response.json();
      setExams(data.exams || []);
    } catch (error: any) {
      console.error("Error fetching exams:", error);
      toast.error("Failed to load exams");
    } finally {
      setLoadingExams(false);
    }
  };

  const handleGenerate = async () => {
    // Validation
    if (examOption === "new" && !newExamName.trim()) {
      toast.error("Please enter an exam name");
      return;
    }

    if (examOption === "existing" && !selectedExamId) {
      toast.error("Please select an exam");
      return;
    }

    if (questionCount < 1 || questionCount > 50) {
      toast.error("Please enter a number between 1 and 50");
      return;
    }

    // Get selected question types
    const questionTypes = Object.entries(selectedQuestionTypes)
      .filter(([_, selected]) => selected)
      .map(([type, _]) => type);

    if (questionTypes.length === 0) {
      toast.error("Please select at least one question type");
      return;
    }

    setLoading(true);

    try {
      const requestBody: any = {
        questionCount,
        questionTypes,
      };

      if (examOption === "new") {
        requestBody.examName = newExamName.trim();
      } else {
        requestBody.examId = selectedExamId;
      }

      const response = await fetch(`/api/notes/${noteId}/generate-exam`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestBody),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to generate exam questions");
      }

      toast.success(`Successfully generated ${data.count} questions!`);

      if (onSuccess) {
        onSuccess(data.exam.id);
      }

      onClose();
    } catch (error: any) {
      console.error("Error generating exam:", error);
      toast.error(error.message || "Failed to generate exam questions");
    } finally {
      setLoading(false);
    }
  };

  const toggleQuestionType = (type: keyof typeof selectedQuestionTypes) => {
    setSelectedQuestionTypes((prev) => ({
      ...prev,
      [type]: !prev[type],
    }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />

      {/* Modal */}
      <div
        className="relative w-full max-w-md mx-4 rounded-lg shadow-xl p-6 max-h-[90vh] overflow-y-auto"
        style={{ backgroundColor: "var(--card-bg)" }}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-2">
            <Sparkles className="w-6 h-6" style={{ color: "var(--primary)" }} />
            <h2 className="text-xl font-semibold" style={{ color: "var(--text-primary)" }}>
              Generate Exam with AI
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
              Generating exam from:
            </p>
            <p className="font-medium" style={{ color: "var(--text-primary)" }}>
              {noteTitle}
            </p>
          </div>

          {/* Number of questions */}
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: "var(--text-secondary)" }}>
              Number of questions
            </label>
            <input
              type="number"
              min="1"
              max="50"
              value={questionCount}
              onChange={(e) => setQuestionCount(parseInt(e.target.value) || 10)}
              className="w-full px-3 py-2 rounded-md border focus:outline-none focus:ring-2"
              style={{
                backgroundColor: "var(--background)",
                borderColor: "var(--border)",
                color: "var(--text-primary)",
              }}
              disabled={loading}
            />
            <p className="text-xs mt-1" style={{ color: "var(--text-muted)" }}>
              Between 1 and 50 questions
            </p>
          </div>

          {/* Question types */}
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: "var(--text-secondary)" }}>
              Question types
            </label>
            <div className="space-y-2">
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={selectedQuestionTypes.multiple_choice}
                  onChange={() => toggleQuestionType("multiple_choice")}
                  disabled={loading}
                  style={{ accentColor: "var(--primary)" }}
                />
                <span className="text-sm" style={{ color: "var(--text-primary)" }}>
                  Multiple Choice (4 options, 1 correct)
                </span>
              </label>
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={selectedQuestionTypes.select_all}
                  onChange={() => toggleQuestionType("select_all")}
                  disabled={loading}
                  style={{ accentColor: "var(--primary)" }}
                />
                <span className="text-sm" style={{ color: "var(--text-primary)" }}>
                  Select All (Multiple correct answers)
                </span>
              </label>
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={selectedQuestionTypes.true_false}
                  onChange={() => toggleQuestionType("true_false")}
                  disabled={loading}
                  style={{ accentColor: "var(--primary)" }}
                />
                <span className="text-sm" style={{ color: "var(--text-primary)" }}>
                  True/False
                </span>
              </label>
            </div>
          </div>

          {/* Exam selection */}
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: "var(--text-secondary)" }}>
              Target exam
            </label>

            <div className="space-y-3">
              {/* New exam option */}
              <label className="flex items-start space-x-3 cursor-pointer">
                <input
                  type="radio"
                  name="exam-option"
                  checked={examOption === "new"}
                  onChange={() => setExamOption("new")}
                  className="mt-1"
                  disabled={loading}
                  style={{ accentColor: "var(--primary)" }}
                />
                <div className="flex-1">
                  <p className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>
                    Create new exam
                  </p>
                  {examOption === "new" && (
                    <input
                      type="text"
                      value={newExamName}
                      onChange={(e) => setNewExamName(e.target.value)}
                      placeholder="Enter exam name..."
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

              {/* Existing exam option */}
              <label className="flex items-start space-x-3 cursor-pointer">
                <input
                  type="radio"
                  name="exam-option"
                  checked={examOption === "existing"}
                  onChange={() => setExamOption("existing")}
                  className="mt-1"
                  disabled={loading}
                  style={{ accentColor: "var(--primary)" }}
                />
                <div className="flex-1">
                  <p className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>
                    Add to existing exam
                  </p>
                  {examOption === "existing" && (
                    <div className="mt-2">
                      {loadingExams ? (
                        <p className="text-sm" style={{ color: "var(--text-muted)" }}>
                          Loading exams...
                        </p>
                      ) : exams.length === 0 ? (
                        <p className="text-sm" style={{ color: "var(--text-muted)" }}>
                          No exams found. Create a new exam instead.
                        </p>
                      ) : (
                        <select
                          value={selectedExamId}
                          onChange={(e) => setSelectedExamId(e.target.value)}
                          className="w-full px-3 py-2 rounded-md border focus:outline-none focus:ring-2"
                          style={{
                            backgroundColor: "var(--background)",
                            borderColor: "var(--border)",
                            color: "var(--text-primary)",
                          }}
                          disabled={loading}
                        >
                          <option value="">Select an exam...</option>
                          {exams.map((exam) => (
                            <option key={exam.id} value={exam.id}>
                              {exam.name}
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
              AI will generate exam questions based on the content of your note. You can edit them
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
                <span>Generate Exam</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
