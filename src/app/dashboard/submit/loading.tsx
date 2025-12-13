export default function SubmitLoading() {
  return (
    <div className="mx-auto max-w-4xl space-y-6">
      {/* Header skeleton */}
      <div>
        <div className="h-8 w-44 animate-pulse rounded bg-muted" />
        <div className="mt-2 h-4 w-72 animate-pulse rounded bg-muted" />
      </div>

      {/* Progress steps skeleton */}
      <div className="flex justify-between border-b border-border pb-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="flex items-center gap-2">
            <div className="h-6 w-6 animate-pulse rounded-full bg-muted" />
            <div className="h-4 w-24 animate-pulse rounded bg-muted" />
          </div>
        ))}
      </div>

      {/* Form skeleton */}
      <div className="rounded-xl border border-border bg-card p-6">
        <div className="mb-6 h-6 w-32 animate-pulse rounded bg-muted" />
        <div className="grid gap-6 sm:grid-cols-2">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="space-y-2">
              <div className="h-4 w-24 animate-pulse rounded bg-muted" />
              <div className="h-10 animate-pulse rounded-lg bg-muted" />
            </div>
          ))}
        </div>
        <div className="mt-6 flex justify-end">
          <div className="h-10 w-24 animate-pulse rounded-lg bg-muted" />
        </div>
      </div>
    </div>
  );
}
