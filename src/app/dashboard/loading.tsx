const placeholderClass = "rounded bg-muted motion-safe:animate-pulse";

export default function DashboardLoading() {
  return (
    <div role="status" className="mx-auto max-w-7xl">
      <span className="sr-only">Loading dashboard</span>
      <div aria-hidden="true" className="space-y-7">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <div className={`${placeholderClass} h-8 w-40`} />
          </div>
          <div className={`${placeholderClass} h-11 w-24 rounded-lg`} />
        </div>

        <div className="rounded-lg border border-border bg-card">
          <div className="border-b border-border p-4">
            <div className={`${placeholderClass} h-5 w-36`} />
          </div>
          <div className="grid divide-y divide-border lg:grid-cols-3 lg:divide-x lg:divide-y-0">
            {Array.from({ length: 3 }, (_, index) => (
              <div key={index} className="space-y-3 p-4">
                <div className={`${placeholderClass} h-4 w-2/3`} />
                <div className={`${placeholderClass} h-12 w-full`} />
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-px overflow-hidden rounded-lg border border-border bg-border lg:grid-cols-4">
          {Array.from({ length: 4 }, (_, index) => (
            <div key={index} className="space-y-2 bg-card p-4">
              <div className={`${placeholderClass} h-4 w-2/3`} />
              <div className={`${placeholderClass} h-7 w-1/2`} />
              <div className={`${placeholderClass} h-3 w-4/5`} />
            </div>
          ))}
        </div>

        <div className="grid gap-5 xl:grid-cols-[minmax(0,0.75fr)_minmax(0,1fr)]">
          <div className={`${placeholderClass} h-56 rounded-lg`} />
          <div className={`${placeholderClass} h-56 rounded-lg`} />
        </div>
      </div>
    </div>
  );
}
