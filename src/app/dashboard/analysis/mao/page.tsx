"use client";

import { useState, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { WorkspaceHeading } from "@/components/layout/workspace-heading";
import { formatWorksheetCurrency, worksheetAction, worksheetCard, worksheetFigure, worksheetGrid, worksheetInput, worksheetResult, formatWorksheetPercent, WorksheetSlider } from "@/app/calculators/_components/worksheet";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { DollarSign, Clock, CheckCircle, XCircle, AlertCircle } from "@/components/ui/icons";

export default function MAOCalculatorPage() {
  const searchParams = useSearchParams();

  // Get initial repairs from URL if present
  const repairsFromUrl = searchParams.get("repairs");
  const initialRepairs = repairsFromUrl ? Number(repairsFromUrl) : 35000;

  // Inputs
  const [arv, setArv] = useState<number>(250000);
  const [repairCosts, setRepairCosts] = useState<number>(initialRepairs);
  const [holdingMonths, setHoldingMonths] = useState<number>(6);
  const [monthlyHoldingCost, setMonthlyHoldingCost] = useState<number>(1500);
  const [buyingClosingCosts, setBuyingClosingCosts] = useState<number>(5000);
  const [sellingClosingPercent, setSellingClosingPercent] = useState<number>(8);
  const [targetProfitPercent, setTargetProfitPercent] = useState<number>(20);
  const [askingPrice, setAskingPrice] = useState<number>(180000);

  // Calculations
  const calculations = useMemo(() => {
    const sellingClosingCosts = arv * (sellingClosingPercent / 100);
    const totalClosingCosts = buyingClosingCosts + sellingClosingCosts;
    const totalHoldingCosts = holdingMonths * monthlyHoldingCost;

    // MAO = ARV × (1 - profit%) - repairs - holding - closing
    const mao = arv * (1 - targetProfitPercent / 100) - repairCosts - totalHoldingCosts - totalClosingCosts;

    // 70% Rule = ARV × 70% - repairs
    const rule70 = arv * 0.70 - repairCosts;

    // Hedge Fund Buy Box (usually 65-75%)
    const buyBox65 = arv * 0.65 - repairCosts;
    const buyBox70 = arv * 0.70 - repairCosts;
    const buyBox75 = arv * 0.75 - repairCosts;

    // Profit at asking price
    const profitAtAsking = arv - askingPrice - repairCosts - totalHoldingCosts - totalClosingCosts;
    const roiAtAsking = (profitAtAsking / (askingPrice + repairCosts + buyingClosingCosts)) * 100;

    // Equity spread
    const equitySpread = arv - askingPrice - repairCosts;
    const equitySpreadPercent = (equitySpread / arv) * 100;

    return {
      mao,
      rule70,
      buyBox65,
      buyBox70,
      buyBox75,
      sellingClosingCosts,
      totalClosingCosts,
      totalHoldingCosts,
      profitAtAsking,
      roiAtAsking,
      equitySpread,
      equitySpreadPercent,
    };
  }, [arv, repairCosts, holdingMonths, monthlyHoldingCost, buyingClosingCosts, sellingClosingPercent, targetProfitPercent, askingPrice]);

  // Deal verdict
  const getVerdict = () => {
    if (askingPrice <= calculations.mao) {
      return { 
        label: "Great Deal", 
        icon: CheckCircle, 
        color: "text-primary dark:text-primary",
        bg: "bg-primary/10",
        description: "Asking price is at or below your MAO"
      };
    }
    if (askingPrice <= calculations.rule70) {
      return { 
        label: "Good Deal", 
        icon: CheckCircle, 
        color: "text-emerald-600 dark:text-emerald-400",
        bg: "bg-primary/10",
        description: "Meets the 70% rule but thin margins"
      };
    }
    if (calculations.profitAtAsking > 0) {
      return { 
        label: "Marginal", 
        icon: AlertCircle, 
        color: "text-amber-800 dark:text-amber-300 dark:text-yellow-400",
        bg: "bg-amber-500/10",
        description: "Some profit but below target margins"
      };
    }
    return { 
      label: "Pass", 
      icon: XCircle, 
      color: "text-red-800 dark:text-red-300 dark:text-red-400",
      bg: "bg-red-500/10",
      description: "Would lose money at this price"
    };
  };

  const verdict = Number.isFinite(calculations.mao) && Number.isFinite(askingPrice)
    ? getVerdict()
    : { label: "Estimate unavailable", icon: AlertCircle, color: "text-foreground", bg: "", description: "Review the property values and costs." };

  return (
    <div className="min-w-0 space-y-6">
      <WorkspaceHeading
        title="MAO calculator"
        description="Find the maximum offer that meets your profit target."
        actions={<>

          <Button asChild variant="outline" className={worksheetAction}><Link href="/dashboard/analysis">Back to analysis</Link></Button>
        </>}
      />

      <div className={worksheetGrid}>
        {/* Left: Inputs */}
        <div className="min-w-0 space-y-6">
          {/* Property Values */}
          <Card className={worksheetCard}>
            <CardHeader>
              <h2 className="text-xl font-semibold tracking-tight">Property Values</h2>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-2 items-end gap-3">
                <div className="space-y-2">
                  <Label htmlFor="mao-arv" className="leading-snug">After Repair Value (ARV)</Label>
                  <div className="relative">
                    <DollarSign aria-hidden="true" className="absolute start-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input id="mao-arv"
                      type="number" inputMode="decimal"
                      value={arv}
                      onChange={(e) => setArv(Number(e.target.value))}
                      className={worksheetInput + " ps-9"}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="mao-askingPrice" className="leading-snug">Asking Price</Label>
                  <div className="relative">
                    <DollarSign aria-hidden="true" className="absolute start-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input id="mao-askingPrice"
                      type="number" inputMode="decimal"
                      value={askingPrice}
                      onChange={(e) => setAskingPrice(Number(e.target.value))}
                      className={worksheetInput + " ps-9"}
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Costs */}
          <Card className={worksheetCard}>
            <CardHeader>
              <h2 className="text-xl font-semibold tracking-tight">Costs & Expenses</h2>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-2 items-end gap-3">
                <div className="space-y-2">
                  <Label htmlFor="mao-repairCosts" className="leading-snug">Repair Costs</Label>
                  <div className="relative">
                    <DollarSign aria-hidden="true" className="absolute start-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input id="mao-repairCosts"
                      type="number" inputMode="decimal"
                      value={repairCosts}
                      onChange={(e) => setRepairCosts(Number(e.target.value))}
                      className={worksheetInput + " ps-9"}
                    />
                  </div>
                  <Link href="/dashboard/analysis/repairs" className="inline-flex min-h-11 items-center text-sm text-primary underline underline-offset-4 focus-visible:outline-2 focus-visible:outline-ring">
                    Open repair estimator
                  </Link>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="mao-buyingClosingCosts" className="leading-snug">Buying Closing Costs</Label>
                  <div className="relative">
                    <DollarSign aria-hidden="true" className="absolute start-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input id="mao-buyingClosingCosts"
                      type="number" inputMode="decimal"
                      value={buyingClosingCosts}
                      onChange={(e) => setBuyingClosingCosts(Number(e.target.value))}
                      className={worksheetInput + " ps-9"}
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 items-end gap-3">
                <div className="space-y-2">
                  <Label htmlFor="mao-holdingMonths" className="leading-snug">Holding Period (months)</Label>
                  <div className="relative">
                    <Clock aria-hidden="true" className="absolute start-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input id="mao-holdingMonths"
                      type="number" inputMode="decimal"
                      value={holdingMonths}
                      onChange={(e) => setHoldingMonths(Number(e.target.value))}
                      className={worksheetInput + " ps-9"}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="mao-monthlyHoldingCost" className="leading-snug">Monthly Holding Cost</Label>
                  <div className="relative">
                    <DollarSign aria-hidden="true" className="absolute start-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input id="mao-monthlyHoldingCost"
                      type="number" inputMode="decimal"
                      value={monthlyHoldingCost}
                      onChange={(e) => setMonthlyHoldingCost(Number(e.target.value))}
                      className={worksheetInput + " ps-9"}
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span id="mao-selling-costs" className="text-sm font-medium">Selling closing costs</span>
                  <span className="text-sm font-medium">{sellingClosingPercent}% = {formatWorksheetCurrency(calculations.sellingClosingCosts)}</span>
                </div>
                <WorksheetSlider
                  labelId="mao-selling-costs"
                  valueText={sellingClosingPercent + "%"}
                  value={[sellingClosingPercent]}
                  onValueChange={(v: number[]) => setSellingClosingPercent(v[0])}
                  min={5}
                  max={12}
                  step={0.5}
                />
              </div>
            </CardContent>
          </Card>

          {/* Target Profit */}
          <Card className={worksheetCard}>
            <CardHeader>
              <h2 className="text-xl font-semibold tracking-tight">Target Profit</h2>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span id="mao-target-profit" className="text-sm font-medium">Target profit margin</span>
                  <span className="text-sm font-medium">{targetProfitPercent}%</span>
                </div>
                <WorksheetSlider
                  labelId="mao-target-profit"
                  valueText={targetProfitPercent + "%"}
                  value={[targetProfitPercent]}
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

        {/* Right: Results */}
        <div className="space-y-6">
          {/* MAO Result */}
          <div
          >
            <Card className={worksheetResult}>
              <CardHeader>
                <h2 className="text-xl font-semibold tracking-tight">Maximum Allowable Offer</h2>
              </CardHeader>
              <CardContent>
                <p role="status" className={worksheetFigure}>{formatWorksheetCurrency(calculations.mao)}</p>
                <p className="mt-2 text-sm text-muted-foreground tabular-nums">
                  {targetProfitPercent}% profit margin
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Deal Verdict */}
          <Card className={worksheetCard + " " + verdict.bg}>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <verdict.icon className={`w-8 h-8 ${verdict.color}`} />
                <div>
                  <p className={`text-xl font-bold ${verdict.color}`}>{verdict.label}</p>
                  <p className="text-sm text-muted-foreground">{verdict.description}</p>
                </div>
              </div>
              {calculations.profitAtAsking !== 0 && (
                <div className="mt-4 pt-4 border-t">
                  <div className="flex justify-between text-sm">
                    <span>Profit at asking</span>
                    <span className={calculations.profitAtAsking > 0 ? "text-primary font-medium" : "text-red-600 font-medium"}>
                      {formatWorksheetCurrency(calculations.profitAtAsking)}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm mt-1">
                    <span>ROI at asking</span>
                    <span className={calculations.roiAtAsking > 0 ? "text-primary font-medium" : "text-red-600 font-medium"}>
                      {formatWorksheetPercent(calculations.roiAtAsking)}
                    </span>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Other Offer Methods */}
          <Card className={worksheetCard}>
            <CardHeader>
              <h2 className="text-xl font-semibold tracking-tight">Other Methods</h2>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="border-t border-border pt-3">
                <div className="flex items-baseline justify-between gap-3">
                  <div>
                    <p className="font-medium">70% Rule</p>
                    <p className="text-xs text-muted-foreground">ARV × 70% - Repairs</p>
                  </div>
                  <span className="min-w-0 text-end text-lg font-semibold tabular-nums [overflow-wrap:anywhere]">{formatWorksheetCurrency(calculations.rule70)}</span>
                </div>
              </div>

              <div className="space-y-2">
                <p className="text-sm font-medium text-muted-foreground">Hedge Fund Buy Box</p>
                <div className="grid grid-cols-3 divide-x divide-border border-y border-border">
                  <div className="min-w-0 px-1 py-2 text-center tabular-nums [overflow-wrap:anywhere]">
                    <p className="text-xs text-muted-foreground">65%</p>
                    <p className="font-medium text-sm">{formatWorksheetCurrency(calculations.buyBox65)}</p>
                  </div>
                  <div className="min-w-0 px-1 py-2 text-center tabular-nums [overflow-wrap:anywhere]">
                    <p className="text-xs text-muted-foreground">70%</p>
                    <p className="font-medium text-sm">{formatWorksheetCurrency(calculations.buyBox70)}</p>
                  </div>
                  <div className="min-w-0 px-1 py-2 text-center tabular-nums [overflow-wrap:anywhere]">
                    <p className="text-xs text-muted-foreground">75%</p>
                    <p className="font-medium text-sm">{formatWorksheetCurrency(calculations.buyBox75)}</p>
                  </div>
                </div>
              </div>

              <div className="border-t border-border pt-3">
                <div className="flex items-baseline justify-between gap-3">
                  <div>
                    <p className="font-medium">Equity Spread</p>
                    <p className="text-xs text-muted-foreground">ARV - Asking - Repairs</p>
                  </div>
                  <div className="text-right">
                    <span className="min-w-0 text-end text-lg font-semibold tabular-nums [overflow-wrap:anywhere]">{formatWorksheetCurrency(calculations.equitySpread)}</span>
                    <p className="text-xs text-muted-foreground">{formatWorksheetPercent(calculations.equitySpreadPercent)}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          <Card className={worksheetCard}>
            <CardContent className="pt-6 space-y-3">
              <Button className={worksheetAction + " w-full"} asChild>
                <Link href="/dashboard/submit">
                  Submit This Deal
                </Link>
              </Button>
              <Button variant="outline" className={worksheetAction + " w-full"} asChild>
                <Link href="/dashboard/analysis/roi">
                  Calculate full ROI
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
