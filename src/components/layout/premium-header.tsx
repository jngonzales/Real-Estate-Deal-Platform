"use client";

import { Sparkles, TrendingUp } from "lucide-react";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";

interface StatItem {
  label: string;
  value: string;
  trend?: number;
  icon?: React.ReactNode;
}

interface PremiumHeaderProps {
  title: string;
  subtitle?: string;
  stats?: StatItem[];
}

export function PremiumHeader({ title, subtitle, stats }: PremiumHeaderProps) {
  return (
    <div className="relative overflow-hidden rounded-lg">
      {/* Animated gradient background */}
      <div className="absolute inset-0 gradient-bg opacity-50" />
      
      {/* Floating orbs */}
      <div className="absolute top-0 left-1/4 w-72 h-72 bg-primary/10 rounded-full blur-3xl animate-pulse" />
      <div 
        className="absolute bottom-0 right-1/4 w-96 h-96 bg-chart-2/10 rounded-full blur-3xl animate-pulse" 
        style={{ animationDelay: "1s" }} 
      />
      
      <div className="relative px-6 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex items-center gap-3 mb-2">
            <Sparkles className="w-6 h-6 text-primary animate-pulse" />
            <h1 className="text-4xl font-bold bg-linear-to-r from-foreground to-foreground/60 bg-clip-text text-transparent">
              {title}
            </h1>
          </div>
          {subtitle && (
            <p className="text-muted-foreground text-lg">{subtitle}</p>
          )}
        </motion.div>

        {/* Stats cards */}
        {stats && stats.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
            {stats.map((stat, idx) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: idx * 0.1, duration: 0.3 }}
              >
                <Card className="glass-card card-hover p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">{stat.label}</p>
                      <p className="text-2xl font-bold mt-1">{stat.value}</p>
                      {stat.trend !== undefined && (
                        <div className={`flex items-center gap-1 mt-1 text-sm ${stat.trend >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                          <TrendingUp 
                            className="w-4 h-4" 
                            style={{ transform: stat.trend < 0 ? 'rotate(180deg)' : 'none' }} 
                          />
                          <span>{Math.abs(stat.trend)}%</span>
                        </div>
                      )}
                    </div>
                    {stat.icon && (
                      <div className="p-3 rounded-full bg-primary/10">
                        {stat.icon}
                      </div>
                    )}
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
