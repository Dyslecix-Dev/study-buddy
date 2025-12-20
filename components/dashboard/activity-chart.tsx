"use client"

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts'

interface ActivityData {
  date: string
  fullDate: string
  focusMinutes: number
  tasksCompleted: number
  cardsReviewed: number
}

interface ActivityChartProps {
  data: ActivityData[]
  metric: 'focus' | 'tasks' | 'cards' | 'all'
}

export function ActivityChart({ data, metric }: ActivityChartProps) {
  return (
    <div className="rounded-lg shadow-sm p-6" style={{ backgroundColor: 'var(--surface)' }}>
      <h3 className="text-lg font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>
        Activity Overview
      </h3>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" opacity={0.3} />
          <XAxis
            dataKey="date"
            stroke="var(--text-secondary)"
            style={{ fontSize: '12px' }}
          />
          <YAxis
            stroke="var(--text-secondary)"
            style={{ fontSize: '12px' }}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: 'var(--surface-secondary)',
              border: '1px solid var(--border)',
              borderRadius: '8px',
              color: 'var(--text-primary)',
            }}
            labelStyle={{ color: 'var(--text-primary)', fontWeight: 'bold' }}
          />
          <Legend
            wrapperStyle={{
              color: 'var(--text-secondary)',
              fontSize: '12px',
            }}
          />

          {(metric === 'focus' || metric === 'all') && (
            <Line
              type="monotone"
              dataKey="focusMinutes"
              name="Focus (min)"
              stroke="var(--primary)"
              strokeWidth={2}
              dot={{ fill: 'var(--primary)', r: 4 }}
              activeDot={{ r: 6 }}
            />
          )}

          {(metric === 'tasks' || metric === 'all') && (
            <Line
              type="monotone"
              dataKey="tasksCompleted"
              name="Tasks"
              stroke="var(--secondary)"
              strokeWidth={2}
              dot={{ fill: 'var(--secondary)', r: 4 }}
              activeDot={{ r: 6 }}
            />
          )}

          {(metric === 'cards' || metric === 'all') && (
            <Line
              type="monotone"
              dataKey="cardsReviewed"
              name="Cards"
              stroke="var(--quaternary)"
              strokeWidth={2}
              dot={{ fill: 'var(--quaternary)', r: 4 }}
              activeDot={{ r: 6 }}
            />
          )}
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
