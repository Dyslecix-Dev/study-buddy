import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import LogoutButton from '@/components/logout-button'

export default async function DashboardPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

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
        <div className="bg-white shadow rounded-lg p-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Welcome to Study Buddy!
          </h1>
          <p className="text-gray-600 mb-4">
            Hi {user.email}! Your account is set up and ready to go.
          </p>
          <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
            <p className="text-blue-800">
              This is your dashboard. Soon you'll be able to:
            </p>
            <ul className="list-disc list-inside mt-2 text-blue-700">
              <li>Create and organize notes</li>
              <li>Manage tasks and deadlines</li>
              <li>Study with flashcards</li>
              <li>Track your study sessions</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}
