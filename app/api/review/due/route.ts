import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma'
import { isDueForReview } from '@/lib/spaced-repetition'

/**
 * GET /api/review/due - Get all flashcards due for review
 *
 * Query params:
 * - deckId (optional): Filter by specific deck
 * - limit (optional): Maximum number of cards to return
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get query parameters
    const { searchParams } = new URL(request.url)
    const deckId = searchParams.get('deckId')
    const limitParam = searchParams.get('limit')
    const limit = limitParam ? parseInt(limitParam, 10) : undefined

    // Build query
    const where: any = {
      Deck: {
        userId: user.id,
      },
      OR: [
        { nextReview: null }, // Never reviewed
        { nextReview: { lte: new Date() } }, // Due for review
      ],
    }

    // Filter by deck if specified
    if (deckId) {
      where.deckId = deckId
    }

    // Fetch due flashcards
    const flashcards = await prisma.flashcard.findMany({
      where,
      include: {
        Deck: {
          select: {
            id: true,
            name: true,
            color: true,
          },
        },
      },
      orderBy: [
        { nextReview: 'asc' }, // Oldest due cards first
        { createdAt: 'asc' }, // Then by creation date
      ],
      take: limit,
    })

    // Calculate statistics
    const stats = {
      total: flashcards.length,
      new: flashcards.filter((card) => card.repetitions === 0).length,
      learning: flashcards.filter((card) => card.repetitions > 0 && card.repetitions < 3).length,
      review: flashcards.filter((card) => card.repetitions >= 3).length,
    }

    return NextResponse.json({
      flashcards,
      stats,
      count: flashcards.length,
    })
  } catch (error) {
    console.error('Error fetching due flashcards:', error)
    return NextResponse.json(
      { error: 'Failed to fetch due flashcards' },
      { status: 500 }
    )
  }
}
