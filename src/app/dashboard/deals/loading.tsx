export default function DealsLoading() {
  return (
    <div className="space-y-6">
      {/* Header skeleton */}
      <div className="flex items-center justify-between">
        <div>
          <div className="h-8 w-28 animate-pulse rounded bg-muted dark:bg-secondary" />
          <div className="mt-2 h-4 w-56 animate-pulse rounded bg-muted dark:bg-secondary" />
        </div>
        <div className="flex gap-2">
          <div className="h-10 w-20 animate-pulse rounded-lg bg-muted dark:bg-secondary" />
          <div className="h-10 w-24 animate-pulse rounded-lg bg-muted dark:bg-secondary" />
          <div className="h-10 w-28 animate-pulse rounded-lg bg-muted dark:bg-secondary" />
        </div>
      </div>

      {/* Stats skeleton */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="h-24 animate-pulse rounded-xl bg-muted dark:bg-secondary" />
        ))}
      </div>

      {/* Table skeleton */}
      <div className="rounded-xl border border-border bg-white dark:border-border dark:bg-card">
        <div className="border-b border-border p-4 dark:border-border">
          <div className="h-10 animate-pulse rounded bg-muted dark:bg-secondary" />
        </div>
        <div className="divide-y divide-border dark:divide-border">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex items-center gap-4 p-4">
              <div className="h-10 w-10 animate-pulse rounded-lg bg-muted dark:bg-secondary" />
              <div className="flex-1 space-y-2">
                <div className="h-4 w-48 animate-pulse rounded bg-muted dark:bg-secondary" />
                <div className="h-3 w-32 animate-pulse rounded bg-muted dark:bg-secondary" />
              </div>
              <div className="h-6 w-20 animate-pulse rounded-full bg-muted dark:bg-secondary" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
