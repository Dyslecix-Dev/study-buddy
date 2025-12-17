'use client'

import { useState, useEffect, use } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { ArrowLeft } from 'lucide-react'
import StudySession from '@/components/flashcards/study-session'
import { toast } from 'sonner'

interface Flashcard {
  id: string
  front: string
  back: string
}

interface Deck {
  id: string
  name: string
  flashcards: Flashcard[]
}

export default function StudyPage({
  params,
}: {
  params: Promise<{ deckId: string }>
}) {
  const { deckId } = use(params)
  const router = useRouter()
  const [deck, setDeck] = useState<Deck | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    checkAuth()
  }, [])

  useEffect(() => {
    if (deckId) {
      fetchDeck()
    }
  }, [deckId])

  const checkAuth = async () => {
    const supabase = createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      router.push('/login')
    }
  }

  const fetchDeck = async () => {
    try {
      const response = await fetch(`/api/decks/${deckId}`)
      if (response.ok) {
        const data = await response.json()
        setDeck(data)
      } else {
        toast.error('Failed to load deck')
        router.push('/flashcards')
      }
    } catch (error) {
      console.error('Error fetching deck:', error)
      toast.error('Failed to load deck')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-600">Loading study session...</p>
      </div>
    )
  }

  if (!deck) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-600">Deck not found</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center h-16">
            <Link
              href={`/flashcards/${deckId}`}
              className="text-gray-600 hover:text-gray-900 mr-4"
            >
              <ArrowLeft size={20} />
            </Link>
            <h2 className="text-xl font-semibold text-gray-900">Study: {deck.name}</h2>
          </div>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <StudySession deckId={deckId} flashcards={deck.flashcards} />
      </div>
    </div>
  )
}
