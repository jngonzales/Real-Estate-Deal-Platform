"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";

interface UsageData {
  tier: string;
  limits: {
    dealsPerMonth: number;
    aiScoresPerMonth: number;
    propertyLookupsPerDay: number;
    formulasAllowed: number;
    teamMembersAllowed: number;
  };
  stats: {
    dealsThisMonth: number;
    aiScoresThisMonth: number;
    propertyLookupsToday: number;
    formulasSaved: number;
    teamMembers: number;
    resetDate: string;
  };
  percentages: {
    deals: number;
    aiScores: number;
    lookups: number;
    formulas: number;
    teamMembers: number;
  };
}

const tierLabels = {
  free: "Free",
  basic: "Basic",
  pro: "Pro",
  enterprise: "Enterprise"
};

export function UsageDashboard() {
  const [usage, setUsage] = useState<UsageData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchUsage = useCallback(() => {
    return fetch("/api/usage").then(async (response) => {
      if (!response.ok) throw new Error("Failed to fetch usage");
      const data = await response.json();
      setUsage(data);
    }).catch((err) => {
      setError(err instanceof Error ? err.message : "An error occurred");
    }).finally(() => {
      setLoading(false);
    });
  }, []);

  useEffect(() => { void fetchUsage(); }, [fetchUsage]);

  const retryUsage = () => {
    setLoading(true);
    setError(null);
    void fetchUsage();
  };

  if (loading) {
    return <p role="status" className="text-muted-foreground">Loading usage…</p>;
  }

  if (error || !usage) {
    return (
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-destructive/40 p-4">
        <p role="alert">Usage data could not be loaded.</p>
        <Button variant="outline" className="min-h-11" onClick={retryUsage}>Try again</Button>
      </div>
    );
  }

  const resetDate = new Date(usage.stats.resetDate);
  const daysUntilReset = Math.ceil((resetDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24));

  const usageItems = [
    {
      label: "Deals analyzed",
      used: usage.stats.dealsThisMonth,
      limit: usage.limits.dealsPerMonth,
      percentage: usage.percentages.deals,
      period: "this month"
    },
    {
      label: "AI scores",
      used: usage.stats.aiScoresThisMonth,
      limit: usage.limits.aiScoresPerMonth,
      percentage: usage.percentages.aiScores,
      period: "this month"
    },
    {
      label: "Property lookups",
      used: usage.stats.propertyLookupsToday,
      limit: usage.limits.propertyLookupsPerDay,
      percentage: usage.percentages.lookups,
      period: "today"
    },
    {
      label: "Saved formulas",
      used: usage.stats.formulasSaved,
      limit: usage.limits.formulasAllowed,
      percentage: usage.percentages.formulas,
      period: "total"
    },
    {
      label: "Team members",
      used: usage.stats.teamMembers,
      limit: usage.limits.teamMembersAllowed,
      percentage: usage.percentages.teamMembers,
      period: "seats"
    }
  ];

  return (
    <div className="space-y-4">
      <section aria-labelledby="current-plan" className="rounded-lg border border-border bg-card p-4 sm:p-6">
        <h2 id="current-plan" className="text-lg font-semibold">Current plan</h2>
        <div className="mt-3 flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="font-medium">{tierLabels[usage.tier as keyof typeof tierLabels] ?? usage.tier}</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Monthly reset in {daysUntilReset} {daysUntilReset === 1 ? "day" : "days"}
            </p>
          </div>
          {usage.tier === "free" && (
            <Button asChild variant="outline" className="min-h-11">
              <Link href="/pricing">Compare plans</Link>
            </Button>
          )}
        </div>
      </section>

      <section aria-labelledby="usage-title" className="rounded-lg border border-border bg-card">
        <h2 id="usage-title" className="p-4 text-lg font-semibold sm:px-6">Usage</h2>
        <ul className="divide-y divide-border border-t border-border">
          {usageItems.map((item) => {
            const unlimited = item.limit >= 999999;
            const isAtLimit = item.percentage >= 100;
            const isNearLimit = item.percentage >= 80;

            return (
              <li key={item.label} className="grid gap-2 p-4 sm:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] sm:gap-x-4 sm:px-6">
                <div>
                  <h3 className="font-medium">{item.label}</h3>
                  <p className="text-sm text-muted-foreground">{item.period}</p>
                </div>
                <div className="space-y-1.5">
                  <p className="break-words text-sm tabular-nums sm:text-end">
                    <span className="font-semibold">{item.used.toLocaleString()}</span>
                    <span className="text-muted-foreground">
                      {unlimited ? " used · Unlimited" : " of " + item.limit.toLocaleString() + " used"}
                    </span>
                  </p>
                  {!unlimited && (
                    <Progress
                      value={Math.min(100, item.percentage)}
                      aria-label={item.label + " usage"}
                      className={"h-2 [&>div]:motion-reduce:transition-none " + (isAtLimit ? "[&>div]:bg-destructive" : isNearLimit ? "[&>div]:bg-amber-500" : "")}
                    />
                  )}
                  {isAtLimit ? (
                    <p className="text-sm text-muted-foreground sm:text-end">Limit reached</p>
                  ) : isNearLimit ? (
                    <p className="text-sm text-muted-foreground sm:text-end">Near the limit</p>
                  ) : null}
                </div>
              </li>
            );
          })}
        </ul>
      </section>
    </div>
  );
}
