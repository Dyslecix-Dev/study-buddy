import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma'

// GET - Get a single note
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const note = await prisma.note.findFirst({
      where: {
        id,
        userId: user.id,
      },
      include: {
        Tag: true,
        Folder: {
          select: {
            name: true,
          },
        },
        NoteLink_NoteLink_fromNoteIdToNote: {
          include: {
            Note_NoteLink_toNoteIdToNote: {
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
            },
          },
        },
        NoteLink_NoteLink_toNoteIdToNote: {
          include: {
            Note_NoteLink_fromNoteIdToNote: {
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
            },
          },
        },
      },
    })

    if (!note) {
      return NextResponse.json({ error: 'Note not found' }, { status: 404 })
    }

    // Format the response to include linked notes and backlinks
    const linkedNotes = note.NoteLink_NoteLink_fromNoteIdToNote.map(link => link.Note_NoteLink_toNoteIdToNote)
    const backlinks = note.NoteLink_NoteLink_toNoteIdToNote.map(link => link.Note_NoteLink_fromNoteIdToNote)

    return NextResponse.json({
      note: {
        ...note,
        linkedNotes,
        backlinks,
      }
    })
  } catch (error: any) {
    console.error('Error fetching note:', error)
    return NextResponse.json({ error: 'Failed to fetch note' }, { status: 500 })
  }
}

// PATCH - Update a note
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { title, content, tagIds, noteLinks } = await request.json()

    // Verify note belongs to user
    const existingNote = await prisma.note.findFirst({
      where: {
        id,
        userId: user.id,
      },
    })

    if (!existingNote) {
      return NextResponse.json({ error: 'Note not found' }, { status: 404 })
    }

    const updateData: any = {
      ...(title !== undefined && { title }),
      ...(content !== undefined && { content }),
    }

    // Handle tag updates
    let removedTagIds: string[] = []
    if (tagIds !== undefined) {
      // Get current tags before update to determine which were removed
      const currentTagIds = await prisma.note.findUnique({
        where: { id },
        select: {
          Tag: {
            select: { id: true },
          },
        },
      })

      if (currentTagIds) {
        const currentIds = currentTagIds.Tag.map(t => t.id)
        removedTagIds = currentIds.filter(tagId => !tagIds.includes(tagId))
      }

      updateData.Tag = {
        set: tagIds.map((id: string) => ({ id })),
      }
    }

    // Handle note link updates
    if (noteLinks !== undefined) {
      // Delete existing links from this note
      await prisma.noteLink.deleteMany({
        where: {
          fromNoteId: id,
        },
      })

      // Create new links
      if (noteLinks.length > 0) {
        await prisma.noteLink.createMany({
          data: noteLinks.map((toNoteId: string) => ({
            fromNoteId: id,
            toNoteId,
          })),
          skipDuplicates: true,
        })
      }
    }

    const note = await prisma.note.update({
      where: { id },
      data: updateData,
      include: {
        Tag: true,
        NoteLink_NoteLink_fromNoteIdToNote: {
          include: {
            Note_NoteLink_toNoteIdToNote: {
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
            },
          },
        },
        NoteLink_NoteLink_toNoteIdToNote: {
          include: {
            Note_NoteLink_fromNoteIdToNote: {
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
            },
          },
        },
      },
    })

    // Clean up unused tags
    for (const tagId of removedTagIds) {
      const tagWithUsage = await prisma.tag.findUnique({
        where: { id: tagId },
        include: {
          _count: {
            select: {
              Note: true,
              Task: true,
              Flashcard: true,
            },
          },
        },
      })

      if (tagWithUsage) {
        const totalUsage = tagWithUsage._count.Note + tagWithUsage._count.Task + tagWithUsage._count.Flashcard
        if (totalUsage === 0) {
          await prisma.tag.delete({
            where: { id: tagId },
          })
        }
      }
    }

    // Format the response to include linked notes and backlinks
    const linkedNotes = note.NoteLink_NoteLink_fromNoteIdToNote.map(link => link.Note_NoteLink_toNoteIdToNote)
    const backlinks = note.NoteLink_NoteLink_toNoteIdToNote.map(link => link.Note_NoteLink_fromNoteIdToNote)

    return NextResponse.json({
      note: {
        ...note,
        linkedNotes,
        backlinks,
      }
    })
  } catch (error: any) {
    console.error('Error updating note:', error)

    // Handle unique constraint violation
    if (error.code === 'P2002') {
      return NextResponse.json({ error: 'A note with this title already exists' }, { status: 409 })
    }

    return NextResponse.json({ error: 'Failed to update note' }, { status: 500 })
  }
}

// DELETE - Delete a note
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Verify note belongs to user
    const existingNote = await prisma.note.findFirst({
      where: {
        id,
        userId: user.id,
      },
    })

    if (!existingNote) {
      return NextResponse.json({ error: 'Note not found' }, { status: 404 })
    }

    // Get tags before deletion for cleanup
    const noteWithTags = await prisma.note.findUnique({
      where: { id },
      select: {
        Tag: {
          select: { id: true },
        },
      },
    })

    const tagIds = noteWithTags?.Tag.map(t => t.id) || []

    await prisma.note.delete({
      where: { id },
    })

    // Clean up unused tags
    for (const tagId of tagIds) {
      const tagWithUsage = await prisma.tag.findUnique({
        where: { id: tagId },
        include: {
          _count: {
            select: {
              Note: true,
              Task: true,
              Flashcard: true,
            },
          },
        },
      })

      if (tagWithUsage) {
        const totalUsage = tagWithUsage._count.Note + tagWithUsage._count.Task + tagWithUsage._count.Flashcard
        if (totalUsage === 0) {
          await prisma.tag.delete({
            where: { id: tagId },
          })
        }
      }
    }

    return NextResponse.json({ message: 'Note deleted successfully' })
  } catch (error: any) {
    console.error('Error deleting note:', error)
    return NextResponse.json({ error: 'Failed to delete note' }, { status: 500 })
  }
}
