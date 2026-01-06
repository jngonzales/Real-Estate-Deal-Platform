"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { 
  Sparkles, 
  ArrowLeft, 
  DollarSign,
  Percent,
  Calculator,
  Building,
  TrendingUp,
  Clock,
  CheckCircle,
  AlertTriangle,
  ArrowRight,
  CreditCard,
  Landmark,
  PiggyBank,
} from "lucide-react";

interface LoanScenario {
  name: string;
  type: string;
  loanAmount: number;
  downPayment: number;
  interestRate: number;
  termMonths: number;
  monthlyPayment: number;
  totalInterest: number;
  totalPayment: number;
  originationFee: number;
  closingCosts: number;
  allInCost: number;
  pointsCost: number;
}

export default function FinancingCalculator() {
  // Property Details
  const [purchasePrice, setPurchasePrice] = useState<number>(300000);
  const [repairCost, setRepairCost] = useState<number>(50000);
  const [arv, setArv] = useState<number>(450000);
  
  // Hard Money Loan
  const [hmLtv, setHmLtv] = useState<number>(70);
  const [hmLtc, setHmLtc] = useState<number>(80);
  const [hmRate, setHmRate] = useState<number>(12);
  const [hmPoints, setHmPoints] = useState<number>(2);
  const [hmTermMonths, setHmTermMonths] = useState<number>(12);
  
  // Conventional Loan
  const [convDownPayment, setConvDownPayment] = useState<number>(25);
  const [convRate, setConvRate] = useState<number>(7);
  const [convTermYears, setConvTermYears] = useState<number>(30);
  
  // DSCR Loan
  const [dscrDownPayment, setDscrDownPayment] = useState<number>(20);
  const [dscrRate, setDscrRate] = useState<number>(8);
  const [dscrTermYears, setDscrTermYears] = useState<number>(30);
  const [monthlyRent, setMonthlyRent] = useState<number>(2500);
  
  // Private Money
  const [pmLoanAmount, setPmLoanAmount] = useState<number>(200000);
  const [pmRate, setPmRate] = useState<number>(10);
  const [pmTermMonths, setPmTermMonths] = useState<number>(24);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0,
    }).format(value);
  };

  const formatPercent = (value: number) => {
    return `${value.toFixed(2)}%`;
  };

  // Calculate monthly payment for amortizing loan
  const calcMonthlyPayment = (principal: number, annualRate: number, months: number): number => {
    if (months === 0 || principal === 0) return 0;
    const monthlyRate = annualRate / 100 / 12;
    if (monthlyRate === 0) return principal / months;
    return (principal * monthlyRate * Math.pow(1 + monthlyRate, months)) / (Math.pow(1 + monthlyRate, months) - 1);
  };

  // Hard Money Calculations
  const hardMoneyLoan = useMemo((): LoanScenario => {
    const totalCost = purchasePrice + repairCost;
    const maxByLtv = arv * (hmLtv / 100);
    const maxByLtc = totalCost * (hmLtc / 100);
    const loanAmount = Math.min(maxByLtv, maxByLtc);
    const downPayment = totalCost - loanAmount;
    const pointsCost = loanAmount * (hmPoints / 100);
    const monthlyInterest = loanAmount * (hmRate / 100 / 12);
    const totalInterest = monthlyInterest * hmTermMonths;
    
    return {
      name: "Hard Money",
      type: "Interest-Only",
      loanAmount,
      downPayment,
      interestRate: hmRate,
      termMonths: hmTermMonths,
      monthlyPayment: monthlyInterest,
      totalInterest,
      totalPayment: loanAmount + totalInterest,
      originationFee: pointsCost,
      closingCosts: loanAmount * 0.01,
      allInCost: loanAmount + totalInterest + pointsCost + (loanAmount * 0.01),
      pointsCost,
    };
  }, [purchasePrice, repairCost, arv, hmLtv, hmLtc, hmRate, hmPoints, hmTermMonths]);

  // Conventional Loan Calculations
  const conventionalLoan = useMemo((): LoanScenario => {
    const downPaymentAmount = purchasePrice * (convDownPayment / 100);
    const loanAmount = purchasePrice - downPaymentAmount;
    const termMonths = convTermYears * 12;
    const monthlyPayment = calcMonthlyPayment(loanAmount, convRate, termMonths);
    const totalPayment = monthlyPayment * termMonths;
    const totalInterest = totalPayment - loanAmount;
    
    return {
      name: "Conventional",
      type: "Amortizing",
      loanAmount,
      downPayment: downPaymentAmount,
      interestRate: convRate,
      termMonths,
      monthlyPayment,
      totalInterest,
      totalPayment,
      originationFee: loanAmount * 0.01,
      closingCosts: loanAmount * 0.02,
      allInCost: totalPayment + (loanAmount * 0.03),
      pointsCost: 0,
    };
  }, [purchasePrice, convDownPayment, convRate, convTermYears]);

  // DSCR Loan Calculations
  const dscrLoan = useMemo((): LoanScenario => {
    const downPaymentAmount = purchasePrice * (dscrDownPayment / 100);
    const loanAmount = purchasePrice - downPaymentAmount;
    const termMonths = dscrTermYears * 12;
    const monthlyPayment = calcMonthlyPayment(loanAmount, dscrRate, termMonths);
    const totalPayment = monthlyPayment * termMonths;
    const totalInterest = totalPayment - loanAmount;
    
    return {
      name: "DSCR",
      type: "Amortizing",
      loanAmount,
      downPayment: downPaymentAmount,
      interestRate: dscrRate,
      termMonths,
      monthlyPayment,
      totalInterest,
      totalPayment,
      originationFee: loanAmount * 0.015,
      closingCosts: loanAmount * 0.025,
      allInCost: totalPayment + (loanAmount * 0.04),
      pointsCost: 0,
    };
  }, [purchasePrice, dscrDownPayment, dscrRate, dscrTermYears]);

  // Private Money Calculations
  const privateLoan = useMemo((): LoanScenario => {
    const downPayment = (purchasePrice + repairCost) - pmLoanAmount;
    const monthlyInterest = pmLoanAmount * (pmRate / 100 / 12);
    const totalInterest = monthlyInterest * pmTermMonths;
    
    return {
      name: "Private Money",
      type: "Interest-Only",
      loanAmount: pmLoanAmount,
      downPayment: Math.max(0, downPayment),
      interestRate: pmRate,
      termMonths: pmTermMonths,
      monthlyPayment: monthlyInterest,
      totalInterest,
      totalPayment: pmLoanAmount + totalInterest,
      originationFee: 0,
      closingCosts: 500,
      allInCost: pmLoanAmount + totalInterest + 500,
      pointsCost: 0,
    };
  }, [purchasePrice, repairCost, pmLoanAmount, pmRate, pmTermMonths]);

  // DSCR Ratio
  const dscrRatio = useMemo(() => {
    const expenses = dscrLoan.monthlyPayment + (purchasePrice * 0.01 / 12) + (purchasePrice * 0.002 / 12); // P&I + Taxes + Insurance
    return expenses > 0 ? monthlyRent / expenses : 0;
  }, [dscrLoan.monthlyPayment, purchasePrice, monthlyRent]);

  // All scenarios for comparison
  const allScenarios = [hardMoneyLoan, conventionalLoan, dscrLoan, privateLoan];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-900 to-slate-950">
      {/* Header */}
      <header className="border-b border-white/10 bg-slate-900/80 backdrop-blur-xl sticky top-0 z-50">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-purple-600">
              <Sparkles className="h-4 w-4 text-white" />
            </div>
            <span className="font-bold text-white">DealFlow</span>
          </Link>
          <div className="flex items-center gap-4">
            <Button variant="ghost" className="text-slate-300 hover:text-white" asChild>
              <Link href="/calculators">
                <ArrowLeft className="h-4 w-4 mr-2" />
                All Calculators
              </Link>
            </Button>
            <Button className="bg-gradient-to-r from-primary to-purple-600" asChild>
              <Link href="/login">Save Analysis</Link>
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Page Title */}
        <div className="max-w-6xl mx-auto mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center">
              <CreditCard className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white">Financing Calculator</h1>
              <p className="text-slate-400">Compare loan options: Hard Money, Conventional, DSCR, and Private Money</p>
            </div>
          </div>
        </div>

        <div className="max-w-6xl mx-auto">
          {/* Property Details (Shared Inputs) */}
          <Card className="bg-slate-800/50 border-white/10 mb-6">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Building className="h-5 w-5 text-blue-400" />
                Property Details
              </CardTitle>
              <CardDescription>Enter property information for loan calculations</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-4 gap-4">
                <div>
                  <Label className="text-slate-300">Purchase Price</Label>
                  <div className="relative mt-1">
                    <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                    <Input
                      type="number"
                      value={purchasePrice}
                      onChange={(e) => setPurchasePrice(Number(e.target.value))}
                      className="pl-9 bg-slate-900/50 border-white/10 text-white"
                    />
                  </div>
                </div>
                <div>
                  <Label className="text-slate-300">Repair Cost</Label>
                  <div className="relative mt-1">
                    <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                    <Input
                      type="number"
                      value={repairCost}
                      onChange={(e) => setRepairCost(Number(e.target.value))}
                      className="pl-9 bg-slate-900/50 border-white/10 text-white"
                    />
                  </div>
                </div>
                <div>
                  <Label className="text-slate-300">After Repair Value (ARV)</Label>
                  <div className="relative mt-1">
                    <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                    <Input
                      type="number"
                      value={arv}
                      onChange={(e) => setArv(Number(e.target.value))}
                      className="pl-9 bg-slate-900/50 border-white/10 text-white"
                    />
                  </div>
                </div>
                <div>
                  <Label className="text-slate-300">Monthly Rent (for DSCR)</Label>
                  <div className="relative mt-1">
                    <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                    <Input
                      type="number"
                      value={monthlyRent}
                      onChange={(e) => setMonthlyRent(Number(e.target.value))}
                      className="pl-9 bg-slate-900/50 border-white/10 text-white"
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Tabs defaultValue="comparison" className="space-y-6">
            <TabsList className="bg-slate-800/50 border border-white/10">
              <TabsTrigger value="comparison" className="data-[state=active]:bg-primary">
                <Calculator className="h-4 w-4 mr-2" />
                Compare All
              </TabsTrigger>
              <TabsTrigger value="hardmoney" className="data-[state=active]:bg-primary">
                <TrendingUp className="h-4 w-4 mr-2" />
                Hard Money
              </TabsTrigger>
              <TabsTrigger value="conventional" className="data-[state=active]:bg-primary">
                <Landmark className="h-4 w-4 mr-2" />
                Conventional
              </TabsTrigger>
              <TabsTrigger value="dscr" className="data-[state=active]:bg-primary">
                <PiggyBank className="h-4 w-4 mr-2" />
                DSCR
              </TabsTrigger>
              <TabsTrigger value="private" className="data-[state=active]:bg-primary">
                <CreditCard className="h-4 w-4 mr-2" />
                Private Money
              </TabsTrigger>
            </TabsList>

            {/* Comparison Tab */}
            <TabsContent value="comparison" className="space-y-6">
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                {allScenarios.map((scenario, index) => (
                  <Card key={index} className={`bg-slate-800/50 border-white/10 ${index === 0 ? 'ring-2 ring-primary' : ''}`}>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-white text-lg">{scenario.name}</CardTitle>
                      <CardDescription>{scenario.type} Loan</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="p-4 rounded-lg bg-slate-900/50">
                        <div className="text-2xl font-bold text-white">{formatCurrency(scenario.monthlyPayment)}</div>
                        <div className="text-slate-400 text-sm">/month</div>
                      </div>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-slate-400">Loan Amount</span>
                          <span className="text-white">{formatCurrency(scenario.loanAmount)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-400">Down Payment</span>
                          <span className="text-white">{formatCurrency(scenario.downPayment)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-400">Interest Rate</span>
                          <span className="text-white">{formatPercent(scenario.interestRate)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-400">Term</span>
                          <span className="text-white">{scenario.termMonths} months</span>
                        </div>
                        <div className="flex justify-between pt-2 border-t border-white/10">
                          <span className="text-slate-400">Total Interest</span>
                          <span className="text-orange-400">{formatCurrency(scenario.totalInterest)}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Comparison Table */}
              <Card className="bg-slate-800/50 border-white/10 overflow-hidden">
                <CardHeader>
                  <CardTitle className="text-white">Side-by-Side Comparison</CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-white/10 bg-slate-900/50">
                          <th className="text-left p-4 text-slate-400">Metric</th>
                          {allScenarios.map((s, i) => (
                            <th key={i} className="text-right p-4 text-slate-400">{s.name}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        <tr className="border-b border-white/10">
                          <td className="p-4 text-slate-300">Loan Amount</td>
                          {allScenarios.map((s, i) => (
                            <td key={i} className="p-4 text-right text-white">{formatCurrency(s.loanAmount)}</td>
                          ))}
                        </tr>
                        <tr className="border-b border-white/10">
                          <td className="p-4 text-slate-300">Down Payment Required</td>
                          {allScenarios.map((s, i) => (
                            <td key={i} className="p-4 text-right text-white">{formatCurrency(s.downPayment)}</td>
                          ))}
                        </tr>
                        <tr className="border-b border-white/10">
                          <td className="p-4 text-slate-300">Monthly Payment</td>
                          {allScenarios.map((s, i) => (
                            <td key={i} className="p-4 text-right text-white font-medium">{formatCurrency(s.monthlyPayment)}</td>
                          ))}
                        </tr>
                        <tr className="border-b border-white/10">
                          <td className="p-4 text-slate-300">Interest Rate</td>
                          {allScenarios.map((s, i) => (
                            <td key={i} className="p-4 text-right text-white">{formatPercent(s.interestRate)}</td>
                          ))}
                        </tr>
                        <tr className="border-b border-white/10">
                          <td className="p-4 text-slate-300">Loan Term</td>
                          {allScenarios.map((s, i) => (
                            <td key={i} className="p-4 text-right text-white">{s.termMonths} months</td>
                          ))}
                        </tr>
                        <tr className="border-b border-white/10">
                          <td className="p-4 text-slate-300">Points / Origination</td>
                          {allScenarios.map((s, i) => (
                            <td key={i} className="p-4 text-right text-orange-400">{formatCurrency(s.originationFee)}</td>
                          ))}
                        </tr>
                        <tr className="border-b border-white/10">
                          <td className="p-4 text-slate-300">Total Interest Paid</td>
                          {allScenarios.map((s, i) => (
                            <td key={i} className="p-4 text-right text-orange-400">{formatCurrency(s.totalInterest)}</td>
                          ))}
                        </tr>
                        <tr className="bg-slate-900/50">
                          <td className="p-4 text-white font-medium">All-In Cost</td>
                          {allScenarios.map((s, i) => (
                            <td key={i} className="p-4 text-right text-white font-bold">{formatCurrency(s.allInCost)}</td>
                          ))}
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Hard Money Tab */}
            <TabsContent value="hardmoney" className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <Card className="bg-slate-800/50 border-white/10">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center gap-2">
                      <TrendingUp className="h-5 w-5 text-orange-400" />
                      Hard Money Loan Settings
                    </CardTitle>
                    <CardDescription>Short-term, asset-based financing for fix-and-flip</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div>
                      <div className="flex justify-between mb-2">
                        <Label className="text-slate-300">LTV (% of ARV)</Label>
                        <span className="text-white font-medium">{hmLtv}%</span>
                      </div>
                      <Slider
                        value={[hmLtv]}
                        onValueChange={(v) => setHmLtv(v[0])}
                        min={50}
                        max={80}
                        step={1}
                        className="[&>span:first-child]:bg-orange-500"
                      />
                      <p className="text-xs text-slate-500 mt-1">Max {formatCurrency(arv * hmLtv / 100)} based on ARV</p>
                    </div>
                    <div>
                      <div className="flex justify-between mb-2">
                        <Label className="text-slate-300">LTC (% of Total Cost)</Label>
                        <span className="text-white font-medium">{hmLtc}%</span>
                      </div>
                      <Slider
                        value={[hmLtc]}
                        onValueChange={(v) => setHmLtc(v[0])}
                        min={70}
                        max={100}
                        step={1}
                        className="[&>span:first-child]:bg-orange-500"
                      />
                      <p className="text-xs text-slate-500 mt-1">Max {formatCurrency((purchasePrice + repairCost) * hmLtc / 100)} based on total cost</p>
                    </div>
                    <div>
                      <div className="flex justify-between mb-2">
                        <Label className="text-slate-300">Interest Rate</Label>
                        <span className="text-white font-medium">{hmRate}%</span>
                      </div>
                      <Slider
                        value={[hmRate]}
                        onValueChange={(v) => setHmRate(v[0])}
                        min={8}
                        max={18}
                        step={0.5}
                        className="[&>span:first-child]:bg-orange-500"
                      />
                    </div>
                    <div>
                      <div className="flex justify-between mb-2">
                        <Label className="text-slate-300">Points (Origination Fee)</Label>
                        <span className="text-white font-medium">{hmPoints} points</span>
                      </div>
                      <Slider
                        value={[hmPoints]}
                        onValueChange={(v) => setHmPoints(v[0])}
                        min={1}
                        max={5}
                        step={0.5}
                        className="[&>span:first-child]:bg-orange-500"
                      />
                      <p className="text-xs text-slate-500 mt-1">Points cost: {formatCurrency(hardMoneyLoan.pointsCost)}</p>
                    </div>
                    <div>
                      <Label className="text-slate-300">Loan Term (months)</Label>
                      <Select value={String(hmTermMonths)} onValueChange={(v) => setHmTermMonths(Number(v))}>
                        <SelectTrigger className="mt-1 bg-slate-900/50 border-white/10 text-white">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="6">6 months</SelectItem>
                          <SelectItem value="9">9 months</SelectItem>
                          <SelectItem value="12">12 months</SelectItem>
                          <SelectItem value="18">18 months</SelectItem>
                          <SelectItem value="24">24 months</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-slate-800/50 border-white/10">
                  <CardHeader>
                    <CardTitle className="text-white">Hard Money Summary</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="p-6 rounded-xl bg-gradient-to-br from-orange-500/20 to-amber-500/20 border border-orange-500/30">
                      <div className="text-3xl font-bold text-orange-400">{formatCurrency(hardMoneyLoan.monthlyPayment)}</div>
                      <div className="text-slate-300">Monthly Interest Payment</div>
                    </div>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-slate-400">Loan Amount</span>
                        <span className="text-white font-medium">{formatCurrency(hardMoneyLoan.loanAmount)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Down Payment Needed</span>
                        <span className="text-white font-medium">{formatCurrency(hardMoneyLoan.downPayment)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Points Cost</span>
                        <span className="text-orange-400">{formatCurrency(hardMoneyLoan.pointsCost)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Total Interest ({hmTermMonths} mo)</span>
                        <span className="text-orange-400">{formatCurrency(hardMoneyLoan.totalInterest)}</span>
                      </div>
                      <div className="flex justify-between pt-3 border-t border-white/10">
                        <span className="text-white font-medium">Cash to Close</span>
                        <span className="text-white font-bold">{formatCurrency(hardMoneyLoan.downPayment + hardMoneyLoan.pointsCost + hardMoneyLoan.closingCosts)}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Conventional Tab */}
            <TabsContent value="conventional" className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <Card className="bg-slate-800/50 border-white/10">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center gap-2">
                      <Landmark className="h-5 w-5 text-blue-400" />
                      Conventional Loan Settings
                    </CardTitle>
                    <CardDescription>Traditional bank financing for stabilized properties</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div>
                      <div className="flex justify-between mb-2">
                        <Label className="text-slate-300">Down Payment</Label>
                        <span className="text-white font-medium">{convDownPayment}%</span>
                      </div>
                      <Slider
                        value={[convDownPayment]}
                        onValueChange={(v) => setConvDownPayment(v[0])}
                        min={5}
                        max={50}
                        step={1}
                        className="[&>span:first-child]:bg-blue-500"
                      />
                      <p className="text-xs text-slate-500 mt-1">{formatCurrency(purchasePrice * convDownPayment / 100)}</p>
                    </div>
                    <div>
                      <div className="flex justify-between mb-2">
                        <Label className="text-slate-300">Interest Rate</Label>
                        <span className="text-white font-medium">{convRate}%</span>
                      </div>
                      <Slider
                        value={[convRate]}
                        onValueChange={(v) => setConvRate(v[0])}
                        min={4}
                        max={12}
                        step={0.125}
                        className="[&>span:first-child]:bg-blue-500"
                      />
                    </div>
                    <div>
                      <Label className="text-slate-300">Loan Term</Label>
                      <Select value={String(convTermYears)} onValueChange={(v) => setConvTermYears(Number(v))}>
                        <SelectTrigger className="mt-1 bg-slate-900/50 border-white/10 text-white">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="15">15 years</SelectItem>
                          <SelectItem value="20">20 years</SelectItem>
                          <SelectItem value="25">25 years</SelectItem>
                          <SelectItem value="30">30 years</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-slate-800/50 border-white/10">
                  <CardHeader>
                    <CardTitle className="text-white">Conventional Summary</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="p-6 rounded-xl bg-gradient-to-br from-blue-500/20 to-cyan-500/20 border border-blue-500/30">
                      <div className="text-3xl font-bold text-blue-400">{formatCurrency(conventionalLoan.monthlyPayment)}</div>
                      <div className="text-slate-300">Monthly P&I Payment</div>
                    </div>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-slate-400">Loan Amount</span>
                        <span className="text-white font-medium">{formatCurrency(conventionalLoan.loanAmount)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Down Payment</span>
                        <span className="text-white font-medium">{formatCurrency(conventionalLoan.downPayment)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Closing Costs (est.)</span>
                        <span className="text-orange-400">{formatCurrency(conventionalLoan.closingCosts)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Total Interest ({convTermYears} yr)</span>
                        <span className="text-orange-400">{formatCurrency(conventionalLoan.totalInterest)}</span>
                      </div>
                      <div className="flex justify-between pt-3 border-t border-white/10">
                        <span className="text-white font-medium">Cash to Close</span>
                        <span className="text-white font-bold">{formatCurrency(conventionalLoan.downPayment + conventionalLoan.closingCosts)}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* DSCR Tab */}
            <TabsContent value="dscr" className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <Card className="bg-slate-800/50 border-white/10">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center gap-2">
                      <PiggyBank className="h-5 w-5 text-emerald-400" />
                      DSCR Loan Settings
                    </CardTitle>
                    <CardDescription>Debt Service Coverage Ratio loans for rental properties</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div>
                      <div className="flex justify-between mb-2">
                        <Label className="text-slate-300">Down Payment</Label>
                        <span className="text-white font-medium">{dscrDownPayment}%</span>
                      </div>
                      <Slider
                        value={[dscrDownPayment]}
                        onValueChange={(v) => setDscrDownPayment(v[0])}
                        min={15}
                        max={40}
                        step={1}
                        className="[&>span:first-child]:bg-emerald-500"
                      />
                    </div>
                    <div>
                      <div className="flex justify-between mb-2">
                        <Label className="text-slate-300">Interest Rate</Label>
                        <span className="text-white font-medium">{dscrRate}%</span>
                      </div>
                      <Slider
                        value={[dscrRate]}
                        onValueChange={(v) => setDscrRate(v[0])}
                        min={5}
                        max={12}
                        step={0.125}
                        className="[&>span:first-child]:bg-emerald-500"
                      />
                    </div>
                    <div>
                      <Label className="text-slate-300">Loan Term</Label>
                      <Select value={String(dscrTermYears)} onValueChange={(v) => setDscrTermYears(Number(v))}>
                        <SelectTrigger className="mt-1 bg-slate-900/50 border-white/10 text-white">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="15">15 years</SelectItem>
                          <SelectItem value="20">20 years</SelectItem>
                          <SelectItem value="25">25 years</SelectItem>
                          <SelectItem value="30">30 years</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </CardContent>
                </Card>

                <div className="space-y-6">
                  <Card className="bg-slate-800/50 border-white/10">
                    <CardHeader>
                      <CardTitle className="text-white">DSCR Summary</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="p-6 rounded-xl bg-gradient-to-br from-emerald-500/20 to-green-500/20 border border-emerald-500/30">
                        <div className="text-3xl font-bold text-emerald-400">{formatCurrency(dscrLoan.monthlyPayment)}</div>
                        <div className="text-slate-300">Monthly P&I Payment</div>
                      </div>
                      <div className="space-y-3">
                        <div className="flex justify-between">
                          <span className="text-slate-400">Loan Amount</span>
                          <span className="text-white font-medium">{formatCurrency(dscrLoan.loanAmount)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-400">Down Payment</span>
                          <span className="text-white font-medium">{formatCurrency(dscrLoan.downPayment)}</span>
                        </div>
                        <div className="flex justify-between pt-3 border-t border-white/10">
                          <span className="text-white font-medium">Cash to Close</span>
                          <span className="text-white font-bold">{formatCurrency(dscrLoan.downPayment + dscrLoan.closingCosts)}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className={`border ${dscrRatio >= 1.25 ? 'bg-emerald-500/10 border-emerald-500/30' : dscrRatio >= 1.0 ? 'bg-yellow-500/10 border-yellow-500/30' : 'bg-red-500/10 border-red-500/30'}`}>
                    <CardContent className="pt-6">
                      <div className="flex items-center gap-3 mb-4">
                        {dscrRatio >= 1.25 ? (
                          <CheckCircle className="h-6 w-6 text-emerald-400" />
                        ) : dscrRatio >= 1.0 ? (
                          <AlertTriangle className="h-6 w-6 text-yellow-400" />
                        ) : (
                          <AlertTriangle className="h-6 w-6 text-red-400" />
                        )}
                        <div>
                          <div className="text-2xl font-bold text-white">{dscrRatio.toFixed(2)}x DSCR</div>
                          <div className="text-sm text-slate-400">
                            {dscrRatio >= 1.25 ? 'Qualifies for most DSCR loans' : dscrRatio >= 1.0 ? 'May qualify with higher rates' : 'Does not qualify'}
                          </div>
                        </div>
                      </div>
                      <p className="text-sm text-slate-400">
                        Based on {formatCurrency(monthlyRent)} monthly rent vs. {formatCurrency(dscrLoan.monthlyPayment + (purchasePrice * 0.012 / 12))} total PITI
                      </p>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </TabsContent>

            {/* Private Money Tab */}
            <TabsContent value="private" className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <Card className="bg-slate-800/50 border-white/10">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center gap-2">
                      <CreditCard className="h-5 w-5 text-purple-400" />
                      Private Money Settings
                    </CardTitle>
                    <CardDescription>Flexible financing from private lenders</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div>
                      <Label className="text-slate-300">Loan Amount</Label>
                      <div className="relative mt-1">
                        <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                        <Input
                          type="number"
                          value={pmLoanAmount}
                          onChange={(e) => setPmLoanAmount(Number(e.target.value))}
                          className="pl-9 bg-slate-900/50 border-white/10 text-white"
                        />
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between mb-2">
                        <Label className="text-slate-300">Interest Rate</Label>
                        <span className="text-white font-medium">{pmRate}%</span>
                      </div>
                      <Slider
                        value={[pmRate]}
                        onValueChange={(v) => setPmRate(v[0])}
                        min={6}
                        max={15}
                        step={0.5}
                        className="[&>span:first-child]:bg-purple-500"
                      />
                    </div>
                    <div>
                      <Label className="text-slate-300">Loan Term (months)</Label>
                      <Select value={String(pmTermMonths)} onValueChange={(v) => setPmTermMonths(Number(v))}>
                        <SelectTrigger className="mt-1 bg-slate-900/50 border-white/10 text-white">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="6">6 months</SelectItem>
                          <SelectItem value="12">12 months</SelectItem>
                          <SelectItem value="18">18 months</SelectItem>
                          <SelectItem value="24">24 months</SelectItem>
                          <SelectItem value="36">36 months</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-slate-800/50 border-white/10">
                  <CardHeader>
                    <CardTitle className="text-white">Private Money Summary</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="p-6 rounded-xl bg-gradient-to-br from-purple-500/20 to-pink-500/20 border border-purple-500/30">
                      <div className="text-3xl font-bold text-purple-400">{formatCurrency(privateLoan.monthlyPayment)}</div>
                      <div className="text-slate-300">Monthly Interest Payment</div>
                    </div>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-slate-400">Loan Amount</span>
                        <span className="text-white font-medium">{formatCurrency(privateLoan.loanAmount)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Your Cash Needed</span>
                        <span className="text-white font-medium">{formatCurrency(privateLoan.downPayment)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Total Interest ({pmTermMonths} mo)</span>
                        <span className="text-orange-400">{formatCurrency(privateLoan.totalInterest)}</span>
                      </div>
                      <div className="flex justify-between pt-3 border-t border-white/10">
                        <span className="text-white font-medium">Total to Repay</span>
                        <span className="text-white font-bold">{formatCurrency(privateLoan.totalPayment)}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </div>

        {/* CTA Section */}
        <div className="max-w-6xl mx-auto mt-12 text-center">
          <div className="p-8 rounded-2xl bg-gradient-to-br from-primary/10 to-purple-500/10 border border-primary/20">
            <h3 className="text-2xl font-bold text-white mb-2">Find the Right Financing</h3>
            <p className="text-slate-400 mb-6">
              Create an account to save your financing scenarios and compare options for each deal.
            </p>
            <div className="flex justify-center gap-4">
              <Button size="lg" className="bg-gradient-to-r from-primary to-purple-600" asChild>
                <Link href="/login">
                  Save Scenarios
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" className="border-white/20 text-white hover:bg-white/10" asChild>
                <Link href="/calculators">
                  Try Other Calculators
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
