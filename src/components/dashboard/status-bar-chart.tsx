"use client";

import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";

interface StatusBarChartProps {
  data: { name: string; value: number; color: string }[];
}

export function StatusBarChart({ data }: StatusBarChartProps) {
  const total = data.reduce((sum, item) => sum + item.value, 0);
  const maxValue = Math.max(...data.map(d => d.value), 1);

  if (total === 0) {
    return (
      <div className="flex h-[250px] items-center justify-center text-muted-foreground">
        <div className="text-center">
          <div className="mx-auto mb-3 h-16 w-16 rounded-full bg-secondary/50 flex items-center justify-center">
            <svg className="h-8 w-8 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>
          <p className="text-sm">No data available</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {data.map((item, index) => (
        <div key={index} className="group">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-sm text-muted-foreground group-hover:text-foreground/90 transition-colors">
              {item.name}
            </span>
            <span className="text-sm font-semibold text-foreground">
              {item.value}
            </span>
          </div>
          <div className="relative h-3 w-full overflow-hidden rounded-full bg-secondary/50">
            <div
              className="absolute inset-y-0 left-0 rounded-full transition-all duration-500 ease-out group-hover:brightness-110"
              style={{
                width: `${(item.value / maxValue) * 100}%`,
                background: `linear-gradient(90deg, ${item.color}cc, ${item.color})`,
                boxShadow: `0 0 12px ${item.color}40`,
              }}
            />
          </div>
        </div>
      ))}
      
      {/* Total */}
      <div className="pt-3 mt-3 border-t border-border">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-foreground/90">Total Deals</span>
          <span className="text-lg font-bold text-white">{total}</span>
        </div>
      </div>
    </div>
  );
}
