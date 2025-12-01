"use client";

import {
  BarChart,
  Bar,
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
        <div className="rounded-lg border border-border bg-card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Pipeline Value</p>
              <p className="mt-1 text-2xl font-bold text-foreground">
                {formatCurrency(metrics.totalPipelineValue)}
              </p>
              <p className="mt-1 text-xs text-muted-foreground">{metrics.activeDeals} active deals</p>
            </div>
            <div className="rounded-full bg-blue-500/10 p-3">
              <DollarSign className="h-6 w-6 text-blue-500" />
            </div>
          </div>
        </div>

        {/* Closed Value */}
        <div className="rounded-lg border border-border bg-card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Closed Value</p>
              <p className="mt-1 text-2xl font-bold text-emerald-500">
                {formatCurrency(metrics.totalClosedValue)}
              </p>
              <p className="mt-1 text-xs text-muted-foreground">{metrics.closedDeals} deals closed</p>
            </div>
            <div className="rounded-full bg-emerald-500/10 p-3">
              <CheckCircle className="h-6 w-6 text-emerald-500" />
            </div>
          </div>
        </div>

        {/* Conversion Rate */}
        <div className="rounded-lg border border-border bg-card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Conversion Rate</p>
              <p className="mt-1 text-2xl font-bold text-foreground">
                {metrics.conversionRate}%
              </p>
              <div className="mt-1 flex items-center gap-1 text-xs">
                {metrics.conversionRate >= 50 ? (
                  <>
                    <TrendingUp className="h-3 w-3 text-emerald-500" />
                    <span className="text-emerald-500 font-medium">Good performance</span>
                  </>
                ) : (
                  <>
                    <TrendingDown className="h-3 w-3 text-amber-500" />
                    <span className="text-amber-500 font-medium">Needs improvement</span>
                  </>
                )}
              </div>
            </div>
            <div className="rounded-full bg-purple-500/10 p-3">
              <Activity className="h-6 w-6 text-purple-500" />
            </div>
          </div>
        </div>

        {/* Avg Days in Pipeline */}
        <div className="rounded-lg border border-border bg-card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Avg. Time to Close</p>
              <p className="mt-1 text-2xl font-bold text-foreground">
                {metrics.avgDaysInPipeline} days
              </p>
              <p className="mt-1 text-xs text-muted-foreground">From submission to close</p>
            </div>
            <div className="rounded-full bg-amber-500/10 p-3">
              <Clock className="h-6 w-6 text-amber-500" />
            </div>
          </div>
        </div>
      </div>

      {/* Charts Row 1 */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Monthly Trends */}
        <div className="rounded-lg border border-border bg-card p-6">
          <h3 className="mb-4 font-semibold text-foreground">Monthly Trends</h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                <XAxis dataKey="month" tick={{ fontSize: 12 }} className="text-muted-foreground" />
                <YAxis tick={{ fontSize: 12 }} className="text-muted-foreground" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "8px",
                    color: "hsl(var(--foreground))",
                    boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)",
                  }}
                />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="submitted"
                  name="Submitted"
                  stroke="#3B82F6"
                  strokeWidth={2}
                  dot={{ fill: "#3B82F6", stroke: "none" }}
                  activeDot={{ stroke: "none" }}
                />
                <Line
                  type="monotone"
                  dataKey="closed"
                  name="Closed"
                  stroke="#22C55E"
                  strokeWidth={2}
                  dot={{ fill: "#22C55E", stroke: "none" }}
                  activeDot={{ stroke: "none" }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Status Distribution */}
        <div className="rounded-lg border border-border bg-card p-6">
          <h3 className="mb-4 font-semibold text-foreground">Deal Status Distribution</h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={statusData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={2}
                  dataKey="value"
                  label={({ name, percent }) => `${name} (${((percent || 0) * 100).toFixed(0)}%)`}
                  labelLine={false}
                  stroke="none"
                >
                  {statusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "8px",
                    color: "hsl(var(--foreground))",
                    boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)",
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Charts Row 2 */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Agent Performance */}
        <div className="rounded-lg border border-border bg-card p-6">
          <h3 className="mb-4 flex items-center gap-2 font-semibold text-foreground">
            <Users className="h-5 w-5" />
            Agent Performance
          </h3>
          {agentPerformance.length > 0 ? (
            <div className="space-y-4">
              {agentPerformance.slice(0, 5).map((agent, index) => (
                <div key={agent.id} className="flex items-center gap-4">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted text-sm font-medium text-muted-foreground">
                    {index + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="truncate font-medium text-foreground">{agent.name}</p>
                    <div className="flex gap-4 text-xs text-muted-foreground">
                      <span>{agent.totalDeals} deals</span>
                      <span className="text-emerald-500 font-medium">{agent.closedDeals} closed</span>
                      <span>{agent.conversionRate}% conversion</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-emerald-500">
                      {formatCurrency(agent.closedValue)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-muted-foreground">No agent data available</p>
          )}
        </div>

        {/* Property Types */}
        <div className="rounded-lg border border-border bg-card p-6">
          <h3 className="mb-4 flex items-center gap-2 font-semibold text-foreground">
            <FileText className="h-5 w-5" />
            Property Type Distribution
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={propertyTypeData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                <XAxis type="number" tick={{ fontSize: 12 }} className="text-muted-foreground" />
                <YAxis dataKey="name" type="category" tick={{ fontSize: 11 }} className="text-muted-foreground" width={100} />
                <Tooltip
                  cursor={{ fill: "hsl(var(--muted) / 0.3)" }}
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "8px",
                    color: "hsl(var(--foreground))",
                    boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)",
                  }}
                />
                <Bar dataKey="value" name="Deals" radius={[0, 4, 4, 0]} stroke="none">
                  {propertyTypeData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-lg border border-border bg-card p-4">
          <div className="flex items-center gap-3">
            <div className="rounded-full bg-blue-500/10 p-2">
              <FileText className="h-5 w-5 text-blue-500" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Total Deals</p>
              <p className="text-xl font-bold text-foreground">{metrics.totalDeals}</p>
            </div>
          </div>
        </div>
        <div className="rounded-lg border border-border bg-card p-4">
          <div className="flex items-center gap-3">
            <div className="rounded-full bg-emerald-500/10 p-2">
              <CheckCircle className="h-5 w-5 text-emerald-500" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Closed Deals</p>
              <p className="text-xl font-bold text-emerald-500">{metrics.closedDeals}</p>
            </div>
          </div>
        </div>
        <div className="rounded-lg border border-border bg-card p-4">
          <div className="flex items-center gap-3">
            <div className="rounded-full bg-red-500/10 p-2">
              <XCircle className="h-5 w-5 text-red-500" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Rejected Deals</p>
              <p className="text-xl font-bold text-red-500">{metrics.rejectedDeals}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
