"use client";

import { useMemo } from "react";
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Home,
  BarChart3,
  Target,
  Percent,
  Clock,
  CheckCircle2,
  XCircle
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

interface Deal {
  id: string;
  title: string;
  status: string;
  asking_price?: number;
  estimated_arv?: number;
  estimated_repair_cost?: number;
  mao?: number;
  cap_rate?: number;
  cash_on_cash?: number;
  noi?: number;
  ai_score?: number;
  property_type?: string;
  created_at: string;
  updated_at?: string;
}

interface DealAnalyticsProps {
  deals: Deal[];
  className?: string;
}

interface MetricCard {
  label: string;
  value: string | number;
  subValue?: string;
  icon: React.ReactNode;
  trend?: "up" | "down" | "neutral";
  trendValue?: string;
  color?: string;
}

export function DealAnalytics({ deals, className }: DealAnalyticsProps) {
  const analytics = useMemo(() => {
    if (deals.length === 0) {
      return {
        totalDeals: 0,
        totalValue: 0,
        avgAskingPrice: 0,
        avgArv: 0,
        avgRoi: 0,
        avgAiScore: 0,
        statusCounts: {} as Record<string, number>,
        propertyTypeCounts: {} as Record<string, number>,
        closedDeals: 0,
        deadDeals: 0,
        activeDeals: 0,
        conversionRate: 0,
        avgDaysToClose: 0,
        totalPotentialProfit: 0,
        avgSpread: 0
      };
    }

    const totalDeals = deals.length;
    const dealsWithPrice = deals.filter(d => d.asking_price);
    const dealsWithArv = deals.filter(d => d.estimated_arv);
    const dealsWithRoi = deals.filter(d => d.estimated_arv && d.asking_price && d.estimated_repair_cost);
    const dealsWithScore = deals.filter(d => d.ai_score);

    const totalValue = dealsWithPrice.reduce((sum, d) => sum + (d.asking_price || 0), 0);
    const avgAskingPrice = dealsWithPrice.length > 0 
      ? totalValue / dealsWithPrice.length 
      : 0;
    
    const avgArv = dealsWithArv.length > 0
      ? dealsWithArv.reduce((sum, d) => sum + (d.estimated_arv || 0), 0) / dealsWithArv.length
      : 0;

    const avgAiScore = dealsWithScore.length > 0
      ? dealsWithScore.reduce((sum, d) => sum + (d.ai_score || 0), 0) / dealsWithScore.length
      : 0;

    // Calculate ROI for each deal
    const rois = dealsWithRoi.map(d => {
      const totalInvestment = (d.asking_price || 0) + (d.estimated_repair_cost || 0);
      const profit = (d.estimated_arv || 0) - totalInvestment;
      return (profit / totalInvestment) * 100;
    });
    const avgRoi = rois.length > 0 ? rois.reduce((a, b) => a + b, 0) / rois.length : 0;

    // Calculate spreads (MAO - Asking)
    const dealsWithSpread = deals.filter(d => d.mao && d.asking_price);
    const spreads = dealsWithSpread.map(d => (d.mao || 0) - (d.asking_price || 0));
    const avgSpread = spreads.length > 0 ? spreads.reduce((a, b) => a + b, 0) / spreads.length : 0;

    // Total potential profit (sum of positive spreads)
    const totalPotentialProfit = spreads.filter(s => s > 0).reduce((a, b) => a + b, 0);

    // Status counts
    const statusCounts = deals.reduce((acc, d) => {
      acc[d.status] = (acc[d.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Property type counts
    const propertyTypeCounts = deals.reduce((acc, d) => {
      const type = d.property_type || "Unknown";
      acc[type] = (acc[type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const closedDeals = statusCounts["closed"] || 0;
    const deadDeals = statusCounts["dead"] || 0;
    const activeDeals = totalDeals - closedDeals - deadDeals;

    // Conversion rate (closed / (closed + dead))
    const conversionRate = (closedDeals + deadDeals) > 0 
      ? (closedDeals / (closedDeals + deadDeals)) * 100 
      : 0;

    return {
      totalDeals,
      totalValue,
      avgAskingPrice,
      avgArv,
      avgRoi,
      avgAiScore,
      statusCounts,
      propertyTypeCounts,
      closedDeals,
      deadDeals,
      activeDeals,
      conversionRate,
      avgDaysToClose: 0, // Would need close dates to calculate
      totalPotentialProfit,
      avgSpread
    };
  }, [deals]);

  const formatCurrency = (value: number) => {
    if (value >= 1000000) return `$${(value / 1000000).toFixed(1)}M`;
    if (value >= 1000) return `$${(value / 1000).toFixed(0)}K`;
    return `$${value.toFixed(0)}`;
  };

  const metrics: MetricCard[] = [
    {
      label: "Total Deals",
      value: analytics.totalDeals,
      subValue: `${analytics.activeDeals} active`,
      icon: <Home className="h-5 w-5" />,
      color: "text-blue-500"
    },
    {
      label: "Total Pipeline Value",
      value: formatCurrency(analytics.totalValue),
      subValue: `Avg: ${formatCurrency(analytics.avgAskingPrice)}`,
      icon: <DollarSign className="h-5 w-5" />,
      color: "text-green-500"
    },
    {
      label: "Average ARV",
      value: formatCurrency(analytics.avgArv),
      icon: <TrendingUp className="h-5 w-5" />,
      color: "text-purple-500"
    },
    {
      label: "Average ROI",
      value: `${analytics.avgRoi.toFixed(1)}%`,
      trend: analytics.avgRoi >= 20 ? "up" : analytics.avgRoi >= 10 ? "neutral" : "down",
      icon: <Percent className="h-5 w-5" />,
      color: analytics.avgRoi >= 20 ? "text-green-500" : analytics.avgRoi >= 10 ? "text-yellow-500" : "text-red-500"
    },
    {
      label: "Avg AI Score",
      value: analytics.avgAiScore.toFixed(0),
      subValue: "out of 100",
      icon: <Target className="h-5 w-5" />,
      color: analytics.avgAiScore >= 70 ? "text-green-500" : analytics.avgAiScore >= 50 ? "text-yellow-500" : "text-red-500"
    },
    {
      label: "Avg Spread (MAO - Ask)",
      value: formatCurrency(analytics.avgSpread),
      trend: analytics.avgSpread > 0 ? "up" : "down",
      icon: <BarChart3 className="h-5 w-5" />,
      color: analytics.avgSpread > 0 ? "text-green-500" : "text-red-500"
    },
    {
      label: "Potential Profit",
      value: formatCurrency(analytics.totalPotentialProfit),
      subValue: "from positive spreads",
      icon: <DollarSign className="h-5 w-5" />,
      color: "text-emerald-500"
    },
    {
      label: "Conversion Rate",
      value: `${analytics.conversionRate.toFixed(1)}%`,
      subValue: `${analytics.closedDeals} closed / ${analytics.deadDeals} dead`,
      icon: <CheckCircle2 className="h-5 w-5" />,
      color: analytics.conversionRate >= 50 ? "text-green-500" : "text-yellow-500"
    }
  ];

  const statusColors: Record<string, string> = {
    lead: "bg-gray-500",
    qualified: "bg-blue-500",
    analyzing: "bg-yellow-500",
    under_contract: "bg-purple-500",
    due_diligence: "bg-orange-500",
    closed: "bg-green-500",
    dead: "bg-red-500"
  };

  if (deals.length === 0) {
    return (
      <Card className={className}>
        <CardContent className="py-12 text-center">
          <BarChart3 className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
          <p className="text-lg font-medium text-muted-foreground">No deal data available</p>
          <p className="text-sm text-muted-foreground">Add deals to see analytics</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className={cn("space-y-6", className)}>
      {/* Key Metrics Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {metrics.map((metric, index) => (
          <Card key={index} className="relative overflow-hidden">
            <CardContent className="p-4">
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">{metric.label}</p>
                  <p className={cn("text-2xl font-bold", metric.color)}>
                    {metric.value}
                  </p>
                  {metric.subValue && (
                    <p className="text-xs text-muted-foreground">{metric.subValue}</p>
                  )}
                </div>
                <div className={cn("p-2 rounded-lg bg-muted", metric.color)}>
                  {metric.icon}
                </div>
              </div>
              {metric.trend && (
                <div className={cn(
                  "absolute top-2 right-2 flex items-center gap-1 text-xs",
                  metric.trend === "up" ? "text-green-500" : metric.trend === "down" ? "text-red-500" : "text-yellow-500"
                )}>
                  {metric.trend === "up" ? <TrendingUp className="h-3 w-3" /> : 
                   metric.trend === "down" ? <TrendingDown className="h-3 w-3" /> : null}
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Pipeline Status */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Pipeline Status
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {Object.entries(analytics.statusCounts)
            .sort((a, b) => b[1] - a[1])
            .map(([status, count]) => {
              const percentage = (count / analytics.totalDeals) * 100;
              return (
                <div key={status} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className={cn("w-3 h-3 rounded-full", statusColors[status] || "bg-gray-400")} />
                      <span className="capitalize font-medium">
                        {status.replace("_", " ")}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">{count}</Badge>
                      <span className="text-sm text-muted-foreground">
                        {percentage.toFixed(1)}%
                      </span>
                    </div>
                  </div>
                  <Progress value={percentage} className="h-2" />
                </div>
              );
            })}
        </CardContent>
      </Card>

      {/* Property Types */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <Home className="h-5 w-5" />
            Property Types
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {Object.entries(analytics.propertyTypeCounts)
              .sort((a, b) => b[1] - a[1])
              .map(([type, count]) => (
                <Badge key={type} variant="secondary" className="text-sm">
                  {type.replace("_", " ")}: {count}
                </Badge>
              ))}
          </div>
        </CardContent>
      </Card>

      {/* Performance Summary */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <Target className="h-5 w-5" />
            Performance Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-green-500/10 rounded-lg border border-green-500/20">
              <CheckCircle2 className="h-8 w-8 mx-auto mb-2 text-green-500" />
              <div className="text-2xl font-bold text-green-500">{analytics.closedDeals}</div>
              <div className="text-sm text-muted-foreground">Deals Closed</div>
            </div>
            <div className="text-center p-4 bg-blue-500/10 rounded-lg border border-blue-500/20">
              <Clock className="h-8 w-8 mx-auto mb-2 text-blue-500" />
              <div className="text-2xl font-bold text-blue-500">{analytics.activeDeals}</div>
              <div className="text-sm text-muted-foreground">Active Deals</div>
            </div>
            <div className="text-center p-4 bg-red-500/10 rounded-lg border border-red-500/20">
              <XCircle className="h-8 w-8 mx-auto mb-2 text-red-500" />
              <div className="text-2xl font-bold text-red-500">{analytics.deadDeals}</div>
              <div className="text-sm text-muted-foreground">Dead Deals</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
