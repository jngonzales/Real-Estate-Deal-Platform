"use client";

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

interface PredictiveMetricsProps {
  historicalData: Array<{
    month: string;
    closed: number;
    value: number;
  }>;
}

const usd = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});
const tick = { fontSize: 12, fill: "var(--muted-foreground)" };

export function PredictiveMetrics({ historicalData }: PredictiveMetricsProps) {
  if (!historicalData.some((month) => month.closed > 0)) {
    return (
      <section aria-labelledby="forecast-title" className="rounded-lg border border-border bg-card p-4 sm:p-5">
        <h2 id="forecast-title" className="text-lg font-semibold tracking-tight">90-day forecast</h2>
        <p className="mt-1 text-sm text-muted-foreground">There are no recent closed deals to forecast from.</p>
      </section>
    );
  }

  const predictions = calculatePredictions(historicalData);
  const trend = calculateTrend(historicalData);
  const recent = historicalData.slice(-6);
  const chartData = [
    ...recent.map((month, index) => ({
      month: month.month,
      actual: month.closed,
      forecast: index === recent.length - 1 ? month.closed : null,
    })),
    ...predictions.map((prediction, index) => ({
      month: "+" + (index + 1) + "m",
      actual: null,
      forecast: prediction.deals,
    })),
  ];

  return (
    <section aria-labelledby="forecast-title" className="min-w-0 rounded-lg border border-border bg-card p-4 sm:p-5">
      <header className="flex flex-wrap items-start justify-between gap-2">
        <div className="min-w-0">
          <h2 id="forecast-title" className="text-lg font-semibold tracking-tight">90-day forecast</h2>
          <p className="mt-1 text-sm text-muted-foreground">Projected from the past six months of closed deals.</p>
        </div>
        <p className="text-sm font-medium tabular-nums">
          Closed deal trend {trend.direction === "stable" ? "stable" : (trend.percentage > 0 ? "+" : "") + trend.percentage + "%"}
        </p>
      </header>

      <dl className="mt-4 grid grid-cols-1 divide-y divide-border border-y border-border sm:grid-cols-3 sm:divide-x sm:divide-y-0">
        {predictions.map((prediction) => (
          <div key={prediction.label} className="min-w-0 py-3 sm:px-3 [overflow-wrap:anywhere]">
            <dt className="text-sm text-muted-foreground">{prediction.label}</dt>
            <dd className="mt-1 text-lg font-semibold tabular-nums">{prediction.deals} projected deals</dd>
            <dd className="text-xs text-muted-foreground tabular-nums">
              Projected value (USD) {Number.isFinite(prediction.value) ? usd.format(prediction.value) : "Unavailable"}
            </dd>
          </div>
        ))}
      </dl>

      <div className="mt-4 flex flex-wrap gap-x-4 gap-y-2 text-sm">
        <span className="flex items-center gap-2"><span aria-hidden="true" className="w-5 border-t-2 border-primary" />Closed deals</span>
        <span className="flex items-center gap-2"><span aria-hidden="true" className="w-5 border-t-2 border-dashed border-muted-foreground" />Forecast</span>
      </div>
      <div className="mt-2 h-48 min-w-0">
        <ResponsiveContainer width="100%" height="100%" minWidth={0}>
          <LineChart data={chartData} accessibilityLayer margin={{ right: 12, left: 0 }}>
            <CartesianGrid vertical={false} stroke="var(--border)" />
            <XAxis dataKey="month" tick={tick} tickLine={false} />
            <YAxis width={32} allowDecimals={false} tick={tick} tickLine={false} />
            <Tooltip contentStyle={{ background: "var(--card)", color: "var(--foreground)", borderColor: "var(--border)", borderRadius: 8 }} />
            <Line dataKey="actual" name="Closed deals" stroke="var(--primary)" dot={false} strokeWidth={2} isAnimationActive={false} />
            <Line dataKey="forecast" name="Forecast" stroke="var(--muted-foreground)" strokeDasharray="5 4" dot={false} strokeWidth={2} isAnimationActive={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {trend.direction === "down" && (
        <p className="mt-3 rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-900 dark:border-amber-800 dark:bg-amber-900/20 dark:text-amber-200">
          Average monthly closings fell {Math.abs(trend.percentage)}% compared with the previous three months.
        </p>
      )}
    </section>
  );
}

function calculatePredictions(data: Array<{ month: string; closed: number; value: number }>) {
  if (data.length < 3) {
    return [
      { label: "Next Month", deals: 0, value: 0 },
      { label: "Month 2", deals: 0, value: 0 },
      { label: "Month 3", deals: 0, value: 0 },
    ];
  }

  // Simple linear regression
  const recentData = data.slice(-6);
  const n = recentData.length;
  
  let sumX = 0, sumY = 0, sumXY = 0, sumX2 = 0;
  recentData.forEach((d, i) => {
    sumX += i;
    sumY += d.closed;
    sumXY += i * d.closed;
    sumX2 += i * i;
  });

  const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
  const intercept = (sumY - slope * sumX) / n;

  // Calculate average value per deal
  const avgValuePerDeal = recentData.reduce((sum, d) => sum + d.value, 0) / 
    recentData.reduce((sum, d) => sum + d.closed, 0);

  return [
    {
      label: "Next Month",
      deals: Math.max(0, Math.round(slope * n + intercept)),
      value: Math.max(0, Math.round((slope * n + intercept) * avgValuePerDeal)),
    },
    {
      label: "Month 2",
      deals: Math.max(0, Math.round(slope * (n + 1) + intercept)),
      value: Math.max(0, Math.round((slope * (n + 1) + intercept) * avgValuePerDeal)),
    },
    {
      label: "Month 3",
      deals: Math.max(0, Math.round(slope * (n + 2) + intercept)),
      value: Math.max(0, Math.round((slope * (n + 2) + intercept) * avgValuePerDeal)),
    },
  ];
}

function calculateTrend(data: Array<{ closed: number }>) {
  if (data.length < 2) {
    return { direction: 'stable' as const, percentage: 0 };
  }

  const recent = data.slice(-3);
  const previous = data.slice(-6, -3);

  if (previous.length === 0 || recent.length === 0) {
    return { direction: 'stable' as const, percentage: 0 };
  }

  const recentAvg = recent.reduce((sum, d) => sum + d.closed, 0) / recent.length;
  const previousAvg = previous.reduce((sum, d) => sum + d.closed, 0) / previous.length;

  if (previousAvg === 0) {
    return { direction: 'stable' as const, percentage: 0 };
  }

  const percentageChange = ((recentAvg - previousAvg) / previousAvg) * 100;

  if (percentageChange > 5) {
    return { direction: 'up' as const, percentage: Math.round(percentageChange) };
  } else if (percentageChange < -5) {
    return { direction: 'down' as const, percentage: Math.round(percentageChange) };
  }

  return { direction: 'stable' as const, percentage: Math.round(percentageChange) };
}
