"use client"

import { startOfMonth, endOfMonth, eachDayOfInterval, format, isSameMonth, startOfWeek, endOfWeek } from 'date-fns'
import { useEffect, useState } from 'react'

interface StreakCalendarProps {
  currentStreak: number
  userId?: string
}

export function StreakCalendar({ currentStreak }: StreakCalendarProps) {
  const [selectedMonth] = useState(new Date())
  const [activityDays, setActivityDays] = useState<Set<string>>(new Set())

  useEffect(() => {
    // Fetch activity data for the month
    const fetchMonthActivity = async () => {
      try {
        const response = await fetch('/api/dashboard/streak')
        if (response.ok) {
          const data = await response.json()
          setActivityDays(new Set(data.activeDays))
        }
      } catch (error) {
        console.error('Error fetching streak data:', error)
      }
    }

    fetchMonthActivity()
  }, [selectedMonth])

  const monthStart = startOfMonth(selectedMonth)
  const monthEnd = endOfMonth(selectedMonth)
  const calendarStart = startOfWeek(monthStart)
  const calendarEnd = endOfWeek(monthEnd)

  const days = eachDayOfInterval({ start: calendarStart, end: calendarEnd })

  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

  const getActivityLevel = (date: Date): number => {
    const dateStr = format(date, 'yyyy-MM-dd')
    if (!activityDays.has(dateStr)) return 0
    return 1 // Can be extended to show different levels of activity
  }

  return (
    <div className="rounded-lg shadow-sm p-6" style={{ backgroundColor: 'var(--surface)' }}>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>
            Study Streak
          </h3>
          <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>
            {currentStreak > 0 ? (
              <>
                <span className="text-2xl font-bold" style={{ color: 'var(--primary)' }}>
                  {currentStreak}
                </span>{' '}
                day{currentStreak !== 1 ? 's' : ''} streak! 🔥
              </>
            ) : (
              'Start your streak today!'
            )}
          </p>
        </div>
      </div>

      <div className="mt-4">
        <div className="grid grid-cols-7 gap-2 mb-2">
          {weekDays.map((day) => (
            <div
              key={day}
              className="text-center text-xs font-medium py-1"
              style={{ color: 'var(--text-muted)' }}
            >
              {day}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-2">
          {days.map((day, idx) => {
            const isCurrentMonth = isSameMonth(day, selectedMonth)
            const activityLevel = getActivityLevel(day)
            const isToday = format(day, 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd')

            return (
              <div
                key={idx}
                className="aspect-square rounded-md flex items-center justify-center text-xs font-medium transition-all"
                style={{
                  backgroundColor:
                    activityLevel > 0
                      ? 'var(--primary)'
                      : isCurrentMonth
                      ? 'var(--surface-secondary)'
                      : 'transparent',
                  color:
                    activityLevel > 0
                      ? '#1a1a1a'
                      : isCurrentMonth
                      ? 'var(--text-primary)'
                      : 'var(--text-muted)',
                  opacity: isCurrentMonth ? 1 : 0.3,
                  border: isToday ? '2px solid var(--primary)' : 'none',
                }}
              >
                {format(day, 'd')}
              </div>
            )
          })}
        </div>

        <div className="flex items-center gap-4 mt-4 text-xs" style={{ color: 'var(--text-muted)' }}>
          <div className="flex items-center gap-2">
            <div
              className="w-3 h-3 rounded"
              style={{ backgroundColor: 'var(--surface-secondary)' }}
            />
            <span>No activity</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded" style={{ backgroundColor: 'var(--primary)' }} />
            <span>Active day</span>
          </div>
        </div>
      </div>
    </div>
  )
}
