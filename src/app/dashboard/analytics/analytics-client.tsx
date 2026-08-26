"use client";

import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  Legend,
} from "recharts";
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Clock,
  Users,
  FileText,
  CheckCircle,
  XCircle,
  Activity,
} from "lucide-react";
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
}

const statusColors: Record<string, string> = {
  submitted: "#3B82F6",
  needs_info: "#F97316",
  underwriting: "#EAB308",
  offer_prepared: "#A855F7",
  offer_sent: "#6366F1",
  in_contract: "#06B6D4",
  funding: "#10B981",
  closed: "#22C55E",
  rejected: "#EF4444",
};

const statusLabels: Record<string, string> = {
  submitted: "Submitted",
  needs_info: "Needs Info",
  underwriting: "Underwriting",
  offer_prepared: "Offer Prepared",
  offer_sent: "Offer Sent",
  in_contract: "In Contract",
  funding: "Funding",
  closed: "Closed",
  rejected: "Rejected",
};

const propertyTypeLabels: Record<string, string> = {
  single_family: "Single Family",
  multi_family: "Multi-Family",
  condo: "Condo",
  townhouse: "Townhouse",
  land: "Land",
  commercial: "Commercial",
  other: "Other",
};

const PROPERTY_COLORS = ["#3B82F6", "#10B981", "#F59E0B", "#EF4444", "#8B5CF6", "#06B6D4", "#6B7280"];

function formatCurrency(value: number): string {
  if (value >= 1000000) {
    return `$${(value / 1000000).toFixed(1)}M`;
  } else if (value >= 1000) {
    return `$${(value / 1000).toFixed(0)}K`;
  }
  return `$${value.toLocaleString()}`;
}

export function AnalyticsClient({
  metrics,
  statusCounts,
  agentPerformance,
  monthlyData,
  propertyTypes,
}: AnalyticsClientProps) {
  // Prepare status data for pie chart
  const statusData = Object.entries(statusCounts).map(([status, count]) => ({
    name: statusLabels[status] || status,
    value: count,
    color: statusColors[status] || "#6B7280",
  }));

  // Prepare property type data
  const propertyTypeData = Object.entries(propertyTypes).map(([type, count], index) => ({
    name: propertyTypeLabels[type] || type,
    value: count,
    color: PROPERTY_COLORS[index % PROPERTY_COLORS.length],
  }));

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Total Pipeline Value */}
        <div className="group rounded-xl border border-border bg-card p-6 backdrop-blur hover:border-primary/40 transition-all duration-300">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Pipeline Value</p>
              <p className="mt-1 text-2xl font-bold text-white">
                {formatCurrency(metrics.totalPipelineValue)}
              </p>
              <p className="mt-1 text-xs text-muted-foreground">{metrics.activeDeals} active deals</p>
            </div>
            <div className="rounded-xl bg-primary/15 p-3 group-hover:bg-primary/30 transition-colors">
              <DollarSign className="h-6 w-6 text-emerald-400" />
            </div>
          </div>
        </div>

        {/* Closed Value */}
        <div className="group rounded-xl border border-border bg-card p-6 backdrop-blur hover:border-emerald-500/50 transition-all duration-300">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Closed Value</p>
              <p className="mt-1 text-2xl font-bold text-emerald-400">
                {formatCurrency(metrics.totalClosedValue)}
              </p>
              <p className="mt-1 text-xs text-muted-foreground">{metrics.closedDeals} deals closed</p>
            </div>
            <div className="rounded-xl bg-emerald-500/20 p-3 group-hover:bg-emerald-500/30 transition-colors">
              <CheckCircle className="h-6 w-6 text-emerald-400" />
            </div>
          </div>
        </div>

        {/* Conversion Rate */}
        <div className="group rounded-xl border border-border bg-card p-6 backdrop-blur hover:border-emerald-500/50 transition-all duration-300">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Conversion Rate</p>
              <p className="mt-1 text-2xl font-bold text-white">
                {metrics.conversionRate}%
              </p>
              <div className="mt-1 flex items-center gap-1 text-xs">
                {metrics.conversionRate >= 50 ? (
                  <>
                    <TrendingUp className="h-3 w-3 text-emerald-400" />
                    <span className="text-emerald-400 font-medium">Good performance</span>
                  </>
                ) : (
                  <>
                    <TrendingDown className="h-3 w-3 text-amber-400" />
                    <span className="text-amber-400 font-medium">Needs improvement</span>
                  </>
                )}
              </div>
            </div>
            <div className="rounded-xl bg-emerald-500/20 p-3 group-hover:bg-emerald-500/30 transition-colors">
              <Activity className="h-6 w-6 text-emerald-400" />
            </div>
          </div>
        </div>

        {/* Avg Days in Pipeline */}
        <div className="group rounded-xl border border-border bg-card p-6 backdrop-blur hover:border-amber-500/50 transition-all duration-300">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Avg. Time to Close</p>
              <p className="mt-1 text-2xl font-bold text-white">
                {metrics.avgDaysInPipeline} days
              </p>
              <p className="mt-1 text-xs text-muted-foreground">From submission to close</p>
            </div>
            <div className="rounded-xl bg-amber-500/20 p-3 group-hover:bg-amber-500/30 transition-colors">
              <Clock className="h-6 w-6 text-amber-400" />
            </div>
          </div>
        </div>
      </div>

      {/* 90-Day Predictive Analytics */}
      <PredictiveMetrics historicalData={monthlyData} />

      {/* Charts Row 1 */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Monthly Trends */}
        <div className="rounded-xl border border-border bg-card p-6">
          <h3 className="mb-4 font-semibold text-white flex items-center gap-2">
            <Activity className="h-5 w-5 text-emerald-400" />
            Monthly Trends
          </h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={monthlyData}>
                <defs>
                  <linearGradient id="submittedGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#3B82F6" stopOpacity={0.3} />
                    <stop offset="100%" stopColor="#3B82F6" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="closedGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#22C55E" stopOpacity={0.3} />
                    <stop offset="100%" stopColor="#22C55E" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" strokeOpacity={0.5} />
                <XAxis 
                  dataKey="month" 
                  tick={{ fontSize: 12, fill: '#94a3b8' }} 
                  axisLine={{ stroke: '#475569' }}
                  tickLine={{ stroke: '#475569' }}
                />
                <YAxis 
                  tick={{ fontSize: 12, fill: '#94a3b8' }} 
                  axisLine={{ stroke: '#475569' }}
                  tickLine={{ stroke: '#475569' }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "rgba(15, 23, 42, 0.95)",
                    border: "1px solid rgba(148, 163, 184, 0.2)",
                    borderRadius: "12px",
                    color: "#f1f5f9",
                    boxShadow: "0 8px 32px rgba(0, 0, 0, 0.4)",
                    padding: "12px 16px",
                  }}
                />
                <Legend 
                  wrapperStyle={{ paddingTop: '20px' }}
                  formatter={(value) => <span style={{ color: '#94a3b8' }}>{value}</span>}
                />
                <Line
                  type="monotone"
                  dataKey="submitted"
                  name="Submitted"
                  stroke="#3B82F6"
                  strokeWidth={3}
                  dot={{ fill: "#3B82F6", stroke: "#1e3a5f", strokeWidth: 2, r: 4 }}
                  activeDot={{ r: 6, stroke: "#3B82F6", strokeWidth: 2, fill: "#1e3a5f" }}
                />
                <Line
                  type="monotone"
                  dataKey="closed"
                  name="Closed"
                  stroke="#22C55E"
                  strokeWidth={3}
                  dot={{ fill: "#22C55E", stroke: "#14532d", strokeWidth: 2, r: 4 }}
                  activeDot={{ r: 6, stroke: "#22C55E", strokeWidth: 2, fill: "#14532d" }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Status Distribution */}
        <div className="rounded-xl border border-border bg-card p-6">
          <h3 className="mb-4 font-semibold text-white flex items-center gap-2">
            <FileText className="h-5 w-5 text-emerald-400" />
            Deal Status Distribution
          </h3>
          <div className="h-72 relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <defs>
                  {statusData.map((entry, index) => (
                    <linearGradient key={`statusGradient-${index}`} id={`statusGradient-${index}`} x1="0" y1="0" x2="1" y2="1">
                      <stop offset="0%" stopColor={entry.color} stopOpacity={1} />
                      <stop offset="100%" stopColor={entry.color} stopOpacity={0.6} />
                    </linearGradient>
                  ))}
                </defs>
                <Pie
                  data={statusData}
                  cx="50%"
                  cy="50%"
                  innerRadius={70}
                  outerRadius={110}
                  paddingAngle={2}
                  dataKey="value"
                  stroke="none"
                  animationDuration={800}
                >
                  {statusData.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={`url(#statusGradient-${index})`}
                      style={{ filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))' }}
                    />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: "rgba(15, 23, 42, 0.95)",
                    border: "1px solid rgba(148, 163, 184, 0.2)",
                    borderRadius: "12px",
                    color: "#f1f5f9",
                    boxShadow: "0 8px 32px rgba(0, 0, 0, 0.4)",
                    padding: "12px 16px",
                  }}
                  formatter={(value: number, name: string) => [`${value} deals`, name]}
                />
              </PieChart>
            </ResponsiveContainer>
            {/* Center text */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center pointer-events-none">
              <p className="text-2xl font-bold text-white">{metrics.totalDeals}</p>
              <p className="text-xs text-muted-foreground uppercase tracking-wide">Total</p>
            </div>
          </div>
        </div>
      </div>

      {/* Charts Row 2 */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Agent Performance */}
        <div className="rounded-xl border border-border bg-card p-6">
          <h3 className="mb-4 flex items-center gap-2 font-semibold text-white">
            <Users className="h-5 w-5 text-cyan-400" />
            Agent Performance
          </h3>
          {agentPerformance.length > 0 ? (
            <div className="space-y-4">
              {agentPerformance.slice(0, 5).map((agent, index) => (
                <div key={agent.id} className="group flex items-center gap-4 p-3 rounded-lg hover:bg-secondary/80/30 transition-colors">
                  <div className={`flex h-10 w-10 items-center justify-center rounded-full text-sm font-bold ${
                    index === 0 ? 'bg-amber-500 text-foreground' :
                    index === 1 ? 'bg-muted-foreground/40 text-foreground' :
                    index === 2 ? 'bg-amber-700 text-white' :
                    'bg-secondary text-foreground/90'
                  }`}>
                    {index + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="truncate font-medium text-white group-hover:text-emerald-400 transition-colors">{agent.name}</p>
                    <div className="flex gap-4 text-xs text-muted-foreground">
                      <span>{agent.totalDeals} deals</span>
                      <span className="text-emerald-400 font-medium">{agent.closedDeals} closed</span>
                      <span className="text-emerald-400">{agent.conversionRate}% rate</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-emerald-400 text-lg">
                      {formatCurrency(agent.closedValue)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex h-48 items-center justify-center">
              <p className="text-muted-foreground">No agent data available</p>
            </div>
          )}
        </div>

        {/* Property Types */}
        <div className="rounded-xl border border-border bg-card p-6">
          <h3 className="mb-4 flex items-center gap-2 font-semibold text-white">
            <FileText className="h-5 w-5 text-amber-400" />
            Property Type Distribution
          </h3>
          <div className="space-y-3">
            {propertyTypeData.length > 0 ? (
              <>
                {propertyTypeData.map((item, index) => {
                  const maxVal = Math.max(...propertyTypeData.map(d => d.value), 1);
                  return (
                    <div key={index} className="group">
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-sm text-muted-foreground group-hover:text-foreground/90 transition-colors">
                          {item.name}
                        </span>
                        <span className="text-sm font-semibold text-foreground">
                          {item.value}
                        </span>
                      </div>
                      <div className="relative h-3 w-full overflow-hidden rounded-full bg-secondary/50">
                        <div
                          className="absolute inset-y-0 left-0 rounded-full transition-all duration-500 ease-out group-hover:brightness-110"
                          style={{
                            width: `${(item.value / maxVal) * 100}%`,
                            background: `linear-gradient(90deg, ${item.color}cc, ${item.color})`,
                            boxShadow: `0 0 12px ${item.color}40`,
                          }}
                        />
                      </div>
                    </div>
                  );
                })}
              </>
            ) : (
              <div className="flex h-48 items-center justify-center">
                <p className="text-muted-foreground">No property data available</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-border bg-card p-5">
          <div className="flex items-center gap-4">
            <div className="rounded-xl bg-primary/15 p-3">
              <FileText className="h-6 w-6 text-emerald-400" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Total Deals</p>
              <p className="text-2xl font-bold text-white">{metrics.totalDeals}</p>
            </div>
          </div>
        </div>
        <div className="rounded-xl border border-border bg-card p-5">
          <div className="flex items-center gap-4">
            <div className="rounded-xl bg-emerald-500/20 p-3">
              <CheckCircle className="h-6 w-6 text-emerald-400" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Closed Deals</p>
              <p className="text-2xl font-bold text-emerald-400">{metrics.closedDeals}</p>
            </div>
          </div>
        </div>
        <div className="rounded-xl border border-border bg-card p-5">
          <div className="flex items-center gap-4">
            <div className="rounded-xl bg-red-500/20 p-3">
              <XCircle className="h-6 w-6 text-red-400" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Rejected Deals</p>
              <p className="text-2xl font-bold text-red-400">{metrics.rejectedDeals}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
