import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { FileText, CheckSquare, Brain, Calendar } from "lucide-react";
import DashboardNav from "@/components/dashboard-nav";

export default async function DashboardPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Check if user has any notes
  const noteCount = await prisma.note.count({
    where: { userId: user.id },
  });

  // Check if user has any tasks
  const taskCount = await prisma.task.count({
    where: { userId: user.id },
  });

  // Check if user has any flashcards
  const flashcardCount = await prisma.flashcard.count({
    where: {
      Deck: {
        userId: user.id,
      },
    },
  });

  return (
    <div className="min-h-screen" style={{ backgroundColor: "var(--background)" }}>
      <DashboardNav />

      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2" style={{ color: "var(--text-primary)" }}>
            Welcome back, {user.email?.split("@")[0]}!
          </h1>
          <p style={{ color: "var(--text-secondary)" }}>Here's what you can do today</p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
          <Link href="/notes" className="shadow rounded-lg p-6 hover:shadow-lg transition-all duration-300" style={{ backgroundColor: "var(--surface)" }}>
            <div className="flex items-center mb-4">
              <div className="p-3 rounded-lg" style={{ backgroundColor: "#7ADAA533" }}>
                <FileText style={{ color: "var(--primary)" }} size={24} />
              </div>
            </div>
            <h3 className="text-lg font-semibold mb-2" style={{ color: "var(--text-primary)" }}>
              Notes
            </h3>
            <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
              Create and organize your study notes with rich text formatting
            </p>
          </Link>

          <Link href="/tasks" className="shadow rounded-lg p-6 hover:shadow-lg transition-all duration-300" style={{ backgroundColor: "var(--surface)" }}>
            <div className="flex items-center mb-4">
              <div className="p-3 rounded-lg" style={{ backgroundColor: "#239BA733" }}>
                <CheckSquare style={{ color: "var(--secondary)" }} size={24} />
              </div>
            </div>
            <h3 className="text-lg font-semibold mb-2" style={{ color: "var(--text-primary)" }}>
              Tasks
            </h3>
            <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
              Manage your assignments and deadlines with priorities
            </p>
          </Link>

          <Link href="/flashcards" className="shadow rounded-lg p-6 hover:shadow-lg transition-all duration-300" style={{ backgroundColor: "var(--surface)" }}>
            <div className="flex items-center mb-4">
              <div className="p-3 rounded-lg" style={{ backgroundColor: "#E1AA3633" }}>
                <Brain style={{ color: "var(--quaternary)" }} size={24} />
              </div>
            </div>
            <h3 className="text-lg font-semibold mb-2" style={{ color: "var(--text-primary)" }}>
              Flashcards
            </h3>
            <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
              Study with flashcard decks and track your progress
            </p>
          </Link>

          <Link href="/calendar" className="shadow rounded-lg p-6 hover:shadow-lg transition-all duration-300" style={{ backgroundColor: "var(--surface)" }}>
            <div className="flex items-center mb-4">
              <div className="p-3 rounded-lg" style={{ backgroundColor: "#ECECBB55" }}>
                <Calendar style={{ color: "#9a9a44" }} size={24} />
              </div>
            </div>
            <h3 className="text-lg font-semibold mb-2" style={{ color: "var(--text-primary)" }}>
              Calendar
            </h3>
            <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
              View all your tasks and deadlines in calendar view
            </p>
          </Link>
        </div>

        <div className="space-y-4">
          {noteCount === 0 && (
            <div className="border rounded-lg p-6" style={{ backgroundColor: "var(--surface-secondary)", borderColor: "var(--border)" }}>
              <h2 className="text-lg font-semibold mb-2" style={{ color: "var(--text-primary)" }}>
                📝 Start Taking Notes
              </h2>
              <p className="mb-3" style={{ color: "var(--text-secondary)" }}>
                Capture your thoughts, ideas, and study materials in one organized place. Create your first note to begin building your knowledge base.
              </p>
              <Link href="/notes/new" className="inline-flex items-center px-4 py-2 text-sm font-medium rounded-md transition-all" style={{ backgroundColor: "var(--primary)", color: "#1a1a1a" }}>
                Create Your First Note
              </Link>
            </div>
          )}

          {taskCount === 0 && (
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

          {flashcardCount === 0 && (
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
        </div>
      </div>
    </div>
  );
}

