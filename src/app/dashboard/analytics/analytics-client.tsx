"use client";

import { XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from "recharts";
import { StatusBadge } from "@/components/ui/status-badge";
import { PredictiveMetrics } from "@/components/analytics/predictive-metrics";

interface AnalyticsClientProps {
  metrics: {
    totalDeals: number;
    activeDeals: number;
    closedDeals: number;
    rejectedDeals: number;
    totalPipelineValue: number;
    totalClosedValue: number;
    avgDaysInPipeline: number;
    conversionRate: number;
  };
  statusCounts: Record<string, number>;
  agentPerformance: {
    id: string;
    name: string;
    totalDeals: number;
    closedDeals: number;
    activeDeals: number;
    closedValue: number;
    conversionRate: number;
  }[];
  monthlyData: {
    month: string;
    submitted: number;
    closed: number;
    value: number;
  }[];
  propertyTypes: Record<string, number>;
  agentDataUnavailable: boolean;
}

const propertyTypeLabels: Record<string, string> = {
  single_family: "Single family",
  multi_family: "Multi-family",
  condo: "Condo",
  townhouse: "Townhouse",
  land: "Land",
  commercial: "Commercial",
  other: "Other",
};

const usd = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});

const panelClass = "min-w-0 rounded-lg border border-border bg-card p-4 sm:p-5";
const tick = { fontSize: 12, fill: "var(--muted-foreground)" };
const axis = { stroke: "var(--border)" };

export function AnalyticsClient({
  metrics,
  statusCounts,
  agentPerformance,
  monthlyData,
  propertyTypes,
  agentDataUnavailable,
}: AnalyticsClientProps) {
  const summaries = [
    { label: "Pipeline asking price (USD)", value: usd.format(metrics.totalPipelineValue), note: metrics.activeDeals + " active deals" },
    { label: "Closed deal value (USD)", value: usd.format(metrics.totalClosedValue), note: metrics.closedDeals + " closed deals" },
    { label: "Conversion rate", value: metrics.totalDeals ? metrics.conversionRate + "%" : "No deals", note: "Closed deals as a share of all deals" },
    { label: "Average time to close", value: metrics.closedDeals ? metrics.avgDaysInPipeline + " days" : "No closed deals", note: "From submission to close" },
  ];
  const stages = Object.entries(statusCounts);
  const types = Object.entries(propertyTypes);
  const highestTypeCount = Math.max(1, ...types.map(([, count]) => count));
  const hasMonthlyActivity = monthlyData.some((month) => month.submitted > 0 || month.closed > 0);

  return (
    <div className="space-y-6">
      <dl aria-label="Pipeline totals" className="grid grid-cols-2 gap-px overflow-hidden rounded-lg border border-border bg-border xl:grid-cols-4">
        {summaries.map(({ label, value, note }) => (
          <div key={label} className="min-w-0 bg-card p-4 [overflow-wrap:anywhere]">
            <dt className="text-sm text-muted-foreground">{label}</dt>
            <dd className="mt-1 text-xl font-semibold tabular-nums sm:text-2xl">{value}</dd>
            <dd className="mt-1 text-xs text-muted-foreground">{note}</dd>
          </div>
        ))}
      </dl>

      <div className="grid min-w-0 gap-4 xl:grid-cols-[minmax(0,1.35fr)_minmax(0,1fr)]">
        <section aria-labelledby="monthly-deals" className={panelClass}>
          <h2 id="monthly-deals" className="text-lg font-semibold tracking-tight">Monthly deal activity</h2>
          <p className="mt-1 text-sm text-muted-foreground">Submitted and closed deals over the past six months.</p>
          {hasMonthlyActivity ? (
            <>
              <div className="mt-4 flex flex-wrap gap-x-4 gap-y-2 text-sm">
                <span className="flex items-center gap-2"><span aria-hidden="true" className="w-5 border-t-2 border-primary" />Submitted</span>
                <span className="flex items-center gap-2"><span aria-hidden="true" className="w-5 border-t-2 border-dashed border-muted-foreground" />Closed</span>
              </div>
              <div className="mt-3 h-56 min-w-0">
                <ResponsiveContainer width="100%" height="100%" minWidth={0}>
                  <LineChart data={monthlyData} accessibilityLayer margin={{ right: 12, left: 0 }}>
                    <CartesianGrid vertical={false} stroke="var(--border)" />
                    <XAxis dataKey="month" tick={tick} axisLine={axis} tickLine={false} />
                    <YAxis width={32} allowDecimals={false} tick={tick} axisLine={axis} tickLine={false} />
                    <Tooltip contentStyle={{ background: "var(--card)", color: "var(--foreground)", borderColor: "var(--border)", borderRadius: 8 }} />
                    <Line dataKey="submitted" name="Submitted" stroke="var(--primary)" strokeWidth={2} dot={false} isAnimationActive={false} />
                    <Line dataKey="closed" name="Closed" stroke="var(--muted-foreground)" strokeWidth={2} strokeDasharray="5 4" dot={false} isAnimationActive={false} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
              <details className="mt-2 border-t border-border">
                <summary className="flex min-h-11 cursor-pointer items-center rounded-sm text-sm font-medium text-primary hover:underline focus-visible:outline-2 focus-visible:outline-ring">
                  Monthly counts
                </summary>
                <table className="w-full text-sm tabular-nums">
                  <caption className="sr-only">Submitted and closed deals by month</caption>
                  <thead className="text-muted-foreground">
                    <tr>
                      <th scope="col" className="py-2 text-start font-medium">Month</th>
                      <th scope="col" className="py-2 text-end font-medium">Submitted</th>
                      <th scope="col" className="py-2 text-end font-medium">Closed</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {monthlyData.map((month) => (
                      <tr key={month.month}>
                        <th scope="row" className="py-2 text-start font-normal">{month.month}</th>
                        <td className="py-2 text-end">{month.submitted}</td>
                        <td className="py-2 text-end">{month.closed}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </details>
            </>
          ) : (
            <p className="mt-4 text-sm text-muted-foreground">No deals submitted or closed in this period.</p>
          )}
        </section>

        <section aria-labelledby="analytics-deal-stages" className={panelClass}>
          <h2 id="analytics-deal-stages" className="text-lg font-semibold tracking-tight">Deals by stage</h2>
          <p className="mt-1 text-sm text-muted-foreground tabular-nums">{metrics.totalDeals} total · {metrics.rejectedDeals} rejected</p>
          {stages.length > 0 ? (
            <dl className="mt-3 divide-y divide-border">
              {stages.map(([status, count]) => (
                <div key={status} className="flex items-center justify-between gap-3 py-2">
                  <dt className="min-w-0"><StatusBadge status={status} /></dt>
                  <dd className="text-end text-sm font-semibold tabular-nums">{count}</dd>
                </div>
              ))}
            </dl>
          ) : (
            <p className="mt-4 text-sm text-muted-foreground">No deals to group by stage.</p>
          )}
        </section>
      </div>

      <div className="grid min-w-0 gap-4 xl:grid-cols-2">
        <section aria-labelledby="agent-performance" className={panelClass}>
          <h2 id="agent-performance" className="text-lg font-semibold tracking-tight">Agent performance</h2>
          {agentDataUnavailable ? (
            <p className="mt-3 text-sm text-destructive">Couldn’t load agents.</p>
          ) : agentPerformance.length > 0 ? (
            <ul className="mt-3 divide-y divide-border">
              {agentPerformance.slice(0, 5).map((agent) => (
                <li key={agent.id} className="flex min-w-0 flex-wrap items-baseline justify-between gap-2 py-3 [overflow-wrap:anywhere]">
                  <div className="min-w-0">
                    <h3 className="text-sm font-semibold">{agent.name}</h3>
                    <p className="text-xs text-muted-foreground tabular-nums">
                      {agent.totalDeals} deals · {agent.closedDeals} closed · {agent.conversionRate}% closed
                    </p>
                  </div>
                  <dl className="ms-auto min-w-0 text-end">
                    <dt className="text-xs text-muted-foreground">Closed value (USD)</dt>
                    <dd className="text-sm font-semibold tabular-nums">{usd.format(agent.closedValue)}</dd>
                  </dl>
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-3 text-sm text-muted-foreground">No agents to report.</p>
          )}
        </section>

        <section aria-labelledby="analytics-property-types" className={panelClass}>
          <h2 id="analytics-property-types" className="text-lg font-semibold tracking-tight">Deals by property type</h2>
          {types.length > 0 ? (
            <dl className="mt-4 space-y-3">
              {types.map(([type, count]) => (
                <div key={type}>
                  <div className="flex items-baseline justify-between gap-2 text-sm">
                    <dt className="min-w-0 [overflow-wrap:anywhere]">{propertyTypeLabels[type] || type}</dt>
                    <dd className="font-semibold tabular-nums">{count}</dd>
                  </div>
                  <div aria-hidden="true" className="mt-1 h-1.5 rounded-full bg-muted">
                    <div className="h-full rounded-full bg-primary" style={{ width: (count / highestTypeCount) * 100 + "%" }} />
                  </div>
                </div>
              ))}
            </dl>
          ) : (
            <p className="mt-3 text-sm text-muted-foreground">No deals to group by property type.</p>
          )}
        </section>
      </div>

      {hasMonthlyActivity && <PredictiveMetrics historicalData={monthlyData} />}
    </div>
  );
}
