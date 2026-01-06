"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Sparkles, 
  ArrowLeft, 
  Calendar,
  DollarSign,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Clock,
  Building,
  ArrowRight,
  Calculator,
  FileText,
  Info,
} from "lucide-react";

interface TimelineEvent {
  day: number;
  label: string;
  description: string;
  status: "completed" | "current" | "upcoming" | "deadline";
}

interface PropertyMatch {
  minValue: number;
  maxValue: number;
  minEquity: number;
  debtCapacity: number;
}

export default function Exchange1031Calculator() {
  // Relinquished Property (property being sold)
  const [salePrice, setSalePrice] = useState<number>(500000);
  const [originalBasis, setOriginalBasis] = useState<number>(250000);
  const [improvements, setImprovements] = useState<number>(50000);
  const [depreciation, setDepreciation] = useState<number>(25000);
  const [existingMortgage, setExistingMortgage] = useState<number>(200000);
  const [sellingCosts, setSellingCosts] = useState<number>(30000);
  
  // Tax Rates
  const [capitalGainsRate, setCapitalGainsRate] = useState<number>(15);
  const [depreciationRecaptureRate] = useState<number>(25); // Fixed at 25%
  const [stateCapitalGainsRate, setStateCapitalGainsRate] = useState<number>(5);
  const [netInvestmentTaxRate] = useState<number>(3.8); // NIIT
  
  // Timeline
  const [saleDate, setSaleDate] = useState<string>(() => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  });
  
  // Calculations
  const calculations = useMemo(() => {
    const adjustedBasis = originalBasis + improvements - depreciation;
    const realizedGain = salePrice - sellingCosts - adjustedBasis;
    const netEquity = salePrice - existingMortgage - sellingCosts;
    
    // Capital gains tax breakdown
    const depreciationRecapture = depreciation;
    const capitalGain = realizedGain - depreciationRecapture;
    
    const federalCapitalGainsTax = capitalGain * (capitalGainsRate / 100);
    const depreciationRecaptureTax = depreciationRecapture * (depreciationRecaptureRate / 100);
    const stateCapitalGainsTax = realizedGain * (stateCapitalGainsRate / 100);
    const niitTax = realizedGain * (netInvestmentTaxRate / 100);
    
    const totalTaxIfSold = federalCapitalGainsTax + depreciationRecaptureTax + stateCapitalGainsTax + niitTax;
    const taxSavings = totalTaxIfSold;
    const afterTaxProceeds = netEquity - totalTaxIfSold;
    
    return {
      adjustedBasis,
      realizedGain: Math.max(0, realizedGain),
      netEquity: Math.max(0, netEquity),
      depreciationRecapture,
      capitalGain: Math.max(0, capitalGain),
      federalCapitalGainsTax: Math.max(0, federalCapitalGainsTax),
      depreciationRecaptureTax: Math.max(0, depreciationRecaptureTax),
      stateCapitalGainsTax: Math.max(0, stateCapitalGainsTax),
      niitTax: Math.max(0, niitTax),
      totalTaxIfSold: Math.max(0, totalTaxIfSold),
      taxSavings: Math.max(0, taxSavings),
      afterTaxProceeds: Math.max(0, afterTaxProceeds),
    };
  }, [salePrice, originalBasis, improvements, depreciation, existingMortgage, sellingCosts, capitalGainsRate, depreciationRecaptureRate, stateCapitalGainsRate, netInvestmentTaxRate]);
  
  // Replacement Property Requirements
  const replacementRequirements: PropertyMatch = useMemo(() => {
    return {
      minValue: salePrice, // Must be equal or greater to defer all gains
      maxValue: salePrice * 2, // Typical upper range
      minEquity: calculations.netEquity, // Must reinvest all equity
      debtCapacity: existingMortgage, // Must take on equal or more debt
    };
  }, [salePrice, calculations.netEquity, existingMortgage]);
  
  // Timeline Events
  const timelineEvents = useMemo((): TimelineEvent[] => {
    const sale = new Date(saleDate);
    const day45 = new Date(sale);
    day45.setDate(day45.getDate() + 45);
    const day180 = new Date(sale);
    day180.setDate(day180.getDate() + 180);
    
    const today = new Date();
    const daysSinceSale = Math.floor((today.getTime() - sale.getTime()) / (1000 * 60 * 60 * 24));
    
    return [
      {
        day: 0,
        label: "Close Sale",
        description: `Sale of relinquished property - ${sale.toLocaleDateString()}`,
        status: daysSinceSale >= 0 ? "completed" : "upcoming",
      },
      {
        day: 45,
        label: "Identification Deadline",
        description: `Must identify replacement property(s) by ${day45.toLocaleDateString()}`,
        status: daysSinceSale > 45 ? "completed" : daysSinceSale >= 0 ? "current" : "upcoming",
      },
      {
        day: 180,
        label: "Closing Deadline",
        description: `Must close on replacement property by ${day180.toLocaleDateString()}`,
        status: daysSinceSale > 180 ? "completed" : daysSinceSale > 45 ? "current" : "upcoming",
      },
    ];
  }, [saleDate]);
  
  // Days remaining calculations
  const daysRemaining = useMemo(() => {
    const today = new Date();
    const sale = new Date(saleDate);
    const daysSinceSale = Math.floor((today.getTime() - sale.getTime()) / (1000 * 60 * 60 * 24));
    
    return {
      toIdentification: Math.max(0, 45 - daysSinceSale),
      toClosing: Math.max(0, 180 - daysSinceSale),
      isExpired: daysSinceSale > 180,
      daysSinceSale,
    };
  }, [saleDate]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0,
    }).format(value);
  };

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
        <div className="max-w-5xl mx-auto mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
              <FileText className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white">1031 Exchange Analyzer</h1>
              <p className="text-slate-400">Calculate tax deferral and replacement property requirements</p>
            </div>
          </div>
          
          {/* Info Banner */}
          <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4 flex gap-3">
            <Info className="h-5 w-5 text-blue-400 shrink-0 mt-0.5" />
            <div className="text-sm text-blue-200">
              <strong>What is a 1031 Exchange?</strong> Section 1031 of the IRS code allows investors to defer capital gains taxes by reinvesting proceeds from the sale of investment property into a &ldquo;like-kind&rdquo; replacement property within specific timeframes.
            </div>
          </div>
        </div>

        <div className="max-w-5xl mx-auto">
          <Tabs defaultValue="calculator" className="space-y-6">
            <TabsList className="bg-slate-800/50 border border-white/10">
              <TabsTrigger value="calculator" className="data-[state=active]:bg-primary">
                <Calculator className="h-4 w-4 mr-2" />
                Tax Calculator
              </TabsTrigger>
              <TabsTrigger value="timeline" className="data-[state=active]:bg-primary">
                <Calendar className="h-4 w-4 mr-2" />
                Timeline Tracker
              </TabsTrigger>
              <TabsTrigger value="replacement" className="data-[state=active]:bg-primary">
                <Building className="h-4 w-4 mr-2" />
                Replacement Requirements
              </TabsTrigger>
            </TabsList>

            {/* Tax Calculator Tab */}
            <TabsContent value="calculator" className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                {/* Inputs */}
                <div className="space-y-6">
                  {/* Relinquished Property */}
                  <Card className="bg-slate-800/50 border-white/10">
                    <CardHeader>
                      <CardTitle className="text-white flex items-center gap-2">
                        <Building className="h-5 w-5 text-orange-400" />
                        Relinquished Property
                      </CardTitle>
                      <CardDescription>Property you are selling</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <Label className="text-slate-300">Sale Price</Label>
                        <div className="relative mt-1">
                          <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                          <Input
                            type="number"
                            value={salePrice}
                            onChange={(e) => setSalePrice(Number(e.target.value))}
                            className="pl-9 bg-slate-900/50 border-white/10 text-white"
                          />
                        </div>
                      </div>
                      <div>
                        <Label className="text-slate-300">Original Purchase Price (Basis)</Label>
                        <div className="relative mt-1">
                          <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                          <Input
                            type="number"
                            value={originalBasis}
                            onChange={(e) => setOriginalBasis(Number(e.target.value))}
                            className="pl-9 bg-slate-900/50 border-white/10 text-white"
                          />
                        </div>
                      </div>
                      <div>
                        <Label className="text-slate-300">Capital Improvements</Label>
                        <div className="relative mt-1">
                          <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                          <Input
                            type="number"
                            value={improvements}
                            onChange={(e) => setImprovements(Number(e.target.value))}
                            className="pl-9 bg-slate-900/50 border-white/10 text-white"
                          />
                        </div>
                      </div>
                      <div>
                        <Label className="text-slate-300">Accumulated Depreciation</Label>
                        <div className="relative mt-1">
                          <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                          <Input
                            type="number"
                            value={depreciation}
                            onChange={(e) => setDepreciation(Number(e.target.value))}
                            className="pl-9 bg-slate-900/50 border-white/10 text-white"
                          />
                        </div>
                      </div>
                      <div>
                        <Label className="text-slate-300">Existing Mortgage Balance</Label>
                        <div className="relative mt-1">
                          <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                          <Input
                            type="number"
                            value={existingMortgage}
                            onChange={(e) => setExistingMortgage(Number(e.target.value))}
                            className="pl-9 bg-slate-900/50 border-white/10 text-white"
                          />
                        </div>
                      </div>
                      <div>
                        <Label className="text-slate-300">Selling Costs (commissions, closing)</Label>
                        <div className="relative mt-1">
                          <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                          <Input
                            type="number"
                            value={sellingCosts}
                            onChange={(e) => setSellingCosts(Number(e.target.value))}
                            className="pl-9 bg-slate-900/50 border-white/10 text-white"
                          />
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Tax Rates */}
                  <Card className="bg-slate-800/50 border-white/10">
                    <CardHeader>
                      <CardTitle className="text-white flex items-center gap-2">
                        <TrendingUp className="h-5 w-5 text-red-400" />
                        Tax Rates
                      </CardTitle>
                      <CardDescription>Federal and state tax rates</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <Label className="text-slate-300">Federal Capital Gains Rate (%)</Label>
                        <Input
                          type="number"
                          value={capitalGainsRate}
                          onChange={(e) => setCapitalGainsRate(Number(e.target.value))}
                          className="mt-1 bg-slate-900/50 border-white/10 text-white"
                          min={0}
                          max={30}
                        />
                        <p className="text-xs text-slate-500 mt-1">0%, 15%, or 20% depending on income</p>
                      </div>
                      <div>
                        <Label className="text-slate-300">State Capital Gains Rate (%)</Label>
                        <Input
                          type="number"
                          value={stateCapitalGainsRate}
                          onChange={(e) => setStateCapitalGainsRate(Number(e.target.value))}
                          className="mt-1 bg-slate-900/50 border-white/10 text-white"
                          min={0}
                          max={15}
                        />
                      </div>
                      <div className="pt-2 border-t border-white/10">
                        <div className="flex justify-between text-sm">
                          <span className="text-slate-400">Depreciation Recapture Rate</span>
                          <span className="text-white">25% (Fixed)</span>
                        </div>
                        <div className="flex justify-between text-sm mt-1">
                          <span className="text-slate-400">Net Investment Income Tax</span>
                          <span className="text-white">3.8% (If applicable)</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Results */}
                <div className="space-y-6">
                  {/* Gain Analysis */}
                  <Card className="bg-slate-800/50 border-white/10">
                    <CardHeader>
                      <CardTitle className="text-white">Gain Analysis</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-slate-400">Sale Price</span>
                          <span className="text-white">{formatCurrency(salePrice)}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-slate-400">- Selling Costs</span>
                          <span className="text-red-400">({formatCurrency(sellingCosts)})</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-slate-400">- Adjusted Basis</span>
                          <span className="text-red-400">({formatCurrency(calculations.adjustedBasis)})</span>
                        </div>
                        <div className="flex justify-between text-sm pt-2 border-t border-white/10">
                          <span className="text-slate-400">Original Basis: {formatCurrency(originalBasis)}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-slate-400">+ Improvements: {formatCurrency(improvements)}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-slate-400">- Depreciation: {formatCurrency(depreciation)}</span>
                        </div>
                        <div className="flex justify-between pt-3 border-t border-white/10">
                          <span className="text-white font-semibold">Realized Gain</span>
                          <span className="text-emerald-400 font-bold">{formatCurrency(calculations.realizedGain)}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Tax Breakdown */}
                  <Card className="bg-slate-800/50 border-white/10">
                    <CardHeader>
                      <CardTitle className="text-white flex items-center gap-2">
                        <AlertTriangle className="h-5 w-5 text-yellow-400" />
                        Tax If Sold (Without 1031)
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-400">Federal Capital Gains ({capitalGainsRate}%)</span>
                        <span className="text-red-400">{formatCurrency(calculations.federalCapitalGainsTax)}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-400">Depreciation Recapture (25%)</span>
                        <span className="text-red-400">{formatCurrency(calculations.depreciationRecaptureTax)}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-400">State Capital Gains ({stateCapitalGainsRate}%)</span>
                        <span className="text-red-400">{formatCurrency(calculations.stateCapitalGainsTax)}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-400">Net Investment Income Tax (3.8%)</span>
                        <span className="text-red-400">{formatCurrency(calculations.niitTax)}</span>
                      </div>
                      <div className="flex justify-between pt-3 border-t border-white/10">
                        <span className="text-white font-semibold">Total Tax Liability</span>
                        <span className="text-red-400 font-bold">{formatCurrency(calculations.totalTaxIfSold)}</span>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Tax Savings */}
                  <Card className="bg-gradient-to-br from-emerald-500/20 to-green-500/20 border-emerald-500/30">
                    <CardHeader>
                      <CardTitle className="text-emerald-400 flex items-center gap-2">
                        <CheckCircle className="h-5 w-5" />
                        Tax Savings with 1031 Exchange
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-4xl font-bold text-emerald-400 mb-2">
                        {formatCurrency(calculations.taxSavings)}
                      </div>
                      <p className="text-emerald-200 text-sm">
                        Total tax deferred by completing a 1031 exchange
                      </p>
                      <div className="mt-4 pt-4 border-t border-emerald-500/20">
                        <div className="flex justify-between text-sm">
                          <span className="text-slate-300">Net Equity Available</span>
                          <span className="text-white font-semibold">{formatCurrency(calculations.netEquity)}</span>
                        </div>
                        <div className="flex justify-between text-sm mt-2">
                          <span className="text-slate-300">If Sold Without 1031</span>
                          <span className="text-red-400">{formatCurrency(calculations.afterTaxProceeds)}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </TabsContent>

            {/* Timeline Tab */}
            <TabsContent value="timeline" className="space-y-6">
              <Card className="bg-slate-800/50 border-white/10">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Calendar className="h-5 w-5 text-blue-400" />
                    Exchange Timeline Tracker
                  </CardTitle>
                  <CardDescription>
                    Track your 1031 exchange deadlines. The IRS allows 45 days to identify and 180 days to close.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Sale Date Input */}
                  <div className="max-w-sm">
                    <Label className="text-slate-300">Sale Date (Close of Relinquished Property)</Label>
                    <Input
                      type="date"
                      value={saleDate}
                      onChange={(e) => setSaleDate(e.target.value)}
                      className="mt-1 bg-slate-900/50 border-white/10 text-white"
                    />
                  </div>

                  {/* Days Remaining */}
                  {!daysRemaining.isExpired ? (
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className={`p-6 rounded-xl ${daysRemaining.toIdentification <= 7 ? 'bg-red-500/20 border-red-500/30' : daysRemaining.toIdentification <= 14 ? 'bg-yellow-500/20 border-yellow-500/30' : 'bg-blue-500/20 border-blue-500/30'} border`}>
                        <div className="flex items-center gap-2 mb-2">
                          <Clock className={`h-5 w-5 ${daysRemaining.toIdentification <= 7 ? 'text-red-400' : daysRemaining.toIdentification <= 14 ? 'text-yellow-400' : 'text-blue-400'}`} />
                          <span className="text-white font-medium">Identification Deadline</span>
                        </div>
                        <div className={`text-4xl font-bold ${daysRemaining.toIdentification <= 7 ? 'text-red-400' : daysRemaining.toIdentification <= 14 ? 'text-yellow-400' : 'text-blue-400'}`}>
                          {daysRemaining.toIdentification} days
                        </div>
                        <p className="text-slate-400 text-sm mt-1">remaining to identify replacement property</p>
                      </div>
                      <div className={`p-6 rounded-xl ${daysRemaining.toClosing <= 30 ? 'bg-yellow-500/20 border-yellow-500/30' : 'bg-emerald-500/20 border-emerald-500/30'} border`}>
                        <div className="flex items-center gap-2 mb-2">
                          <Clock className={`h-5 w-5 ${daysRemaining.toClosing <= 30 ? 'text-yellow-400' : 'text-emerald-400'}`} />
                          <span className="text-white font-medium">Closing Deadline</span>
                        </div>
                        <div className={`text-4xl font-bold ${daysRemaining.toClosing <= 30 ? 'text-yellow-400' : 'text-emerald-400'}`}>
                          {daysRemaining.toClosing} days
                        </div>
                        <p className="text-slate-400 text-sm mt-1">remaining to close on replacement property</p>
                      </div>
                    </div>
                  ) : (
                    <div className="p-6 rounded-xl bg-red-500/20 border border-red-500/30">
                      <div className="flex items-center gap-2 mb-2">
                        <AlertTriangle className="h-5 w-5 text-red-400" />
                        <span className="text-red-400 font-semibold">Exchange Period Expired</span>
                      </div>
                      <p className="text-slate-300">The 180-day exchange period has passed. A 1031 exchange is no longer possible for this sale.</p>
                    </div>
                  )}

                  {/* Timeline Visual */}
                  <div className="relative pt-8">
                    <div className="absolute top-12 left-6 right-6 h-1 bg-slate-700 rounded" />
                    <div className="relative flex justify-between">
                      {timelineEvents.map((event, index) => (
                        <div key={index} className="flex flex-col items-center relative z-10">
                          <div className={`h-10 w-10 rounded-full flex items-center justify-center ${
                            event.status === 'completed' ? 'bg-emerald-500' :
                            event.status === 'current' ? 'bg-blue-500 ring-4 ring-blue-500/30' :
                            event.status === 'deadline' ? 'bg-red-500' :
                            'bg-slate-600'
                          }`}>
                            {event.status === 'completed' ? (
                              <CheckCircle className="h-5 w-5 text-white" />
                            ) : (
                              <span className="text-white font-bold text-sm">{event.day}</span>
                            )}
                          </div>
                          <div className="mt-3 text-center max-w-[120px]">
                            <div className="text-white font-medium text-sm">{event.label}</div>
                            <div className="text-slate-400 text-xs mt-1">{event.description}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Exchange Rules Summary */}
              <Card className="bg-slate-800/50 border-white/10">
                <CardHeader>
                  <CardTitle className="text-white">Key 1031 Exchange Rules</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="p-4 rounded-lg bg-slate-900/50">
                      <h4 className="text-white font-medium mb-2">Identification Rules</h4>
                      <ul className="space-y-2 text-sm text-slate-400">
                        <li className="flex gap-2"><ArrowRight className="h-4 w-4 text-primary shrink-0" />3-Property Rule: Identify up to 3 properties regardless of value</li>
                        <li className="flex gap-2"><ArrowRight className="h-4 w-4 text-primary shrink-0" />200% Rule: Identify any number if total value ≤ 200% of relinquished</li>
                        <li className="flex gap-2"><ArrowRight className="h-4 w-4 text-primary shrink-0" />95% Rule: Acquire 95% of identified properties&apos; value</li>
                      </ul>
                    </div>
                    <div className="p-4 rounded-lg bg-slate-900/50">
                      <h4 className="text-white font-medium mb-2">Critical Requirements</h4>
                      <ul className="space-y-2 text-sm text-slate-400">
                        <li className="flex gap-2"><ArrowRight className="h-4 w-4 text-primary shrink-0" />Qualified Intermediary (QI) must hold proceeds</li>
                        <li className="flex gap-2"><ArrowRight className="h-4 w-4 text-primary shrink-0" />Same taxpayer on both properties</li>
                        <li className="flex gap-2"><ArrowRight className="h-4 w-4 text-primary shrink-0" />Investment or business property only</li>
                        <li className="flex gap-2"><ArrowRight className="h-4 w-4 text-primary shrink-0" />No personal residence or vacation homes</li>
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Replacement Requirements Tab */}
            <TabsContent value="replacement" className="space-y-6">
              <Card className="bg-slate-800/50 border-white/10">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Building className="h-5 w-5 text-purple-400" />
                    Replacement Property Requirements
                  </CardTitle>
                  <CardDescription>
                    To fully defer taxes, your replacement property must meet these criteria
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Requirements Grid */}
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="p-6 rounded-xl bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border border-blue-500/20">
                      <div className="flex items-center gap-2 mb-3">
                        <DollarSign className="h-5 w-5 text-blue-400" />
                        <span className="text-white font-medium">Minimum Purchase Price</span>
                      </div>
                      <div className="text-3xl font-bold text-blue-400">
                        {formatCurrency(replacementRequirements.minValue)}
                      </div>
                      <p className="text-slate-400 text-sm mt-2">
                        Equal to or greater than sale price to defer all gain
                      </p>
                    </div>
                    
                    <div className="p-6 rounded-xl bg-gradient-to-br from-emerald-500/10 to-green-500/10 border border-emerald-500/20">
                      <div className="flex items-center gap-2 mb-3">
                        <TrendingUp className="h-5 w-5 text-emerald-400" />
                        <span className="text-white font-medium">Minimum Equity to Reinvest</span>
                      </div>
                      <div className="text-3xl font-bold text-emerald-400">
                        {formatCurrency(replacementRequirements.minEquity)}
                      </div>
                      <p className="text-slate-400 text-sm mt-2">
                        All net proceeds must be reinvested
                      </p>
                    </div>
                    
                    <div className="p-6 rounded-xl bg-gradient-to-br from-purple-500/10 to-pink-500/10 border border-purple-500/20">
                      <div className="flex items-center gap-2 mb-3">
                        <Building className="h-5 w-5 text-purple-400" />
                        <span className="text-white font-medium">Minimum Debt to Assume</span>
                      </div>
                      <div className="text-3xl font-bold text-purple-400">
                        {formatCurrency(replacementRequirements.debtCapacity)}
                      </div>
                      <p className="text-slate-400 text-sm mt-2">
                        Must take on equal or greater mortgage debt
                      </p>
                    </div>
                    
                    <div className="p-6 rounded-xl bg-gradient-to-br from-orange-500/10 to-amber-500/10 border border-orange-500/20">
                      <div className="flex items-center gap-2 mb-3">
                        <Calculator className="h-5 w-5 text-orange-400" />
                        <span className="text-white font-medium">Max Down Payment Needed</span>
                      </div>
                      <div className="text-3xl font-bold text-orange-400">
                        {formatCurrency(replacementRequirements.minEquity)}
                      </div>
                      <p className="text-slate-400 text-sm mt-2">
                        Maximum amount from exchange proceeds
                      </p>
                    </div>
                  </div>

                  {/* Boot Explanation */}
                  <div className="p-4 rounded-lg bg-yellow-500/10 border border-yellow-500/20">
                    <div className="flex items-start gap-3">
                      <AlertTriangle className="h-5 w-5 text-yellow-400 shrink-0 mt-0.5" />
                      <div>
                        <h4 className="text-yellow-400 font-medium">Understanding &quot;Boot&quot;</h4>
                        <p className="text-yellow-200 text-sm mt-1">
                          Any cash or non-like-kind property received (called &quot;boot&quot;) is taxable. Common sources of boot include:
                        </p>
                        <ul className="text-sm text-yellow-200/80 mt-2 space-y-1">
                          <li>• Cash not reinvested in replacement property</li>
                          <li>• Reduction in mortgage debt</li>
                          <li>• Personal property included in sale</li>
                          <li>• Excess exchange proceeds</li>
                        </ul>
                      </div>
                    </div>
                  </div>

                  {/* Like-Kind Examples */}
                  <div>
                    <h4 className="text-white font-medium mb-4">Like-Kind Property Examples</h4>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <div className="flex items-center gap-2 mb-3">
                          <CheckCircle className="h-5 w-5 text-emerald-400" />
                          <span className="text-emerald-400 font-medium">Qualifies as Like-Kind</span>
                        </div>
                        <ul className="space-y-2 text-sm text-slate-400">
                          <li>• Rental house → Rental apartment</li>
                          <li>• Commercial building → Industrial warehouse</li>
                          <li>• Vacant land → Shopping center</li>
                          <li>• Duplex → Single-family rental</li>
                          <li>• Office building → Retail property</li>
                        </ul>
                      </div>
                      <div>
                        <div className="flex items-center gap-2 mb-3">
                          <AlertTriangle className="h-5 w-5 text-red-400" />
                          <span className="text-red-400 font-medium">Does NOT Qualify</span>
                        </div>
                        <ul className="space-y-2 text-sm text-slate-400">
                          <li>• Rental property → Primary residence</li>
                          <li>• US property → Foreign property</li>
                          <li>• Real estate → Stocks or bonds</li>
                          <li>• Investment property → Dealer property (inventory)</li>
                          <li>• Property → Partnership interests</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        {/* CTA Section */}
        <div className="max-w-5xl mx-auto mt-12 text-center">
          <div className="p-8 rounded-2xl bg-gradient-to-br from-primary/10 to-purple-500/10 border border-primary/20">
            <h3 className="text-2xl font-bold text-white mb-2">Ready to Complete Your 1031 Exchange?</h3>
            <p className="text-slate-400 mb-6">
              Create an account to save your analysis, track deadlines, and find replacement properties.
            </p>
            <div className="flex justify-center gap-4">
              <Button size="lg" className="bg-gradient-to-r from-primary to-purple-600" asChild>
                <Link href="/login">
                  Save Analysis
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
