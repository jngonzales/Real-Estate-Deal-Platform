import type { HealthResult } from "@/lib/health-checks";

export function HealthMetrics({ results }: { results: HealthResult[] }) {
  const count = results.length;
  const healthy = results.filter((result) => result.status === "healthy").length;
  const warnings = results.filter((result) => result.status === "warning").length;
  const errors = results.filter((result) => result.status === "error").length;
  const unknown = count - healthy - warnings - errors;
  const responseTimes = results.flatMap((result) => result.responseTime == null ? [] : [result.responseTime]);
  const average = responseTimes.length
    ? Math.round(responseTimes.reduce((sum, time) => sum + time, 0) / responseTimes.length)
    : null;
  const metrics = [
    { label: "Healthy endpoints", value: count ? Math.round((healthy / count) * 100) + "%" : "Awaiting checks", hint: healthy + " healthy" },
    { label: "Warnings", value: warnings },
    { label: "Errors", value: errors },
    { label: "Unknown", value: unknown },
    { label: "Average response time", value: average == null ? "Unavailable" : average + " ms" },
    { label: "Endpoints checked", value: count },
  ];

  return (
    <dl aria-label="Health check totals" className="grid grid-cols-2 gap-px overflow-hidden rounded-lg border border-border bg-border sm:grid-cols-3 xl:grid-cols-6">
      {metrics.map(({ label, value, hint }) => (
        <div key={label} className="min-w-0 bg-card p-4 [overflow-wrap:anywhere]">
          <dt className="text-sm text-muted-foreground">{label}</dt>
          <dd className="mt-1 text-lg font-semibold tabular-nums sm:text-xl">{value}</dd>
          {count > 0 && hint && <dd className="mt-1 text-xs text-muted-foreground tabular-nums">{hint}</dd>}
        </div>
      ))}
    </dl>
  );
}
