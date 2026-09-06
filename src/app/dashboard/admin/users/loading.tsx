export default function AdminUsersLoading() {
  return (
    <div role="status" className="mx-auto max-w-7xl space-y-6">
      <span className="sr-only">Loading users…</span>
      <div aria-hidden="true" className="space-y-6">
        <div className="h-8 w-48 rounded bg-muted" />
        <div className="grid grid-cols-2 gap-px overflow-hidden rounded-lg border border-border bg-border sm:grid-cols-5">
          {Array.from({ length: 5 }, (_, index) => (
            <div key={index} className="space-y-2 bg-card p-4">
              <div className="h-4 w-2/3 rounded bg-muted" />
              <div className="h-6 w-1/3 rounded bg-muted" />
            </div>
          ))}
        </div>
        <div className="divide-y divide-border rounded-lg border border-border bg-card">
          {Array.from({ length: 4 }, (_, index) => (
            <div key={index} className="grid grid-cols-2 gap-3 p-4 lg:grid-cols-4">
              <div className="h-5 w-3/4 rounded bg-muted" />
              <div className="h-5 w-2/3 rounded bg-muted" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
