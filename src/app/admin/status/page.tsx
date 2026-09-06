"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { healthChecks, runHealthCheck, type HealthResult } from "@/lib/health-checks";
import { StatusGrid } from "@/components/status-checker/status-grid";
import { HealthMetrics } from "@/components/status-checker/health-metrics";
import { ErrorLog } from "@/components/status-checker/error-log";
import { ArrowLeft, Download, RefreshCw } from "@/components/ui/icons";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { WorkspaceHeading } from "@/components/layout/workspace-heading";
import Link from "next/link";

const categories = {
  all: "All checks",
  issues: "Issues",
  api: "API",
  database: "Database",
  feature: "Feature",
  integration: "Integration",
};
type CheckFilter = keyof typeof categories;
const filters = Object.keys(categories) as CheckFilter[];
const checkedAt = new Intl.DateTimeFormat("en-US", { timeStyle: "medium", timeZone: "UTC" });

export default function StatusPage() {
  const [results, setResults] = useState<HealthResult[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [lastCheck, setLastCheck] = useState<Date | null>(null);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [filter, setFilter] = useState<CheckFilter>("all");
  const [checkError, setCheckError] = useState(false);
  const checking = useRef(false);

  const runChecks = useCallback(async () => {
    if (checking.current) return;
    checking.current = true;
    setIsLoading(true);
    setCheckError(false);

    try {
      const nextResults: HealthResult[] = [];
      // Run each check sequentially to avoid overwhelming the server.
      for (const check of healthChecks) nextResults.push(await runHealthCheck(check));
      setResults(nextResults);
      setLastCheck(new Date());
    } catch {
      setCheckError(true);
    } finally {
      checking.current = false;
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(runChecks, 100);
    return () => clearTimeout(timer);
  }, [runChecks]);

  useEffect(() => {
    if (!autoRefresh) return;
    const interval = setInterval(runChecks, 30000);
    return () => clearInterval(interval);
  }, [autoRefresh, runChecks]);

  const filteredResults = results.filter((result) => {
    if (filter === "all") return true;
    if (filter === "issues") return result.status === "error" || result.status === "warning";
    return result.category === filter;
  });
  const issueCount = results.filter((result) => result.status === "error" || result.status === "warning").length;

  const exportResults = () => {
    const data = {
      timestamp: new Date().toISOString(),
      results,
      summary: {
        total: results.length,
        healthy: results.filter((result) => result.status === "healthy").length,
        warning: results.filter((result) => result.status === "warning").length,
        error: results.filter((result) => result.status === "error").length,
      },
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "health-check-" + new Date().toISOString().split("T")[0] + ".json";
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <main className="mx-auto min-w-0 max-w-7xl space-y-6 p-4 sm:p-6">
      <Link href="/dashboard" className="inline-flex min-h-11 items-center gap-2 rounded-sm text-sm font-medium text-primary hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring">
        <ArrowLeft aria-hidden="true" className="size-4" />
        Dashboard
      </Link>
      <WorkspaceHeading
        title="System status"
        actions={
          <>
            <Button variant="outline" className="min-h-11" onClick={exportResults} disabled={results.length === 0}>
              <Download aria-hidden="true" className="size-4" />
              Export JSON
            </Button>
            <Button className="min-h-11" onClick={runChecks} disabled={isLoading}>
              <RefreshCw aria-hidden="true" className="size-4" />
              {isLoading ? "Checking…" : "Refresh checks"}
            </Button>
          </>
        }
      />

      <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2 border-y border-border">
        <p role="status" className="text-sm text-muted-foreground tabular-nums">
          {isLoading ? "Checking endpoints…" : lastCheck && <>Last checked <time dateTime={lastCheck.toISOString()}>{checkedAt.format(lastCheck)} UTC</time></>}
        </p>
        <div className="flex items-center gap-2">
          <Switch id="auto-refresh" checked={autoRefresh} onCheckedChange={setAutoRefresh} />
          <Label htmlFor="auto-refresh" className="flex min-h-11 cursor-pointer items-center text-sm">Auto-refresh every 30 seconds</Label>
        </div>
      </div>
      <p role="alert" className={checkError ? "text-sm text-destructive" : "sr-only"}>
        {checkError && "Couldn’t complete the health checks. Refresh to try again."}
      </p>

      <HealthMetrics results={results} />

      <section aria-labelledby="status-endpoints" className="space-y-3">
        <h2 id="status-endpoints" className="text-lg font-semibold tracking-tight">Endpoint checks</h2>
        <div role="group" aria-label="Filter endpoint checks" className="flex flex-wrap gap-2">
          {filters.map((category) => (
            <Button
              key={category}
              variant={filter === category ? "default" : "outline"}
              aria-pressed={filter === category}
              className="min-h-11"
              onClick={() => setFilter(category)}
            >
              {categories[category]}
              {category === "issues" && <span className="tabular-nums">({issueCount})</span>}
            </Button>
          ))}
        </div>
        <StatusGrid results={filteredResults} isLoading={isLoading} />
      </section>

      <ErrorLog results={results} />
    </main>
  );
}
