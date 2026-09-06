import type { HealthResult } from "@/lib/health-checks";
import { ExternalLink } from "@/components/ui/icons";

const statuses = {
  healthy: { label: "Healthy", style: "border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-800 dark:bg-emerald-900/20 dark:text-emerald-300" },
  warning: { label: "Warning", style: "border-amber-200 bg-amber-50 text-amber-800 dark:border-amber-800 dark:bg-amber-900/20 dark:text-amber-300" },
  error: { label: "Error", style: "border-destructive/30 bg-destructive/10 text-destructive" },
  unknown: { label: "Unknown", style: "border-border bg-muted text-muted-foreground" },
};

export function StatusGrid({ results, isLoading }: { results: HealthResult[]; isLoading: boolean }) {
  if (results.length === 0) {
    return (
      <p className="rounded-lg border border-border bg-card p-4 text-sm text-muted-foreground">
        {isLoading ? "Checking endpoints…" : "No checks match this filter."}
      </p>
    );
  }

  return (
    <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {results.map((result) => {
        const status = statuses[result.status];
        return (
          <li key={result.id} className="flex min-w-0 flex-col gap-2 rounded-lg border border-border bg-card p-4 [overflow-wrap:anywhere]">
            <div className="flex flex-wrap items-start justify-between gap-2">
              <h3 className="font-semibold">{result.name}</h3>
              <span className={"rounded-md border px-2 py-0.5 text-xs font-medium " + status.style}>{status.label}</span>
            </div>
            <p className="text-sm text-muted-foreground">{result.message}</p>
            <dl className="mt-auto space-y-1 border-t border-border pt-2 text-sm">
              <div className="flex flex-wrap items-baseline justify-between gap-x-2">
                <dt className="text-muted-foreground">Category</dt>
                <dd className="capitalize">{result.category}</dd>
              </div>
              <div className="flex flex-wrap items-baseline justify-between gap-x-2">
                <dt className="text-muted-foreground">Response time</dt>
                <dd className="tabular-nums">{result.responseTime == null ? "Unavailable" : result.responseTime + " ms"}</dd>
              </div>
            </dl>
            <a
              href={result.endpoint}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex min-h-11 items-center gap-1.5 self-start rounded-sm text-sm font-medium text-primary hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
            >
              Open endpoint<span className="sr-only"> for {result.name} (opens in a new tab)</span>
              <ExternalLink aria-hidden="true" className="size-3.5" />
            </a>
          </li>
        );
      })}
    </ul>
  );
}
