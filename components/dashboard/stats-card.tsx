import { LucideIcon } from 'lucide-react'

interface StatsCardProps {
  title: string
  value: string | number
  subtitle?: string
  icon: LucideIcon
  iconColor: string
  iconBgColor: string
  trend?: {
    value: number
    isPositive: boolean
  }
}

export function StatsCard({ title, value, subtitle, icon: Icon, iconColor, iconBgColor, trend }: StatsCardProps) {
  return (
    <div className="rounded-lg shadow-sm p-6" style={{ backgroundColor: 'var(--surface)' }}>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>
            {title}
          </p>
          <p className="text-3xl font-bold mb-1" style={{ color: 'var(--text-primary)' }}>
            {value}
          </p>
          {subtitle && (
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
              {subtitle}
            </p>
          )}
          {trend && (
            <div className="flex items-center gap-1 mt-2">
              <span
                className="text-xs font-medium"
                style={{
                  color: trend.isPositive ? 'var(--success)' : 'var(--error)',
                }}
              >
                {trend.isPositive ? '↑' : '↓'} {Math.abs(trend.value)}%
              </span>
              <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
                vs last period
              </span>
            </div>
          )}
        </div>
        <div className="p-3 rounded-lg" style={{ backgroundColor: iconBgColor }}>
          <Icon size={24} style={{ color: iconColor }} />
        </div>
      </div>
    </div>
  )
}
