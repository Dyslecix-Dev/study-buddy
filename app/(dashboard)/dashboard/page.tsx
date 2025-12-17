import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import LogoutButton from "@/components/logout-button";
import { FileText, CheckSquare, Brain, Calendar } from "lucide-react";
import SearchTrigger from "@/components/search/search-trigger";

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
      deck: {
        userId: user.id,
      },
    },
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <h2 className="text-xl font-semibold text-gray-900">Study Buddy</h2>
            <div className="flex items-center gap-4">
              <SearchTrigger />
              <LogoutButton />
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Welcome back, {user.email?.split("@")[0]}!</h1>
          <p className="text-gray-600">Here's what you can do today</p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
          <Link href="/notes" className="bg-white shadow rounded-lg p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-center mb-4">
              <div className="p-3 bg-blue-100 rounded-lg">
                <FileText className="text-blue-600" size={24} />
              </div>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Notes</h3>
            <p className="text-sm text-gray-600">Create and organize your study notes with rich text formatting</p>
          </Link>

          <Link href="/tasks" className="bg-white shadow rounded-lg p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-center mb-4">
              <div className="p-3 bg-green-100 rounded-lg">
                <CheckSquare className="text-green-600" size={24} />
              </div>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Tasks</h3>
            <p className="text-sm text-gray-600">Manage your assignments and deadlines with priorities</p>
          </Link>

          <Link href="/flashcards" className="bg-white shadow rounded-lg p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-center mb-4">
              <div className="p-3 bg-purple-100 rounded-lg">
                <Brain className="text-purple-600" size={24} />
              </div>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Flashcards</h3>
            <p className="text-sm text-gray-600">Study with flashcard decks and track your progress</p>
          </Link>

          <Link href="/calendar" className="bg-white shadow rounded-lg p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-center mb-4">
              <div className="p-3 bg-orange-100 rounded-lg">
                <Calendar className="text-orange-600" size={24} />
              </div>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Calendar</h3>
            <p className="text-sm text-gray-600">View all your tasks and deadlines in calendar view</p>
          </Link>
        </div>

        <div className="space-y-4">
          {noteCount === 0 && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
              <h2 className="text-lg font-semibold text-blue-900 mb-2">Getting Started</h2>
              <p className="text-blue-800 mb-3">You've successfully set up your account! Try creating your first note to get started.</p>
              <Link href="/notes/new" className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700">
                Create Your First Note
              </Link>
            </div>
          )}

          {taskCount === 0 && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-6">
              <h2 className="text-lg font-semibold text-green-900 mb-2">Getting Started</h2>
              <p className="text-green-800 mb-3">You've successfully set up your account! Try creating your first task to get started.</p>
              <Link href="/tasks" className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700">
                Create Your First Task
              </Link>
            </div>
          )}

          {flashcardCount === 0 && (
            <div className="bg-purple-50 border border-purple-200 rounded-lg p-6">
              <h2 className="text-lg font-semibold text-purple-900 mb-2">Getting Started</h2>
              <p className="text-purple-800 mb-3">You've successfully set up your account! Try creating your first flashcard to get started.</p>
              <Link href="/flashcards" className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-purple-600 hover:bg-purple-700">
                Create Your First Flashcard
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

