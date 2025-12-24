import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma'
import { logFlashcardCreated } from '@/lib/activity-logger'

type Params = {
  params: Promise<{
    deckId: string
  }>
}

// GET /api/decks/[deckId]/flashcards - Get all flashcards in a deck
export async function GET(request: NextRequest, { params }: Params) {
  try {
    const { deckId } = await params
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

    const flashcards = await prisma.flashcard.findMany({
      where: { deckId },
      orderBy: { createdAt: 'asc' },
      include: {
        Tag: true,
      },
    })

    return NextResponse.json(flashcards)
  } catch (error) {
    console.error('Error fetching flashcards:', error)
    return NextResponse.json({ error: 'Failed to fetch flashcards' }, { status: 500 })
  }
}

// POST /api/decks/[deckId]/flashcards - Create a new flashcard
export async function POST(request: NextRequest, { params }: Params) {
  try {
    const { deckId } = await params
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
    const { front, back, tagIds } = body

    if (!front || !back) {
      return NextResponse.json({ error: 'Front and back are required' }, { status: 400 })
    }

    const flashcard = await prisma.flashcard.create({
      data: {
        front,
        back,
        deckId,
        Tag: tagIds && tagIds.length > 0 ? {
          connect: tagIds.map((id: string) => ({ id })),
        } : undefined,
      },
      include: {
        Tag: true,
      },
    })

    // Log activity
    await logFlashcardCreated(user.id, flashcard.id, deck.name)

    return NextResponse.json(flashcard, { status: 201 })
  } catch (error) {
    console.error('Error creating flashcard:', error)
    return NextResponse.json({ error: 'Failed to create flashcard' }, { status: 500 })
  }
}
