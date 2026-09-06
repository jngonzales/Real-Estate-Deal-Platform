'use client';

import { useMemo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import {
  TrendingUp,
  TrendingDown,
  Minus,
  DollarSign,
  Home,
  Target,
  Clock,
  CheckCircle,
  BarChart3,
} from '@/components/ui/icons';
import { cn } from '@/lib/utils';

interface QuickStatsWidgetProps {
  title: string;
  value: string | number;
  subtitle?: string;
  trend?: {
    value: number;
    direction: 'up' | 'down' | 'neutral';
    label?: string;
  };
  icon?: 'dollar' | 'home' | 'target' | 'clock' | 'check' | 'chart';
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'info';
  className?: string;
}

const ICONS = {
  dollar: DollarSign,
  home: Home,
  target: Target,
  clock: Clock,
  check: CheckCircle,
  chart: BarChart3,
};

const VARIANTS = {
  default: {
    bg: 'bg-gray-100 dark:bg-gray-800',
    text: 'text-gray-600 dark:text-gray-400',
  },
  success: {
    bg: 'bg-green-100 dark:bg-green-900',
    text: 'text-green-600 dark:text-green-400',
  },
  warning: {
    bg: 'bg-yellow-100 dark:bg-yellow-900',
    text: 'text-yellow-600 dark:text-yellow-400',
  },
  danger: {
    bg: 'bg-red-100 dark:bg-red-900',
    text: 'text-red-600 dark:text-red-400',
  },
  info: {
    bg: 'bg-emerald-100 dark:bg-emerald-900',
    text: 'text-emerald-600 dark:text-emerald-400',
  },
};

export function QuickStatsWidget({
  title,
  value,
  subtitle,
  trend,
  icon = 'chart',
  variant = 'default',
  className,
}: QuickStatsWidgetProps) {
  const Icon = ICONS[icon];
  const variantStyles = VARIANTS[variant];

  const TrendIcon = trend?.direction === 'up' 
    ? TrendingUp 
    : trend?.direction === 'down' 
      ? TrendingDown 
      : Minus;

  const trendColor = trend?.direction === 'up'
    ? 'text-green-600'
    : trend?.direction === 'down'
      ? 'text-red-600'
      : 'text-gray-500';

  return (
    <Card className={cn('transition-shadow hover:shadow-md', className)}>
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">
              {title}
            </p>
            <p className="text-2xl font-bold">{value}</p>
            {subtitle && (
              <p className="text-xs text-muted-foreground">{subtitle}</p>
            )}
          </div>
          <div className={cn('p-2 rounded-md', variantStyles.bg)}>
            <Icon className={cn('h-5 w-5', variantStyles.text)} />
          </div>
        </div>
        
        {trend && (
          <div className="flex items-center gap-1 mt-3 pt-3 border-t">
            <TrendIcon className={cn('h-4 w-4', trendColor)} />
            <span className={cn('text-sm font-medium', trendColor)}>
              {trend.value > 0 ? '+' : ''}{trend.value}%
            </span>
            {trend.label && (
              <span className="text-xs text-muted-foreground">{trend.label}</span>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// Grid of stats for dashboard
interface StatsGridProps {
  deals: Array<{
    id: string;
    status: string;
    asking_price?: number;
    arv?: number;
    ai_score?: number;
    created_at: string;
  }>;
  className?: string;
}

export function StatsGrid({ deals, className }: StatsGridProps) {
  const stats = useMemo(() => {
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const sixtyDaysAgo = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000);

    // Current period deals
    const currentPeriodDeals = deals.filter(d => new Date(d.created_at) >= thirtyDaysAgo);
    
    // Previous period deals (for trend calculation)
    const previousPeriodDeals = deals.filter(d => {
      const date = new Date(d.created_at);
      return date >= sixtyDaysAgo && date < thirtyDaysAgo;
    });

    // Calculate metrics
    const totalDeals = deals.length;
    const newDealsThisMonth = currentPeriodDeals.length;
    const newDealsLastMonth = previousPeriodDeals.length;
    const dealsTrend = newDealsLastMonth > 0 
      ? ((newDealsThisMonth - newDealsLastMonth) / newDealsLastMonth) * 100 
      : newDealsThisMonth > 0 ? 100 : 0;

    const totalValue = deals.reduce((sum, d) => sum + (d.asking_price || 0), 0);
    const currentValue = currentPeriodDeals.reduce((sum, d) => sum + (d.asking_price || 0), 0);
    const previousValue = previousPeriodDeals.reduce((sum, d) => sum + (d.asking_price || 0), 0);
    const valueTrend = previousValue > 0 
      ? ((currentValue - previousValue) / previousValue) * 100 
      : currentValue > 0 ? 100 : 0;

    const avgScore = deals.filter(d => d.ai_score).length > 0
      ? deals.reduce((sum, d) => sum + (d.ai_score || 0), 0) / deals.filter(d => d.ai_score).length
      : 0;
    
    const currentAvgScore = currentPeriodDeals.filter(d => d.ai_score).length > 0
      ? currentPeriodDeals.reduce((sum, d) => sum + (d.ai_score || 0), 0) / currentPeriodDeals.filter(d => d.ai_score).length
      : 0;
    const previousAvgScore = previousPeriodDeals.filter(d => d.ai_score).length > 0
      ? previousPeriodDeals.reduce((sum, d) => sum + (d.ai_score || 0), 0) / previousPeriodDeals.filter(d => d.ai_score).length
      : 0;
    const scoreTrend = previousAvgScore > 0 
      ? ((currentAvgScore - previousAvgScore) / previousAvgScore) * 100 
      : 0;

    const closedDeals = deals.filter(d => d.status.toLowerCase() === 'closed').length;
    const conversionRate = totalDeals > 0 ? (closedDeals / totalDeals) * 100 : 0;

    return {
      totalDeals,
      dealsTrend,
      totalValue,
      valueTrend,
      avgScore,
      scoreTrend,
      closedDeals,
      conversionRate,
    };
  }, [deals]);

  const formatCurrency = (value: number): string => {
    if (value >= 1000000) return `$${(value / 1000000).toFixed(1)}M`;
    if (value >= 1000) return `$${(value / 1000).toFixed(0)}K`;
    return `$${value.toLocaleString()}`;
  };

  return (
    <div className={cn('grid grid-cols-2 md:grid-cols-4 gap-4', className)}>
      <QuickStatsWidget
        title="Total Deals"
        value={stats.totalDeals}
        icon="home"
        variant="info"
        trend={{
          value: Math.round(stats.dealsTrend),
          direction: stats.dealsTrend > 0 ? 'up' : stats.dealsTrend < 0 ? 'down' : 'neutral',
          label: 'vs last 30 days',
        }}
      />
      <QuickStatsWidget
        title="Pipeline Value"
        value={formatCurrency(stats.totalValue)}
        icon="dollar"
        variant="success"
        trend={{
          value: Math.round(stats.valueTrend),
          direction: stats.valueTrend > 0 ? 'up' : stats.valueTrend < 0 ? 'down' : 'neutral',
          label: 'vs last 30 days',
        }}
      />
      <QuickStatsWidget
        title="Avg AI Score"
        value={stats.avgScore.toFixed(0)}
        subtitle="Out of 100"
        icon="target"
        variant={stats.avgScore >= 70 ? 'success' : stats.avgScore >= 50 ? 'warning' : 'danger'}
        trend={{
          value: Math.round(stats.scoreTrend),
          direction: stats.scoreTrend > 0 ? 'up' : stats.scoreTrend < 0 ? 'down' : 'neutral',
        }}
      />
      <QuickStatsWidget
        title="Conversion Rate"
        value={`${stats.conversionRate.toFixed(1)}%`}
        subtitle={`${stats.closedDeals} closed`}
        icon="check"
        variant={stats.conversionRate >= 20 ? 'success' : stats.conversionRate >= 10 ? 'warning' : 'default'}
      />
    </div>
  );
}

// Mini stat for compact displays
export function MiniStat({
  label,
  value,
  icon,
}: {
  label: string;
  value: string | number;
  icon?: React.ReactNode;
}) {
  return (
    <div className="flex items-center gap-2">
      {icon && <span className="text-muted-foreground">{icon}</span>}
      <div>
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="text-sm font-medium">{value}</p>
      </div>
    </div>
  );
}
