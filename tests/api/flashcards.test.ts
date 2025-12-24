import { describe, it, expect, beforeEach, vi } from 'vitest'
import { POST } from '@/app/api/decks/[deckId]/flashcards/[flashcardId]/review/route'
import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { incrementDailyProgress } from '@/lib/progress-tracker'

// Mock dependencies
vi.mock('@/lib/prisma', () => ({
  prisma: {
    deck: {
      findFirst: vi.fn(),
    },
    flashcard: {
      findUnique: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
    review: {
      create: vi.fn(),
    },
  },
}))

vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn(() => ({
    auth: {
      getUser: vi.fn(() => Promise.resolve({
        data: { user: { id: 'test-user-id', email: 'test@example.com' } },
        error: null,
      })),
    },
  })),
}))

vi.mock('@/lib/progress-tracker', () => ({
  incrementDailyProgress: vi.fn(),
}))

vi.mock('@/lib/spaced-repetition', () => ({
  calculateNextReview: vi.fn(() => ({
    easeFactor: 2.5,
    interval: 1,
    repetitions: 1,
    nextReview: new Date('2024-01-16'),
  })),
  mapRatingToQuality: vi.fn((rating) => {
    const map: Record<number, number> = { 0: 0, 2: 3, 3: 4, 5: 5 }
    return map[rating]
  }),
}))

describe('Flashcard Review API', () => {
  const mockDeckId = 'deck-123'
  const mockFlashcardId = 'flashcard-456'
  const mockUserId = 'test-user-id'

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('POST /api/decks/[deckId]/flashcards/[flashcardId]/review', () => {
    it('should record review and track progress', async () => {
      const mockDeck = {
        id: mockDeckId,
        userId: mockUserId,
        name: 'Test Deck',
      }

      const mockFlashcard = {
        id: mockFlashcardId,
        front: 'Question',
        back: 'Answer',
        easeFactor: 2.5,
        interval: 0,
        repetitions: 0,
        lastReviewed: null,
        nextReview: null,
      }

      const mockReview = {
        id: 'review-789',
        flashcardId: mockFlashcardId,
        quality: 4,
        createdAt: new Date(),
      }

      const mockUpdatedFlashcard = {
        ...mockFlashcard,
        easeFactor: 2.5,
        interval: 1,
        repetitions: 1,
        nextReview: new Date('2024-01-16'),
        lastReviewed: new Date(),
      }

      vi.mocked(prisma.deck.findFirst).mockResolvedValue(mockDeck as any)
      vi.mocked(prisma.flashcard.findUnique).mockResolvedValue(mockFlashcard as any)
      vi.mocked(prisma.review.create).mockResolvedValue(mockReview as any)
      vi.mocked(prisma.flashcard.update).mockResolvedValue(mockUpdatedFlashcard as any)

      const request = new NextRequest(
        `http://localhost:3000/api/decks/${mockDeckId}/flashcards/${mockFlashcardId}/review`,
        {
          method: 'POST',
          body: JSON.stringify({ rating: 3 }), // "good" rating
        }
      )
      const params = Promise.resolve({ deckId: mockDeckId, flashcardId: mockFlashcardId })
      const response = await POST(request, { params })
      const data = await response.json()

      expect(response.status).toBe(201)
      expect(data.review).toBeDefined()
      expect(data.flashcard).toBeDefined()
      expect(data.schedule).toBeDefined()
      expect(incrementDailyProgress).toHaveBeenCalledWith(mockUserId, 'cardReviewed')
    })

    it('should reject invalid rating', async () => {
      const mockDeck = {
        id: mockDeckId,
        userId: mockUserId,
        name: 'Test Deck',
      }

      vi.mocked(prisma.deck.findFirst).mockResolvedValue(mockDeck as any)

      const request = new NextRequest(
        `http://localhost:3000/api/decks/${mockDeckId}/flashcards/${mockFlashcardId}/review`,
        {
          method: 'POST',
          body: JSON.stringify({ rating: 7 }), // Invalid rating
        }
      )
      const params = Promise.resolve({ deckId: mockDeckId, flashcardId: mockFlashcardId })
      const response = await POST(request, { params })

      expect(response.status).toBe(400)
      expect(incrementDailyProgress).not.toHaveBeenCalled()
    })

    it('should return 404 if deck not found', async () => {
      vi.mocked(prisma.deck.findFirst).mockResolvedValue(null)

      const request = new NextRequest(
        `http://localhost:3000/api/decks/${mockDeckId}/flashcards/${mockFlashcardId}/review`,
        {
          method: 'POST',
          body: JSON.stringify({ rating: 3 }),
        }
      )
      const params = Promise.resolve({ deckId: mockDeckId, flashcardId: mockFlashcardId })
      const response = await POST(request, { params })

      expect(response.status).toBe(404)
      expect(incrementDailyProgress).not.toHaveBeenCalled()
    })

    it('should return 404 if flashcard not found', async () => {
      const mockDeck = {
        id: mockDeckId,
        userId: mockUserId,
        name: 'Test Deck',
      }

      vi.mocked(prisma.deck.findFirst).mockResolvedValue(mockDeck as any)
      vi.mocked(prisma.flashcard.findUnique).mockResolvedValue(null)

      const request = new NextRequest(
        `http://localhost:3000/api/decks/${mockDeckId}/flashcards/${mockFlashcardId}/review`,
        {
          method: 'POST',
          body: JSON.stringify({ rating: 3 }),
        }
      )
      const params = Promise.resolve({ deckId: mockDeckId, flashcardId: mockFlashcardId })
      const response = await POST(request, { params })

      expect(response.status).toBe(404)
      expect(incrementDailyProgress).not.toHaveBeenCalled()
    })

    it('should track progress exactly once per review', async () => {
      const mockDeck = {
        id: mockDeckId,
        userId: mockUserId,
        name: 'Test Deck',
      }

      const mockFlashcard = {
        id: mockFlashcardId,
        front: 'Question',
        back: 'Answer',
        easeFactor: 2.5,
        interval: 0,
        repetitions: 0,
        lastReviewed: null,
        nextReview: null,
      }

      vi.mocked(prisma.deck.findFirst).mockResolvedValue(mockDeck as any)
      vi.mocked(prisma.flashcard.findUnique).mockResolvedValue(mockFlashcard as any)
      vi.mocked(prisma.review.create).mockResolvedValue({} as any)
      vi.mocked(prisma.flashcard.update).mockResolvedValue(mockFlashcard as any)

      const request = new NextRequest(
        `http://localhost:3000/api/decks/${mockDeckId}/flashcards/${mockFlashcardId}/review`,
        {
          method: 'POST',
          body: JSON.stringify({ rating: 3 }),
        }
      )
      const params = Promise.resolve({ deckId: mockDeckId, flashcardId: mockFlashcardId })
      await POST(request, { params })

      // Should be called exactly once
      expect(incrementDailyProgress).toHaveBeenCalledTimes(1)
      expect(incrementDailyProgress).toHaveBeenCalledWith(mockUserId, 'cardReviewed')
    })
  })
})
