export default function SettingsLoading() {
  return (
    <div className="space-y-6">
      {/* Header skeleton */}
      <div>
        <div className="h-8 w-24 animate-pulse rounded bg-slate-200 dark:bg-slate-800" />
        <div className="mt-2 h-4 w-56 animate-pulse rounded bg-slate-200 dark:bg-slate-800" />
      </div>

      {/* Settings grid skeleton */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Profile card */}
        <div className="rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
          <div className="mb-4 flex items-center justify-between">
            <div className="h-6 w-36 animate-pulse rounded bg-slate-200 dark:bg-slate-800" />
            <div className="h-8 w-16 animate-pulse rounded-lg bg-slate-200 dark:bg-slate-800" />
          </div>
          <div className="space-y-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="flex justify-between">
                <div className="h-4 w-20 animate-pulse rounded bg-slate-200 dark:bg-slate-800" />
                <div className="h-4 w-32 animate-pulse rounded bg-slate-200 dark:bg-slate-800" />
              </div>
            ))}
          </div>
        </div>

        {/* Security card */}
        <div className="rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
          <div className="mb-4 h-6 w-24 animate-pulse rounded bg-slate-200 dark:bg-slate-800" />
          <div className="space-y-4">
            {[...Array(2)].map((_, i) => (
              <div key={i} className="flex items-center justify-between py-2">
                <div className="space-y-1">
                  <div className="h-4 w-24 animate-pulse rounded bg-slate-200 dark:bg-slate-800" />
                  <div className="h-3 w-36 animate-pulse rounded bg-slate-200 dark:bg-slate-800" />
                </div>
                <div className="h-8 w-16 animate-pulse rounded-lg bg-slate-200 dark:bg-slate-800" />
              </div>
            ))}
          </div>
        </div>

        {/* Underwriting defaults card */}
        <div className="rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
          <div className="mb-4 flex items-center justify-between">
            <div className="h-6 w-44 animate-pulse rounded bg-slate-200 dark:bg-slate-800" />
            <div className="h-8 w-16 animate-pulse rounded-lg bg-slate-200 dark:bg-slate-800" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="space-y-1">
                <div className="h-3 w-20 animate-pulse rounded bg-slate-200 dark:bg-slate-800" />
                <div className="h-5 w-16 animate-pulse rounded bg-slate-200 dark:bg-slate-800" />
              </div>
            ))}
          </div>
        </div>

        {/* Notifications card */}
        <div className="rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
          <div className="mb-4 h-6 w-28 animate-pulse rounded bg-slate-200 dark:bg-slate-800" />
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="flex items-center justify-between py-2">
                <div className="space-y-1">
                  <div className="h-4 w-32 animate-pulse rounded bg-slate-200 dark:bg-slate-800" />
                  <div className="h-3 w-40 animate-pulse rounded bg-slate-200 dark:bg-slate-800" />
                </div>
                <div className="h-6 w-11 animate-pulse rounded-full bg-slate-200 dark:bg-slate-800" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
