'use client';

import { HealthResult } from '@/lib/health-checks';
import { CheckCircle, AlertTriangle, XCircle, Activity, Clock, Zap } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

interface HealthMetricsProps {
  results: HealthResult[];
}

export function HealthMetrics({ results }: HealthMetricsProps) {
  const healthy = results.filter((r) => r.status === 'healthy').length;
  const warning = results.filter((r) => r.status === 'warning').length;
  const error = results.filter((r) => r.status === 'error').length;
  
  const total = results.length;
  const healthPercentage = total > 0 ? Math.round((healthy / total) * 100) : 0;
  
  const responseTimes = results.filter((r) => r.responseTime !== null).map((r) => r.responseTime as number);
  const avgResponseTime = responseTimes.length > 0 
    ? Math.round(responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length) 
    : 0;

  const overallStatus = error > 0 
    ? 'Critical Issues Detected' 
    : warning > 0 
      ? 'Some Warnings' 
      : 'All Systems Operational';
  
  const overallColor = error > 0 
    ? 'text-red-500' 
    : warning > 0 
      ? 'text-yellow-500' 
      : 'text-green-500';

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      {/* Overall Health */}
      <Card className="bg-primary/10">
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-4">
            <Activity className="w-6 h-6 text-primary" />
            <span className="text-3xl font-bold">{healthPercentage}%</span>
          </div>
          <h3 className="text-sm text-muted-foreground">System Health</h3>
          <p className={`text-sm font-medium ${overallColor}`}>{overallStatus}</p>
        </CardContent>
      </Card>

      {/* Status Breakdown */}
      <Card>
        <CardContent className="p-4">
          <h3 className="text-sm text-muted-foreground mb-4">Status Breakdown</h3>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-500" />
                <span className="text-sm">Healthy</span>
              </div>
              <span className="font-semibold text-green-500">{healthy}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-yellow-500" />
                <span className="text-sm">Warning</span>
              </div>
              <span className="font-semibold text-yellow-500">{warning}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <XCircle className="w-4 h-4 text-red-500" />
                <span className="text-sm">Error</span>
              </div>
              <span className="font-semibold text-red-500">{error}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Response Time */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-4">
            <Clock className="w-6 h-6 text-muted-foreground" />
            <span className="text-3xl font-bold">{avgResponseTime}</span>
          </div>
          <h3 className="text-sm text-muted-foreground">Avg Response Time</h3>
          <p className="text-sm text-muted-foreground">milliseconds</p>
        </CardContent>
      </Card>

      {/* Endpoints Checked */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-4">
            <Zap className="w-6 h-6 text-amber-500" />
            <span className="text-3xl font-bold">{total}</span>
          </div>
          <h3 className="text-sm text-muted-foreground">Endpoints Checked</h3>
          <p className="text-sm text-amber-500">Total monitored</p>
        </CardContent>
      </Card>
    </div>
  );
}
