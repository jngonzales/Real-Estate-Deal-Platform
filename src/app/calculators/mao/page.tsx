"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
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
  Sparkles,
  ArrowRight,
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

export default function PublicMAOCalculatorPage() {
  const [arv, setArv] = useState<number>(250000);
  const [repairCosts, setRepairCosts] = useState<number>(35000);
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
        color: "text-green-400",
        bg: "bg-green-500/10",
        description: "Asking price is at or below your MAO"
      };
    }
    if (askingPrice <= calculations.rule70) {
      return { 
        label: "Good Deal", 
        icon: CheckCircle, 
        color: "text-emerald-400",
        bg: "bg-primary/10",
        description: "Meets the 70% rule but thin margins"
      };
    }
    if (calculations.profitAtAsking > 0) {
      return { 
        label: "Marginal", 
        icon: AlertCircle, 
        color: "text-yellow-400",
        bg: "bg-yellow-500/10",
        description: "Some profit but below target margins"
      };
    }
    return { 
      label: "Pass", 
      icon: XCircle, 
      color: "text-red-400",
      bg: "bg-red-500/10",
      description: "Would lose money at this price"
    };
  };

  const verdict = getVerdict();

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-white/10 bg-card/80 backdrop-blur-xl sticky top-0 z-50">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" className="text-foreground/90 hover:text-white" asChild>
              <Link href="/calculators">
                <ArrowLeft className="h-5 w-5" />
              </Link>
            </Button>
            <Link href="/" className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
                <Sparkles className="h-4 w-4 text-white" />
              </div>
              <span className="font-bold text-white">DealFlow</span>
            </Link>
          </div>
          <Button className="bg-primary" asChild>
            <Link href="/login">Save Analysis</Link>
          </Button>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-5xl mx-auto">
          {/* Title */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-white mb-2">MAO Calculator</h1>
            <p className="text-muted-foreground">Calculate your Maximum Allowable Offer</p>
          </div>

          <div className="grid lg:grid-cols-3 gap-6">
            {/* Left: Inputs */}
            <div className="lg:col-span-2 space-y-6">
              {/* Property Values */}
              <Card className="bg-secondary/50 border-white/10">
                <CardHeader>
                  <CardTitle className="text-white">Property Values</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid sm:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label className="text-foreground/90">After Repair Value (ARV)</Label>
                      <div className="relative">
                        <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                          type="number"
                          value={arv}
                          onChange={(e) => setArv(Number(e.target.value))}
                          className="pl-9 bg-secondary/50 border-white/10 text-white"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-foreground/90">Asking Price</Label>
                      <div className="relative">
                        <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                          type="number"
                          value={askingPrice}
                          onChange={(e) => setAskingPrice(Number(e.target.value))}
                          className="pl-9 bg-secondary/50 border-white/10 text-white"
                        />
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label className="text-foreground/90">Repair Costs</Label>
                    <div className="relative">
                      <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        type="number"
                        value={repairCosts}
                        onChange={(e) => setRepairCosts(Number(e.target.value))}
                        className="pl-9 bg-secondary/50 border-white/10 text-white"
                      />
                    </div>
                    <Link href="/calculators/repairs" className="text-xs text-primary hover:underline">
                      Need help? Try our Repair Estimator →
                    </Link>
                  </div>
                </CardContent>
              </Card>

              {/* Target Profit */}
              <Card className="bg-secondary/50 border-white/10">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Percent className="w-5 h-5" />
                    Target Profit
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <Label className="text-foreground/90">Target Profit Margin</Label>
                      <span className="text-sm font-medium text-white">{targetProfitPercent}%</span>
                    </div>
                    <Slider
                      value={[targetProfitPercent]}
                      onValueChange={(v: number[]) => setTargetProfitPercent(v[0])}
                      min={10}
                      max={35}
                      step={1}
                      className="[&>span:first-child]:bg-secondary [&_[role=slider]]:bg-primary"
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
              <Card className="bg-primary text-white">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="w-5 h-5" />
                    Maximum Allowable Offer
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-4xl font-bold">{formatCurrency(calculations.mao)}</p>
                  <p className="text-emerald-100 mt-2">{targetProfitPercent}% profit margin</p>
                </CardContent>
              </Card>

              {/* Deal Verdict */}
              <Card className={`${verdict.bg} border-white/10`}>
                <CardContent className="pt-6">
                  <div className="flex items-center gap-3">
                    <verdict.icon className={`w-8 h-8 ${verdict.color}`} />
                    <div>
                      <p className={`text-xl font-bold ${verdict.color}`}>{verdict.label}</p>
                      <p className="text-sm text-muted-foreground">{verdict.description}</p>
                    </div>
                  </div>
                  <div className="mt-4 pt-4 border-t border-white/10">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Profit at asking</span>
                      <span className={calculations.profitAtAsking > 0 ? "text-green-400 font-medium" : "text-red-400 font-medium"}>
                        {formatCurrency(calculations.profitAtAsking)}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm mt-1">
                      <span className="text-muted-foreground">ROI at asking</span>
                      <span className={calculations.roiAtAsking > 0 ? "text-green-400 font-medium" : "text-red-400 font-medium"}>
                        {calculations.roiAtAsking.toFixed(1)}%
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Other Methods */}
              <Card className="bg-secondary/50 border-white/10">
                <CardHeader>
                  <CardTitle className="text-white">Other Methods</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="p-3 rounded-lg bg-secondary/30">
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="font-medium text-white">70% Rule</p>
                        <p className="text-xs text-muted-foreground">ARV × 70% - Repairs</p>
                      </div>
                      <span className="text-lg font-bold text-white">{formatCurrency(calculations.rule70)}</span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <p className="text-sm font-medium text-muted-foreground">Hedge Fund Buy Box</p>
                    <div className="grid grid-cols-3 gap-2">
                      <div className="p-2 rounded bg-secondary/30 text-center">
                        <p className="text-xs text-muted-foreground">65%</p>
                        <p className="font-medium text-sm text-white">{formatCurrency(calculations.buyBox65)}</p>
                      </div>
                      <div className="p-2 rounded bg-secondary/30 text-center">
                        <p className="text-xs text-muted-foreground">70%</p>
                        <p className="font-medium text-sm text-white">{formatCurrency(calculations.buyBox70)}</p>
                      </div>
                      <div className="p-2 rounded bg-secondary/30 text-center">
                        <p className="text-xs text-muted-foreground">75%</p>
                        <p className="font-medium text-sm text-white">{formatCurrency(calculations.buyBox75)}</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* CTA */}
              <Card className="bg-primary/10 border-primary/30">
                <CardContent className="pt-6 text-center">
                  <p className="text-foreground/90 mb-4">Save your analysis and submit this deal for review</p>
                  <Button className="w-full bg-primary" asChild>
                    <Link href="/login">
                      Create Free Account <ArrowRight className="w-4 h-4 ml-2" />
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
