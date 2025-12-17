import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma'

type Params = {
  params: Promise<{
    deckId: string
    flashcardId: string
  }>
}

// GET /api/decks/[deckId]/flashcards/[flashcardId] - Get a specific flashcard
export async function GET(_request: NextRequest, { params }: Params) {
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

    const flashcard = await prisma.flashcard.findFirst({
      where: {
        id: flashcardId,
        deckId,
      },
    })

    if (!flashcard) {
      return NextResponse.json({ error: 'Flashcard not found' }, { status: 404 })
    }

    return NextResponse.json(flashcard)
  } catch (error) {
    console.error('Error fetching flashcard:', error)
    return NextResponse.json({ error: 'Failed to fetch flashcard' }, { status: 500 })
  }
}

// PATCH /api/decks/[deckId]/flashcards/[flashcardId] - Update a flashcard
export async function PATCH(request: NextRequest, { params }: Params) {
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
    const { front, back } = body

    const flashcard = await prisma.flashcard.update({
      where: { id: flashcardId },
      data: {
        ...(front !== undefined && { front }),
        ...(back !== undefined && { back }),
      },
    })

    return NextResponse.json(flashcard)
  } catch (error) {
    console.error('Error updating flashcard:', error)
    return NextResponse.json({ error: 'Failed to update flashcard' }, { status: 500 })
  }
}

// DELETE /api/decks/[deckId]/flashcards/[flashcardId] - Delete a flashcard
export async function DELETE(_request: NextRequest, { params }: Params) {
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

    await prisma.flashcard.delete({
      where: { id: flashcardId },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting flashcard:', error)
    return NextResponse.json({ error: 'Failed to delete flashcard' }, { status: 500 })
  }
}
