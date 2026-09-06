'use client';

import { HealthResult } from '@/lib/health-checks';
import { XCircle, Clock, AlertTriangle, CheckCircle } from '@/components/ui/icons';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface ErrorLogProps {
  results: HealthResult[];
}

export function ErrorLog({ results }: ErrorLogProps) {
  // Filter for errors and warnings only
  const issues = results.filter(
    (r) => r.status === 'error' || r.status === 'warning'
  );

  if (issues.length === 0) {
    return (
      <Card className="bg-green-500/10 border-green-500/30">
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-green-500/20">
              <CheckCircle className="w-5 h-5 text-green-500" />
            </div>
            <div>
              <h3 className="font-medium text-green-600 dark:text-green-400">No Issues Detected</h3>
              <p className="text-sm text-muted-foreground">
                All endpoints are responding normally
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <AlertTriangle className="w-5 h-5 text-yellow-500" />
          Issues ({issues.length})
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3 max-h-[400px] overflow-y-auto">
          {issues.map((issue, idx) => (
            <div
              key={idx}
              className={`p-3 rounded-lg border ${
                issue.status === 'error'
                  ? 'bg-red-500/10 border-red-500/30'
                  : 'bg-yellow-500/10 border-yellow-500/30'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  {issue.status === 'error' ? (
                    <XCircle className="w-4 h-4 text-red-500 shrink-0" />
                  ) : (
                    <AlertTriangle className="w-4 h-4 text-yellow-500 shrink-0" />
                  )}
                  <span className="font-medium">{issue.name}</span>
                </div>
                <span className="text-xs text-muted-foreground uppercase">
                  {issue.category}
                </span>
              </div>
              <p
                className={`text-sm mt-1 ml-6 ${
                  issue.status === 'error' ? 'text-red-600 dark:text-red-400' : 'text-yellow-600 dark:text-yellow-400'
                }`}
              >
                {issue.message}
              </p>
              <div className="flex items-center gap-4 mt-2 ml-6 text-xs text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {issue.lastChecked
                    ? new Date(issue.lastChecked).toLocaleTimeString()
                    : 'N/A'}
                </span>
                <span>
                  {issue.responseTime !== null
                    ? `${issue.responseTime}ms`
                    : 'Timeout'}
                </span>
                <code className="text-xs bg-muted px-1.5 py-0.5 rounded">
                  {issue.endpoint}
                </code>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
