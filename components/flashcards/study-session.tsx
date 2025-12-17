'use client'

import { useState } from 'react'
import { ChevronLeft, ChevronRight, X } from 'lucide-react'
import Flashcard from './flashcard'
import { useRouter } from 'next/navigation'

interface FlashcardData {
  id: string
  front: string
  back: string
}

interface StudySessionProps {
  deckId: string
  flashcards: FlashcardData[]
}

export default function StudySession({ deckId, flashcards }: StudySessionProps) {
  const router = useRouter()
  const [currentIndex, setCurrentIndex] = useState(0)
  const [showAnswer, setShowAnswer] = useState(false)
  const [studiedCards, setStudiedCards] = useState<Set<number>>(new Set())
  const [ratings, setRatings] = useState<Map<string, number>>(new Map())

  const currentCard = flashcards[currentIndex]
  const progress = ((currentIndex + 1) / flashcards.length) * 100
  const correctCount = Array.from(ratings.values()).filter((r) => r >= 3).length
  const totalReviewed = ratings.size

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1)
      setShowAnswer(false)
    }
  }

  const handleNext = () => {
    if (currentIndex < flashcards.length - 1) {
      setStudiedCards(new Set(studiedCards).add(currentIndex))
      setCurrentIndex(currentIndex + 1)
      setShowAnswer(false)
    }
  }

  const handleRating = async (rating: number) => {
    // Record the rating
    setRatings(new Map(ratings).set(currentCard.id, rating))
    setStudiedCards(new Set(studiedCards).add(currentIndex))

    // Send to API
    try {
      await fetch(`/api/decks/${deckId}/flashcards/${currentCard.id}/review`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rating }),
      })
    } catch (error) {
      console.error('Error recording review:', error)
    }

    // Move to next card
    if (currentIndex < flashcards.length - 1) {
      setCurrentIndex(currentIndex + 1)
      setShowAnswer(false)
    }
  }

  const handleFinish = () => {
    router.push(`/flashcards/${deckId}`)
  }

  if (flashcards.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">No flashcards to study in this deck.</p>
      </div>
    )
  }

  const isLastCard = currentIndex === flashcards.length - 1
  const allReviewed = studiedCards.size === flashcards.length || ratings.size === flashcards.length

  return (
    <div className="max-w-3xl mx-auto">
      {/* Progress Bar */}
      <div className="mb-6">
        <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
          <span>
            Card {currentIndex + 1} of {flashcards.length}
          </span>
          <span>
            {totalReviewed > 0 && `${correctCount}/${totalReviewed} correct`}
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Flashcard */}
      <div className="mb-6">
        <Flashcard
          front={currentCard.front}
          back={currentCard.back}
          showAnswer={showAnswer}
        />
      </div>

      {/* Rating Buttons */}
      {!allReviewed && (
        <div className="bg-white rounded-lg shadow p-6 mb-4">
          <p className="text-sm text-gray-600 mb-3 text-center">How well did you know this?</p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <button
              onClick={() => handleRating(0)}
              className="px-4 py-3 bg-red-100 text-red-700 rounded-md hover:bg-red-200 transition-colors font-medium text-sm"
            >
              Wrong
            </button>
            <button
              onClick={() => handleRating(2)}
              className="px-4 py-3 bg-yellow-100 text-yellow-700 rounded-md hover:bg-yellow-200 transition-colors font-medium text-sm"
            >
              Hard
            </button>
            <button
              onClick={() => handleRating(3)}
              className="px-4 py-3 bg-green-100 text-green-700 rounded-md hover:bg-green-200 transition-colors font-medium text-sm"
            >
              Good
            </button>
            <button
              onClick={() => handleRating(5)}
              className="px-4 py-3 bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200 transition-colors font-medium text-sm"
            >
              Easy
            </button>
          </div>
        </div>
      )}

      {/* Navigation */}
      <div className="flex items-center justify-between">
        <button
          onClick={handlePrevious}
          disabled={currentIndex === 0}
          className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <ChevronLeft size={18} />
          Previous
        </button>

        {allReviewed ? (
          <button
            onClick={handleFinish}
            className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors font-medium"
          >
            Finish Session
          </button>
        ) : (
          <button
            onClick={handleNext}
            disabled={isLastCard}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Next
            <ChevronRight size={18} />
          </button>
        )}
      </div>

      {/* Session Summary (shown when all reviewed) */}
      {allReviewed && (
        <div className="mt-6 bg-green-50 border border-green-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-green-900 mb-2">Session Complete!</h3>
          <div className="text-green-800">
            <p className="mb-1">
              You reviewed <span className="font-semibold">{flashcards.length}</span> cards
            </p>
            <p className="mb-1">
              Correct answers: <span className="font-semibold">{correctCount}</span> (
              {Math.round((correctCount / totalReviewed) * 100)}%)
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
