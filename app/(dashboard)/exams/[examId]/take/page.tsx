"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import DashboardNav from "@/components/dashboard-nav";
import { LoadingSpinner } from "@/components/loading-spinner";
import { ArrowLeft, CheckCircle, XCircle, Trophy } from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";

interface Question {
  id: string;
  question: string;
  questionType: string;
  options: Array<{ text: string; isCorrect: boolean }>;
  originalOptions?: Array<{ text: string; isCorrect: boolean }>;
}

interface Exam {
  id: string;
  name: string;
  description: string | null;
  Question: Question[];
}

interface UserAnswer {
  questionId: string;
  userAnswer: number | number[];
}

export default function TakeExamPage() {
  const router = useRouter();
  const params = useParams();
  const examId = params?.examId as string;

  const [exam, setExam] = useState<Exam | null>(null);
  const [loading, setLoading] = useState(true);
  const [sessionStarted, setSessionStarted] = useState(false);
  const [questionCount, setQuestionCount] = useState<number>(5);
  const [selectedQuestions, setSelectedQuestions] = useState<Question[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Map<string, number | number[]>>(new Map());
  const [submitted, setSubmitted] = useState(false);
  const [result, setResult] = useState<any>(null);

  useEffect(() => {
    checkAuth();
    fetchExam();
  }, [examId]);

  useEffect(() => {
    if (exam) {
      setQuestionCount(Math.min(5, exam.Question.length));
    }
  }, [exam]);

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
        if (data.Question.length === 0) {
          toast.error("This exam has no questions");
          router.push(`/exams/${examId}`);
          return;
        }
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

  const shuffleArray = <T,>(array: T[]): T[] => {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  };

  const handleStartSession = () => {
    if (!exam) return;

    // Shuffle and select questions
    const shuffledQuestions = shuffleArray(exam.Question).slice(0, questionCount);

    // Shuffle options for each question while keeping original options for grading
    const questionsWithShuffledOptions = shuffledQuestions.map((question) => {
      const shuffledOptions = shuffleArray(question.options);
      return {
        ...question,
        originalOptions: question.options, // Keep original order for grading
        options: shuffledOptions, // Shuffled order for display
      };
    });

    setSelectedQuestions(questionsWithShuffledOptions);
    setSessionStarted(true);
  };

  const currentQuestion = selectedQuestions[currentQuestionIndex];

  const handleAnswer = (optionIndex: number) => {
    if (!currentQuestion) return;

    const newAnswers = new Map(answers);

    if (currentQuestion.questionType === "select_all") {
      const current = (newAnswers.get(currentQuestion.id) as number[]) || [];
      if (current.includes(optionIndex)) {
        newAnswers.set(
          currentQuestion.id,
          current.filter((i) => i !== optionIndex)
        );
      } else {
        newAnswers.set(currentQuestion.id, [...current, optionIndex]);
      }
    } else {
      newAnswers.set(currentQuestion.id, optionIndex);
    }

    setAnswers(newAnswers);
  };

  const isOptionSelected = (optionIndex: number): boolean => {
    if (!currentQuestion) return false;

    const answer = answers.get(currentQuestion.id);
    if (currentQuestion.questionType === "select_all") {
      return Array.isArray(answer) && answer.includes(optionIndex);
    }
    return answer === optionIndex;
  };

  const handleNext = () => {
    if (currentQuestionIndex < selectedQuestions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  const handleSubmit = async () => {
    if (!exam) return;

    // Check if all questions are answered
    const unanswered = selectedQuestions.filter((q) => !answers.has(q.id));
    if (unanswered.length > 0) {
      if (!confirm(`You have ${unanswered.length} unanswered question(s). Submit anyway?`)) {
        return;
      }
    }

    try {
      // Map shuffled indices back to original indices for grading
      const answersArray: UserAnswer[] = selectedQuestions.map((q) => {
        const userAnswer = answers.get(q.id);

        if (userAnswer === undefined) {
          return {
            questionId: q.id,
            userAnswer: q.questionType === "select_all" ? [] : 0,
          };
        }

        // Map shuffled indices to original indices
        if (q.originalOptions && q.options) {
          if (q.questionType === "select_all" && Array.isArray(userAnswer)) {
            // For select_all, map each shuffled index to original index
            const originalIndices = userAnswer.map((shuffledIdx) => {
              const selectedOption = q.options[shuffledIdx];
              return q.originalOptions!.findIndex(
                (opt) => opt.text === selectedOption.text && opt.isCorrect === selectedOption.isCorrect
              );
            });
            return {
              questionId: q.id,
              userAnswer: originalIndices,
            };
          } else if (typeof userAnswer === "number") {
            // For multiple_choice and true_false, map shuffled index to original index
            const selectedOption = q.options[userAnswer];
            const originalIndex = q.originalOptions.findIndex(
              (opt) => opt.text === selectedOption.text && opt.isCorrect === selectedOption.isCorrect
            );
            return {
              questionId: q.id,
              userAnswer: originalIndex,
            };
          }
        }

        return {
          questionId: q.id,
          userAnswer,
        };
      });

      const response = await fetch(`/api/exams/${examId}/attempts`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ answers: answersArray }),
      });

      if (response.ok) {
        const data = await response.json();
        setResult(data);
        setSubmitted(true);
        toast.success(`Exam completed! Score: ${data.score}%`);
      } else {
        const error = await response.json();
        toast.error(error.error || "Failed to submit exam");
      }
    } catch (error) {
      console.error("Error submitting exam:", error);
      toast.error("Failed to submit exam");
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

  // Results View
  if (submitted && result) {
    const percentage = result.score;
    const passed = percentage >= 70;

    return (
      <div className="min-h-screen" style={{ backgroundColor: "var(--background)" }}>
        <DashboardNav />

        <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <div className="mb-6">
              {passed ? (
                <Trophy size={64} className="mx-auto" style={{ color: "#22c55e" }} />
              ) : (
                <XCircle size={64} className="mx-auto" style={{ color: "#ef4444" }} />
              )}
            </div>
            <h1 className="text-4xl font-bold mb-4" style={{ color: "var(--text-primary)" }}>
              {passed ? "Congratulations!" : "Keep Practicing!"}
            </h1>
            <p className="text-2xl mb-2" style={{ color: "var(--text-primary)" }}>
              Your Score: {percentage}%
            </p>
            <p className="text-lg" style={{ color: "var(--text-secondary)" }}>
              {result.correctAnswers} out of {result.totalQuestions} correct
            </p>
          </div>

          <div className="p-6 rounded-lg shadow mb-6" style={{ backgroundColor: "var(--surface)" }}>
            <h2 className="text-xl font-semibold mb-4" style={{ color: "var(--text-primary)" }}>
              Review Your Answers
            </h2>
            <div className="space-y-4">
              {result.QuestionResult.map((qr: any, index: number) => {
                const question = qr.Question;
                return (
                  <div
                    key={qr.id}
                    className="p-4 rounded-lg"
                    style={{
                      backgroundColor: qr.isCorrect ? "#22c55e15" : "#ef444415",
                      border: `1px solid ${qr.isCorrect ? "#22c55e" : "#ef4444"}`,
                    }}
                  >
                    <div className="flex items-start gap-2 mb-2">
                      {qr.isCorrect ? (
                        <CheckCircle size={20} style={{ color: "#22c55e" }} className="mt-1" />
                      ) : (
                        <XCircle size={20} style={{ color: "#ef4444" }} className="mt-1" />
                      )}
                      <div className="flex-1">
                        <p className="font-semibold mb-2" style={{ color: "var(--text-primary)" }}>
                          Question {index + 1}: {question.question}
                        </p>
                        <div className="space-y-1">
                          {question.options.map((opt: any, optIndex: number) => {
                            const isUserAnswer = Array.isArray(qr.userAnswer)
                              ? qr.userAnswer.includes(optIndex)
                              : qr.userAnswer === optIndex;
                            const isCorrect = opt.isCorrect;

                            return (
                              <div
                                key={optIndex}
                                className="flex items-center gap-2 text-sm"
                                style={{
                                  color: isCorrect
                                    ? "#22c55e"
                                    : isUserAnswer
                                    ? "#ef4444"
                                    : "var(--text-secondary)",
                                  fontWeight: isCorrect || isUserAnswer ? 600 : 400,
                                }}
                              >
                                {isCorrect && <CheckCircle size={16} />}
                                {isUserAnswer && !isCorrect && <XCircle size={16} />}
                                <span>{opt.text}</span>
                                {isUserAnswer && !isCorrect && <span className="text-xs">(Your answer)</span>}
                                {isCorrect && <span className="text-xs">(Correct)</span>}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="flex gap-4 justify-center">
            <button
              onClick={() => {
                setSubmitted(false);
                setResult(null);
                setAnswers(new Map());
                setCurrentQuestionIndex(0);
                setSessionStarted(false);
                setSelectedQuestions([]);
              }}
              className="px-6 py-3 rounded-md font-medium"
              style={{ backgroundColor: "var(--primary)", color: "#1a1a1a" }}
            >
              Retake Exam
            </button>
            <Link
              href={`/exams/${examId}`}
              className="px-6 py-3 rounded-md font-medium"
              style={{ backgroundColor: "var(--surface-secondary)", color: "var(--text-primary)" }}
            >
              Back to Exam
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Configuration View
  if (!sessionStarted && exam && exam.Question.length > 0) {
    const effectiveQuestionCount = Math.min(questionCount, exam.Question.length);

    return (
      <div className="min-h-screen" style={{ backgroundColor: "var(--background)" }}>
        <DashboardNav />

        <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
          <div className="mb-6">
            <Link
              href={`/exams/${examId}`}
              className="inline-flex items-center gap-2 mb-4 text-sm hover:opacity-70"
              style={{ color: "var(--text-secondary)" }}
            >
              <ArrowLeft size={16} />
              Back to Exam
            </Link>
          </div>

          <div className="rounded-lg shadow-lg p-8" style={{ backgroundColor: "var(--surface)" }}>
            <h2 className="text-2xl font-bold mb-4" style={{ color: "var(--text-primary)" }}>
              Configure Exam Session
            </h2>
            <p className="mb-6" style={{ color: "var(--text-secondary)" }}>
              Choose how many questions you want to answer in this exam session. Questions and their options will be randomized.
            </p>

            <div className="mb-6">
              <label className="block text-sm font-medium mb-2" style={{ color: "var(--text-primary)" }}>
                Number of questions: {effectiveQuestionCount}
              </label>
              <input
                type="range"
                min="1"
                max={exam.Question.length}
                value={effectiveQuestionCount}
                onChange={(e) => setQuestionCount(parseInt(e.target.value))}
                className="w-full h-2 rounded-lg appearance-none cursor-pointer"
                style={{
                  background: `linear-gradient(to right, var(--primary) 0%, var(--primary) ${((effectiveQuestionCount - 1) / (exam.Question.length - 1)) * 100}%, var(--border) ${((effectiveQuestionCount - 1) / (exam.Question.length - 1)) * 100}%, var(--border) 100%)`,
                }}
              />
              <div className="flex justify-between text-xs mt-2" style={{ color: "var(--text-muted)" }}>
                <span>1 question</span>
                <span>{exam.Question.length} questions (all)</span>
              </div>
            </div>

            <div className="rounded-lg p-4 mb-6" style={{ backgroundColor: "var(--surface-secondary)" }}>
              <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
                You will answer <span className="font-semibold" style={{ color: "var(--text-primary)" }}>{effectiveQuestionCount}</span> out of{" "}
                <span className="font-semibold" style={{ color: "var(--text-primary)" }}>{exam.Question.length}</span> available questions.
                Questions and answer options will be randomly shuffled.
              </p>
            </div>

            <button
              onClick={handleStartSession}
              className="w-full px-6 py-3 rounded-md font-medium transition-all duration-300 cursor-pointer"
              style={{ backgroundColor: "var(--primary)", color: "#1a1a1a" }}
              onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.9")}
              onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
            >
              Start Exam
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Exam Taking View
  return (
    <div className="min-h-screen" style={{ backgroundColor: "var(--background)" }}>
      <DashboardNav />

      <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-6">
          <Link
            href={`/exams/${examId}`}
            className="inline-flex items-center gap-2 mb-4 text-sm hover:opacity-70"
            style={{ color: "var(--text-secondary)" }}
          >
            <ArrowLeft size={16} />
            Exit Exam
          </Link>
          <h1 className="text-2xl font-bold" style={{ color: "var(--text-primary)" }}>
            {exam?.name}
          </h1>
        </div>

        {/* Progress */}
        <div className="mb-6">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm" style={{ color: "var(--text-secondary)" }}>
              Question {currentQuestionIndex + 1} of {selectedQuestions.length}
            </span>
            <span className="text-sm" style={{ color: "var(--text-secondary)" }}>
              {answers.size} answered
            </span>
          </div>
          <div className="w-full h-2 rounded-full" style={{ backgroundColor: "var(--surface-secondary)" }}>
            <div
              className="h-2 rounded-full transition-all"
              style={{
                backgroundColor: "var(--primary)",
                width: `${((currentQuestionIndex + 1) / selectedQuestions.length) * 100}%`,
              }}
            />
          </div>
        </div>

        {/* Question */}
        {currentQuestion && (
          <div className="p-8 rounded-lg shadow mb-6" style={{ backgroundColor: "var(--surface)" }}>
            <div className="mb-6">
              <span className="text-sm px-3 py-1 rounded" style={{ backgroundColor: "var(--surface-secondary)", color: "var(--text-secondary)" }}>
                {currentQuestion.questionType === "multiple_choice" && "Multiple Choice"}
                {currentQuestion.questionType === "select_all" && "Select All That Apply"}
                {currentQuestion.questionType === "true_false" && "True or False"}
              </span>
            </div>

            <h2 className="text-2xl font-semibold mb-6" style={{ color: "var(--text-primary)" }}>
              {currentQuestion.question}
            </h2>

            <div className="space-y-3">
              {currentQuestion.options.map((option, index) => (
                <button
                  key={index}
                  onClick={() => handleAnswer(index)}
                  className="w-full text-left p-4 rounded-lg border-2 transition-all"
                  style={{
                    borderColor: isOptionSelected(index) ? "var(--primary)" : "var(--border)",
                    backgroundColor: isOptionSelected(index) ? "var(--primary)15" : "var(--surface-secondary)",
                    color: "var(--text-primary)",
                  }}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="w-5 h-5 rounded-full border-2 flex items-center justify-center"
                      style={{
                        borderColor: isOptionSelected(index) ? "var(--primary)" : "var(--border)",
                        backgroundColor: isOptionSelected(index) ? "var(--primary)" : "transparent",
                      }}
                    >
                      {isOptionSelected(index) && (
                        <CheckCircle size={14} style={{ color: "#1a1a1a" }} />
                      )}
                    </div>
                    <span>{option.text}</span>
                  </div>
                </button>
              ))}
            </div>

            {currentQuestion.questionType === "select_all" && (
              <p className="text-sm mt-4" style={{ color: "var(--text-secondary)" }}>
                Select all correct answers
              </p>
            )}
          </div>
        )}

        {/* Navigation */}
        <div className="flex justify-between items-center">
          <button
            onClick={handlePrevious}
            disabled={currentQuestionIndex === 0}
            className="px-6 py-2 rounded-md font-medium disabled:opacity-50"
            style={{ backgroundColor: "var(--surface-secondary)", color: "var(--text-primary)" }}
          >
            Previous
          </button>

          {currentQuestionIndex === selectedQuestions.length - 1 ? (
            <button
              onClick={handleSubmit}
              className="px-6 py-2 rounded-md font-medium"
              style={{ backgroundColor: "#22c55e", color: "#ffffff" }}
            >
              Submit Exam
            </button>
          ) : (
            <button
              onClick={handleNext}
              className="px-6 py-2 rounded-md font-medium"
              style={{ backgroundColor: "var(--primary)", color: "#1a1a1a" }}
            >
              Next
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
