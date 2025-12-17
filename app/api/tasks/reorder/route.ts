import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma'

// POST /api/tasks/reorder - Reorder tasks after drag-and-drop
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
    const { tasks } = body // Array of { id, order } objects

    if (!tasks || !Array.isArray(tasks)) {
      return NextResponse.json({ error: 'Invalid tasks array' }, { status: 400 })
    }

    // Update all tasks in a transaction
    await prisma.$transaction(
      tasks.map((task: { id: string; order: number }) =>
        prisma.task.updateMany({
          where: {
            id: task.id,
            userId: user.id, // Ensure user owns the task
          },
          data: {
            order: task.order,
          },
        })
      )
    )

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error reordering tasks:', error)
    return NextResponse.json({ error: 'Failed to reorder tasks' }, { status: 500 })
  }
}
