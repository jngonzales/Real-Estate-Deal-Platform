import { createClient } from "@/utils/supabase/server";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { DollarSign, Activity, BarChart3, Trophy, ArrowRight, Plus, Calculator, FileText, Building2 } from "@/components/ui/icons";
import Link from "next/link";
import { DashboardActivity } from "@/components/dashboard/dashboard-activity";

const OPEN_STATUSES = [
  "submitted",
  "needs_info",
  "underwriting",
  "offer_prepared",
  "offer_sent",
  "in_contract",
  "funding",
];

// The nine pipeline statuses collapse into four board columns.
const BUCKETS: { id: string; title: string; statuses: string[] }[] = [
  { id: "new", title: "New", statuses: ["submitted", "needs_info"] },
  { id: "underwriting", title: "Underwriting", statuses: ["underwriting", "offer_prepared"] },
  { id: "offer", title: "Offer Sent", statuses: ["offer_sent", "in_contract", "funding"] },
  { id: "closed", title: "Closed", statuses: ["closed"] },
];

const STATUS_LABELS: Record<string, string> = {
  submitted: "Submitted",
  needs_info: "Needs Info",
  underwriting: "Underwriting",
  offer_prepared: "Offer Ready",
  offer_sent: "Offer Sent",
  in_contract: "In Contract",
  funding: "Funding",
  closed: "Closed",
  rejected: "Rejected",
};

type PropertyRef = { address: string | null; city: string | null; state: string | null };

interface BoardDeal {
  id: string;
  status: string;
  asking_price: number | null;
  submitted_at: string | null;
  // Supabase types embedded resources as arrays; at runtime it's a single object.
  property: PropertyRef | PropertyRef[] | null;
}

function StatusPill({ status }: { status: string }) {
  const label = STATUS_LABELS[status] ?? status;
  if (status === "closed") {
    return (
      <span className="shrink-0 rounded-full bg-primary/15 px-2 py-0.5 text-[11px] font-medium text-primary">
        {label}
      </span>
    );
  }
  if (status === "needs_info") {
    return (
      <span className="shrink-0 rounded-full bg-amber-500/15 px-2 py-0.5 text-[11px] font-medium text-amber-700 dark:text-amber-400">
        {label}
      </span>
    );
  }
  if (status === "rejected") {
    return (
      <span className="shrink-0 rounded-full bg-destructive/15 px-2 py-0.5 text-[11px] font-medium text-destructive">
        {label}
      </span>
    );
  }
  return (
    <span className="shrink-0 rounded-full bg-secondary px-2 py-0.5 text-[11px] font-medium text-secondary-foreground">
      {label}
    </span>
  );
}

// Seven days back from "now", isolated in a helper so the render body
// stays free of impure clock reads.
function sevenDaysAgoIso(): string {
  return new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
}

export default async function DashboardPage() {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user?.id)
    .single();

  const isAdmin = profile?.role === "admin";
  const isUnderwriter = profile?.role === "underwriter";
  const showAllDeals = isAdmin || isUnderwriter;
  const agentFilter = !showAllDeals ? user?.id : null;

  const weekAgo = sevenDaysAgoIso();

  const [
    dealsCountResult,
    closedCountResult,
    rejectedCountResult,
    pipelineResult,
    boardResult,
    scoresResult,
    weekResult,
  ] = await Promise.all([
    agentFilter
      ? supabase.from("deals").select("*", { count: "exact", head: true }).eq("agent_id", agentFilter)
      : supabase.from("deals").select("*", { count: "exact", head: true }),

    agentFilter
      ? supabase.from("deals").select("*", { count: "exact", head: true }).eq("status", "closed").eq("agent_id", agentFilter)
      : supabase.from("deals").select("*", { count: "exact", head: true }).eq("status", "closed"),

    agentFilter
      ? supabase.from("deals").select("*", { count: "exact", head: true }).eq("status", "rejected").eq("agent_id", agentFilter)
      : supabase.from("deals").select("*", { count: "exact", head: true }).eq("status", "rejected"),

    // Pipeline value: asking price across all open statuses
    agentFilter
      ? supabase.from("deals").select("asking_price").in("status", OPEN_STATUSES).eq("agent_id", agentFilter)
      : supabase.from("deals").select("asking_price").in("status", OPEN_STATUSES),

    // Board cards: newest open deals, capped to keep the query cheap
    agentFilter
      ? supabase.from("deals").select(`
          id, status, asking_price, submitted_at,
          property:properties(address, city, state)
        `).in("status", OPEN_STATUSES).eq("agent_id", agentFilter).order("submitted_at", { ascending: false }).limit(48)
      : supabase.from("deals").select(`
          id, status, asking_price, submitted_at,
          property:properties(address, city, state)
        `).in("status", OPEN_STATUSES).order("submitted_at", { ascending: false }).limit(48),

    // AI scores, for the average-score KPI
    agentFilter
      ? supabase.from("deals").select("ai_score").not("ai_score", "is", null).eq("agent_id", agentFilter)
      : supabase.from("deals").select("ai_score").not("ai_score", "is", null),

    // Deals submitted in the last 7 days, for the weekly volume chart
    agentFilter
      ? supabase.from("deals").select("submitted_at").gte("submitted_at", weekAgo).eq("agent_id", agentFilter)
      : supabase.from("deals").select("submitted_at").gte("submitted_at", weekAgo),
  ]);

  const dealsCount = dealsCountResult.count ?? 0;
  const closedCount = closedCountResult.count ?? 0;
  const rejectedCount = rejectedCountResult.count ?? 0;
  const pipelineValue = (pipelineResult.data ?? []).reduce(
    (sum, deal) => sum + (deal.asking_price || 0),
    0
  );
  const boardDeals = (boardResult.data ?? []) as BoardDeal[];
  const scores = (scoresResult.data ?? []) as { ai_score: number | null }[];
  const weekDeals = (weekResult.data ?? []) as { submitted_at: string | null }[];

  const activeDeals = Math.max(dealsCount - closedCount - rejectedCount, 0);
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

  const kpis = [
    {
      label: "Pipeline Value",
      value: formatCompact(pipelineValue),
      hint: "Open deals, asking price",
      icon: DollarSign,
    },
    {
      label: "Active Deals",
      value: String(activeDeals),
      hint: "Not closed or rejected",
      icon: Activity,
    },
    {
      label: "Avg Deal Score",
      value: avgScore ?? "—",
      hint: scores.length ? `${scores.length} AI-scored deals` : "No scores yet",
      icon: BarChart3,
    },
    {
      label: "Win Rate",
      value: winRate !== null ? `${winRate}%` : "—",
      hint: "Closed vs rejected, all time",
      icon: Trophy,
    },
  ];

  return (
    <div className="space-y-6 p-4 md:p-6">
      {/* Header */}
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Dashboard</h1>
          <p className="text-muted-foreground">
            {showAllDeals ? "Company-wide pipeline overview" : "Your deal pipeline at a glance"}
          </p>
        </div>
        <Button asChild>
          <Link href="/dashboard/submit">
            <Plus className="mr-1 h-4 w-4" />
            New Deal
          </Link>
        </Button>
      </div>

      {/* KPI cards */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {kpis.map((kpi) => {
          const Icon = kpi.icon;
          return (
            <Card key={kpi.label} className="border-border bg-card p-5">
              <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                <Icon className="h-4 w-4 text-primary" />
                {kpi.label}
              </div>
              <p className="mt-2 text-3xl font-bold tracking-tight text-foreground">
                {kpi.value}
              </p>
              <p className="mt-1 text-xs text-muted-foreground">{kpi.hint}</p>
            </Card>
          );
        })}
      </div>

      {/* Pipeline board + weekly volume */}
      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="border-border bg-card lg:col-span-2">
          <div className="flex items-center justify-between border-b border-border px-5 py-4">
            <h2 className="font-semibold text-foreground">Pipeline</h2>
            <Link
              href="/dashboard/deals"
              className="inline-flex items-center gap-1 text-sm font-medium text-primary transition-colors hover:text-primary/80"
            >
              View all
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="grid gap-px overflow-hidden rounded-b-xl bg-border sm:grid-cols-2 lg:grid-cols-4">
            {BUCKETS.map((bucket) => {
              const items = boardDeals.filter((deal) =>
                bucket.statuses.includes(deal.status)
              );
              return (
                <div key={bucket.id} className="min-h-[240px] space-y-2 bg-card p-4">
                  <div className="flex items-center justify-between px-1">
                    <h3 className="text-sm font-medium text-muted-foreground">
                      {bucket.title}
                    </h3>
                    <span className="text-xs text-muted-foreground">{items.length}</span>
                  </div>
                  {items.slice(0, 3).map((deal) => {
                    const property = Array.isArray(deal.property)
                      ? deal.property[0]
                      : deal.property;
                    return (
                      <Link
                        key={deal.id}
                        href={`/dashboard/deals/${deal.id}`}
                        className="block rounded-lg border border-border bg-background p-3 transition-colors hover:border-primary/50"
                      >
                        <p className="line-clamp-2 text-sm font-medium leading-snug text-foreground">
                          {property?.address || "Unknown address"}
                        </p>
                        <div className="mt-2 flex items-center justify-between gap-2">
                          <span className="text-sm font-semibold text-foreground">
                            {formatCurrency(deal.asking_price || 0)}
                          </span>
                          <StatusPill status={deal.status} />
                        </div>
                      </Link>
                    );
                  })}
                  {items.length > 3 && (
                    <p className="px-1 text-xs text-muted-foreground">
                      +{items.length - 3} more
                    </p>
                  )}
                  {items.length === 0 && (
                    <p className="px-1 text-xs text-muted-foreground/70">No deals</p>
                  )}
                </div>
              );
            })}
          </div>
        </Card>

        <Card className="border-border bg-card p-5">
          <h2 className="font-semibold text-foreground">Weekly Volume</h2>
          <p className="mt-0.5 text-xs text-muted-foreground">Deals submitted, last 7 days</p>
          <div className="mt-6 flex h-44 items-end gap-3">
            {dayCounts.map((count, i) => (
              <div key={i} className="flex h-full flex-1 flex-col items-center justify-end gap-2">
                <span className="text-xs font-medium text-muted-foreground">{count || ""}</span>
                <div
                  className={`w-full rounded-t-[3px] ${maxDay > 0 ? "bg-primary/85" : "bg-border"}`}
                  style={{ height: maxDay > 0 ? `${Math.max((count / maxDay) * 100, 4)}%` : "6%" }}
                />
              </div>
            ))}
          </div>
          <div className="mt-2 flex gap-3">
            {dayLabels.map((label) => (
              <span key={label} className="flex-1 text-center text-xs text-muted-foreground">
                {label}
              </span>
            ))}
          </div>
          {maxDay === 0 && (
            <p className="mt-4 text-center text-xs text-muted-foreground">
              No deals submitted this week
            </p>
          )}
        </Card>
      </div>

      {/* Activity Feed */}
      <DashboardActivity />

      {/* Getting Started */}
      <Card className="border-border bg-card">
        <div className="grid gap-4 p-6 sm:grid-cols-3">
          <div className="rounded-lg border border-border bg-background p-6">
            <div className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
              <FileText className="h-5 w-5 text-primary" />
            </div>
            <h4 className="mb-2 font-semibold text-foreground">Submit Deals</h4>
            <p className="text-sm text-muted-foreground">
              Add property details and seller information to begin the review process.
            </p>
          </div>

          <div className="rounded-lg border border-border bg-background p-6">
            <div className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
              <Calculator className="h-5 w-5 text-primary" />
            </div>
            <h4 className="mb-2 font-semibold text-foreground">Underwriting</h4>
            <p className="text-sm text-muted-foreground">
              Calculate maximum allowable offer using ARV and repair estimates.
            </p>
          </div>

          <div className="rounded-lg border border-border bg-background p-6">
            <div className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
              <Building2 className="h-5 w-5 text-primary" />
            </div>
            <h4 className="mb-2 font-semibold text-foreground">Track Progress</h4>
            <p className="text-sm text-muted-foreground">
              Monitor your deals through each stage of the pipeline.
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
}
