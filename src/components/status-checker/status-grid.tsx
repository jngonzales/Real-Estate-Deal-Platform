'use client';

import { HealthResult } from '@/lib/health-checks';
import { CheckCircle, AlertTriangle, XCircle, HelpCircle, ExternalLink } from '@/components/ui/icons';
import { Card, CardContent } from '@/components/ui/card';

interface StatusGridProps {
  results: HealthResult[];
  isLoading: boolean;
}

const statusConfig = {
  healthy: {
    icon: CheckCircle,
    color: 'text-green-500',
    bgColor: 'bg-green-500/10',
    borderColor: 'border-green-500/30',
    label: 'Healthy',
  },
  warning: {
    icon: AlertTriangle,
    color: 'text-yellow-500',
    bgColor: 'bg-yellow-500/10',
    borderColor: 'border-yellow-500/30',
    label: 'Warning',
  },
  error: {
    icon: XCircle,
    color: 'text-red-500',
    bgColor: 'bg-red-500/10',
    borderColor: 'border-red-500/30',
    label: 'Error',
  },
  unknown: {
    icon: HelpCircle,
    color: 'text-muted-foreground',
    bgColor: 'bg-muted/50',
    borderColor: 'border-muted',
    label: 'Unknown',
  },
};

function StatusCard({ result }: { result: HealthResult }) {
  const config = statusConfig[result.status];
  const Icon = config.icon;

  return (
    <Card className={`${config.bgColor} ${config.borderColor} border transition-all hover:shadow-md`}>
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className={`w-2 h-2 rounded-full ${
              result.status === 'healthy' ? 'bg-green-500 animate-pulse' :
              result.status === 'warning' ? 'bg-yellow-500' :
              result.status === 'error' ? 'bg-red-500' : 'bg-gray-500'
            }`} />
            <span className="text-xs text-muted-foreground uppercase tracking-wide">
              {result.category}
            </span>
          </div>
          <Icon className={`w-5 h-5 ${config.color}`} />
        </div>
        
        <h3 className="font-semibold mb-1">{result.name}</h3>
        <p className={`text-sm ${config.color}`}>{result.message}</p>
        
        <div className="flex items-center justify-between mt-3 pt-3 border-t border-border/50">
          <span className="text-xs text-muted-foreground">
            {result.responseTime !== null ? `${result.responseTime}ms` : 'N/A'}
          </span>
          <a
            href={result.endpoint}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1"
          >
            <ExternalLink className="w-3 h-3" />
            <span>View</span>
          </a>
        </div>
      </CardContent>
    </Card>
  );
}

function LoadingSkeleton() {
  return (
    <Card className="animate-pulse">
      <CardContent className="p-4">
        <div className="h-4 bg-muted rounded w-3/4 mb-2" />
        <div className="h-3 bg-muted rounded w-1/2 mb-4" />
        <div className="h-3 bg-muted rounded w-1/4" />
      </CardContent>
    </Card>
  );
}

export function StatusGrid({ results, isLoading }: StatusGridProps) {
  if (isLoading && results.length === 0) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {[...Array(8)].map((_, i) => (
          <LoadingSkeleton key={i} />
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {results.map((result) => (
        <StatusCard key={result.id} result={result} />
      ))}
    </div>
  );
}
