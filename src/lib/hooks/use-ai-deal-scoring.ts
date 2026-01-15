"use client";

import { useState, useCallback } from "react";
import { DealData, DealScore } from "@/lib/ai/deal-scoring";

interface UseAIDealScoringResult {
  score: DealScore | null;
  loading: boolean;
  error: string | null;
  scoreDeal: (dealData: DealData, dealId?: string) => Promise<DealScore | null>;
  evaluateFormula: (formula: string, variables: Record<string, number>) => Promise<{
    result: number;
    breakdown: Record<string, number>;
    explanation: string;
  } | null>;
}

export function useAIDealScoring(): UseAIDealScoringResult {
  const [score, setScore] = useState<DealScore | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const scoreDeal = useCallback(async (dealData: DealData, dealId?: string): Promise<DealScore | null> => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/deals/score", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ dealData, dealId }),
      });

      if (!response.ok) {
        throw new Error("Failed to score deal");
      }

      const data = await response.json();
      setScore(data.score);
      return data.score;
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unknown error";
      setError(message);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const evaluateFormula = useCallback(async (
    formula: string, 
    variables: Record<string, number>
  ) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/deals/formula", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ formula, variables }),
      });

      if (!response.ok) {
        throw new Error("Failed to evaluate formula");
      }

      const data = await response.json();
      return data.result;
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unknown error";
      setError(message);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    score,
    loading,
    error,
    scoreDeal,
    evaluateFormula,
  };
}
