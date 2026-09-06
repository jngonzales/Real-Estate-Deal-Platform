const placeholder = "rounded bg-muted motion-safe:animate-pulse";

export default function DealsLoading() {
  return (
    <div role="status" className="mx-auto max-w-7xl">
      <span className="sr-only">Loading deals</span>
      <div aria-hidden="true" className="space-y-5">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <div className={placeholder + " h-8 w-32"} />
          </div>
          <div className={placeholder + " h-11 w-40"} />
        </div>
        <div className={placeholder + " h-11 w-full"} />
        <div className="grid grid-cols-3 gap-px overflow-hidden rounded-lg border border-border bg-border sm:grid-cols-5 xl:grid-cols-10">
          {Array.from({ length: 10 }, (_, index) => (
            <div key={index} className="space-y-2 bg-card p-2">
              <div className={placeholder + " h-6 w-1/3"} />
              <div className={placeholder + " h-3 w-3/4"} />
            </div>
          ))}
        </div>
        <div className="divide-y divide-border rounded-lg border border-border bg-card">
          {Array.from({ length: 4 }, (_, index) => (
            <div key={index} className="grid grid-cols-2 gap-3 px-4 py-4 lg:grid-cols-4">
              <div className={placeholder + " col-span-2 h-5 w-3/4 lg:col-span-1"} />
              <div className={placeholder + " h-5 w-2/3"} />
              <div className={placeholder + " h-5 w-1/2"} />
              <div className={placeholder + " hidden h-5 w-2/3 lg:block"} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
