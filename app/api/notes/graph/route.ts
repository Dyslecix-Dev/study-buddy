import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma'

// GET - Get knowledge graph data
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get folderId from query params if provided
    const { searchParams } = new URL(request.url)
    const folderId = searchParams.get('folderId')

    // Build the where clause
    const whereClause: any = {
      userId: user.id,
    }

    // Add folder filter if provided
    if (folderId && folderId !== 'all') {
      whereClause.folderId = folderId
    }

    // Fetch all notes with their links
    const notes = await prisma.note.findMany({
      where: whereClause,
      select: {
        id: true,
        title: true,
        createdAt: true,
        updatedAt: true,
        Tag: {
          select: {
            id: true,
            name: true,
            color: true,
          },
        },
        NoteLink_NoteLink_fromNoteIdToNote: {
          select: {
            toNoteId: true,
          },
        },
      },
    })

    // Get all note IDs in this result set for filtering links
    const noteIds = notes.map(note => note.id)

    // Get all note links - only those between notes in our filtered set
    const links = await prisma.noteLink.findMany({
      where: {
        AND: [
          {
            fromNoteId: {
              in: noteIds,
            },
          },
          {
            toNoteId: {
              in: noteIds,
            },
          },
        ],
      },
      select: {
        fromNoteId: true,
        toNoteId: true,
      },
    })

    // Calculate statistics
    const nodeCount = notes.length
    const linkCount = links.length

    // Find orphaned notes (no links in or out)
    const linkedNoteIds = new Set<string>()
    links.forEach(link => {
      linkedNoteIds.add(link.fromNoteId)
      linkedNoteIds.add(link.toNoteId)
    })
    const orphanedNotes = notes.filter(note => !linkedNoteIds.has(note.id))

    // Find most connected notes
    const connectionCounts = new Map<string, number>()
    links.forEach(link => {
      connectionCounts.set(link.fromNoteId, (connectionCounts.get(link.fromNoteId) || 0) + 1)
      connectionCounts.set(link.toNoteId, (connectionCounts.get(link.toNoteId) || 0) + 1)
    })

    const mostConnected = notes
      .map(note => ({
        ...note,
        connections: connectionCounts.get(note.id) || 0,
      }))
      .sort((a, b) => b.connections - a.connections)
      .slice(0, 10)

    return NextResponse.json({
      nodes: notes.map(note => ({
        id: note.id,
        title: note.title,
        tags: note.Tag,
        linkCount: note.NoteLink_NoteLink_fromNoteIdToNote.length,
        updatedAt: note.updatedAt,
      })),
      links,
      statistics: {
        nodeCount,
        linkCount,
        orphanedCount: orphanedNotes.length,
        averageConnections: linkCount > 0 ? (linkCount * 2) / nodeCount : 0,
      },
      orphanedNotes: orphanedNotes.map(note => ({
        id: note.id,
        title: note.title,
      })),
      mostConnected: mostConnected.map(note => ({
        id: note.id,
        title: note.title,
        connections: note.connections,
      })),
    })
  } catch (error: any) {
    console.error('Error fetching graph data:', error)
    return NextResponse.json({ error: 'Failed to fetch graph data' }, { status: 500 })
  }
}
