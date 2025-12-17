import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma'
import LogoutButton from '@/components/logout-button'
import { FileText, CheckSquare, Brain } from 'lucide-react'

export default async function DashboardPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Check if user has any notes
  const noteCount = await prisma.note.count({
    where: { userId: user.id }
  })

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <h2 className="text-xl font-semibold text-gray-900">Study Buddy</h2>
            <LogoutButton />
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome back, {user.email?.split('@')[0]}!
          </h1>
          <p className="text-gray-600">
            Here's what you can do today
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-3 mb-8">
          <Link
            href="/notes"
            className="bg-white shadow rounded-lg p-6 hover:shadow-lg transition-shadow"
          >
            <div className="flex items-center mb-4">
              <div className="p-3 bg-blue-100 rounded-lg">
                <FileText className="text-blue-600" size={24} />
              </div>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Notes</h3>
            <p className="text-sm text-gray-600">
              Create and organize your study notes with rich text formatting
            </p>
          </Link>

          <Link
            href="/tasks"
            className="bg-white shadow rounded-lg p-6 hover:shadow-lg transition-shadow"
          >
            <div className="flex items-center mb-4">
              <div className="p-3 bg-green-100 rounded-lg">
                <CheckSquare className="text-green-600" size={24} />
              </div>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Tasks</h3>
            <p className="text-sm text-gray-600">
              Manage your assignments and deadlines with priorities
            </p>
          </Link>

          <div className="bg-white shadow rounded-lg p-6 opacity-50 cursor-not-allowed">
            <div className="flex items-center mb-4">
              <div className="p-3 bg-purple-100 rounded-lg">
                <Brain className="text-purple-600" size={24} />
              </div>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Flashcards</h3>
            <p className="text-sm text-gray-600">
              Coming soon: Study with spaced repetition flashcards
            </p>
          </div>
        </div>

        {noteCount === 0 && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
            <h2 className="text-lg font-semibold text-blue-900 mb-2">Getting Started</h2>
            <p className="text-blue-800 mb-3">
              You've successfully set up your account! Try creating your first note to get started.
            </p>
            <Link
              href="/notes/new"
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
            >
              Create Your First Note
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}
