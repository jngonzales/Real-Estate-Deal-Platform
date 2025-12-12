"use client";

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";

interface PipelineChartProps {
  data: { name: string; value: number; color: string }[];
}

export function PipelineChart({ data }: PipelineChartProps) {
  const total = data.reduce((sum, item) => sum + item.value, 0);

  if (total === 0) {
    return (
      <div className="flex h-[250px] items-center justify-center text-muted-foreground">
        <div className="text-center">
          <div className="mx-auto mb-3 h-16 w-16 rounded-full bg-slate-800/50 flex items-center justify-center">
            <svg className="h-8 w-8 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z" />
            </svg>
          </div>
          <p className="text-sm">No deals in pipeline yet</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative">
      <ResponsiveContainer width="100%" height={250}>
        <PieChart>
          <defs>
            {data.map((entry, index) => (
              <linearGradient key={`gradient-${index}`} id={`pieGradient-${index}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={entry.color} stopOpacity={1} />
                <stop offset="100%" stopColor={entry.color} stopOpacity={0.7} />
              </linearGradient>
            ))}
          </defs>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={55}
            outerRadius={90}
            paddingAngle={3}
            dataKey="value"
            stroke="none"
            animationDuration={800}
            animationBegin={0}
          >
            {data.map((entry, index) => (
              <Cell 
                key={`cell-${index}`} 
                fill={`url(#pieGradient-${index})`}
                stroke="none"
                style={{ filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))' }}
              />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{
              backgroundColor: "rgba(15, 23, 42, 0.95)",
              border: "1px solid rgba(148, 163, 184, 0.2)",
              borderRadius: "12px",
              color: "#f1f5f9",
              boxShadow: "0 8px 32px rgba(0, 0, 0, 0.4)",
              padding: "12px 16px",
            }}
            itemStyle={{ color: "#f1f5f9" }}
            formatter={(value: number, name: string) => [`${value} deals`, name]}
          />
        </PieChart>
      </ResponsiveContainer>
      
      {/* Center label */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center pointer-events-none">
        <p className="text-3xl font-bold text-white">{total}</p>
        <p className="text-xs text-slate-400 uppercase tracking-wide">Total</p>
      </div>
      
      {/* Legend */}
      <div className="mt-4 flex flex-wrap justify-center gap-4">
        {data.map((entry, index) => (
          <div key={index} className="flex items-center gap-2">
            <div 
              className="h-3 w-3 rounded-full" 
              style={{ backgroundColor: entry.color, boxShadow: `0 0 8px ${entry.color}40` }}
            />
            <span className="text-xs text-slate-400">{entry.name}</span>
            <span className="text-xs font-medium text-slate-300">{entry.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
