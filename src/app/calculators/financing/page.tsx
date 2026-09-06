"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PublicHeader } from "@/components/layout/public-header";
import {
  CalculatorFrame,
  CalculatorHeading,
  WorksheetMoneyInput,
  WorksheetSlider,
  worksheetCard,
  worksheetFigure,
  worksheetGrid,
  worksheetInput,
  worksheetResult,
  worksheetTab,
  worksheetTabs,
  worksheetAction,
  worksheetPanelFocus,
  WorksheetResultRow,
  formatWorksheetCurrency,
  formatWorksheetPercent,
} from "../_components/worksheet";

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

  const scenarios = [
    {
      id: "hardmoney",
      loan: hardMoneyLoan,
      description: "Short-term, asset-based financing for fix-and-flip.",
      sliders: [
        { id: "hm-ltv", label: "LTV (% of ARV)", value: hmLtv, setValue: setHmLtv, min: 50, max: 80, step: 1, hint: "Max " + formatWorksheetCurrency(arv * hmLtv / 100) + " based on ARV" },
        { id: "hm-ltc", label: "LTC (% of total cost)", value: hmLtc, setValue: setHmLtc, min: 70, max: 100, step: 1, hint: "Max " + formatWorksheetCurrency((purchasePrice + repairCost) * hmLtc / 100) + " based on total cost" },
        { id: "hm-rate", label: "Interest rate", value: hmRate, setValue: setHmRate, min: 8, max: 18, step: 0.5 },
        { id: "hm-points", label: "Points (origination fee)", value: hmPoints, setValue: setHmPoints, min: 1, max: 5, step: 0.5, unit: " points", hint: "Points cost: " + formatWorksheetCurrency(hardMoneyLoan.pointsCost) },
      ],
      term: { value: hmTermMonths, setValue: setHmTermMonths, unit: "months", options: [6, 9, 12, 18, 24] },
      totals: [
        { label: "Down payment needed", value: hardMoneyLoan.downPayment },
        { label: "Points cost", value: hardMoneyLoan.pointsCost },
        { label: "Total interest (" + hmTermMonths + " mo)", value: hardMoneyLoan.totalInterest },
        { label: "Cash to close", value: hardMoneyLoan.downPayment + hardMoneyLoan.pointsCost + hardMoneyLoan.closingCosts },
      ],
    },
    {
      id: "conventional",
      loan: conventionalLoan,
      description: "Traditional bank financing for stabilized properties.",
      sliders: [
        { id: "conv-down", label: "Down payment", value: convDownPayment, setValue: setConvDownPayment, min: 5, max: 50, step: 1, hint: formatWorksheetCurrency(purchasePrice * convDownPayment / 100) },
        { id: "conv-rate", label: "Interest rate", value: convRate, setValue: setConvRate, min: 4, max: 12, step: 0.125 },
      ],
      term: { value: convTermYears, setValue: setConvTermYears, unit: "years", options: [15, 20, 25, 30] },
      totals: [
        { label: "Down payment", value: conventionalLoan.downPayment },
        { label: "Closing costs (est.)", value: conventionalLoan.closingCosts },
        { label: "Total interest (" + convTermYears + " yr)", value: conventionalLoan.totalInterest },
        { label: "Cash to close", value: conventionalLoan.downPayment + conventionalLoan.closingCosts },
      ],
    },
    {
      id: "dscr",
      loan: dscrLoan,
      description: "Debt service coverage ratio loans for rental properties.",
      sliders: [
        { id: "dscr-down", label: "Down payment", value: dscrDownPayment, setValue: setDscrDownPayment, min: 15, max: 40, step: 1 },
        { id: "dscr-rate", label: "Interest rate", value: dscrRate, setValue: setDscrRate, min: 5, max: 12, step: 0.125 },
      ],
      term: { value: dscrTermYears, setValue: setDscrTermYears, unit: "years", options: [15, 20, 25, 30] },
      totals: [
        { label: "Down payment", value: dscrLoan.downPayment },
        { label: "Cash to close", value: dscrLoan.downPayment + dscrLoan.closingCosts },
      ],
    },
    {
      id: "private",
      loan: privateLoan,
      description: "Flexible financing from private lenders.",
      sliders: [
        { id: "pm-rate", label: "Interest rate", value: pmRate, setValue: setPmRate, min: 6, max: 15, step: 0.5 },
      ],
      term: { value: pmTermMonths, setValue: setPmTermMonths, unit: "months", options: [6, 12, 18, 24, 36] },
      totals: [
        { label: "Your cash needed", value: privateLoan.downPayment },
        { label: "Total interest (" + pmTermMonths + " mo)", value: privateLoan.totalInterest },
        { label: "Total to repay", value: privateLoan.totalPayment },
      ],
    },
  ];

  const comparisonRows: { label: string; display: (scenario: LoanScenario) => string }[] = [
    { label: "Loan amount", display: (loan) => formatWorksheetCurrency(loan.loanAmount) },
    { label: "Down payment required", display: (loan) => formatWorksheetCurrency(loan.downPayment) },
    { label: "Monthly payment", display: (loan) => formatWorksheetCurrency(loan.monthlyPayment) },
    { label: "Interest rate", display: (loan) => formatWorksheetPercent(loan.interestRate, 2) },
    { label: "Loan term", display: (loan) => loan.termMonths + " months" },
    { label: "Points / origination", display: (loan) => formatWorksheetCurrency(loan.originationFee) },
    { label: "Total interest paid", display: (loan) => formatWorksheetCurrency(loan.totalInterest) },
    { label: "All-in cost", display: (loan) => formatWorksheetCurrency(loan.allInCost) },
  ];

  const propertyFields = [
    { id: "financing-price", label: "Purchase price", value: purchasePrice, setValue: setPurchasePrice },
    { id: "financing-repairs", label: "Repair cost", value: repairCost, setValue: setRepairCost },
    { id: "financing-arv", label: "After repair value (ARV)", value: arv, setValue: setArv },
    { id: "financing-rent", label: "Monthly rent (for DSCR)", value: monthlyRent, setValue: setMonthlyRent },
  ];

  const propertyDetails = (
    <Card className={worksheetCard}>
      <CardHeader>
        <h2 className="text-xl font-semibold tracking-tight">Property assumptions</h2>
      </CardHeader>
      <CardContent className="grid grid-cols-2 items-end gap-3 sm:gap-4">
        {propertyFields.map(({ id, label, value, setValue }) => (
          <WorksheetMoneyInput key={id} id={id} label={label} value={value} setValue={setValue} />
        ))}
      </CardContent>
    </Card>
  );

  return (
    <div className="min-h-screen bg-background">
      <a href="#calculator-content" className="lm-skip-link">Skip to content</a>
      <PublicHeader backHref="/calculators" ctaLabel="Save Analysis" />
      <CalculatorFrame id="calculator-content">
        <CalculatorHeading title="Financing calculator" description="Compare monthly payments and total costs across four ways to finance a property." />

        <Tabs defaultValue="comparison" className="gap-4 sm:gap-6">
          <TabsList aria-label="Loan scenarios" className={worksheetTabs + " grid-cols-2 sm:grid-cols-5"}>
            <TabsTrigger value="comparison" className={worksheetTab + " col-span-2 sm:col-span-1"}>Compare all</TabsTrigger>
            {scenarios.map(({ id, loan }) => (
              <TabsTrigger key={id} value={id} className={worksheetTab + " min-w-0"}>
                {loan.name}
              </TabsTrigger>
            ))}
          </TabsList>

          <TabsContent value="comparison" className={worksheetPanelFocus + " space-y-4 sm:space-y-6"}>
            <div className={worksheetGrid}>
              {propertyDetails}
              <Card className={worksheetResult}>
                <CardHeader>
                  <h2 className="text-xl font-semibold tracking-tight">Monthly payments</h2>
                </CardHeader>
                <CardContent>
                  <dl aria-live="polite" aria-atomic="true" className="grid grid-cols-2 gap-x-4 gap-y-3">
                    {scenarios.map(({ id, loan }) => (
                      <div key={id} className="min-w-0 border-t border-border pt-2">
                        <dt className="text-sm text-muted-foreground">{loan.name}</dt>
                        <dd className="mt-1 text-2xl font-semibold tabular-nums [overflow-wrap:anywhere] sm:text-3xl">
                          {formatWorksheetCurrency(loan.monthlyPayment)}
                        </dd>
                        <dd className="text-xs text-muted-foreground">{loan.type}</dd>
                      </div>
                    ))}
                  </dl>
                </CardContent>
              </Card>
            </div>

            <Card className={worksheetCard}>
              <CardHeader>
                <h2 id="financing-comparison" className="text-xl font-semibold tracking-tight">Side-by-side comparison</h2>
                <CardDescription id="financing-scroll-hint" className="lg:sr-only">Scroll across to compare all four loans.</CardDescription>
              </CardHeader>
              <CardContent>
                <div
                  role="region"
                  aria-labelledby="financing-comparison"
                  aria-describedby="financing-scroll-hint"
                  tabIndex={0}
                  className="max-w-full overflow-x-auto border-y border-border focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
                >
                  <table className="w-full min-w-[43rem] text-sm tabular-nums">
                    <thead className="border-b border-border">
                      <tr>
                        <th scope="col" className="sticky start-0 w-32 border-r border-border bg-card px-3 py-3 text-start font-semibold sm:w-44">Metric</th>
                        {scenarios.map(({ id, loan }) => (
                          <th key={id} scope="col" className="px-3 py-3 text-end font-semibold">{loan.name}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {comparisonRows.map(({ label, display }) => (
                        <tr key={label} className="last:font-semibold">
                          <th scope="row" className="sticky start-0 border-r border-border bg-card px-3 py-2.5 text-start font-medium">{label}</th>
                          {scenarios.map(({ id, loan }) => (
                            <td key={id} className="whitespace-nowrap px-3 py-2.5 text-end">{display(loan)}</td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {scenarios.map(({ id, loan, description, sliders, term, totals }) => (
            <TabsContent key={id} value={id} className={worksheetPanelFocus}>
              <div className={worksheetGrid}>
                <div className="min-w-0 space-y-4">
                  {propertyDetails}
                  <Card className={worksheetCard}>
                    <CardHeader>
                      <h2 className="text-xl font-semibold tracking-tight">{loan.name} assumptions</h2>
                      <CardDescription>{description}</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {id === "private" && (
                        <WorksheetMoneyInput id="pm-amount" label="Loan amount" value={pmLoanAmount} setValue={setPmLoanAmount} />
                      )}
                      {sliders.map(({ id: sliderId, label, value, setValue, min, max, step, unit = "%", hint }) => (
                        <div key={sliderId}>
                          <div className="flex justify-between gap-2 text-sm">
                            <span id={sliderId} className="font-medium">{label}</span>
                            <span className="tabular-nums">{value}{unit}</span>
                          </div>
                          <WorksheetSlider
                            labelId={sliderId}
                            value={[value]}
                            onValueChange={(values) => setValue(values[0])}
                            min={min}
                            max={max}
                            step={step}
                            valueText={value + unit}
                          />
                          {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
                        </div>
                      ))}
                      <div className="space-y-2">
                        <Label htmlFor={id + "-term"}>Loan term ({term.unit})</Label>
                        <Select value={String(term.value)} onValueChange={(value) => term.setValue(Number(value))}>
                          <SelectTrigger id={id + "-term"} className={worksheetInput + " w-full data-[size=default]:h-11"}>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {term.options.map((option) => (
                              <SelectItem key={option} value={String(option)}>{option} {term.unit}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </CardContent>
                  </Card>
                </div>
                <div className="min-w-0 space-y-4">
                  <Card className={worksheetResult}>
                    <CardHeader>
                      <h2 className="text-xl font-semibold tracking-tight">{loan.name} summary</h2>
                    </CardHeader>
                    <CardContent>
                      <div>
                        <p role="status" className={worksheetFigure}>
                          {formatWorksheetCurrency(loan.monthlyPayment)}
                          {Number.isFinite(loan.monthlyPayment) && (
                            <span className="ms-1 text-base font-medium text-muted-foreground">
                              <span aria-hidden="true">/mo</span>
                              <span className="sr-only"> per month</span>
                            </span>
                          )}
                        </p>
                        <p className="mt-1 text-sm text-muted-foreground">
                          {loan.type === "Interest-Only" ? "Monthly interest payment" : "Monthly principal and interest"}
                        </p>
                      </div>
                      <dl className="mt-4 divide-y divide-border border-y border-border text-sm">
                        {[{ label: "Loan amount", value: loan.loanAmount }, ...totals].map(({ label, value }) => (
                          <WorksheetResultRow key={label} label={label} value={formatWorksheetCurrency(value)} />
                        ))}
                      </dl>
                    </CardContent>
                  </Card>
                  {id === "dscr" && (
                    <Card className={worksheetCard}>
                      <CardHeader>
                        <CardTitle className="tabular-nums">{Number.isFinite(dscrRatio) ? dscrRatio.toFixed(2) + "x DSCR" : "DSCR unavailable"}</CardTitle>
                        <CardDescription className={!Number.isFinite(dscrRatio) ? "text-muted-foreground" : dscrRatio >= 1.25 ? "text-primary" : "text-amber-800 dark:text-amber-400"}>
                          {!Number.isFinite(dscrRatio) ? "Review the loan assumptions" : dscrRatio >= 1.25 ? "Qualifies for most DSCR loans" : dscrRatio >= 1.0 ? "May qualify with higher rates" : "Does not qualify"}
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="text-sm text-muted-foreground">
                        Based on {formatWorksheetCurrency(monthlyRent)} monthly rent vs. {formatWorksheetCurrency(dscrLoan.monthlyPayment + (purchasePrice * 0.012 / 12))} total PITI.
                      </CardContent>
                    </Card>
                  )}
                </div>
              </div>
            </TabsContent>
          ))}
        </Tabs>

        <section className="mt-8 flex flex-wrap items-center justify-between gap-4 border-t border-border pt-5">
          <p className="text-sm text-muted-foreground">Save financing scenarios to compare options for each deal.</p>
          <div className="flex flex-wrap gap-2">
            <Button asChild className={worksheetAction}><Link href="/login">Save scenarios</Link></Button>
            <Button asChild variant="outline" className={worksheetAction}><Link href="/calculators">Other calculators</Link></Button>
          </div>
        </section>
      </CalculatorFrame>
    </div>
  );
}
