import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma'
import { logTaskCreated } from '@/lib/activity-logger'

// GET /api/tasks - Get all tasks for the current user
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const priority = searchParams.get('priority')

    const where: any = { userId: user.id }

    if (status === 'completed') {
      where.completed = true
    } else if (status === 'active') {
      where.completed = false
    }

    if (priority) {
      where.priority = parseInt(priority)
    }

    const tasks = await prisma.task.findMany({
      where,
      orderBy: [{ order: 'asc' }, { createdAt: 'desc' }],
      include: {
        Tag: true,
      },
    })

    return NextResponse.json(tasks)
  } catch (error) {
    console.error('Error fetching tasks:', error)
    return NextResponse.json({ error: 'Failed to fetch tasks' }, { status: 500 })
  }
}

// POST /api/tasks - Create a new task
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { title, description, startTime, endTime, priority, tagIds } = body

    if (!title) {
      return NextResponse.json({ error: 'Title is required' }, { status: 400 })
    }

    // Get the highest order value to append the new task at the end
    const lastTask = await prisma.task.findFirst({
      where: { userId: user.id },
      orderBy: { order: 'desc' },
    })

    // Compute dueDate from endTime or startTime
    let dueDate = null
    if (endTime) {
      dueDate = new Date(endTime)
    } else if (startTime) {
      dueDate = new Date(startTime)
    }

    const task = await prisma.task.create({
      data: {
        title,
        description: description || null,
        dueDate,
        startTime: startTime ? new Date(startTime) : null,
        endTime: endTime ? new Date(endTime) : null,
        priority: priority !== undefined ? priority : 0,
        order: lastTask ? lastTask.order + 1 : 0,
        userId: user.id,
        Tag: tagIds && tagIds.length > 0 ? {
          connect: tagIds.map((id: string) => ({ id })),
        } : undefined,
      },
      include: {
        Tag: true,
      },
    })

    // Log activity
    await logTaskCreated(user.id, task.id, task.title)

    return NextResponse.json(task, { status: 201 })
  } catch (error) {
    console.error('Error creating task:', error)
    return NextResponse.json({ error: 'Failed to create task' }, { status: 500 })
  }
}
