"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  ArrowLeft,
  TrendingUp,
  DollarSign,
  Percent,
  Sparkles,
  ArrowRight,
  Home,
  Clock,
} from "lucide-react";

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(amount);
}

export default function PublicROICalculatorPage() {
  const [strategy, setStrategy] = useState<"flip" | "rental" | "brrrr">("flip");
  
  // Common inputs
  const [purchasePrice, setPurchasePrice] = useState<number>(180000);
  const [repairCosts, setRepairCosts] = useState<number>(35000);
  const [arv, setArv] = useState<number>(280000);
  const [closingCostsBuy, setClosingCostsBuy] = useState<number>(5000);
  const [closingCostsSell, setClosingCostsSell] = useState<number>(22400);

  // Flip inputs
  const [holdingMonths, setHoldingMonths] = useState<number>(6);
  const [monthlyHoldingCost, setMonthlyHoldingCost] = useState<number>(1500);

  // Rental inputs
  const [monthlyRent, setMonthlyRent] = useState<number>(2000);
  const [monthlyExpenses, setMonthlyExpenses] = useState<number>(600);
  const [downPaymentPercent, setDownPaymentPercent] = useState<number>(25);
  const [interestRate, setInterestRate] = useState<number>(7);

  // Flip calculations
  const flipCalculations = useMemo(() => {
    const totalInvestment = purchasePrice + repairCosts + closingCostsBuy;
    const holdingCosts = holdingMonths * monthlyHoldingCost;
    const totalCosts = totalInvestment + holdingCosts + closingCostsSell;
    const profit = arv - totalCosts;
    const roi = (profit / totalInvestment) * 100;
    const annualizedRoi = (roi / holdingMonths) * 12;
    
    return { totalInvestment, holdingCosts, totalCosts, profit, roi, annualizedRoi };
  }, [purchasePrice, repairCosts, closingCostsBuy, holdingMonths, monthlyHoldingCost, closingCostsSell, arv]);

  // Rental calculations
  const rentalCalculations = useMemo(() => {
    const downPayment = purchasePrice * (downPaymentPercent / 100);
    const loanAmount = purchasePrice - downPayment;
    const monthlyRate = interestRate / 100 / 12;
    const numPayments = 30 * 12;
    const monthlyPayment = loanAmount * (monthlyRate * Math.pow(1 + monthlyRate, numPayments)) / (Math.pow(1 + monthlyRate, numPayments) - 1);
    
    const totalCashInvested = downPayment + repairCosts + closingCostsBuy;
    const netOperatingIncome = (monthlyRent - monthlyExpenses) * 12;
    const annualDebtService = monthlyPayment * 12;
    const annualCashFlow = netOperatingIncome - annualDebtService;
    const cashOnCash = (annualCashFlow / totalCashInvested) * 100;
    const capRate = (netOperatingIncome / arv) * 100;
    
    return { totalCashInvested, netOperatingIncome, annualCashFlow, cashOnCash, capRate, monthlyPayment, monthlyCashFlow: annualCashFlow / 12 };
  }, [purchasePrice, downPaymentPercent, interestRate, repairCosts, closingCostsBuy, monthlyRent, monthlyExpenses, arv]);

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
            <h1 className="text-3xl font-bold text-white mb-2">ROI Calculator</h1>
            <p className="text-muted-foreground">Calculate returns for different investment strategies</p>
          </div>

          <div className="grid lg:grid-cols-3 gap-6">
            {/* Left: Inputs */}
            <div className="lg:col-span-2 space-y-6">
              {/* Property Basics */}
              <Card className="bg-secondary/50 border-white/10">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Home className="w-5 h-5" />
                    Property Details
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label className="text-foreground/90">Purchase Price</Label>
                      <div className="relative">
                        <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                          type="number"
                          value={purchasePrice}
                          onChange={(e) => setPurchasePrice(Number(e.target.value))}
                          className="pl-9 bg-secondary/50 border-white/10 text-white"
                        />
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
                    </div>
                    <div className="space-y-2">
                      <Label className="text-foreground/90">After Repair Value</Label>
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
                  </div>
                </CardContent>
              </Card>

              {/* Strategy Tabs */}
              <Card className="bg-secondary/50 border-white/10">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <TrendingUp className="w-5 h-5" />
                    Investment Strategy
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Tabs value={strategy} onValueChange={(v) => setStrategy(v as "flip" | "rental" | "brrrr")}>
                    <TabsList className="grid grid-cols-3 bg-secondary/50">
                      <TabsTrigger value="flip">Fix & Flip</TabsTrigger>
                      <TabsTrigger value="rental">Buy & Hold</TabsTrigger>
                      <TabsTrigger value="brrrr">BRRRR</TabsTrigger>
                    </TabsList>

                    <TabsContent value="flip" className="space-y-4 mt-4">
                      <div className="grid sm:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label className="text-foreground/90">Holding Period (months)</Label>
                          <div className="relative">
                            <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                            <Input
                              type="number"
                              value={holdingMonths}
                              onChange={(e) => setHoldingMonths(Number(e.target.value))}
                              className="pl-9 bg-secondary/50 border-white/10 text-white"
                            />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label className="text-foreground/90">Monthly Holding Cost</Label>
                          <div className="relative">
                            <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                            <Input
                              type="number"
                              value={monthlyHoldingCost}
                              onChange={(e) => setMonthlyHoldingCost(Number(e.target.value))}
                              className="pl-9 bg-secondary/50 border-white/10 text-white"
                            />
                          </div>
                        </div>
                      </div>
                    </TabsContent>

                    <TabsContent value="rental" className="space-y-4 mt-4">
                      <div className="grid sm:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label className="text-foreground/90">Monthly Rent</Label>
                          <div className="relative">
                            <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                            <Input
                              type="number"
                              value={monthlyRent}
                              onChange={(e) => setMonthlyRent(Number(e.target.value))}
                              className="pl-9 bg-secondary/50 border-white/10 text-white"
                            />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label className="text-foreground/90">Monthly Expenses</Label>
                          <div className="relative">
                            <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                            <Input
                              type="number"
                              value={monthlyExpenses}
                              onChange={(e) => setMonthlyExpenses(Number(e.target.value))}
                              className="pl-9 bg-secondary/50 border-white/10 text-white"
                            />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label className="text-foreground/90">Down Payment %</Label>
                          <div className="relative">
                            <Input
                              type="number"
                              value={downPaymentPercent}
                              onChange={(e) => setDownPaymentPercent(Number(e.target.value))}
                              className="pr-9 bg-secondary/50 border-white/10 text-white"
                            />
                            <Percent className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label className="text-foreground/90">Interest Rate %</Label>
                          <div className="relative">
                            <Input
                              type="number"
                              step="0.125"
                              value={interestRate}
                              onChange={(e) => setInterestRate(Number(e.target.value))}
                              className="pr-9 bg-secondary/50 border-white/10 text-white"
                            />
                            <Percent className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                          </div>
                        </div>
                      </div>
                    </TabsContent>

                    <TabsContent value="brrrr" className="space-y-4 mt-4">
                      <p className="text-muted-foreground text-sm">
                        BRRRR combines rental analysis with refinance projections. 
                        Create a free account to access the full BRRRR calculator with refinance analysis.
                      </p>
                      <Button className="bg-primary" asChild>
                        <Link href="/login">Unlock BRRRR Calculator</Link>
                      </Button>
                    </TabsContent>
                  </Tabs>
                </CardContent>
              </Card>
            </div>

            {/* Right: Results */}
            <div className="space-y-6">
              {strategy === "flip" && (
                <>
                  <Card className="bg-primary text-white">
                    <CardHeader>
                      <CardTitle>Flip Profit</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-4xl font-bold">{formatCurrency(flipCalculations.profit)}</p>
                      <p className="text-green-100 mt-2">{flipCalculations.roi.toFixed(1)}% ROI</p>
                    </CardContent>
                  </Card>

                  <Card className="bg-secondary/50 border-white/10">
                    <CardContent className="pt-6 space-y-3">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Total Investment</span>
                        <span className="text-white">{formatCurrency(flipCalculations.totalInvestment)}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Holding Costs</span>
                        <span className="text-white">{formatCurrency(flipCalculations.holdingCosts)}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Annualized ROI</span>
                        <span className="text-white">{flipCalculations.annualizedRoi.toFixed(1)}%</span>
                      </div>
                    </CardContent>
                  </Card>
                </>
              )}

              {strategy === "rental" && (
                <>
                  <Card className="bg-primary text-white">
                    <CardHeader>
                      <CardTitle>Annual Cash Flow</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-4xl font-bold">{formatCurrency(rentalCalculations.annualCashFlow)}</p>
                      <p className="text-emerald-100 mt-2">{formatCurrency(rentalCalculations.monthlyCashFlow)}/mo</p>
                    </CardContent>
                  </Card>

                  <Card className="bg-secondary/50 border-white/10">
                    <CardContent className="pt-6 space-y-3">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Cash Invested</span>
                        <span className="text-white">{formatCurrency(rentalCalculations.totalCashInvested)}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Cash-on-Cash Return</span>
                        <span className="text-white">{rentalCalculations.cashOnCash.toFixed(1)}%</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Cap Rate</span>
                        <span className="text-white">{rentalCalculations.capRate.toFixed(1)}%</span>
                      </div>
                    </CardContent>
                  </Card>
                </>
              )}

              {/* CTA */}
              <Card className="bg-primary/10 border-primary/30">
                <CardContent className="pt-6 text-center">
                  <p className="text-foreground/90 mb-4">Save your analysis and compare multiple scenarios</p>
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
