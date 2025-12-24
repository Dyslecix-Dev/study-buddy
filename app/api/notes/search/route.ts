import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma'

// GET - Search notes by title
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const searchParams = request.nextUrl.searchParams
    const query = searchParams.get('q') || ''
    const excludeNoteId = searchParams.get('excludeNoteId')

    // Search notes by title with folder information
    const notes = await prisma.note.findMany({
      where: {
        userId: user.id,
        title: {
          contains: query,
          mode: 'insensitive',
        },
        // Exclude the current note if provided
        ...(excludeNoteId && {
          id: {
            not: excludeNoteId,
          },
        }),
      },
      select: {
        id: true,
        title: true,
        folderId: true,
        Folder: {
          select: {
            name: true,
          },
        },
      },
      orderBy: {
        updatedAt: 'desc',
      },
      take: 10, // Limit to 10 results for autocomplete
    })

    return NextResponse.json({ notes })
  } catch (error: any) {
    console.error('Error searching notes:', error)
    return NextResponse.json({ error: 'Failed to search notes' }, { status: 500 })
  }
}
