import { createClient } from "@/utils/supabase/server";
import { StatusBadge } from "@/components/ui/status-badge";
import { Button } from "@/components/ui/button";
import { Plus } from "@/components/ui/icons";
import Link from "next/link";
import { redirect } from "next/navigation";
import { DashboardActivity } from "@/components/dashboard/dashboard-activity";
import { WorkspaceHeading } from "@/components/layout/workspace-heading";

const OPEN_STATUSES = [
  "submitted",
  "needs_info",
  "underwriting",
  "offer_prepared",
  "offer_sent",
  "in_contract",
  "funding",
];

// Group the open statuses returned by the dashboard preview query.
const BUCKETS: { id: string; title: string; statuses: string[] }[] = [
  { id: "new", title: "New", statuses: ["submitted", "needs_info"] },
  { id: "underwriting", title: "Underwriting", statuses: ["underwriting", "offer_prepared"] },
  { id: "offer", title: "Offer through funding", statuses: ["offer_sent", "in_contract", "funding"] },
];

type PropertyRef = { address: string | null; city: string | null; state: string | null };

interface BoardDeal {
  id: string;
  status: string;
  asking_price: number | null;
  submitted_at: string | null;
  // Supabase types embedded resources as arrays; at runtime it's a single object.
  property: PropertyRef | PropertyRef[] | null;
}

// Seven days back from "now", isolated in a helper so the render body
// stays free of impure clock reads.
function sevenDaysAgoIso(): string {
  return new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
}

export default async function DashboardPage() {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("role, organization_id")
    .eq("id", user.id)
    .single();

  const organizationId = profile?.organization_id;
  const showAllDeals = Boolean(organizationId) && (profile?.role === "admin" || profile?.role === "underwriter");

  const dealScope: Record<string, string> = {};
  if (organizationId) dealScope.organization_id = organizationId;
  if (!showAllDeals) dealScope.agent_id = user.id;

  const weekAgo = sevenDaysAgoIso();
  const countDeals = () => supabase.from("deals").select("id", { count: "exact" }).match(dealScope).limit(1);

  const [
    activeCountResult,
    closedCountResult,
    rejectedCountResult,
    pipelineResult,
    boardResult,
    scoresResult,
    weekResult,
  ] = await Promise.all([
    countDeals().in("status", OPEN_STATUSES),
    countDeals().eq("status", "closed"),
    countDeals().eq("status", "rejected"),

    // Pipeline value: asking price across all open statuses
    supabase.from("deals").select("asking_price").match(dealScope).in("status", OPEN_STATUSES),

    // Board cards: newest open deals, capped to keep the query cheap
    supabase.from("deals").select(`
          id, status, asking_price, submitted_at,
          property:properties(address, city, state)
        `).match(dealScope).in("status", OPEN_STATUSES).order("submitted_at", { ascending: false }).limit(48),

    // AI scores, for the average-score KPI
    supabase.from("deals").select("ai_score").match(dealScope).not("ai_score", "is", null),

    // Deals submitted in the last 7 days, for the weekly volume chart
    supabase.from("deals").select("submitted_at").match(dealScope).gte("submitted_at", weekAgo),
  ]);

  const closedCount = closedCountResult.count ?? 0;
  const rejectedCount = rejectedCountResult.count ?? 0;
  const pipelineDeals = pipelineResult.data ?? [];
  const pipelineValue = pipelineDeals.reduce(
    (sum, deal) => sum + (deal.asking_price ?? 0),
    0
  );
  const hasMissingPipelinePrices = pipelineDeals.some((deal) => deal.asking_price == null);
  const hasRecordedPipelinePrices = pipelineDeals.some((deal) => deal.asking_price != null);
  const boardDeals = (boardResult.data ?? []) as BoardDeal[];
  const scores = (scoresResult.data ?? []) as { ai_score: number | null }[];
  const weekDeals = (weekResult.data ?? []) as { submitted_at: string | null }[];

  const avgScore = scores.length
    ? (scores.reduce((sum, s) => sum + (s.ai_score || 0), 0) / scores.length).toFixed(1)
    : null;
  const winRate = closedCount + rejectedCount > 0
    ? Math.round((closedCount / (closedCount + rejectedCount)) * 100)
    : null;

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 0,
    }).format(amount);

  const formatCompact = (amount: number) =>
    new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      notation: "compact",
      maximumFractionDigits: 1,
    }).format(amount);

  // Monday-first weekday buckets for the weekly volume chart.
  const dayCounts = [0, 0, 0, 0, 0, 0, 0];
  for (const deal of weekDeals) {
    if (!deal.submitted_at) continue;
    const day = new Date(deal.submitted_at).getDay(); // 0 = Sunday
    dayCounts[(day + 6) % 7]++;
  }
  const maxDay = Math.max(...dayCounts);
  const dayLabels = ["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"];
  const dayNames = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

  const pipelineAmount = pipelineResult.error
    ? "Unavailable"
    : hasMissingPipelinePrices && !hasRecordedPipelinePrices
      ? "Not recorded"
      : formatCompact(pipelineValue);
  const decisionCountsUnavailable = [closedCountResult, rejectedCountResult].some(({ count, error }) => count == null || error);

  const kpis = [
    {
      label: "Pipeline asking price (USD)",
      value: pipelineAmount,
      hint: hasMissingPipelinePrices ? "Open deals with a recorded price" : "Open deals",
    },
    {
      label: "Active deals",
      value: activeCountResult.error || activeCountResult.count == null ? "Unavailable" : String(activeCountResult.count),
    },
    {
      label: "Average deal score",
      value: scoresResult.error ? "Unavailable" : avgScore ?? "Not scored",
      hint: scoresResult.error ? undefined : scores.length ? `${scores.length} AI-scored deals` : "No scores yet",
    },
    {
      label: "Win rate",
      value: decisionCountsUnavailable
        ? "Unavailable"
        : winRate !== null ? `${winRate}%` : "No decisions",
      hint: "Closed vs rejected, all time",
    },
  ];

  return (
    <div className="mx-auto min-w-0 max-w-7xl space-y-7">
      <WorkspaceHeading
        title="Dashboard"
        actions={
          <Button asChild className="min-h-11 rounded-lg transition-colors motion-safe:active:scale-[0.97]">
            <Link href="/dashboard/submit">
              <Plus aria-hidden="true" className="size-4" />
              New deal
            </Link>
          </Button>
        }
      />

      <section aria-labelledby="open-deals-heading" className="rounded-lg border border-border bg-card">
        <div className="flex flex-wrap items-center justify-between gap-x-4 border-b border-border px-4 py-2 sm:px-5">
          <h2 id="open-deals-heading" className="py-1 text-lg font-semibold tracking-tight">Recent open deals</h2>
          <Link
            href="/dashboard/deals"
            className="inline-flex min-h-11 items-center whitespace-nowrap rounded-lg text-sm font-medium text-primary hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
          >
            View all deals
          </Link>
        </div>

        {boardResult.error ? (
          <p role="alert" className="p-4 text-sm text-destructive sm:p-5">Couldn’t load recent open deals.</p>
        ) : boardDeals.length === 0 ? (
          <p className="p-4 text-sm text-muted-foreground sm:p-5">No open deals.</p>
        ) : (
        <div className="grid divide-y divide-border lg:grid-cols-3 lg:divide-x lg:divide-y-0">
          {BUCKETS.map((bucket) => {
            const items = boardDeals.filter((deal) => bucket.statuses.includes(deal.status));
            return (
              <section key={bucket.id} className="min-w-0">
                <div className="flex items-center justify-between gap-2 bg-muted/40 px-4 py-2.5 sm:px-5">
                  <h3 className="text-sm font-semibold">{bucket.title}</h3>
                  <span className="text-xs text-muted-foreground tabular-nums">{items.length}</span>
                </div>

                {items.length > 0 ? (
                  <ul className="divide-y divide-border">
                    {items.slice(0, 3).map((deal) => {
                      const property = Array.isArray(deal.property) ? deal.property[0] : deal.property;
                      const location = [property?.city, property?.state].filter(Boolean).join(", ");
                      return (
                        <li key={deal.id}>
                          <Link
                            href={`/dashboard/deals/${deal.id}`}
                            className="block px-4 py-3 text-sm transition-colors hover:bg-accent/50 focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-ring sm:px-5"
                          >
                            <p className="font-semibold leading-snug [overflow-wrap:anywhere]">{property?.address || "Address unavailable"}</p>
                            {location && <p className="text-xs text-muted-foreground [overflow-wrap:anywhere]">{location}</p>}
                            <div className="mt-2 flex flex-wrap items-center justify-between gap-2">
                              <StatusBadge status={deal.status} size="sm" />
                              <dl className="ms-auto min-w-0 text-end [overflow-wrap:anywhere]">
                                <dt className="text-xs text-muted-foreground">Asking price (USD)</dt>
                                <dd className="font-semibold tabular-nums">
                                  {deal.asking_price == null ? "Not recorded" : formatCurrency(deal.asking_price)}
                                </dd>
                              </dl>
                            </div>
                          </Link>
                        </li>
                      );
                    })}
                  </ul>
                ) : (
                  <p className="px-4 py-4 text-sm text-muted-foreground sm:px-5">No recent deals</p>
                )}

                {items.length > 3 && (
                  <p className="border-t border-border px-4 py-2 text-xs text-muted-foreground tabular-nums sm:px-5">
                    {items.length - 3} more
                  </p>
                )}
              </section>
            );
          })}
        </div>
        )}
      </section>

      <dl aria-label="Pipeline metrics" className="grid grid-cols-2 gap-px overflow-hidden rounded-lg border border-border bg-border lg:grid-cols-4">
        {kpis.map((kpi) => (
          <div key={kpi.label} className="min-w-0 bg-card p-3 sm:p-4">
            <dt className="text-sm font-medium text-muted-foreground">{kpi.label}</dt>
            <dd className="mt-1.5 text-xl font-semibold tracking-tight tabular-nums [overflow-wrap:anywhere] sm:text-2xl">{kpi.value}</dd>
            {kpi.hint && <dd className="mt-1 text-xs text-muted-foreground">{kpi.hint}</dd>}
          </div>
        ))}
      </dl>

      <div className="grid items-start gap-5 xl:grid-cols-[minmax(0,0.75fr)_minmax(0,1fr)]">
        <section aria-labelledby="weekly-volume-heading" className="min-w-0 rounded-lg border border-border bg-card p-4 sm:p-5">
          <h2 id="weekly-volume-heading" className="text-lg font-semibold tracking-tight">Weekly volume</h2>
          <p className="mt-0.5 text-xs text-muted-foreground">Deals submitted in the last 7 days</p>
          {weekResult.error ? (
            <p role="alert" className="mt-4 text-sm text-destructive">Couldn’t load weekly volume.</p>
          ) : maxDay === 0 ? (
            <p className="mt-4 text-sm text-muted-foreground">No deals submitted in the last 7 days.</p>
          ) : (
          <ol aria-label="Deals by weekday" className="mt-5 grid grid-cols-7 gap-2 sm:gap-3">
            {dayCounts.map((count, i) => (
              <li key={dayLabels[i]} className="min-w-0 text-center text-xs text-muted-foreground tabular-nums">
                <span className="sr-only">{dayNames[i]}, {count} deals</span>
                <div aria-hidden="true" className="flex h-36 flex-col items-center justify-end gap-1.5">
                  <span className="font-medium">{count || ""}</span>
                  <div
                    className={`w-full rounded-t-sm ${count > 0 ? "bg-primary" : "bg-border"}`}
                    style={{ height: `${Math.max((count / maxDay) * 100, 4)}%` }}
                  />
                </div>
                <span aria-hidden="true" className="mt-2 block">{dayLabels[i]}</span>
              </li>
            ))}
          </ol>
          )}
        </section>

        <DashboardActivity />
      </div>

    </div>
  );
}
