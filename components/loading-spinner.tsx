interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg'
  message?: string
}

export function LoadingSpinner({ size = 'md', message }: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-8 w-8',
    lg: 'h-12 w-12',
  }

  return (
    <div className="flex flex-col items-center justify-center py-8">
      <div
        className={`inline-block animate-spin rounded-full border-b-2 ${sizeClasses[size]}`}
        style={{ borderColor: 'var(--primary)' }}
      />
      {message && (
        <p className="mt-3 text-sm" style={{ color: 'var(--text-secondary)' }}>
          {message}
        </p>
      )}
    </div>
  )
}
