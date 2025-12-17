import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma'

// GET /api/search - Get all searchable content for the current user
export async function GET() {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Fetch notes, tasks, and flashcards in parallel
    const [notes, tasks, decks] = await Promise.all([
      prisma.note.findMany({
        where: { userId: user.id },
        select: {
          id: true,
          title: true,
          content: true,
          createdAt: true,
          updatedAt: true,
        },
      }),
      prisma.task.findMany({
        where: { userId: user.id },
        select: {
          id: true,
          title: true,
          description: true,
          completed: true,
          dueDate: true,
          priority: true,
        },
      }),
      prisma.deck.findMany({
        where: { userId: user.id },
        include: {
          flashcards: {
            select: {
              id: true,
              front: true,
              back: true,
            },
          },
        },
      }),
    ])

    return NextResponse.json({
      notes,
      tasks,
      decks,
    })
  } catch (error) {
    console.error('Error fetching search data:', error)
    return NextResponse.json({ error: 'Failed to fetch search data' }, { status: 500 })
  }
}
