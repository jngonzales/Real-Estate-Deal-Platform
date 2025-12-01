"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PipelineChart } from "./pipeline-chart";
import { StatusBarChart } from "./status-bar-chart";
import { BarChart3, PieChart } from "lucide-react";

interface DealsByStatus {
  submitted: number;
  needs_info: number;
  underwriting: number;
  offer_prepared: number;
  offer_sent: number;
  in_contract: number;
  funding: number;
  closed: number;
  rejected: number;
}

interface DashboardChartsProps {
  dealsByStatus: DealsByStatus;
  isAdmin?: boolean;
}

const statusConfig = [
  { key: "submitted", name: "Submitted", color: "#3b82f6" },
  { key: "needs_info", name: "Needs Info", color: "#f97316" },
  { key: "underwriting", name: "Underwriting", color: "#eab308" },
  { key: "offer_prepared", name: "Offer Ready", color: "#a855f7" },
  { key: "offer_sent", name: "Offer Sent", color: "#6366f1" },
  { key: "in_contract", name: "In Contract", color: "#06b6d4" },
  { key: "funding", name: "Funding", color: "#10b981" },
  { key: "closed", name: "Closed", color: "#22c55e" },
  { key: "rejected", name: "Rejected", color: "#ef4444" },
];

export function DashboardCharts({ dealsByStatus }: DashboardChartsProps) {
  // Prepare data for charts
  const chartData = statusConfig
    .map((status) => ({
      name: status.name,
      value: dealsByStatus[status.key as keyof DealsByStatus] || 0,
      color: status.color,
    }))
    .filter((item) => item.value > 0);

  // Active deals (exclude closed and rejected)
  const activeData = statusConfig
    .filter((s) => !["closed", "rejected"].includes(s.key))
    .map((status) => ({
      name: status.name,
      value: dealsByStatus[status.key as keyof DealsByStatus] || 0,
      color: status.color,
    }))
    .filter((item) => item.value > 0);

  const totalActive = activeData.reduce((sum, item) => sum + item.value, 0);
  const totalClosed = dealsByStatus.closed || 0;
  const totalRejected = dealsByStatus.rejected || 0;

  return (
    <div className="grid gap-4 md:grid-cols-2">
      {/* Pipeline Distribution */}
      <Card className="border-border bg-card">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-base font-medium text-foreground">
            <PieChart className="h-4 w-4 text-muted-foreground" />
            Pipeline Distribution
          </CardTitle>
        </CardHeader>
        <CardContent>
          <PipelineChart data={activeData} />
          <div className="mt-4 flex justify-center gap-6 text-sm">
            <div className="text-center">
              <p className="text-2xl font-bold text-foreground">{totalActive}</p>
              <p className="text-muted-foreground">Active</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-emerald-500">{totalClosed}</p>
              <p className="text-muted-foreground">Closed</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-red-500">{totalRejected}</p>
              <p className="text-muted-foreground">Rejected</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Status Breakdown */}
      <Card className="border-border bg-card">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-base font-medium text-foreground">
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
            Deals by Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <StatusBarChart data={chartData} />
        </CardContent>
      </Card>
    </div>
  );
}
