"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { TrendingUp, TrendingDown, AlertTriangle, Target } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

interface PredictiveMetricsProps {
  historicalData: Array<{
    month: string;
    closed: number;
    value: number;
  }>;
}

export function PredictiveMetrics({ historicalData }: PredictiveMetricsProps) {
  // Simple linear regression for next 3 months
  const predictions = calculatePredictions(historicalData);
  const trend = calculateTrend(historicalData);
  
  // Combine historical and predicted data for chart
  const chartData = [
    ...historicalData.slice(-6).map(d => ({ ...d, type: 'actual' })),
    ...predictions.map((d, idx) => ({ ...d, type: 'predicted', month: `+${idx + 1}m` })),
  ];

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5" />
                90-Day Forecast
              </CardTitle>
              <CardDescription>
                Projected based on last 6 months of activity
              </CardDescription>
            </div>
            {trend.direction === 'up' ? (
              <div className="flex items-center gap-1 text-green-600 dark:text-green-400">
                <TrendingUp className="h-4 w-4" />
                <span className="text-sm font-medium">+{trend.percentage}%</span>
              </div>
            ) : trend.direction === 'down' ? (
              <div className="flex items-center gap-1 text-red-600 dark:text-red-400">
                <TrendingDown className="h-4 w-4" />
                <span className="text-sm font-medium">{trend.percentage}%</span>
              </div>
            ) : (
              <div className="flex items-center gap-1 text-muted-foreground">
                <span className="text-sm font-medium">Stable</span>
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Predictions */}
          <div className="grid grid-cols-3 gap-4">
            {predictions.map((pred, idx) => (
              <div
                key={idx}
                className="rounded-lg border border-border bg-card p-4"
              >
                <p className="text-xs text-muted-foreground mb-1">{pred.label}</p>
                <p className="text-2xl font-bold text-foreground">{pred.deals}</p>
                <p className="text-xs text-green-600 dark:text-green-400 font-medium">
                  ${(pred.value / 1000).toFixed(0)}k value
                </p>
              </div>
            ))}
          </div>

          {/* Chart */}
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                <XAxis 
                  dataKey="month" 
                  className="text-xs fill-muted-foreground"
                  tick={{ fontSize: 12 }}
                />
                <YAxis 
                  className="text-xs fill-muted-foreground"
                  tick={{ fontSize: 12 }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '6px',
                  }}
                  labelStyle={{ color: 'hsl(var(--foreground))' }}
                />
                <Line
                  type="monotone"
                  dataKey="closed"
                  stroke="hsl(var(--primary))"
                  strokeWidth={2}
                  dot={(props) => {
                    const { cx, cy, payload } = props as { cx: number; cy: number; payload: { type: string } };
                    return (
                      <circle
                        cx={cx}
                        cy={cy}
                        r={4}
                        fill={payload.type === 'predicted' ? 'hsl(var(--muted-foreground))' : 'hsl(var(--primary))'}
                        stroke="white"
                        strokeWidth={2}
                      />
                    );
                  }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Warning if trend is negative */}
          {trend.direction === 'down' && (
            <div className="rounded-lg bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 p-3 flex items-start gap-2">
              <AlertTriangle className="h-4 w-4 text-amber-600 dark:text-amber-400 mt-0.5 shrink-0" />
              <div className="flex-1">
                <p className="text-sm font-medium text-amber-900 dark:text-amber-100">
                  Declining Pipeline Detected
                </p>
                <p className="text-xs text-amber-700 dark:text-amber-300 mt-1">
                  Deal velocity has decreased by {Math.abs(trend.percentage)}% over the last quarter. 
                  Consider increasing lead generation and follow-up activities.
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
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
