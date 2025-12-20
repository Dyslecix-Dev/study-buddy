import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma'

// GET /api/tags/[id] - Get a specific tag
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params

    const tag = await prisma.tag.findFirst({
      where: {
        id,
        userId: user.id,
      },
      include: {
        Note: {
          where: { userId: user.id },
          select: { id: true, title: true },
        },
        Task: {
          where: { userId: user.id },
          select: { id: true, title: true },
        },
        Deck: {
          where: { userId: user.id },
          select: { id: true, name: true },
        },
      },
    })

    if (!tag) {
      return NextResponse.json({ error: 'Tag not found' }, { status: 404 })
    }

    return NextResponse.json(tag)
  } catch (error) {
    console.error('Error fetching tag:', error)
    return NextResponse.json({ error: 'Failed to fetch tag' }, { status: 500 })
  }
}

// PATCH /api/tags/[id] - Update a tag
export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    const body = await request.json()
    const { name, color } = body

    const updateData: any = {}

    // Verify ownership
    const existingTag = await prisma.tag.findFirst({
      where: {
        id,
        userId: user.id,
      },
    })

    if (!existingTag) {
      return NextResponse.json({ error: 'Tag not found' }, { status: 404 })
    }

    if (name !== undefined && name.trim()) {
      // Check if another tag with this name exists for this user
      const duplicateTag = await prisma.tag.findFirst({
        where: {
          userId: user.id,
          name: {
            equals: name.trim(),
            mode: 'insensitive',
          },
          NOT: { id },
        },
      })

      if (duplicateTag) {
        return NextResponse.json({ error: 'A tag with this name already exists' }, { status: 400 })
      }

      updateData.name = name.trim()
    }

    if (color !== undefined) {
      updateData.color = color
    }

    const tag = await prisma.tag.update({
      where: { id },
      data: updateData,
    })

    return NextResponse.json(tag)
  } catch (error) {
    console.error('Error updating tag:', error)
    return NextResponse.json({ error: 'Failed to update tag' }, { status: 500 })
  }
}

// DELETE /api/tags/[id] - Delete a tag
export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params

    // Verify ownership before deleting
    const existingTag = await prisma.tag.findFirst({
      where: {
        id,
        userId: user.id,
      },
    })

    if (!existingTag) {
      return NextResponse.json({ error: 'Tag not found' }, { status: 404 })
    }

    await prisma.tag.delete({
      where: { id },
    })

    return NextResponse.json({ message: 'Tag deleted successfully' })
  } catch (error) {
    console.error('Error deleting tag:', error)
    return NextResponse.json({ error: 'Failed to delete tag' }, { status: 500 })
  }
}
