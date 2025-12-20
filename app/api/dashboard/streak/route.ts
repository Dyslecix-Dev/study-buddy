import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma'
import { startOfMonth, endOfMonth, format } from 'date-fns'

// GET /api/dashboard/streak - Get active days for streak calendar
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const now = new Date()
    const monthStart = startOfMonth(now)
    const monthEnd = endOfMonth(now)

    // Get all days with focus sessions in the current month
    const sessions = await prisma.focusSession.findMany({
      where: {
        userId: user.id,
        completedAt: {
          gte: monthStart,
          lte: monthEnd,
        },
      },
      select: {
        completedAt: true,
      },
    })

    // Extract unique days with activity
    const activeDays = new Set(
      sessions.map((session) => format(new Date(session.completedAt), 'yyyy-MM-dd'))
    )

    return NextResponse.json({
      activeDays: Array.from(activeDays),
    })
  } catch (error) {
    console.error('Error fetching streak data:', error)
    return NextResponse.json({ error: 'Failed to fetch streak data' }, { status: 500 })
  }
}
