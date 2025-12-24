import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma'

type Params = {
  params: Promise<{
    id: string
  }>
}

// GET /api/tasks/[id] - Get a specific task
export async function GET(request: NextRequest, { params }: Params) {
  try {
    const { id } = await params
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const task = await prisma.task.findFirst({
      where: {
        id,
        userId: user.id,
      },
      include: {
        Tag: true,
      },
    })

    if (!task) {
      return NextResponse.json({ error: 'Task not found' }, { status: 404 })
    }

    return NextResponse.json(task)
  } catch (error) {
    console.error('Error fetching task:', error)
    return NextResponse.json({ error: 'Failed to fetch task' }, { status: 500 })
  }
}

// PATCH /api/tasks/[id] - Update a task
export async function PATCH(request: NextRequest, { params }: Params) {
  try {
    const { id } = await params
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { title, description, completed, startTime, endTime, priority, order, tagIds } = body

    // Verify the task belongs to the user
    const existingTask = await prisma.task.findFirst({
      where: {
        id,
        userId: user.id,
      },
    })

    if (!existingTask) {
      return NextResponse.json({ error: 'Task not found' }, { status: 404 })
    }

    const updateData: any = {}
    if (title !== undefined) updateData.title = title
    if (description !== undefined) updateData.description = description
    if (completed !== undefined) updateData.completed = completed
    if (startTime !== undefined) updateData.startTime = startTime ? new Date(startTime) : null
    if (endTime !== undefined) updateData.endTime = endTime ? new Date(endTime) : null

    // Auto-update dueDate based on endTime or startTime
    if (endTime !== undefined || startTime !== undefined) {
      if (endTime) {
        updateData.dueDate = new Date(endTime)
      } else if (startTime) {
        updateData.dueDate = new Date(startTime)
      } else {
        updateData.dueDate = null
      }
    }

    if (priority !== undefined) updateData.priority = priority
    if (order !== undefined) updateData.order = order

    // Handle tag updates
    let removedTagIds: string[] = []
    if (tagIds !== undefined) {
      // Get current tags to determine which were removed
      const taskWithTags = await prisma.task.findUnique({
        where: { id },
        select: {
          Tag: {
            select: { id: true },
          },
        },
      })

      if (taskWithTags) {
        const currentIds = taskWithTags.Tag.map(t => t.id)
        removedTagIds = currentIds.filter(tagId => !tagIds.includes(tagId))
      }

      updateData.Tag = {
        set: tagIds.map((id: string) => ({ id })),
      }
    }

    const task = await prisma.task.update({
      where: { id },
      data: updateData,
      include: {
        Tag: true,
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

    return NextResponse.json(task)
  } catch (error) {
    console.error('Error updating task:', error)
    return NextResponse.json({ error: 'Failed to update task' }, { status: 500 })
  }
}

// DELETE /api/tasks/[id] - Delete a task
export async function DELETE(request: NextRequest, { params }: Params) {
  try {
    const { id } = await params
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Verify the task belongs to the user
    const existingTask = await prisma.task.findFirst({
      where: {
        id,
        userId: user.id,
      },
    })

    if (!existingTask) {
      return NextResponse.json({ error: 'Task not found' }, { status: 404 })
    }

    // Get tags before deletion for cleanup
    const taskWithTags = await prisma.task.findUnique({
      where: { id },
      select: {
        Tag: {
          select: { id: true },
        },
      },
    })

    const tagIds = taskWithTags?.Tag.map(t => t.id) || []

    await prisma.task.delete({
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

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting task:', error)
    return NextResponse.json({ error: 'Failed to delete task' }, { status: 500 })
  }
}
