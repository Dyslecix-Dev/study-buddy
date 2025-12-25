"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import DashboardNav from "@/components/dashboard-nav";
import { LoadingSpinner } from "@/components/loading-spinner";
import { Plus, ArrowLeft, Play, Edit, Trash2, CheckCircle, XCircle, Clock } from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";

interface Question {
  id: string;
  question: string;
  questionType: string;
  options: Array<{ text: string; isCorrect: boolean }>;
  createdAt: Date;
  Tag: Array<{ id: string; name: string; color: string | null }>;
}

interface Exam {
  id: string;
  name: string;
  description: string | null;
  color: string | null;
  Question: Question[];
  _count: {
    Question: number;
  };
  createdAt: Date;
  updatedAt: Date;
}

export default function ExamDetailPage() {
  const router = useRouter();
  const params = useParams();
  const examId = params?.examId as string;

  const [exam, setExam] = useState<Exam | null>(null);
  const [loading, setLoading] = useState(true);
  const [showQuestionForm, setShowQuestionForm] = useState(false);
  const [editingQuestionId, setEditingQuestionId] = useState<string | null>(null);
  const [questionFormData, setQuestionFormData] = useState({
    question: "",
    questionType: "multiple_choice",
    options: [
      { text: "", isCorrect: false },
      { text: "", isCorrect: false },
    ],
  });

  useEffect(() => {
    checkAuth();
    fetchExam();
  }, [examId]);

  const checkAuth = async () => {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      router.push("/login");
    }
  };

  const fetchExam = async () => {
    try {
      const response = await fetch(`/api/exams/${examId}`);
      if (response.ok) {
        const data = await response.json();
        setExam(data);
      } else if (response.status === 404) {
        toast.error("Exam not found");
        router.push("/exams");
      }
    } catch (error) {
      console.error("Error fetching exam:", error);
      toast.error("Failed to load exam");
    } finally {
      setLoading(false);
    }
  };

  const handleAddOption = () => {
    if (questionFormData.options.length < 5) {
      setQuestionFormData({
        ...questionFormData,
        options: [...questionFormData.options, { text: "", isCorrect: false }],
      });
    }
  };

  const handleRemoveOption = (index: number) => {
    if (questionFormData.options.length > 2) {
      const newOptions = questionFormData.options.filter((_, i) => i !== index);
      setQuestionFormData({ ...questionFormData, options: newOptions });
    }
  };

  const handleOptionChange = (index: number, field: "text" | "isCorrect", value: string | boolean) => {
    const newOptions = [...questionFormData.options];
    if (field === "isCorrect" && (questionFormData.questionType === "multiple_choice" || questionFormData.questionType === "true_false")) {
      // For multiple choice and true/false, only one can be correct
      newOptions.forEach((opt, i) => {
        opt.isCorrect = i === index;
      });
    } else {
      newOptions[index] = { ...newOptions[index], [field]: value };
    }
    setQuestionFormData({ ...questionFormData, options: newOptions });
  };

  const handleQuestionTypeChange = (type: string) => {
    let options = questionFormData.options;

    if (type === "true_false") {
      options = [
        { text: "True", isCorrect: false },
        { text: "False", isCorrect: false },
      ];
    } else if (questionFormData.questionType === "true_false" && type !== "true_false") {
      options = [
        { text: "", isCorrect: false },
        { text: "", isCorrect: false },
      ];
    }

    setQuestionFormData({ ...questionFormData, questionType: type, options });
  };

  const handleStartEdit = (question: Question) => {
    setEditingQuestionId(question.id);
    setQuestionFormData({
      question: question.question,
      questionType: question.questionType,
      options: question.options,
    });
    setShowQuestionForm(false);
  };

  const handleCancelEdit = () => {
    setEditingQuestionId(null);
    setQuestionFormData({
      question: "",
      questionType: "multiple_choice",
      options: [
        { text: "", isCorrect: false },
        { text: "", isCorrect: false },
      ],
    });
  };

  const handleUpdateQuestion = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!questionFormData.question.trim()) {
      toast.error("Please enter a question");
      return;
    }

    const hasEmptyOptions = questionFormData.options.some((opt) => !opt.text.trim());
    if (hasEmptyOptions) {
      toast.error("All options must have text");
      return;
    }

    const hasCorrectAnswer = questionFormData.options.some((opt) => opt.isCorrect);
    if (!hasCorrectAnswer) {
      toast.error("Please mark at least one correct answer");
      return;
    }

    try {
      const response = await fetch(`/api/exams/${examId}/questions/${editingQuestionId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(questionFormData),
      });

      if (response.ok) {
        toast.success("Question updated successfully");
        handleCancelEdit();
        await fetchExam();
      } else {
        const error = await response.json();
        toast.error(error.error || "Failed to update question");
      }
    } catch (error) {
      console.error("Error updating question:", error);
      toast.error("Failed to update question");
    }
  };

  const handleCreateQuestion = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!questionFormData.question.trim()) {
      toast.error("Please enter a question");
      return;
    }

    const hasEmptyOptions = questionFormData.options.some((opt) => !opt.text.trim());
    if (hasEmptyOptions) {
      toast.error("All options must have text");
      return;
    }

    const hasCorrectAnswer = questionFormData.options.some((opt) => opt.isCorrect);
    if (!hasCorrectAnswer) {
      toast.error("Please mark at least one correct answer");
      return;
    }

    try {
      const response = await fetch(`/api/exams/${examId}/questions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(questionFormData),
      });

      if (response.ok) {
        toast.success("Question created successfully");
        setShowQuestionForm(false);
        setQuestionFormData({
          question: "",
          questionType: "multiple_choice",
          options: [
            { text: "", isCorrect: false },
            { text: "", isCorrect: false },
          ],
        });
        await fetchExam();
      } else {
        const error = await response.json();
        toast.error(error.error || "Failed to create question");
      }
    } catch (error) {
      console.error("Error creating question:", error);
      toast.error("Failed to create question");
    }
  };

  const handleDeleteQuestion = async (questionId: string) => {
    if (!confirm("Are you sure you want to delete this question?")) {
      return;
    }

    try {
      const response = await fetch(`/api/exams/${examId}/questions/${questionId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        toast.success("Question deleted successfully");
        await fetchExam();
      } else {
        toast.error("Failed to delete question");
      }
    } catch (error) {
      console.error("Error deleting question:", error);
      toast.error("Failed to delete question");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen" style={{ backgroundColor: "var(--background)" }}>
        <DashboardNav />
        <LoadingSpinner />
      </div>
    );
  }

  if (!exam) {
    return null;
  }

  const getQuestionTypeLabel = (type: string) => {
    switch (type) {
      case "multiple_choice":
        return "Multiple Choice";
      case "select_all":
        return "Select All";
      case "true_false":
        return "True/False";
      default:
        return type;
    }
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: "var(--background)" }}>
      <DashboardNav />

      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-6">
          <Link href="/exams" className="inline-flex items-center gap-2 mb-4 text-sm hover:opacity-70" style={{ color: "var(--text-secondary)" }}>
            <ArrowLeft size={16} />
            Back to Exams
          </Link>
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold mb-2" style={{ color: "var(--text-primary)" }}>
                {exam.name}
              </h1>
              {exam.description && (
                <p className="text-lg mb-2" style={{ color: "var(--text-secondary)" }}>
                  {exam.description}
                </p>
              )}
              <p style={{ color: "var(--text-secondary)" }}>
                {exam.Question.length} question{exam.Question.length !== 1 ? "s" : ""}
              </p>
            </div>
            <div className="flex gap-2">
              {exam.Question.length > 0 && (
                <Link href={`/exams/${examId}/take`} className="flex items-center gap-2 px-4 py-2 rounded-md transition-colors" style={{ backgroundColor: "#9C27B0", color: "#ffffff" }}>
                  <Play size={20} />
                  Take Exam
                </Link>
              )}
              <button
                onClick={() => setShowQuestionForm(!showQuestionForm)}
                className="flex items-center gap-2 px-4 py-2 rounded-md transition-colors cursor-pointer"
                style={{
                  backgroundColor: showQuestionForm ? "var(--surface-secondary)" : "var(--primary)",
                  color: showQuestionForm ? "var(--text-primary)" : "#1a1a1a",
                }}
              >
                <Plus size={20} />
                {showQuestionForm ? "Cancel" : "Add Question"}
              </button>
            </div>
          </div>
        </div>

        {/* Question Form */}
        {(showQuestionForm || editingQuestionId) && (
          <div className="mb-6 p-6 rounded-lg shadow" style={{ backgroundColor: "var(--surface)" }}>
            <h2 className="text-xl font-semibold mb-4" style={{ color: "var(--text-primary)" }}>
              {editingQuestionId ? "Edit Question" : "Create New Question"}
            </h2>
            <form onSubmit={editingQuestionId ? handleUpdateQuestion : handleCreateQuestion} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: "var(--text-primary)" }}>
                  Question Type
                </label>
                <select
                  value={questionFormData.questionType}
                  onChange={(e) => handleQuestionTypeChange(e.target.value)}
                  className="w-full px-4 py-2 rounded-md border cursor-pointer"
                  style={{
                    backgroundColor: "var(--surface-secondary)",
                    borderColor: "var(--border)",
                    color: "var(--text-primary)",
                  }}
                >
                  <option value="multiple_choice">Multiple Choice (one correct)</option>
                  <option value="select_all">Select All (multiple correct)</option>
                  <option value="true_false">True/False</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: "var(--text-primary)" }}>
                  Question *
                </label>
                <textarea
                  value={questionFormData.question}
                  onChange={(e) => setQuestionFormData({ ...questionFormData, question: e.target.value })}
                  className="w-full px-4 py-2 rounded-md border"
                  style={{
                    backgroundColor: "var(--surface-secondary)",
                    borderColor: "var(--border)",
                    color: "var(--text-primary)",
                  }}
                  rows={3}
                  placeholder="Enter your question"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-medium" style={{ color: "var(--text-primary)" }}>
                    Options *
                  </label>
                  {questionFormData.questionType !== "true_false" && questionFormData.options.length < 5 && (
                    <button type="button" onClick={handleAddOption} className="text-sm px-3 py-1 rounded cursor-pointer" style={{ backgroundColor: "var(--primary)", color: "#1a1a1a" }}>
                      Add Option
                    </button>
                  )}
                </div>
                <div className="space-y-2">
                  {questionFormData.options.map((option, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <input
                        type={questionFormData.questionType === "multiple_choice" || questionFormData.questionType === "true_false" ? "radio" : "checkbox"}
                        checked={option.isCorrect}
                        onChange={(e) => handleOptionChange(index, "isCorrect", e.target.checked)}
                        className="w-4 h-4 cursor-pointer"
                      />
                      <input
                        type="text"
                        value={option.text}
                        onChange={(e) => handleOptionChange(index, "text", e.target.value)}
                        className="flex-1 px-4 py-2 rounded-md border"
                        style={{
                          backgroundColor: "var(--surface-secondary)",
                          borderColor: "var(--border)",
                          color: "var(--text-primary)",
                        }}
                        placeholder={`Option ${index + 1}`}
                        disabled={questionFormData.questionType === "true_false"}
                      />
                      {questionFormData.questionType !== "true_false" && questionFormData.options.length > 2 && (
                        <button type="button" onClick={() => handleRemoveOption(index)} className="p-2 hover:opacity-70 cursor-pointer" style={{ color: "#ef4444" }}>
                          <Trash2 size={18} />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
                <p className="text-xs mt-2" style={{ color: "var(--text-secondary)" }}>
                  {questionFormData.questionType === "multiple_choice" && "Select one correct answer"}
                  {questionFormData.questionType === "select_all" && "Select all correct answers"}
                  {questionFormData.questionType === "true_false" && "Select the correct answer"}
                </p>
              </div>

              <div className="flex gap-2">
                <button type="submit" className="px-6 py-2 rounded-md font-medium cursor-pointer" style={{ backgroundColor: "var(--primary)", color: "#1a1a1a" }}>
                  {editingQuestionId ? "Update Question" : "Create Question"}
                </button>
                {editingQuestionId && (
                  <button type="button" onClick={handleCancelEdit} className="px-6 py-2 rounded-md font-medium cursor-pointer" style={{ backgroundColor: "var(--surface-secondary)", color: "var(--text-primary)" }}>
                    Cancel
                  </button>
                )}
              </div>
            </form>
          </div>
        )}

        {/* Questions List */}
        {exam.Question.length === 0 ? (
          <div className="text-center py-12 rounded-lg" style={{ backgroundColor: "var(--surface)" }}>
            <p className="text-lg mb-2" style={{ color: "var(--text-primary)" }}>
              No questions yet
            </p>
            <p style={{ color: "var(--text-secondary)" }}>Add your first question to get started</p>
          </div>
        ) : (
          <div className="space-y-4">
            {exam.Question.map((question, index) => (
              <div key={question.id} className="p-6 rounded-lg shadow" style={{ backgroundColor: "var(--surface)" }}>
                {editingQuestionId === question.id ? (
                  <div className="text-center py-4" style={{ color: "var(--text-secondary)" }}>
                    Editing this question above...
                  </div>
                ) : (
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-sm font-medium px-2 py-1 rounded" style={{ backgroundColor: "var(--surface-secondary)", color: "var(--text-secondary)" }}>
                          {getQuestionTypeLabel(question.questionType)}
                        </span>
                        <span className="text-sm" style={{ color: "var(--text-secondary)" }}>
                          Question {index + 1}
                        </span>
                      </div>
                      <h3 className="text-lg font-semibold mb-3" style={{ color: "var(--text-primary)" }}>
                        {question.question}
                      </h3>
                      <div className="space-y-2">
                        {question.options.map((option, optIndex) => (
                          <div key={optIndex} className="flex items-center gap-2">
                            {option.isCorrect ? <CheckCircle size={18} style={{ color: "#22c55e" }} /> : <XCircle size={18} style={{ color: "var(--text-muted)" }} />}
                            <span style={{ color: option.isCorrect ? "var(--text-primary)" : "var(--text-secondary)" }}>{option.text}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => handleStartEdit(question)} className="p-2 rounded hover:bg-opacity-10 cursor-pointer" style={{ color: "var(--text-secondary)" }}>
                        <Edit size={18} />
                      </button>
                      <button onClick={() => handleDeleteQuestion(question.id)} className="p-2 rounded hover:bg-opacity-10 cursor-pointer" style={{ color: "#ef4444" }}>
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

