"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Brain,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Sparkles,
  Loader2,
  RefreshCw,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { DealScore } from "@/lib/ai/deal-scoring";
import { cn } from "@/lib/utils";

interface AIScoreCardProps {
  score: DealScore | null;
  loading?: boolean;
  onRefresh?: () => void;
  compact?: boolean;
}

const gradeColors: Record<string, string> = {
  A: "bg-green-500",
  B: "bg-blue-500",
  C: "bg-yellow-500",
  D: "bg-orange-500",
  F: "bg-red-500",
};

const recommendationStyles: Record<string, { bg: string; text: string; icon: React.ElementType }> = {
  "STRONG BUY": { bg: "bg-green-500/10", text: "text-green-600 dark:text-green-400", icon: TrendingUp },
  "BUY": { bg: "bg-blue-500/10", text: "text-blue-600 dark:text-blue-400", icon: TrendingUp },
  "REVIEW": { bg: "bg-yellow-500/10", text: "text-yellow-600 dark:text-yellow-400", icon: AlertTriangle },
  "PASS": { bg: "bg-orange-500/10", text: "text-orange-600 dark:text-orange-400", icon: TrendingDown },
  "REJECT": { bg: "bg-red-500/10", text: "text-red-600 dark:text-red-400", icon: XCircle },
};

export function AIScoreCard({ score, loading, onRefresh, compact = false }: AIScoreCardProps) {
  const [expanded, setExpanded] = useState(!compact);

  if (loading) {
    return (
      <Card className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-purple-500/5 to-primary/5 animate-pulse" />
        <CardContent className="py-8">
          <div className="flex flex-col items-center justify-center gap-4">
            <div className="relative">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                <Brain className="w-8 h-8 text-primary animate-pulse" />
              </div>
              <Loader2 className="absolute -bottom-1 -right-1 w-6 h-6 text-primary animate-spin" />
            </div>
            <div className="text-center">
              <p className="font-semibold text-foreground">AI Analyzing Deal...</p>
              <p className="text-sm text-muted-foreground">Evaluating metrics and risks</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!score) {
    return (
      <Card>
        <CardContent className="py-8">
          <div className="flex flex-col items-center justify-center gap-4 text-center">
            <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center">
              <Brain className="w-8 h-8 text-muted-foreground" />
            </div>
            <div>
              <p className="font-semibold">No AI Score Yet</p>
              <p className="text-sm text-muted-foreground">Click to analyze this deal</p>
            </div>
            {onRefresh && (
              <Button onClick={onRefresh} variant="outline" size="sm">
                <Sparkles className="w-4 h-4 mr-2" />
                Analyze with AI
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    );
  }

  const RecIcon = recommendationStyles[score.recommendation]?.icon || AlertTriangle;

  return (
    <Card className="relative overflow-hidden">
      {/* Animated background */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-purple-500/5" />
      
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Brain className="w-5 h-5 text-primary" />
            AI Deal Score
          </CardTitle>
          <div className="flex items-center gap-2">
            {onRefresh && (
              <Button variant="ghost" size="icon" onClick={onRefresh} className="h-8 w-8">
                <RefreshCw className="w-4 h-4" />
              </Button>
            )}
            {compact && (
              <Button variant="ghost" size="icon" onClick={() => setExpanded(!expanded)} className="h-8 w-8">
                {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </Button>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="relative">
        {/* Main Score Display */}
        <div className="flex items-center gap-6 mb-4">
          {/* Score Circle */}
          <div className="relative">
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: "spring", stiffness: 200, damping: 15 }}
              className={cn(
                "w-20 h-20 rounded-full flex items-center justify-center text-white font-bold text-2xl shadow-lg",
                gradeColors[score.grade]
              )}
            >
              {score.score}
            </motion.div>
            <Badge 
              className={cn(
                "absolute -bottom-1 -right-1 text-xs font-bold px-2",
                gradeColors[score.grade]
              )}
            >
              {score.grade}
            </Badge>
          </div>

          {/* Recommendation */}
          <div className="flex-1">
            <div className={cn(
              "inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-semibold mb-2",
              recommendationStyles[score.recommendation]?.bg,
              recommendationStyles[score.recommendation]?.text
            )}>
              <RecIcon className="w-4 h-4" />
              {score.recommendation}
            </div>
            <p className="text-sm text-muted-foreground">{score.summary}</p>
          </div>
        </div>

        {/* Score Bar */}
        <div className="mb-4">
          <div className="flex justify-between text-xs text-muted-foreground mb-1">
            <span>Poor</span>
            <span>Excellent</span>
          </div>
          <Progress value={score.score} className="h-2" />
        </div>

        <AnimatePresence>
          {expanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              {/* Quick Stats */}
              <div className="grid grid-cols-2 gap-3 mb-4">
                <div className="p-3 rounded-lg bg-muted/50">
                  <p className="text-xs text-muted-foreground">Profit Potential</p>
                  <p className={cn(
                    "font-semibold",
                    score.profitPotential === "HIGH" && "text-green-600 dark:text-green-400",
                    score.profitPotential === "MEDIUM" && "text-yellow-600 dark:text-yellow-400",
                    score.profitPotential === "LOW" && "text-red-600 dark:text-red-400"
                  )}>
                    {score.profitPotential}
                  </p>
                </div>
                <div className="p-3 rounded-lg bg-muted/50">
                  <p className="text-xs text-muted-foreground">Est. Time to Close</p>
                  <p className="font-semibold">{score.timeToClose}</p>
                </div>
              </div>

              {/* Strengths */}
              {score.strengths.length > 0 && (
                <div className="mb-3">
                  <p className="text-sm font-medium text-green-600 dark:text-green-400 mb-2 flex items-center gap-1">
                    <CheckCircle className="w-4 h-4" />
                    Strengths
                  </p>
                  <ul className="space-y-1">
                    {score.strengths.map((strength, i) => (
                      <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                        <span className="text-green-500 mt-1">•</span>
                        {strength}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Weaknesses */}
              {score.weaknesses.length > 0 && (
                <div className="mb-3">
                  <p className="text-sm font-medium text-orange-600 dark:text-orange-400 mb-2 flex items-center gap-1">
                    <AlertTriangle className="w-4 h-4" />
                    Weaknesses
                  </p>
                  <ul className="space-y-1">
                    {score.weaknesses.map((weakness, i) => (
                      <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                        <span className="text-orange-500 mt-1">•</span>
                        {weakness}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Risk Factors */}
              {score.riskFactors.length > 0 && (
                <div>
                  <p className="text-sm font-medium text-red-600 dark:text-red-400 mb-2 flex items-center gap-1">
                    <XCircle className="w-4 h-4" />
                    Risk Factors
                  </p>
                  <ul className="space-y-1">
                    {score.riskFactors.map((risk, i) => (
                      <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                        <span className="text-red-500 mt-1">•</span>
                        {risk}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Powered by AI badge */}
        <div className="mt-4 pt-3 border-t flex items-center justify-center gap-2 text-xs text-muted-foreground">
          <Sparkles className="w-3 h-3" />
          Powered by AI Analysis
        </div>
      </CardContent>
    </Card>
  );
}
