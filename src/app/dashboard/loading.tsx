export default function DashboardLoading() {
  return (
    <div className="space-y-6">
      {/* Header skeleton */}
      <div className="flex items-center justify-between">
        <div>
          <div className="h-8 w-32 animate-pulse rounded bg-muted dark:bg-secondary" />
          <div className="mt-2 h-4 w-48 animate-pulse rounded bg-muted dark:bg-secondary" />
        </div>
        <div className="h-10 w-36 animate-pulse rounded-lg bg-muted dark:bg-secondary" />
      </div>

      {/* Stats skeleton */}
      <div className="h-32 animate-pulse rounded-xl bg-muted dark:bg-secondary" />
      
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-28 animate-pulse rounded-xl bg-muted dark:bg-secondary" />
        ))}
      </div>

      {/* Content skeleton */}
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <div className="h-64 animate-pulse rounded-xl bg-muted dark:bg-secondary" />
        </div>
        <div className="h-64 animate-pulse rounded-xl bg-muted dark:bg-secondary" />
      </div>
    </div>
  );
}
