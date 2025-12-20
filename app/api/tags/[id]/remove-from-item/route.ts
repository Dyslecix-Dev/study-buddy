import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma'

// POST /api/tags/[id]/remove-from-item - Remove tag from an item and delete if unused
export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id: tagId } = await params
    const body = await request.json()
    const { itemType, itemId } = body

    if (!itemType || !itemId) {
      return NextResponse.json({ error: 'itemType and itemId are required' }, { status: 400 })
    }

    // Verify the tag belongs to this user
    const tag = await prisma.tag.findFirst({
      where: {
        id: tagId,
        userId: user.id,
      },
    })

    if (!tag) {
      return NextResponse.json({ error: 'Tag not found' }, { status: 404 })
    }

    // Disconnect the tag from the item based on type
    if (itemType === 'note') {
      await prisma.note.update({
        where: { id: itemId },
        data: {
          Tag: {
            disconnect: { id: tagId },
          },
        },
      })
    } else if (itemType === 'task') {
      await prisma.task.update({
        where: { id: itemId },
        data: {
          Tag: {
            disconnect: { id: tagId },
          },
        },
      })
    } else if (itemType === 'flashcard') {
      await prisma.flashcard.update({
        where: { id: itemId },
        data: {
          Tag: {
            disconnect: { id: tagId },
          },
        },
      })
    } else {
      return NextResponse.json({ error: 'Invalid itemType' }, { status: 400 })
    }

    // Check if the tag is still being used anywhere
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

    let deleted = false
    if (tagWithUsage) {
      const totalUsage = tagWithUsage._count.Note + tagWithUsage._count.Task + tagWithUsage._count.Flashcard

      // If the tag is not used anywhere, delete it
      if (totalUsage === 0) {
        await prisma.tag.delete({
          where: { id: tagId },
        })
        deleted = true
      }
    }

    return NextResponse.json({
      success: true,
      deleted,
      message: deleted ? 'Tag removed and deleted (no longer in use)' : 'Tag removed from item',
    })
  } catch (error) {
    console.error('Error removing tag from item:', error)
    return NextResponse.json({ error: 'Failed to remove tag' }, { status: 500 })
  }
}
