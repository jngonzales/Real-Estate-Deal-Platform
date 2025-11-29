export default function SubmitLoading() {
  return (
    <div className="mx-auto max-w-4xl space-y-6">
      {/* Header skeleton */}
      <div>
        <div className="h-8 w-44 animate-pulse rounded bg-slate-200 dark:bg-slate-800" />
        <div className="mt-2 h-4 w-72 animate-pulse rounded bg-slate-200 dark:bg-slate-800" />
      </div>

      {/* Progress steps skeleton */}
      <div className="flex justify-between border-b border-slate-200 pb-4 dark:border-slate-800">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="flex items-center gap-2">
            <div className="h-6 w-6 animate-pulse rounded-full bg-slate-200 dark:bg-slate-800" />
            <div className="h-4 w-24 animate-pulse rounded bg-slate-200 dark:bg-slate-800" />
          </div>
        ))}
      </div>

      {/* Form skeleton */}
      <div className="rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
        <div className="mb-6 h-6 w-32 animate-pulse rounded bg-slate-200 dark:bg-slate-800" />
        <div className="grid gap-6 sm:grid-cols-2">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="space-y-2">
              <div className="h-4 w-24 animate-pulse rounded bg-slate-200 dark:bg-slate-800" />
              <div className="h-10 animate-pulse rounded-lg bg-slate-200 dark:bg-slate-800" />
            </div>
          ))}
        </div>
        <div className="mt-6 flex justify-end">
          <div className="h-10 w-24 animate-pulse rounded-lg bg-slate-200 dark:bg-slate-800" />
        </div>
      </div>
    </div>
  );
}
