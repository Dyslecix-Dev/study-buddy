export function DashboardSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      {/* Header with Period Selector Skeleton */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div
          className="h-8 w-40 sm:w-48 rounded"
          style={{ backgroundColor: 'var(--surface-secondary)' }}
        />
        <div className="flex gap-2">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-9 w-16 sm:h-10 sm:w-20 rounded-lg"
              style={{ backgroundColor: 'var(--surface-secondary)' }}
            />
          ))}
        </div>
      </div>

      {/* Stats Cards Skeleton */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="rounded-lg shadow-sm p-6 h-32"
            style={{ backgroundColor: 'var(--surface)' }}
          >
            <div className="flex items-start justify-between">
              <div className="flex-1 space-y-3">
                <div
                  className="h-4 w-20 rounded"
                  style={{ backgroundColor: 'var(--surface-secondary)' }}
                />
                <div
                  className="h-8 w-24 rounded"
                  style={{ backgroundColor: 'var(--surface-secondary)' }}
                />
                <div
                  className="h-3 w-16 rounded"
                  style={{ backgroundColor: 'var(--surface-secondary)' }}
                />
              </div>
              <div
                className="w-12 h-12 rounded-lg"
                style={{ backgroundColor: 'var(--surface-secondary)' }}
              />
            </div>
          </div>
        ))}
      </div>

      {/* Activity Chart and Quick Stats Skeleton */}
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <div className="rounded-lg shadow-sm p-4 sm:p-6" style={{ backgroundColor: 'var(--surface)' }}>
            <div className="mb-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div
                className="h-5 w-32 rounded"
                style={{ backgroundColor: 'var(--surface-secondary)' }}
              />
              <div className="flex gap-2 flex-wrap">
                {[1, 2, 3, 4].map((i) => (
                  <div
                    key={i}
                    className="h-7 w-14 sm:w-16 rounded"
                    style={{ backgroundColor: 'var(--surface-secondary)' }}
                  />
                ))}
              </div>
            </div>
            <div
              className="h-[250px] sm:h-[300px] rounded"
              style={{ backgroundColor: 'var(--surface-secondary)' }}
            />
          </div>
        </div>

        <div className="space-y-6">
          <div className="rounded-lg shadow-sm p-4 sm:p-6" style={{ backgroundColor: 'var(--surface)' }}>
            <div
              className="h-5 w-28 rounded mb-4"
              style={{ backgroundColor: 'var(--surface-secondary)' }}
            />
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-center justify-between pb-3 border-b last:border-b-0" style={{ borderColor: 'var(--border)' }}>
                  <div className="flex items-center gap-2">
                    <div
                      className="w-4 h-4 rounded"
                      style={{ backgroundColor: 'var(--surface-secondary)' }}
                    />
                    <div
                      className="h-4 w-20 sm:w-24 rounded"
                      style={{ backgroundColor: 'var(--surface-secondary)' }}
                    />
                  </div>
                  <div
                    className="h-4 w-8 rounded"
                    style={{ backgroundColor: 'var(--surface-secondary)' }}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Streak and Activity Skeleton */}
      <div className="grid gap-6 lg:grid-cols-2">
        {[1, 2].map((i) => (
          <div
            key={i}
            className="rounded-lg shadow-sm p-4 sm:p-6 h-72 sm:h-80"
            style={{ backgroundColor: 'var(--surface)' }}
          >
            <div
              className="h-5 w-28 sm:w-32 rounded mb-4"
              style={{ backgroundColor: 'var(--surface-secondary)' }}
            />
            <div
              className="h-56 sm:h-64 rounded"
              style={{ backgroundColor: 'var(--surface-secondary)' }}
            />
          </div>
        ))}
      </div>
    </div>
  )
}
