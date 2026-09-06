'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { healthChecks, runHealthCheck, HealthResult } from '@/lib/health-checks';
import { StatusGrid } from '@/components/status-checker/status-grid';
import { HealthMetrics } from '@/components/status-checker/health-metrics';
import { ErrorLog } from '@/components/status-checker/error-log';
import { RefreshCw, Activity, Clock, Download, ArrowLeft } from '@/components/ui/icons';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import Link from 'next/link';

function formatTimeAgo(date: Date): string {
  const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);
  if (seconds < 60) return `${seconds}s ago`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  return `${hours}h ago`;
}

export default function StatusPage() {
  const [results, setResults] = useState<HealthResult[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [lastCheck, setLastCheck] = useState<Date | null>(null);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [filter, setFilter] = useState<string>('all');
  const hasInitialized = useRef(false);

  const runChecks = useCallback(async () => {
    setIsLoading(true);
    
    const newResults: HealthResult[] = [];
    
    // Run checks sequentially to avoid overwhelming the server
    for (const check of healthChecks) {
      const result = await runHealthCheck(check);
      newResults.push(result);
    }
    
    setResults(newResults);
    setLastCheck(new Date());
    setIsLoading(false);
  }, []);

  // Initial check - runs once on mount
  useEffect(() => {
    if (!hasInitialized.current) {
      hasInitialized.current = true;
      const timer = setTimeout(() => {
        runChecks();
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [runChecks]);

  // Auto-refresh every 30 seconds
  useEffect(() => {
    if (!autoRefresh) return;
    
    const interval = setInterval(() => {
      runChecks();
    }, 30000);
    
    return () => clearInterval(interval);
  }, [autoRefresh, runChecks]);

  const filteredResults = results.filter(result => {
    if (filter === 'all') return true;
    if (filter === 'issues') return result.status === 'error' || result.status === 'warning';
    return result.category === filter;
  });

  const categories = ['all', 'issues', 'api', 'database', 'feature', 'integration'];

  const exportResults = () => {
    const data = {
      timestamp: new Date().toISOString(),
      results,
      summary: {
        total: results.length,
        healthy: results.filter(r => r.status === 'healthy').length,
        warning: results.filter(r => r.status === 'warning').length,
        error: results.filter(r => r.status === 'error').length,
      }
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `health-check-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-background p-6">
      {/* Header */}
      <header className="mb-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <Link href="/dashboard">
              <Button variant="ghost" size="icon">
                <ArrowLeft className="w-5 h-5" />
              </Button>
            </Link>
            <div className="flex items-center gap-3">
              <Activity className="w-8 h-8 text-green-500" />
              <div>
                <h1 className="text-2xl font-bold">System Status</h1>
                <p className="text-muted-foreground text-sm">Real-time health monitoring</p>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            {lastCheck && (
              <div className="flex items-center gap-2 text-muted-foreground text-sm">
                <Clock className="w-4 h-4" />
                <span>Updated {formatTimeAgo(lastCheck)}</span>
              </div>
            )}
            
            <div className="flex items-center gap-2">
              <Switch
                id="auto-refresh"
                checked={autoRefresh}
                onCheckedChange={setAutoRefresh}
              />
              <Label htmlFor="auto-refresh" className="text-sm">
                Auto-refresh (30s)
              </Label>
            </div>
            
            <Button
              variant="outline"
              size="sm"
              onClick={exportResults}
              disabled={results.length === 0}
            >
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
            
            <Button
              onClick={runChecks}
              disabled={isLoading}
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
              {isLoading ? 'Checking...' : 'Refresh'}
            </Button>
          </div>
        </div>
        
        {/* Summary Cards */}
        <HealthMetrics results={results} />
      </header>

      {/* Filter Tabs */}
      <div className="flex gap-2 mb-6 flex-wrap">
        {categories.map((cat) => (
          <Button
            key={cat}
            variant={filter === cat ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilter(cat)}
            className="capitalize"
          >
            {cat === 'issues' ? 'Issues' : cat}
            {cat === 'issues' && (
              <span className="ml-2 px-1.5 py-0.5 text-xs rounded-full bg-yellow-500/20 text-yellow-600">
                {results.filter(r => r.status === 'error' || r.status === 'warning').length}
              </span>
            )}
          </Button>
        ))}
      </div>

      {/* Status Grid */}
      <div className="mb-8">
        <StatusGrid results={filteredResults} isLoading={isLoading} />
      </div>

      {/* Error Log */}
      <ErrorLog results={results} />
    </div>
  );
}
