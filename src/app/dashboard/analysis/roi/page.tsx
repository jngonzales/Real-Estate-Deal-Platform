"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  ArrowLeft,
  TrendingUp,
  DollarSign,
  Percent,
  Clock,
  Home,
  PiggyBank,
  BarChart3,
  ArrowUpRight,
  ArrowDownRight,
  Calculator,
} from "lucide-react";

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(amount);
}

function formatPercent(value: number): string {
  return `${value.toFixed(1)}%`;
}

export default function ROICalculatorPage() {
  const [strategy, setStrategy] = useState<"flip" | "rental" | "brrrr">("flip");

  // Common inputs
  const [purchasePrice, setPurchasePrice] = useState<number>(150000);
  const [repairCosts, setRepairCosts] = useState<number>(35000);
  const [closingCostsBuy, setClosingCostsBuy] = useState<number>(5000);
  const [arv, setArv] = useState<number>(250000);

  // Flip inputs
  const [holdingMonths, setHoldingMonths] = useState<number>(6);
  const [monthlyHoldingCost, setMonthlyHoldingCost] = useState<number>(1500);
  const [closingCostsSell, setClosingCostsSell] = useState<number>(20000); // ~8% of ARV

  // Rental inputs
  const [monthlyRent, setMonthlyRent] = useState<number>(2000);
  const [monthlyExpenses, setMonthlyExpenses] = useState<number>(600);
  const [downPaymentPercent, setDownPaymentPercent] = useState<number>(25);
  const [interestRate, setInterestRate] = useState<number>(7);
  const [loanTerm, setLoanTerm] = useState<number>(30);

  // BRRRR inputs
  const [refinancePercent, setRefinancePercent] = useState<number>(75);
  const [refinanceRate, setRefinanceRate] = useState<number>(7);

  // Calculations
  const totalInvestment = purchasePrice + repairCosts + closingCostsBuy;
  
  // Flip calculations
  const flipResults = useMemo(() => {
    const holdingCosts = holdingMonths * monthlyHoldingCost;
    const totalCosts = totalInvestment + holdingCosts + closingCostsSell;
    const profit = arv - totalCosts;
    const roi = (profit / totalInvestment) * 100;
    const annualizedRoi = (roi / holdingMonths) * 12;
    
    return {
      holdingCosts,
      totalCosts,
      profit,
      roi,
      annualizedRoi,
    };
  }, [totalInvestment, holdingMonths, monthlyHoldingCost, closingCostsSell, arv]);

  // Rental calculations
  const rentalResults = useMemo(() => {
    const downPayment = purchasePrice * (downPaymentPercent / 100);
    const loanAmount = purchasePrice - downPayment;
    const monthlyRate = interestRate / 100 / 12;
    const numPayments = loanTerm * 12;
    const monthlyMortgage = loanAmount * (monthlyRate * Math.pow(1 + monthlyRate, numPayments)) / (Math.pow(1 + monthlyRate, numPayments) - 1);
    
    const cashInvested = downPayment + repairCosts + closingCostsBuy;
    const monthlyCashFlow = monthlyRent - monthlyExpenses - monthlyMortgage;
    const annualCashFlow = monthlyCashFlow * 12;
    const cashOnCash = (annualCashFlow / cashInvested) * 100;
    const capRate = ((monthlyRent - monthlyExpenses) * 12 / arv) * 100;
    
    return {
      downPayment,
      loanAmount,
      monthlyMortgage,
      cashInvested,
      monthlyCashFlow,
      annualCashFlow,
      cashOnCash,
      capRate,
    };
  }, [purchasePrice, downPaymentPercent, interestRate, loanTerm, repairCosts, closingCostsBuy, monthlyRent, monthlyExpenses, arv]);

  // BRRRR calculations
  const brrrrResults = useMemo(() => {
    const refinanceValue = arv * (refinancePercent / 100);
    const cashOutAmount = refinanceValue - purchasePrice;
    const cashLeftInDeal = totalInvestment - cashOutAmount;
    const actualCashInvested = Math.max(0, cashLeftInDeal);
    
    const monthlyRate = refinanceRate / 100 / 12;
    const numPayments = loanTerm * 12;
    const monthlyMortgage = refinanceValue * (monthlyRate * Math.pow(1 + monthlyRate, numPayments)) / (Math.pow(1 + monthlyRate, numPayments) - 1);
    
    const monthlyCashFlow = monthlyRent - monthlyExpenses - monthlyMortgage;
    const annualCashFlow = monthlyCashFlow * 12;
    const infiniteReturn = actualCashInvested <= 0;
    const cashOnCash = infiniteReturn ? Infinity : (annualCashFlow / actualCashInvested) * 100;
    
    return {
      refinanceValue,
      cashOutAmount,
      cashLeftInDeal,
      actualCashInvested,
      monthlyMortgage,
      monthlyCashFlow,
      annualCashFlow,
      cashOnCash,
      infiniteReturn,
    };
  }, [arv, refinancePercent, purchasePrice, totalInvestment, refinanceRate, loanTerm, monthlyRent, monthlyExpenses]);

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
          <h1 className="text-2xl font-bold">ROI Calculator</h1>
          <p className="text-muted-foreground">Analyze returns for different investment strategies</p>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Left: Inputs */}
        <div className="lg:col-span-2 space-y-6">
          {/* Common Inputs */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Home className="w-5 h-5" />
                Deal Parameters
              </CardTitle>
              <CardDescription>Enter the basic deal numbers</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="space-y-2">
                  <Label>Purchase Price</Label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      type="number"
                      value={purchasePrice}
                      onChange={(e) => setPurchasePrice(Number(e.target.value))}
                      className="pl-9"
                    />
                  </div>
                </div>
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
                </div>
                <div className="space-y-2">
                  <Label>Closing Costs (Buy)</Label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      type="number"
                      value={closingCostsBuy}
                      onChange={(e) => setClosingCostsBuy(Number(e.target.value))}
                      className="pl-9"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>After Repair Value</Label>
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
              </div>
              <div className="mt-4 p-3 bg-muted rounded-lg">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Total Investment</span>
                  <span className="font-semibold">{formatCurrency(totalInvestment)}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Strategy Tabs */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calculator className="w-5 h-5" />
                Investment Strategy
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Tabs value={strategy} onValueChange={(v) => setStrategy(v as typeof strategy)}>
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="flip">Fix & Flip</TabsTrigger>
                  <TabsTrigger value="rental">Buy & Hold</TabsTrigger>
                  <TabsTrigger value="brrrr">BRRRR</TabsTrigger>
                </TabsList>

                {/* Flip Tab */}
                <TabsContent value="flip" className="space-y-4 mt-4">
                  <div className="grid sm:grid-cols-3 gap-4">
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
                    <div className="space-y-2">
                      <Label>Selling Costs (~8%)</Label>
                      <div className="relative">
                        <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                          type="number"
                          value={closingCostsSell}
                          onChange={(e) => setClosingCostsSell(Number(e.target.value))}
                          className="pl-9"
                        />
                      </div>
                    </div>
                  </div>
                </TabsContent>

                {/* Rental Tab */}
                <TabsContent value="rental" className="space-y-4 mt-4">
                  <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="space-y-2">
                      <Label>Monthly Rent</Label>
                      <div className="relative">
                        <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                          type="number"
                          value={monthlyRent}
                          onChange={(e) => setMonthlyRent(Number(e.target.value))}
                          className="pl-9"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>Monthly Expenses</Label>
                      <div className="relative">
                        <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                          type="number"
                          value={monthlyExpenses}
                          onChange={(e) => setMonthlyExpenses(Number(e.target.value))}
                          className="pl-9"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>Down Payment %</Label>
                      <div className="relative">
                        <Input
                          type="number"
                          value={downPaymentPercent}
                          onChange={(e) => setDownPaymentPercent(Number(e.target.value))}
                          className="pr-9"
                        />
                        <Percent className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>Interest Rate %</Label>
                      <div className="relative">
                        <Input
                          type="number"
                          step="0.125"
                          value={interestRate}
                          onChange={(e) => setInterestRate(Number(e.target.value))}
                          className="pr-9"
                        />
                        <Percent className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>Loan Term (years)</Label>
                      <Input
                        type="number"
                        value={loanTerm}
                        onChange={(e) => setLoanTerm(Number(e.target.value))}
                      />
                    </div>
                  </div>
                </TabsContent>

                {/* BRRRR Tab */}
                <TabsContent value="brrrr" className="space-y-4 mt-4">
                  <p className="text-sm text-muted-foreground">
                    Buy, Rehab, Rent, Refinance, Repeat - Pull your cash out and do it again!
                  </p>
                  <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="space-y-2">
                      <Label>Monthly Rent</Label>
                      <div className="relative">
                        <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                          type="number"
                          value={monthlyRent}
                          onChange={(e) => setMonthlyRent(Number(e.target.value))}
                          className="pl-9"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>Monthly Expenses</Label>
                      <div className="relative">
                        <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                          type="number"
                          value={monthlyExpenses}
                          onChange={(e) => setMonthlyExpenses(Number(e.target.value))}
                          className="pl-9"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>Refinance LTV %</Label>
                      <div className="relative">
                        <Input
                          type="number"
                          value={refinancePercent}
                          onChange={(e) => setRefinancePercent(Number(e.target.value))}
                          className="pr-9"
                        />
                        <Percent className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>Refinance Rate %</Label>
                      <div className="relative">
                        <Input
                          type="number"
                          step="0.125"
                          value={refinanceRate}
                          onChange={(e) => setRefinanceRate(Number(e.target.value))}
                          className="pr-9"
                        />
                        <Percent className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      </div>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>

        {/* Right: Results */}
        <div className="space-y-6">
          {/* Main Result Card */}
          {strategy === "flip" && (
            <motion.div
              key="flip-result"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
            >
              <Card className={`${flipResults.profit > 0 ? "bg-linear-to-br from-green-500 to-emerald-500" : "bg-linear-to-br from-red-500 to-rose-500"} text-white`}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    {flipResults.profit > 0 ? <ArrowUpRight className="w-5 h-5" /> : <ArrowDownRight className="w-5 h-5" />}
                    Flip Profit
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-4xl font-bold">{formatCurrency(flipResults.profit)}</p>
                  <p className="text-white/80 mt-2">
                    {formatPercent(flipResults.roi)} ROI • {formatPercent(flipResults.annualizedRoi)} Annualized
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {strategy === "rental" && (
            <motion.div
              key="rental-result"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
            >
              <Card className={`${rentalResults.cashOnCash > 0 ? "bg-linear-to-br from-blue-500 to-cyan-500" : "bg-linear-to-br from-red-500 to-rose-500"} text-white`}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <PiggyBank className="w-5 h-5" />
                    Cash-on-Cash Return
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-4xl font-bold">{formatPercent(rentalResults.cashOnCash)}</p>
                  <p className="text-white/80 mt-2">
                    {formatCurrency(rentalResults.monthlyCashFlow)}/mo • {formatCurrency(rentalResults.annualCashFlow)}/yr
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {strategy === "brrrr" && (
            <motion.div
              key="brrrr-result"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
            >
              <Card className="bg-linear-to-br from-purple-500 to-pink-500 text-white">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="w-5 h-5" />
                    BRRRR Return
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-4xl font-bold">
                    {brrrrResults.infiniteReturn ? "∞" : formatPercent(brrrrResults.cashOnCash)}
                  </p>
                  <p className="text-white/80 mt-2">
                    {brrrrResults.infiniteReturn ? "All cash out!" : `${formatCurrency(brrrrResults.actualCashInvested)} left in deal`}
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Detailed Breakdown */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5" />
                Detailed Breakdown
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              {strategy === "flip" && (
                <>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Sale Price (ARV)</span>
                    <span>{formatCurrency(arv)}</span>
                  </div>
                  <div className="flex justify-between text-red-600 dark:text-red-400">
                    <span>- Purchase Price</span>
                    <span>{formatCurrency(purchasePrice)}</span>
                  </div>
                  <div className="flex justify-between text-red-600 dark:text-red-400">
                    <span>- Repairs</span>
                    <span>{formatCurrency(repairCosts)}</span>
                  </div>
                  <div className="flex justify-between text-red-600 dark:text-red-400">
                    <span>- Closing Costs</span>
                    <span>{formatCurrency(closingCostsBuy + closingCostsSell)}</span>
                  </div>
                  <div className="flex justify-between text-red-600 dark:text-red-400">
                    <span>- Holding Costs ({holdingMonths} mo)</span>
                    <span>{formatCurrency(flipResults.holdingCosts)}</span>
                  </div>
                  <div className="border-t pt-3 flex justify-between font-semibold">
                    <span>Net Profit</span>
                    <span className={flipResults.profit > 0 ? "text-green-600" : "text-red-600"}>
                      {formatCurrency(flipResults.profit)}
                    </span>
                  </div>
                </>
              )}

              {strategy === "rental" && (
                <>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Monthly Rent</span>
                    <span>{formatCurrency(monthlyRent)}</span>
                  </div>
                  <div className="flex justify-between text-red-600 dark:text-red-400">
                    <span>- Expenses</span>
                    <span>{formatCurrency(monthlyExpenses)}</span>
                  </div>
                  <div className="flex justify-between text-red-600 dark:text-red-400">
                    <span>- Mortgage</span>
                    <span>{formatCurrency(rentalResults.monthlyMortgage)}</span>
                  </div>
                  <div className="border-t pt-3 flex justify-between font-semibold">
                    <span>Monthly Cash Flow</span>
                    <span className={rentalResults.monthlyCashFlow > 0 ? "text-green-600" : "text-red-600"}>
                      {formatCurrency(rentalResults.monthlyCashFlow)}
                    </span>
                  </div>
                  <div className="flex justify-between text-muted-foreground">
                    <span>Cash Invested</span>
                    <span>{formatCurrency(rentalResults.cashInvested)}</span>
                  </div>
                  <div className="flex justify-between text-muted-foreground">
                    <span>Cap Rate</span>
                    <span>{formatPercent(rentalResults.capRate)}</span>
                  </div>
                </>
              )}

              {strategy === "brrrr" && (
                <>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Refinance Value ({refinancePercent}% LTV)</span>
                    <span>{formatCurrency(brrrrResults.refinanceValue)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Total Investment</span>
                    <span>{formatCurrency(totalInvestment)}</span>
                  </div>
                  <div className="flex justify-between text-green-600 dark:text-green-400">
                    <span>Cash Out at Refi</span>
                    <span>{formatCurrency(brrrrResults.cashOutAmount)}</span>
                  </div>
                  <div className="border-t pt-3 flex justify-between font-semibold">
                    <span>Cash Left in Deal</span>
                    <span className={brrrrResults.actualCashInvested <= 0 ? "text-green-600" : ""}>
                      {formatCurrency(brrrrResults.actualCashInvested)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Monthly Cash Flow</span>
                    <span className={brrrrResults.monthlyCashFlow > 0 ? "text-green-600" : "text-red-600"}>
                      {formatCurrency(brrrrResults.monthlyCashFlow)}
                    </span>
                  </div>
                </>
              )}
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
                <Link href="/dashboard/analysis">
                  ← Back to Analysis Hub
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
