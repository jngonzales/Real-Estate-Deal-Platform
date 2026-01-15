'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  TrendingUp,
  TrendingDown,
  Minus,
  Home,
  DollarSign,
  Clock,
  BarChart3,
  MapPin,
  RefreshCw,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface MarketMetric {
  label: string;
  value: string;
  change?: number;
  changeLabel?: string;
  icon: typeof Home;
}

interface MarketData {
  market: string;
  lastUpdated: string;
  metrics: {
    medianPrice: number;
    priceChange: number;
    daysOnMarket: number;
    domChange: number;
    listToSaleRatio: number;
    inventory: number;
    inventoryChange: number;
  };
  priceRanges: {
    range: string;
    percentage: number;
    count: number;
  }[];
  hotNeighborhoods: {
    name: string;
    growth: number;
  }[];
}

interface MarketTrendsProps {
  markets?: string[];
  onFetchMarketData?: (market: string) => Promise<MarketData>;
  className?: string;
}

// Demo data for when no API is connected
const DEMO_MARKETS: Record<string, MarketData> = {
  'Atlanta, GA': {
    market: 'Atlanta, GA',
    lastUpdated: new Date().toISOString(),
    metrics: {
      medianPrice: 425000,
      priceChange: 5.2,
      daysOnMarket: 28,
      domChange: -8,
      listToSaleRatio: 98.5,
      inventory: 12500,
      inventoryChange: -12,
    },
    priceRanges: [
      { range: 'Under $200K', percentage: 15, count: 1875 },
      { range: '$200K - $400K', percentage: 35, count: 4375 },
      { range: '$400K - $600K', percentage: 30, count: 3750 },
      { range: '$600K - $1M', percentage: 15, count: 1875 },
      { range: 'Over $1M', percentage: 5, count: 625 },
    ],
    hotNeighborhoods: [
      { name: 'East Atlanta', growth: 12.5 },
      { name: 'West End', growth: 10.2 },
      { name: 'Grant Park', growth: 8.8 },
      { name: 'Kirkwood', growth: 7.5 },
      { name: 'Summerhill', growth: 6.9 },
    ],
  },
  'Phoenix, AZ': {
    market: 'Phoenix, AZ',
    lastUpdated: new Date().toISOString(),
    metrics: {
      medianPrice: 450000,
      priceChange: 3.8,
      daysOnMarket: 35,
      domChange: 5,
      listToSaleRatio: 97.2,
      inventory: 18000,
      inventoryChange: 8,
    },
    priceRanges: [
      { range: 'Under $200K', percentage: 10, count: 1800 },
      { range: '$200K - $400K', percentage: 30, count: 5400 },
      { range: '$400K - $600K', percentage: 35, count: 6300 },
      { range: '$600K - $1M', percentage: 18, count: 3240 },
      { range: 'Over $1M', percentage: 7, count: 1260 },
    ],
    hotNeighborhoods: [
      { name: 'Arcadia', growth: 9.5 },
      { name: 'Gilbert', growth: 8.2 },
      { name: 'Scottsdale', growth: 7.8 },
      { name: 'Tempe', growth: 6.5 },
      { name: 'Mesa', growth: 5.9 },
    ],
  },
  'Dallas, TX': {
    market: 'Dallas, TX',
    lastUpdated: new Date().toISOString(),
    metrics: {
      medianPrice: 395000,
      priceChange: 4.5,
      daysOnMarket: 32,
      domChange: -2,
      listToSaleRatio: 98.0,
      inventory: 22000,
      inventoryChange: -5,
    },
    priceRanges: [
      { range: 'Under $200K', percentage: 12, count: 2640 },
      { range: '$200K - $400K', percentage: 38, count: 8360 },
      { range: '$400K - $600K', percentage: 28, count: 6160 },
      { range: '$600K - $1M', percentage: 16, count: 3520 },
      { range: 'Over $1M', percentage: 6, count: 1320 },
    ],
    hotNeighborhoods: [
      { name: 'Bishop Arts', growth: 11.2 },
      { name: 'Deep Ellum', growth: 9.8 },
      { name: 'Oak Cliff', growth: 8.5 },
      { name: 'Uptown', growth: 7.2 },
      { name: 'Frisco', growth: 6.8 },
    ],
  },
};

export function MarketTrends({
  markets = ['Atlanta, GA', 'Phoenix, AZ', 'Dallas, TX'],
  onFetchMarketData,
  className,
}: MarketTrendsProps) {
  const [selectedMarket, setSelectedMarket] = useState(markets[0]);
  const [loading, setLoading] = useState(false);
  const [marketData, setMarketData] = useState<MarketData>(
    DEMO_MARKETS[markets[0]] || DEMO_MARKETS['Atlanta, GA']
  );

  const handleMarketChange = async (market: string) => {
    setSelectedMarket(market);
    
    if (onFetchMarketData) {
      setLoading(true);
      try {
        const data = await onFetchMarketData(market);
        setMarketData(data);
      } catch {
        // Fall back to demo data
        setMarketData(DEMO_MARKETS[market] || DEMO_MARKETS['Atlanta, GA']);
      } finally {
        setLoading(false);
      }
    } else {
      // Use demo data
      setMarketData(DEMO_MARKETS[market] || DEMO_MARKETS['Atlanta, GA']);
    }
  };

  const handleRefresh = async () => {
    await handleMarketChange(selectedMarket);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('en-US').format(num);
  };

  const TrendIcon = ({ change }: { change: number }) => {
    if (change > 0) return <TrendingUp className="h-4 w-4 text-green-500" />;
    if (change < 0) return <TrendingDown className="h-4 w-4 text-red-500" />;
    return <Minus className="h-4 w-4 text-muted-foreground" />;
  };

  const getChangeColor = (change: number, inverse = false) => {
    if (change === 0) return 'text-muted-foreground';
    if (inverse) {
      return change > 0 ? 'text-red-500' : 'text-green-500';
    }
    return change > 0 ? 'text-green-500' : 'text-red-500';
  };

  const metrics: MarketMetric[] = [
    {
      label: 'Median Price',
      value: formatCurrency(marketData.metrics.medianPrice),
      change: marketData.metrics.priceChange,
      changeLabel: 'vs last year',
      icon: DollarSign,
    },
    {
      label: 'Days on Market',
      value: `${marketData.metrics.daysOnMarket} days`,
      change: marketData.metrics.domChange,
      changeLabel: 'vs last month',
      icon: Clock,
    },
    {
      label: 'List-to-Sale Ratio',
      value: `${marketData.metrics.listToSaleRatio}%`,
      icon: BarChart3,
    },
    {
      label: 'Active Inventory',
      value: formatNumber(marketData.metrics.inventory),
      change: marketData.metrics.inventoryChange,
      changeLabel: 'vs last month',
      icon: Home,
    },
  ];

  return (
    <Card className={cn('', className)}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Market Trends
            </CardTitle>
            <CardDescription>Real estate market insights</CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Select value={selectedMarket} onValueChange={handleMarketChange}>
              <SelectTrigger className="w-40">
                <MapPin className="h-4 w-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {markets.map((market) => (
                  <SelectItem key={market} value={market}>
                    {market}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleRefresh}
              disabled={loading}
            >
              <RefreshCw className={cn('h-4 w-4', loading && 'animate-spin')} />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Key Metrics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {metrics.map((metric) => {
            const Icon = metric.icon;
            return (
              <div
                key={metric.label}
                className="p-3 rounded-lg border bg-card"
              >
                <div className="flex items-center gap-2 text-muted-foreground mb-1">
                  <Icon className="h-4 w-4" />
                  <span className="text-xs">{metric.label}</span>
                </div>
                <p className="text-lg font-semibold">{metric.value}</p>
                {metric.change !== undefined && (
                  <div className="flex items-center gap-1 mt-1">
                    <TrendIcon change={metric.change} />
                    <span
                      className={cn(
                        'text-xs',
                        getChangeColor(
                          metric.change,
                          metric.label === 'Days on Market'
                        )
                      )}
                    >
                      {metric.change > 0 ? '+' : ''}
                      {metric.change}%
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {metric.changeLabel}
                    </span>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Price Distribution */}
        <div>
          <h4 className="text-sm font-semibold mb-3">Price Distribution</h4>
          <div className="space-y-2">
            {marketData.priceRanges.map((range) => (
              <div key={range.range} className="space-y-1">
                <div className="flex justify-between text-sm">
                  <span>{range.range}</span>
                  <span className="text-muted-foreground">
                    {formatNumber(range.count)} ({range.percentage}%)
                  </span>
                </div>
                <Progress value={range.percentage} className="h-2" />
              </div>
            ))}
          </div>
        </div>

        {/* Hot Neighborhoods */}
        <div>
          <h4 className="text-sm font-semibold mb-3">Hot Neighborhoods</h4>
          <div className="flex flex-wrap gap-2">
            {marketData.hotNeighborhoods.map((neighborhood) => (
              <Badge
                key={neighborhood.name}
                variant="secondary"
                className="flex items-center gap-1"
              >
                <TrendingUp className="h-3 w-3 text-green-500" />
                {neighborhood.name}
                <span className="text-green-500">+{neighborhood.growth}%</span>
              </Badge>
            ))}
          </div>
        </div>

        {/* Data Source Note */}
        <p className="text-xs text-muted-foreground text-center">
          Data is for demonstration purposes. Connect to real data sources for live insights.
        </p>
      </CardContent>
    </Card>
  );
}
