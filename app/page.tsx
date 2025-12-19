import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export default async function Home() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  // If user is logged in, redirect to dashboard
  if (user) {
    redirect("/dashboard");
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="pt-12 sm:pt-16 lg:pt-20 pb-12 sm:pb-16 text-center">
          <div className="flex flex-col sm:flex-row items-center sm:items-end justify-center gap-2 sm:gap-4">
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold text-gray-900 sm:pb-1">Welcome to</h1>
            <Image src="/images/study-buddy-logo.png" alt="Study Buddy logo" width={384} height={56} className="w-64 h-10 sm:w-80 sm:h-12 md:w-96 md:h-14" />
          </div>
          <p className="mt-4 sm:mt-6 text-base sm:text-lg md:text-xl text-gray-600 max-w-2xl mx-auto px-4">
            Your AI-powered study platform. Take notes, manage tasks, create flashcards, and track your learning progress all in one place.
          </p>
          <div className="mt-8 sm:mt-10 flex flex-col sm:flex-row justify-center gap-3 sm:gap-4 px-4">
            <Link
              href="/signup"
              className="w-full sm:w-auto px-8 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 transition-colors duration-300 md:py-4 md:text-lg md:px-10"
            >
              Get Started
            </Link>
            <Link
              href="/login"
              className="w-full sm:w-auto px-8 py-3 border border-gray-300 text-base font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 transition-colors duration-300 md:py-4 md:text-lg md:px-10"
            >
              Sign In
            </Link>
          </div>
        </div>

        <div className="mt-12 sm:mt-16 lg:mt-20 pb-12 sm:pb-16 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300">
            <div className="text-blue-600 text-3xl sm:text-4xl mb-4">📝</div>
            <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2">Rich Text Notes</h3>
            <p className="text-sm sm:text-base text-gray-600">Create beautiful notes with formatting, images, and wiki-style linking</p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300">
            <div className="text-blue-600 text-3xl sm:text-4xl mb-4">✅</div>
            <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2">Task Management</h3>
            <p className="text-sm sm:text-base text-gray-600">Keep track of assignments, deadlines, and priorities in one place</p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300">
            <div className="text-blue-600 text-3xl sm:text-4xl mb-4">🎴</div>
            <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2">Smart Flashcards</h3>
            <p className="text-sm sm:text-base text-gray-600">Study smarter with spaced repetition and AI-generated flashcards</p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300">
            <div className="text-blue-600 text-3xl sm:text-4xl mb-4">⏱️</div>
            <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2">Pomodoro Timer</h3>
            <p className="text-sm sm:text-base text-gray-600">Stay focused with built-in Pomodoro sessions and time tracking</p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300">
            <div className="text-blue-600 text-3xl sm:text-4xl mb-4">📊</div>
            <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2">Progress Tracking</h3>
            <p className="text-sm sm:text-base text-gray-600">Visualize your study habits with detailed analytics and streaks</p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300">
            <div className="text-blue-600 text-3xl sm:text-4xl mb-4">🤖</div>
            <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2">AI-Powered</h3>
            <p className="text-sm sm:text-base text-gray-600">Generate quizzes and flashcards automatically from your notes</p>
          </div>
        </div>
      </div>
    </div>
  );
}
