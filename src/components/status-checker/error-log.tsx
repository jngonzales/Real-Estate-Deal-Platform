import type { HealthResult } from "@/lib/health-checks";

const checkedAt = new Intl.DateTimeFormat("en-US", { timeStyle: "medium", timeZone: "UTC" });

export function ErrorLog({ results }: { results: HealthResult[] }) {
  const issues = results.filter((result) => result.status === "error" || result.status === "warning");

  return (
    <section aria-labelledby="health-issues" className="rounded-lg border border-border bg-card">
      <header className="flex flex-wrap items-baseline gap-2 p-4">
        <h2 id="health-issues" className="text-lg font-semibold tracking-tight">Issues</h2>
        {results.length > 0 && <p className="text-sm text-muted-foreground tabular-nums">{issues.length} reported</p>}
      </header>
      {issues.length === 0 ? (
        <p className="border-t border-border p-4 text-sm text-muted-foreground">
          {results.length > 0 ? "No warnings or errors reported." : "Issues appear after the first check."}
        </p>
      ) : (
        <ul className="divide-y divide-border border-t border-border">
          {issues.map((issue) => (
            <li key={issue.id} className="min-w-0 space-y-2 p-4 [overflow-wrap:anywhere]">
              <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                <h3 className="font-semibold">{issue.name}</h3>
                <p className={issue.status === "error" ? "text-sm font-medium text-destructive" : "text-sm font-medium text-amber-800 dark:text-amber-300"}>
                  {issue.status === "error" ? "Error" : "Warning"}
                </p>
              </div>
              <p className="text-sm text-muted-foreground">{issue.message}</p>
              <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground tabular-nums">
                <span className="capitalize">{issue.category}</span>
                {issue.lastChecked && <time dateTime={issue.lastChecked}>{checkedAt.format(new Date(issue.lastChecked))} UTC</time>}
                <span>{issue.responseTime == null ? "No response time" : issue.responseTime + " ms"}</span>
                <code>{issue.endpoint}</code>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
