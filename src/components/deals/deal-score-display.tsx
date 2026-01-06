"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { calculateDealScore, DealScoreInput, DealScoreResult } from "@/lib/actions/deal-score";
import {
  Brain,
  TrendingUp,
  Building,
  Target,
  CheckCircle,
  AlertTriangle,
  RefreshCw,
  ChevronDown,
  ChevronUp,
  Sparkles,
} from "lucide-react";

interface DealScoreDisplayProps {
  dealData: DealScoreInput;
  compact?: boolean;
}

const gradeColors: Record<string, string> = {
  A: "text-emerald-400 bg-emerald-400/20 border-emerald-400/30",
  B: "text-green-400 bg-green-400/20 border-green-400/30",
  C: "text-yellow-400 bg-yellow-400/20 border-yellow-400/30",
  D: "text-orange-400 bg-orange-400/20 border-orange-400/30",
  F: "text-red-400 bg-red-400/20 border-red-400/30",
};

const recommendationColors: Record<string, string> = {
  "Strong Buy": "text-emerald-400",
  "Buy": "text-green-400",
  "Review": "text-yellow-400",
  "Pass": "text-orange-400",
  "Avoid": "text-red-400",
};

export function DealScoreDisplay({ dealData, compact = false }: DealScoreDisplayProps) {
  const [score, setScore] = useState<DealScoreResult | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [expanded, setExpanded] = useState(!compact);

  useEffect(() => {
    const loadScore = async () => {
      setIsLoading(true);
      try {
        const result = await calculateDealScore(dealData);
        setScore(result);
      } catch (error) {
        console.error("Error calculating deal score:", error);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadScore();
  }, [dealData]);

  const handleRetry = async () => {
    setIsLoading(true);
    try {
      const result = await calculateDealScore(dealData);
      setScore(result);
    } catch (error) {
      console.error("Error calculating deal score:", error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <Card className="bg-slate-800/50 border-white/10">
        <CardContent className="py-8 text-center">
          <RefreshCw className="h-8 w-8 text-primary animate-spin mx-auto mb-2" />
          <p className="text-slate-400">Analyzing deal...</p>
        </CardContent>
      </Card>
    );
  }

  if (!score) {
    return (
      <Card className="bg-slate-800/50 border-white/10">
        <CardContent className="py-8 text-center">
          <AlertTriangle className="h-8 w-8 text-yellow-400 mx-auto mb-2" />
          <p className="text-slate-400">Unable to calculate score</p>
          <Button variant="ghost" onClick={handleRetry} className="mt-2">
            <RefreshCw className="h-4 w-4 mr-2" />
            Retry
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (compact && !expanded) {
    return (
      <Card className="bg-slate-800/50 border-white/10 cursor-pointer hover:bg-slate-800/70 transition-colors" onClick={() => setExpanded(true)}>
        <CardContent className="py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`h-12 w-12 rounded-full flex items-center justify-center text-2xl font-bold border-2 ${gradeColors[score.grade]}`}>
                {score.grade}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <Brain className="h-4 w-4 text-primary" />
                  <span className="text-white font-medium">AI Deal Score</span>
                </div>
                <span className={`text-sm ${recommendationColors[score.recommendation]}`}>
                  {score.recommendation}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <div className="text-2xl font-bold text-white">{score.overallScore}</div>
                <div className="text-xs text-slate-400">out of 100</div>
              </div>
              <ChevronDown className="h-5 w-5 text-slate-400" />
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-slate-800/50 border-white/10">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-primary to-purple-600 flex items-center justify-center">
              <Brain className="h-4 w-4 text-white" />
            </div>
            <div>
              <CardTitle className="text-white text-lg">AI Deal Quality Score</CardTitle>
              <CardDescription>Automated investment analysis</CardDescription>
            </div>
          </div>
          {compact && (
            <Button variant="ghost" size="sm" onClick={() => setExpanded(false)}>
              <ChevronUp className="h-4 w-4" />
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Main Score Display */}
        <div className="flex items-center justify-between p-4 rounded-xl bg-slate-900/50">
          <div className="flex items-center gap-4">
            <div className={`h-20 w-20 rounded-full flex items-center justify-center text-4xl font-bold border-4 ${gradeColors[score.grade]}`}>
              {score.grade}
            </div>
            <div>
              <div className="text-4xl font-bold text-white">{score.overallScore}</div>
              <div className={`text-lg font-medium ${recommendationColors[score.recommendation]}`}>
                {score.recommendation}
              </div>
            </div>
          </div>
          <div className="hidden md:block max-w-xs">
            <p className="text-sm text-slate-400">{score.summary}</p>
          </div>
        </div>

        {/* Component Scores */}
        <div className="grid grid-cols-3 gap-4">
          <div className="p-4 rounded-lg bg-slate-900/50">
            <div className="flex items-center gap-2 mb-2">
              <Building className="h-4 w-4 text-blue-400" />
              <span className="text-slate-400 text-sm">Property</span>
            </div>
            <div className="text-2xl font-bold text-white mb-1">{score.propertyScore}</div>
            <Progress value={score.propertyScore} className="h-1.5" />
          </div>
          <div className="p-4 rounded-lg bg-slate-900/50">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="h-4 w-4 text-emerald-400" />
              <span className="text-slate-400 text-sm">Financial</span>
            </div>
            <div className="text-2xl font-bold text-white mb-1">{score.financialScore}</div>
            <Progress value={score.financialScore} className="h-1.5" />
          </div>
          <div className="p-4 rounded-lg bg-slate-900/50">
            <div className="flex items-center gap-2 mb-2">
              <Target className="h-4 w-4 text-purple-400" />
              <span className="text-slate-400 text-sm">Strategic</span>
            </div>
            <div className="text-2xl font-bold text-white mb-1">{score.strategicScore}</div>
            <Progress value={score.strategicScore} className="h-1.5" />
          </div>
        </div>

        {/* Strengths & Weaknesses */}
        <div className="grid md:grid-cols-2 gap-4">
          {score.strengths.length > 0 && (
            <div className="p-4 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
              <div className="flex items-center gap-2 mb-3">
                <CheckCircle className="h-5 w-5 text-emerald-400" />
                <span className="text-emerald-400 font-medium">Strengths</span>
              </div>
              <ul className="space-y-2">
                {score.strengths.map((strength, index) => (
                  <li key={index} className="text-sm text-slate-300 flex gap-2">
                    <Sparkles className="h-3 w-3 text-emerald-400 shrink-0 mt-1" />
                    {strength}
                  </li>
                ))}
              </ul>
            </div>
          )}
          {score.weaknesses.length > 0 && (
            <div className="p-4 rounded-lg bg-orange-500/10 border border-orange-500/20">
              <div className="flex items-center gap-2 mb-3">
                <AlertTriangle className="h-5 w-5 text-orange-400" />
                <span className="text-orange-400 font-medium">Weaknesses</span>
              </div>
              <ul className="space-y-2">
                {score.weaknesses.map((weakness, index) => (
                  <li key={index} className="text-sm text-slate-300 flex gap-2">
                    <AlertTriangle className="h-3 w-3 text-orange-400 shrink-0 mt-1" />
                    {weakness}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Summary on mobile */}
        <div className="md:hidden p-4 rounded-lg bg-slate-900/50">
          <p className="text-sm text-slate-400">{score.summary}</p>
        </div>

        {/* Disclaimer */}
        <p className="text-xs text-slate-500 text-center">
          AI analysis is for informational purposes only. Always conduct thorough due diligence before making investment decisions.
        </p>
      </CardContent>
    </Card>
  );
}
