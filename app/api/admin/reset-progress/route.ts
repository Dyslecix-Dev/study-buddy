import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma'

/**
 * Reset endpoint to clear all DailyProgress data for the current user
 * Use this to fix double-counted data, then run backfill again
 *
 * DELETE /api/admin/reset-progress
 */
export async function DELETE(request: NextRequest) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const result = await prisma.dailyProgress.deleteMany({
      where: {
        userId: user.id,
      },
    })

    return NextResponse.json({
      message: 'Progress data reset successfully',
      recordsDeleted: result.count,
    })
  } catch (error) {
    console.error('Error resetting progress data:', error)
    return NextResponse.json({ error: 'Failed to reset progress data' }, { status: 500 })
  }
}
