import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma'

type Params = {
  params: Promise<{
    deckId: string
    flashcardId: string
  }>
}

// POST /api/decks/[deckId]/flashcards/[flashcardId]/review - Record a review for a flashcard
export async function POST(request: NextRequest, { params }: Params) {
  try {
    const { deckId, flashcardId } = await params
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Verify the deck belongs to the user
    const deck = await prisma.deck.findFirst({
      where: {
        id: deckId,
        userId: user.id,
      },
    })

    if (!deck) {
      return NextResponse.json({ error: 'Deck not found' }, { status: 404 })
    }

    const body = await request.json()
    const { rating } = body // 0-5 rating (0=wrong, 3=correct, 5=easy)

    if (rating === undefined || rating < 0 || rating > 5) {
      return NextResponse.json({ error: 'Rating must be between 0 and 5' }, { status: 400 })
    }

    // Create review record
    const review = await prisma.review.create({
      data: {
        flashcardId: flashcardId,
        quality: rating,
      },
    })

    // Update flashcard review stats (basic for now, SM-2 algorithm can be added later)
    const flashcard = await prisma.flashcard.findUnique({
      where: { id: flashcardId },
    })

    if (flashcard) {
      await prisma.flashcard.update({
        where: { id: flashcardId },
        data: {
          lastReviewed: new Date(),
          repetitions: flashcard.repetitions + 1,
        },
      })
    }

    return NextResponse.json(review, { status: 201 })
  } catch (error) {
    console.error('Error recording review:', error)
    return NextResponse.json({ error: 'Failed to record review' }, { status: 500 })
  }
}
