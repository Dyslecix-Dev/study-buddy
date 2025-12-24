import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma'
import { incrementDailyProgress } from '@/lib/progress-tracker'
import { logNoteCreated } from '@/lib/activity-logger'

// GET - List all notes for the authenticated user
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const notes = await prisma.note.findMany({
      where: {
        userId: user.id,
      },
      orderBy: {
        updatedAt: 'desc',
      },
      select: {
        id: true,
        title: true,
        content: true,
        createdAt: true,
        updatedAt: true,
        folderId: true,
        Tag: true,
        Folder: {
          select: {
            name: true,
          },
        },
      },
    })

    return NextResponse.json({ notes })
  } catch (error: any) {
    console.error('Error fetching notes:', error)
    return NextResponse.json({ error: 'Failed to fetch notes' }, { status: 500 })
  }
}

// POST - Create a new note
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { title, content, folderId, tagIds, noteLinks } = await request.json()

    if (!title) {
      return NextResponse.json({ error: 'Title is required' }, { status: 400 })
    }

    const note = await prisma.note.create({
      data: {
        title,
        content: content || '<p></p>',
        userId: user.id,
        folderId: folderId || null,
        Tag: tagIds && tagIds.length > 0 ? {
          connect: tagIds.map((id: string) => ({ id })),
        } : undefined,
      },
      include: {
        Tag: true,
      },
    })

    // Create note links if provided
    if (noteLinks && noteLinks.length > 0) {
      await prisma.noteLink.createMany({
        data: noteLinks.map((toNoteId: string) => ({
          fromNoteId: note.id,
          toNoteId,
        })),
        skipDuplicates: true,
      })
    }

    // Track progress - note created
    await incrementDailyProgress(user.id, 'noteCreated')

    // Log activity
    await logNoteCreated(user.id, note.id, note.title)

    return NextResponse.json({ note }, { status: 201 })
  } catch (error: any) {
    console.error('Error creating note:', error)

    // Handle unique constraint violation
    if (error.code === 'P2002') {
      return NextResponse.json({ error: 'A note with this title already exists' }, { status: 409 })
    }

    return NextResponse.json({ error: 'Failed to create note' }, { status: 500 })
  }
}
