'use client';

import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  TrendingUp,
  TrendingDown,
  Target,
  Clock,
  CheckCircle,
  XCircle,
  DollarSign,
  BarChart3,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface Deal {
  id: string;
  name: string;
  status: string;
  asking_price?: number;
  arv?: number;
  ai_score?: number;
  created_at: string;
  updated_at?: string;
}

interface PipelineStatsProps {
  deals: Deal[];
  className?: string;
}

interface StatusConfig {
  label: string;
  color: string;
  icon: React.ReactNode;
}

const STATUS_CONFIG: Record<string, StatusConfig> = {
  new: { label: 'New', color: 'bg-blue-500', icon: <Clock className="h-4 w-4" /> },
  lead: { label: 'Lead', color: 'bg-purple-500', icon: <Target className="h-4 w-4" /> },
  analyzing: { label: 'Analyzing', color: 'bg-yellow-500', icon: <BarChart3 className="h-4 w-4" /> },
  negotiating: { label: 'Negotiating', color: 'bg-orange-500', icon: <DollarSign className="h-4 w-4" /> },
  under_contract: { label: 'Under Contract', color: 'bg-cyan-500', icon: <CheckCircle className="h-4 w-4" /> },
  closed: { label: 'Closed', color: 'bg-green-500', icon: <CheckCircle className="h-4 w-4" /> },
  lost: { label: 'Lost', color: 'bg-red-500', icon: <XCircle className="h-4 w-4" /> },
  on_hold: { label: 'On Hold', color: 'bg-gray-500', icon: <Clock className="h-4 w-4" /> },
};

export function PipelineStats({ deals, className }: PipelineStatsProps) {
  const stats = useMemo(() => {
    const totalDeals = deals.length;
    const totalValue = deals.reduce((sum, deal) => sum + (deal.asking_price || 0), 0);
    const totalARV = deals.reduce((sum, deal) => sum + (deal.arv || 0), 0);
    const avgScore = deals.length > 0
      ? deals.reduce((sum, deal) => sum + (deal.ai_score || 0), 0) / deals.filter(d => d.ai_score).length
      : 0;

    // Status breakdown
    const statusCounts = deals.reduce((acc, deal) => {
      const status = deal.status.toLowerCase().replace(/\s+/g, '_');
      acc[status] = (acc[status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Calculate funnel metrics
    const closedDeals = statusCounts['closed'] || 0;
    const lostDeals = statusCounts['lost'] || 0;
    const activeDeals = totalDeals - closedDeals - lostDeals;
    const conversionRate = totalDeals > 0 ? (closedDeals / totalDeals) * 100 : 0;

    // Score distribution
    const highScore = deals.filter(d => (d.ai_score || 0) >= 70).length;
    const mediumScore = deals.filter(d => (d.ai_score || 0) >= 40 && (d.ai_score || 0) < 70).length;
    const lowScore = deals.filter(d => (d.ai_score || 0) > 0 && (d.ai_score || 0) < 40).length;

    // Time-based metrics
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const recentDeals = deals.filter(d => new Date(d.created_at) >= thirtyDaysAgo).length;

    return {
      totalDeals,
      totalValue,
      totalARV,
      avgScore,
      statusCounts,
      closedDeals,
      lostDeals,
      activeDeals,
      conversionRate,
      highScore,
      mediumScore,
      lowScore,
      recentDeals,
    };
  }, [deals]);

  const formatCurrency = (value: number): string => {
    if (value >= 1000000) {
      return `$${(value / 1000000).toFixed(1)}M`;
    }
    if (value >= 1000) {
      return `$${(value / 1000).toFixed(0)}K`;
    }
    return `$${value.toLocaleString()}`;
  };

  return (
    <div className={cn('space-y-4', className)}>
      {/* Key Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-md">
                <BarChart3 className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Total Deals</p>
                <p className="text-2xl font-bold">{stats.totalDeals}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-green-100 dark:bg-green-900 rounded-md">
                <DollarSign className="h-4 w-4 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Pipeline Value</p>
                <p className="text-2xl font-bold">{formatCurrency(stats.totalValue)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-purple-100 dark:bg-purple-900 rounded-md">
                <Target className="h-4 w-4 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Avg AI Score</p>
                <p className="text-2xl font-bold">{stats.avgScore.toFixed(0)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-cyan-100 dark:bg-cyan-900 rounded-md">
                <TrendingUp className="h-4 w-4 text-cyan-600 dark:text-cyan-400" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Conversion Rate</p>
                <p className="text-2xl font-bold">{stats.conversionRate.toFixed(1)}%</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Pipeline Breakdown */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Pipeline Breakdown</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {Object.entries(stats.statusCounts)
              .sort((a, b) => b[1] - a[1])
              .map(([status, count]) => {
                const config = STATUS_CONFIG[status] || { 
                  label: status.charAt(0).toUpperCase() + status.slice(1).replace(/_/g, ' '), 
                  color: 'bg-gray-500',
                  icon: <Clock className="h-4 w-4" />
                };
                const percentage = stats.totalDeals > 0 ? (count / stats.totalDeals) * 100 : 0;

                return (
                  <div key={status} className="space-y-1">
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        {config.icon}
                        <span>{config.label}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary">{count}</Badge>
                        <span className="text-muted-foreground">{percentage.toFixed(0)}%</span>
                      </div>
                    </div>
                    <Progress value={percentage} className={cn('h-2', config.color)} />
                  </div>
                );
              })}
          </div>
        </CardContent>
      </Card>

      {/* Score Distribution */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">AI Score Distribution</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <div className="flex-1 text-center p-3 bg-green-50 dark:bg-green-950 rounded-md">
              <p className="text-2xl font-bold text-green-600">{stats.highScore}</p>
              <p className="text-xs text-muted-foreground">High (70+)</p>
            </div>
            <div className="flex-1 text-center p-3 bg-yellow-50 dark:bg-yellow-950 rounded-md">
              <p className="text-2xl font-bold text-yellow-600">{stats.mediumScore}</p>
              <p className="text-xs text-muted-foreground">Medium (40-69)</p>
            </div>
            <div className="flex-1 text-center p-3 bg-red-50 dark:bg-red-950 rounded-md">
              <p className="text-2xl font-bold text-red-600">{stats.lowScore}</p>
              <p className="text-xs text-muted-foreground">Low (&lt;40)</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Performance Summary */}
      <div className="grid grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <CheckCircle className="h-8 w-8 mx-auto text-green-500 mb-2" />
            <p className="text-2xl font-bold">{stats.closedDeals}</p>
            <p className="text-xs text-muted-foreground">Closed Deals</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <Clock className="h-8 w-8 mx-auto text-blue-500 mb-2" />
            <p className="text-2xl font-bold">{stats.activeDeals}</p>
            <p className="text-xs text-muted-foreground">Active Deals</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <TrendingDown className="h-8 w-8 mx-auto text-red-500 mb-2" />
            <p className="text-2xl font-bold">{stats.lostDeals}</p>
            <p className="text-xs text-muted-foreground">Lost Deals</p>
          </CardContent>
        </Card>
      </div>

      {/* 30-Day Activity */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">Last 30 Days Activity</p>
              <p className="text-2xl font-bold">{stats.recentDeals} new deals</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-muted-foreground">Potential ARV</p>
              <p className="text-lg font-semibold">{formatCurrency(stats.totalARV)}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
