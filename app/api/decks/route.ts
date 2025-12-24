import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma'

// GET /api/decks - Get all decks for the current user
export async function GET() {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const decks = await prisma.deck.findMany({
      where: { userId: user.id },
      include: {
        _count: {
          select: { Flashcard: true },
        },
      },
      orderBy: { updatedAt: 'desc' },
    })

    return NextResponse.json(decks)
  } catch (error) {
    console.error('Error fetching decks:', error)
    return NextResponse.json({ error: 'Failed to fetch decks' }, { status: 500 })
  }
}

// POST /api/decks - Create a new deck
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      console.error('POST /api/decks - Unauthorized: No user found')
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { name, description, color } = body

    if (!name) {
      console.error('POST /api/decks - Bad request: Name is required')
      return NextResponse.json({ error: 'Name is required' }, { status: 400 })
    }

    console.log('Creating deck for user:', user.id, 'with data:', { name, description, color })

    const deck = await prisma.deck.create({
      data: {
        name,
        description: description || null,
        color: color || null,
        userId: user.id,
      },
      include: {
        _count: {
          select: { Flashcard: true },
        },
      },
    })

    console.log('Deck created successfully:', deck.id)
    return NextResponse.json(deck, { status: 201 })
  } catch (error: any) {
    console.error('Error creating deck:', error)
    if (error instanceof Error) {
      console.error('Error message:', error.message)
      console.error('Error stack:', error.stack)
    }

    // Handle unique constraint violation
    if (error.code === 'P2002') {
      return NextResponse.json({ error: 'A deck with this name already exists' }, { status: 409 })
    }

    return NextResponse.json({ error: 'Failed to create deck' }, { status: 500 })
  }
}
