"use client";

import { useState, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { 
  ArrowLeft,
  Target,
  DollarSign,
  Percent,
  Home,
  Hammer,
  Clock,
  Calculator,
  CheckCircle,
  XCircle,
  AlertCircle,
} from "lucide-react";

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(amount);
}

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
        color: "text-green-600 dark:text-green-400",
        bg: "bg-green-500/10",
        description: "Asking price is at or below your MAO"
      };
    }
    if (askingPrice <= calculations.rule70) {
      return { 
        label: "Good Deal", 
        icon: CheckCircle, 
        color: "text-blue-600 dark:text-blue-400",
        bg: "bg-blue-500/10",
        description: "Meets the 70% rule but thin margins"
      };
    }
    if (calculations.profitAtAsking > 0) {
      return { 
        label: "Marginal", 
        icon: AlertCircle, 
        color: "text-yellow-600 dark:text-yellow-400",
        bg: "bg-yellow-500/10",
        description: "Some profit but below target margins"
      };
    }
    return { 
      label: "Pass", 
      icon: XCircle, 
      color: "text-red-600 dark:text-red-400",
      bg: "bg-red-500/10",
      description: "Would lose money at this price"
    };
  };

  const verdict = getVerdict();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/dashboard/analysis">
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold">MAO Calculator</h1>
          <p className="text-muted-foreground">Calculate your Maximum Allowable Offer</p>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Left: Inputs */}
        <div className="lg:col-span-2 space-y-6">
          {/* Property Values */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Home className="w-5 h-5" />
                Property Values
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid sm:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label>After Repair Value (ARV)</Label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      type="number"
                      value={arv}
                      onChange={(e) => setArv(Number(e.target.value))}
                      className="pl-9"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Asking Price</Label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      type="number"
                      value={askingPrice}
                      onChange={(e) => setAskingPrice(Number(e.target.value))}
                      className="pl-9"
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Costs */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Hammer className="w-5 h-5" />
                Costs & Expenses
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid sm:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label>Repair Costs</Label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      type="number"
                      value={repairCosts}
                      onChange={(e) => setRepairCosts(Number(e.target.value))}
                      className="pl-9"
                    />
                  </div>
                  <Link href="/dashboard/analysis/repairs" className="text-xs text-primary hover:underline">
                    Open Repair Estimator →
                  </Link>
                </div>
                <div className="space-y-2">
                  <Label>Buying Closing Costs</Label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      type="number"
                      value={buyingClosingCosts}
                      onChange={(e) => setBuyingClosingCosts(Number(e.target.value))}
                      className="pl-9"
                    />
                  </div>
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label>Holding Period (months)</Label>
                  <div className="relative">
                    <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      type="number"
                      value={holdingMonths}
                      onChange={(e) => setHoldingMonths(Number(e.target.value))}
                      className="pl-9"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Monthly Holding Cost</Label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      type="number"
                      value={monthlyHoldingCost}
                      onChange={(e) => setMonthlyHoldingCost(Number(e.target.value))}
                      className="pl-9"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label>Selling Closing Costs</Label>
                  <span className="text-sm font-medium">{sellingClosingPercent}% = {formatCurrency(calculations.sellingClosingCosts)}</span>
                </div>
                <Slider
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
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Percent className="w-5 h-5" />
                Target Profit
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label>Target Profit Margin</Label>
                  <span className="text-sm font-medium">{targetProfitPercent}%</span>
                </div>
                <Slider
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
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <Card className="bg-linear-to-br from-purple-500 to-pink-500 text-white">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="w-5 h-5" />
                  Maximum Allowable Offer
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-4xl font-bold">{formatCurrency(calculations.mao)}</p>
                <p className="text-purple-100 mt-2">
                  {targetProfitPercent}% profit margin
                </p>
              </CardContent>
            </Card>
          </motion.div>

          {/* Deal Verdict */}
          <Card className={verdict.bg}>
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
                    <span className={calculations.profitAtAsking > 0 ? "text-green-600 font-medium" : "text-red-600 font-medium"}>
                      {formatCurrency(calculations.profitAtAsking)}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm mt-1">
                    <span>ROI at asking</span>
                    <span className={calculations.roiAtAsking > 0 ? "text-green-600 font-medium" : "text-red-600 font-medium"}>
                      {calculations.roiAtAsking.toFixed(1)}%
                    </span>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Other Offer Methods */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calculator className="w-5 h-5" />
                Other Methods
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-3 rounded-lg bg-muted">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="font-medium">70% Rule</p>
                    <p className="text-xs text-muted-foreground">ARV × 70% - Repairs</p>
                  </div>
                  <span className="text-lg font-bold">{formatCurrency(calculations.rule70)}</span>
                </div>
              </div>

              <div className="space-y-2">
                <p className="text-sm font-medium text-muted-foreground">Hedge Fund Buy Box</p>
                <div className="grid grid-cols-3 gap-2">
                  <div className="p-2 rounded bg-muted text-center">
                    <p className="text-xs text-muted-foreground">65%</p>
                    <p className="font-medium text-sm">{formatCurrency(calculations.buyBox65)}</p>
                  </div>
                  <div className="p-2 rounded bg-muted text-center">
                    <p className="text-xs text-muted-foreground">70%</p>
                    <p className="font-medium text-sm">{formatCurrency(calculations.buyBox70)}</p>
                  </div>
                  <div className="p-2 rounded bg-muted text-center">
                    <p className="text-xs text-muted-foreground">75%</p>
                    <p className="font-medium text-sm">{formatCurrency(calculations.buyBox75)}</p>
                  </div>
                </div>
              </div>

              <div className="p-3 rounded-lg bg-muted">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="font-medium">Equity Spread</p>
                    <p className="text-xs text-muted-foreground">ARV - Asking - Repairs</p>
                  </div>
                  <div className="text-right">
                    <span className="text-lg font-bold">{formatCurrency(calculations.equitySpread)}</span>
                    <p className="text-xs text-muted-foreground">{calculations.equitySpreadPercent.toFixed(1)}%</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          <Card>
            <CardContent className="pt-6 space-y-3">
              <Button className="w-full" asChild>
                <Link href="/dashboard/submit">
                  Submit This Deal
                </Link>
              </Button>
              <Button variant="outline" className="w-full" asChild>
                <Link href="/dashboard/analysis/roi">
                  Calculate Full ROI →
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
