import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { FileText, CheckSquare, Brain, BookOpen } from "lucide-react";
import DashboardNav from "@/components/dashboard-nav";
import { ProgressDashboard } from "@/components/dashboard/progress-dashboard";

export default async function DashboardPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Get or create user progress to track historical creation
  let userProgress = await prisma.userProgress.findUnique({
    where: { userId: user.id },
  });

  // If no user progress exists, create one
  if (!userProgress) {
    userProgress = await prisma.userProgress.create({
      data: { userId: user.id },
    });
  }

  // Check if user has any current items for activity detection
  const noteCount = await prisma.note.count({
    where: { userId: user.id },
  });

  const taskCount = await prisma.task.count({
    where: { userId: user.id },
  });

  const flashcardCount = await prisma.flashcard.count({
    where: {
      Deck: {
        userId: user.id,
      },
    },
  });

  const focusSessionCount = await prisma.focusSession.count({
    where: { userId: user.id },
  });

  const questionCount = await prisma.question.count({
    where: {
      Exam: {
        userId: user.id,
      },
    },
  });

  // Check if user has any activity (to determine if we should show the progress dashboard)
  const hasActivity = noteCount > 0 || taskCount > 0 || flashcardCount > 0 || focusSessionCount > 0 || questionCount > 0;

  return (
    <div className="min-h-screen" style={{ backgroundColor: "var(--background)" }}>
      <DashboardNav />

      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2" style={{ color: "var(--text-primary)" }}>
            Welcome back, {user.email?.split("@")[0]}!
          </h1>
          <p style={{ color: "var(--text-secondary)" }}>{hasActivity ? "Here's your progress overview" : "Here's what you can do today"}</p>
        </div>

        {/* Show Progress Dashboard if user has activity */}
        {hasActivity && (
          <div className="mb-8">
            <ProgressDashboard />
          </div>
        )}

        <div className="space-y-4">
          {userProgress.totalNotesCreated === 0 && (
            <div className="border rounded-lg p-6" style={{ backgroundColor: "var(--surface-secondary)", borderColor: "var(--border)" }}>
              <h2 className="text-lg font-semibold mb-2" style={{ color: "var(--text-primary)" }}>
                📝 Start Taking Notes
              </h2>
              <p className="mb-3" style={{ color: "var(--text-secondary)" }}>
                Capture your thoughts, ideas, and study materials in one organized place. Create your first note to begin building your knowledge base.
              </p>
              <Link href="/notes" className="inline-flex items-center px-4 py-2 text-sm font-medium rounded-md transition-all" style={{ backgroundColor: "var(--primary)", color: "#1a1a1a" }}>
                Create Your First Note
              </Link>
            </div>
          )}

          {userProgress.totalTasksCreated === 0 && (
            <div className="border rounded-lg p-6" style={{ backgroundColor: "var(--surface-secondary)", borderColor: "var(--border)" }}>
              <h2 className="text-lg font-semibold mb-2" style={{ color: "var(--text-primary)" }}>
                ✅ Stay Organized
              </h2>
              <p className="mb-3" style={{ color: "var(--text-secondary)" }}>
                Keep track of assignments, projects, and deadlines. Add your first task to start managing your workload effectively.
              </p>
              <Link href="/tasks" className="inline-flex items-center px-4 py-2 text-sm font-medium rounded-md transition-all" style={{ backgroundColor: "var(--secondary)", color: "#ffffff" }}>
                Create Your First Task
              </Link>
            </div>
          )}

          {userProgress.totalDecksCreated === 0 && (
            <div className="border rounded-lg p-6" style={{ backgroundColor: "var(--surface-secondary)", borderColor: "var(--border)" }}>
              <h2 className="text-lg font-semibold mb-2" style={{ color: "var(--text-primary)" }}>
                🎯 Master Your Studies
              </h2>
              <p className="mb-3" style={{ color: "var(--text-secondary)" }}>
                Use spaced repetition to memorize key concepts and facts. Create your first flashcard deck to boost your retention.
              </p>
              <Link href="/flashcards" className="inline-flex items-center px-4 py-2 text-sm font-medium rounded-md transition-all" style={{ backgroundColor: "var(--quaternary)", color: "#1a1a1a" }}>
                Create Your First Flashcard
              </Link>
            </div>
          )}

          {userProgress.totalQuestionsCreated === 0 && (
            <div className="border rounded-lg p-6" style={{ backgroundColor: "var(--surface-secondary)", borderColor: "var(--border)" }}>
              <h2 className="text-lg font-semibold mb-2" style={{ color: "var(--text-primary)" }}>
                📝 Test Your Knowledge
              </h2>
              <p className="mb-3" style={{ color: "var(--text-secondary)" }}>
                Create practice exams with multiple choice, select all, and true/false questions. Start building your first exam to test yourself.
              </p>
              <Link href="/exams" className="inline-flex items-center px-4 py-2 text-sm font-medium rounded-md transition-all" style={{ backgroundColor: "var(--primary)", color: "#1a1a1a" }}>
                Create Your First Exam Question
              </Link>
            </div>
          )}

          {userProgress.totalTagsUsed === 0 && (
            <div className="border rounded-lg p-6" style={{ backgroundColor: "var(--surface-secondary)", borderColor: "var(--border)" }}>
              <h2 className="text-lg font-semibold mb-2" style={{ color: "var(--text-primary)" }}>
                🏷️ Organize with Tags
              </h2>
              <p className="mb-3" style={{ color: "var(--text-secondary)" }}>
                Tags help you categorize and find your notes, tasks, flashcards, and exams. Create your first tag to start organizing your content.
              </p>
              <Link href="/tags" className="inline-flex items-center px-4 py-2 text-sm font-medium rounded-md transition-all" style={{ backgroundColor: "var(--secondary)", color: "#ffffff" }}>
                Create Your First Tag
              </Link>
            </div>
          )}

          {focusSessionCount === 0 && (
            <div className="border rounded-lg p-6" style={{ backgroundColor: "var(--surface-secondary)", borderColor: "var(--border)" }}>
              <h2 className="text-lg font-semibold mb-2" style={{ color: "var(--text-primary)" }}>
                ⏱️ Start a Study Session
              </h2>
              <p className="mb-3" style={{ color: "var(--text-secondary)" }}>
                Use the Pomodoro timer to maintain focus and track your study time. Start your first focus session to build productive habits.
              </p>
              <Link href="/focus" className="inline-flex items-center px-4 py-2 text-sm font-medium rounded-md transition-all" style={{ backgroundColor: "var(--quaternary)", color: "#1a1a1a" }}>
                Create Your First Study Session
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

