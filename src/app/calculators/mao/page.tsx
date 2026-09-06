"use client";

import { Suspense, useState, useMemo } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

import {
  ArrowRight,
  CheckCircle,
  XCircle,
  AlertCircle,
} from "@/components/ui/icons";
import { PublicHeader } from "@/components/layout/public-header";
import { CalculatorFrame, CalculatorHeading, worksheetCard, worksheetFigure, worksheetGrid, WorksheetMoneyInput, worksheetResult, worksheetAction, formatWorksheetCurrency, formatWorksheetPercent, WorksheetSlider } from "../_components/worksheet";

export default function PublicMAOCalculatorPage() {
  return (
    <div className="min-h-screen bg-background">
      <a href="#calculator-content" className="lm-skip-link">Skip to content</a>
      <PublicHeader backHref="/calculators" ctaLabel="Save Analysis" />
      <CalculatorFrame id="calculator-content">
        <CalculatorHeading title="MAO Calculator" description="Find the maximum offer that meets your profit target." />
        <Suspense fallback={<p role="status" className="text-sm text-muted-foreground">Loading calculator…</p>}>
          <MAOCalculatorFromQuery />
        </Suspense>
      </CalculatorFrame>
    </div>
  );
}

function MAOCalculatorFromQuery() {
  const repairs = useSearchParams().get("repairs");
  const amount = repairs?.trim() ? Number(repairs) : NaN;
  const initialRepairCosts = Number.isFinite(amount) && amount >= 0 ? amount : 35000;

  return (
    <MAOCalculator
      key={repairs === null ? "default" : "repairs:" + repairs}
      initialRepairCosts={initialRepairCosts}
    />
  );
}

function MAOCalculator({ initialRepairCosts }: { initialRepairCosts: number }) {
  const [arv, setArv] = useState<number>(250000);
  const [repairCosts, setRepairCosts] = useState(initialRepairCosts);
  const [targetProfitPercent, setTargetProfitPercent] = useState<number>(20);
  const [askingPrice, setAskingPrice] = useState<number>(180000);

  const calculations = useMemo(() => {
    // Standard closing costs estimate (8%)
    const closingCosts = arv * 0.08;
    // Holding costs estimate (6 months at $1500/mo)
    const holdingCosts = 9000;

    // MAO = ARV × (1 - profit%) - repairs - holding - closing
    const mao = arv * (1 - targetProfitPercent / 100) - repairCosts - holdingCosts - closingCosts;

    // 70% Rule = ARV × 70% - repairs
    const rule70 = arv * 0.70 - repairCosts;

    // Hedge Fund Buy Box
    const buyBox65 = arv * 0.65 - repairCosts;
    const buyBox70 = arv * 0.70 - repairCosts;
    const buyBox75 = arv * 0.75 - repairCosts;

    // Profit at asking price
    const profitAtAsking = arv - askingPrice - repairCosts - holdingCosts - closingCosts;
    const roiAtAsking = (profitAtAsking / (askingPrice + repairCosts)) * 100;

    // Equity spread
    const equitySpread = arv - askingPrice - repairCosts;

    return {
      mao,
      rule70,
      buyBox65,
      buyBox70,
      buyBox75,
      closingCosts,
      holdingCosts,
      profitAtAsking,
      roiAtAsking,
      equitySpread,
    };
  }, [arv, repairCosts, targetProfitPercent, askingPrice]);

  // Deal verdict
  const getVerdict = () => {
    if (askingPrice <= calculations.mao) {
      return {
        label: "Great Deal",
        icon: CheckCircle,
        color: "text-primary",
        bg: "bg-primary/10",
        description: "Asking price is at or below your MAO"
      };
    }
    if (askingPrice <= calculations.rule70) {
      return {
        label: "Good Deal",
        icon: CheckCircle,
        color: "text-primary",
        bg: "bg-primary/10",
        description: "Meets the 70% rule but thin margins"
      };
    }
    if (calculations.profitAtAsking > 0) {
      return {
        label: "Marginal",
        icon: AlertCircle,
        color: "text-amber-700 dark:text-amber-300",
        bg: "bg-amber-500/10",
        description: "Some profit but below target margins"
      };
    }
    return {
      label: "Pass",
      icon: XCircle,
      color: "text-red-700 dark:text-red-300",
      bg: "bg-red-500/10",
      description: "Would lose money at this price"
    };
  };

  const verdict = Number.isFinite(calculations.mao) && Number.isFinite(askingPrice)
    ? getVerdict()
    : { label: "Estimate unavailable", icon: AlertCircle, color: "text-foreground", bg: "", description: "Review the property values and costs." };

  return (
    <div className={worksheetGrid}>
      {/* Left: Inputs */}
      <div className="min-w-0 space-y-4 lg:space-y-5">
        {/* Property Values */}
        <Card className={worksheetCard}>
          <CardHeader>
            <h2 className="text-xl font-semibold tracking-tight">Property values</h2>
          </CardHeader>
          <CardContent className="min-w-0 space-y-4">
            <div className="grid grid-cols-2 items-end gap-3">
              <WorksheetMoneyInput id="mao-arv" label="After Repair Value (ARV)" value={arv} setValue={setArv} />
              <WorksheetMoneyInput id="mao-asking-price" label="Asking Price" value={askingPrice} setValue={setAskingPrice} />
            </div>
            <WorksheetMoneyInput id="mao-repair-costs" label="Repair Costs" value={repairCosts} setValue={setRepairCosts} />
            <Link href="/calculators/repairs" className="inline-flex min-h-11 items-center rounded-sm text-sm text-primary underline underline-offset-4 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring">
              Open repair estimator
            </Link>
          </CardContent>
        </Card>

        {/* Target Profit */}
        <Card className={worksheetCard}>
          <CardHeader>
            <h2 className="text-xl font-semibold tracking-tight">Target profit</h2>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span id="mao-profit-margin" className="text-sm font-medium">Target Profit Margin</span>
                <span className="text-sm font-medium tabular-nums text-foreground">{targetProfitPercent}%</span>
              </div>
              <WorksheetSlider
                labelId="mao-profit-margin"
                value={[targetProfitPercent]}
                valueText={targetProfitPercent + "%"}
                onValueChange={(v: number[]) => setTargetProfitPercent(v[0])}
                min={10}
                max={35}
                step={1}
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Conservative (10%)</span>
                <span>Aggressive (35%)</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="min-w-0 space-y-4 lg:space-y-5">
        <Card className={worksheetResult}>
          <CardHeader>
            <h2 className="text-xl font-semibold tracking-tight">Maximum allowable offer</h2>
          </CardHeader>
          <CardContent>
            <p role="status" className={worksheetFigure}>{formatWorksheetCurrency(calculations.mao)}</p>
            <p className="mt-2 text-sm tabular-nums text-muted-foreground">{targetProfitPercent}% profit margin</p>
          </CardContent>
        </Card>
        {/* Deal Verdict */}
        <Card className={`${worksheetCard} ${verdict.bg}`}>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <verdict.icon aria-hidden="true" className={`size-5 shrink-0 ${verdict.color}`} />
              <div>
                <p className={`text-lg font-semibold ${verdict.color}`}>{verdict.label}</p>
                <p className="text-sm text-muted-foreground">{verdict.description}</p>
              </div>
            </div>
            <div className="mt-4 pt-4 border-t border-border">
              <div className="flex items-baseline justify-between gap-3 text-sm tabular-nums">
                <span className="text-muted-foreground">Profit at asking</span>
                <span className="min-w-0 text-end font-medium [overflow-wrap:anywhere]">
                  {formatWorksheetCurrency(calculations.profitAtAsking)}
                </span>
              </div>
              <div className="mt-1 flex items-baseline justify-between gap-3 text-sm tabular-nums">
                <span className="text-muted-foreground">ROI at asking</span>
                <span className="min-w-0 text-end font-medium [overflow-wrap:anywhere]">
                  {formatWorksheetPercent(calculations.roiAtAsking)}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Other Methods */}
        <Card className={worksheetCard}>
          <CardHeader>
            <h2 className="text-xl font-semibold tracking-tight">Other methods</h2>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="border-b border-border pb-3">
              <div className="flex items-baseline justify-between gap-3">
                <div>
                  <p className="font-medium text-foreground">70% Rule</p>
                  <p className="text-xs text-muted-foreground">ARV × 70% - Repairs</p>
                </div>
                <span className="min-w-0 text-end text-lg font-semibold tabular-nums [overflow-wrap:anywhere]">{formatWorksheetCurrency(calculations.rule70)}</span>
              </div>
            </div>

            <div className="space-y-2">
              <p className="text-sm font-medium text-muted-foreground">Hedge Fund Buy Box</p>
              <div className="grid grid-cols-3 divide-x divide-border border-y border-border tabular-nums">
                <div className="min-w-0 px-1 py-2 text-center [overflow-wrap:anywhere]">
                  <p className="text-xs text-muted-foreground">65%</p>
                  <p className="font-medium text-sm text-foreground">{formatWorksheetCurrency(calculations.buyBox65)}</p>
                </div>
                <div className="min-w-0 px-1 py-2 text-center [overflow-wrap:anywhere]">
                  <p className="text-xs text-muted-foreground">70%</p>
                  <p className="font-medium text-sm text-foreground">{formatWorksheetCurrency(calculations.buyBox70)}</p>
                </div>
                <div className="min-w-0 px-1 py-2 text-center [overflow-wrap:anywhere]">
                  <p className="text-xs text-muted-foreground">75%</p>
                  <p className="font-medium text-sm text-foreground">{formatWorksheetCurrency(calculations.buyBox75)}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* CTA */}
        <Card className={worksheetCard}>
          <CardContent>
            <p className="text-muted-foreground mb-4">Save your analysis and submit this deal for review</p>
            <Button className={worksheetAction} asChild>
              <Link href="/login">
                Create Free Account <ArrowRight aria-hidden="true" />
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

