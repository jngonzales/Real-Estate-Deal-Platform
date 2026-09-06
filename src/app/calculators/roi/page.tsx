"use client";

import { useState, useMemo, type ReactNode } from "react";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowRight } from "@/components/ui/icons";
import { PublicHeader } from "@/components/layout/public-header";
import {
  CalculatorFrame,
  CalculatorHeading,
  worksheetCard,
  worksheetFigure,
  worksheetGrid,
  worksheetInput,
  worksheetTab,
  worksheetTabs,
} from "../_components/worksheet";

function formatCurrency(amount: number): string {
  if (!Number.isFinite(amount)) return "Unavailable";

  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(amount);
}

function formatPercent(value: number): string {
  return Number.isFinite(value) ? value.toFixed(1) + "%" : "Unavailable";
}

export default function PublicROICalculatorPage() {
  // Common inputs
  const [purchasePrice, setPurchasePrice] = useState<number>(180000);
  const [repairCosts, setRepairCosts] = useState<number>(35000);
  const [arv, setArv] = useState<number>(280000);
  // Default closing costs (no UI controls wired yet — used as constants in calc).
  const closingCostsBuy = 5000;
  const closingCostsSell = 22400;

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

  const propertyDetails = (
    <fieldset className="min-w-0">
      <legend className="mb-3 font-semibold">Property details</legend>
      <div className="grid grid-cols-2 items-end gap-x-3 gap-y-4 sm:grid-cols-3">
        <RoiField id="roi-purchase" label="Purchase price" unit="$" value={purchasePrice} onChange={setPurchasePrice} />
        <RoiField id="roi-repairs" label="Repair costs" unit="$" value={repairCosts} onChange={setRepairCosts} />
        <div className="col-span-2 min-w-0 sm:col-span-1">
          <RoiField id="roi-arv" label="After repair value" unit="$" value={arv} onChange={setArv} />
        </div>
      </div>
    </fieldset>
  );

  return (
    <div className="min-h-screen bg-background">
      <a href="#roi-content" className="lm-skip-link">Skip to content</a>
      <PublicHeader backHref="/calculators" ctaLabel="Save analysis" />

      <CalculatorFrame id="roi-content">
        <CalculatorHeading
          title="ROI calculator"
          description="Estimate returns for a flip or rental property."
        />
        <p id="roi-currency" className="sr-only">In U.S. dollars</p>

        <Tabs defaultValue="flip" className="gap-4 lg:gap-5">
          <TabsList aria-label="Investment strategy" className={worksheetTabs + " grid-cols-3 sm:max-w-md"}>
            <TabsTrigger value="flip" className={worksheetTab}>Fix &amp; Flip</TabsTrigger>
            <TabsTrigger value="rental" className={worksheetTab}>Buy &amp; Hold</TabsTrigger>
            <TabsTrigger value="brrrr" className={worksheetTab}>BRRRR</TabsTrigger>
          </TabsList>

          <TabsContent value="flip" className={panelClass}>
            <div className={worksheetGrid}>
              <RoiAssumptions>
                {propertyDetails}
                <fieldset className="min-w-0">
                  <legend className="mb-3 font-semibold">Holding costs</legend>
                  <div className="grid grid-cols-2 items-end gap-x-3 gap-y-4">
                    <RoiField id="roi-months" label="Holding period (months)" value={holdingMonths} onChange={setHoldingMonths} />
                    <RoiField id="roi-holding" label="Monthly holding cost" unit="$" value={monthlyHoldingCost} onChange={setMonthlyHoldingCost} />
                  </div>
                </fieldset>
              </RoiAssumptions>
              <RoiResults id="flip-result" title="Flip profit" amount={flipCalculations.profit}>
                <ResultRow label="ROI" value={formatPercent(flipCalculations.roi)} />
                <ResultRow label="Total investment" value={formatCurrency(flipCalculations.totalInvestment)} />
                <ResultRow label="Holding costs" value={formatCurrency(flipCalculations.holdingCosts)} />
                <ResultRow label="Annualized ROI" value={formatPercent(flipCalculations.annualizedRoi)} />
              </RoiResults>
            </div>
          </TabsContent>

          <TabsContent value="rental" className={panelClass}>
            <div className={worksheetGrid}>
              <RoiAssumptions>
                {propertyDetails}
                <fieldset className="min-w-0">
                  <legend className="mb-3 font-semibold">Rent and financing</legend>
                  <div className="grid grid-cols-2 items-end gap-x-3 gap-y-4">
                    <RoiField id="roi-rent" label="Monthly rent" unit="$" value={monthlyRent} onChange={setMonthlyRent} />
                    <RoiField id="roi-expenses" label="Monthly expenses" unit="$" value={monthlyExpenses} onChange={setMonthlyExpenses} />
                    <RoiField id="roi-down-payment" label="Down payment (%)" value={downPaymentPercent} onChange={setDownPaymentPercent} />
                    <RoiField id="roi-rate" label="Interest rate (%)" value={interestRate} step="0.125" onChange={setInterestRate} />
                  </div>
                </fieldset>
              </RoiAssumptions>
              <RoiResults id="rental-result" title="Monthly cash flow" amount={rentalCalculations.monthlyCashFlow} monthly>
                <ResultRow label="Annual cash flow" value={formatCurrency(rentalCalculations.annualCashFlow)} />
                <ResultRow label="Cash invested" value={formatCurrency(rentalCalculations.totalCashInvested)} />
                <ResultRow label="Cash-on-cash return" value={formatPercent(rentalCalculations.cashOnCash)} />
                <ResultRow label="Cap rate" value={formatPercent(rentalCalculations.capRate)} />
              </RoiResults>
            </div>
          </TabsContent>

          <TabsContent value="brrrr" className={panelClass}>
            <RoiAssumptions>
              {propertyDetails}
              <div className="space-y-3 border-t border-border pt-4">
                <p className="text-sm text-muted-foreground">
                  Create a free account to use the BRRRR calculator with refinance analysis.
                </p>
                <Button className="min-h-11 rounded-lg whitespace-normal transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring" asChild>
                  <Link href="/login">Unlock BRRRR calculator</Link>
                </Button>
              </div>
            </RoiAssumptions>
          </TabsContent>
        </Tabs>

        <div className="mt-5 flex flex-wrap items-center gap-x-4 gap-y-1 border-t border-border pt-3">
          <p className="text-sm text-muted-foreground">Save your analysis and compare scenarios.</p>
          <Button variant="link" className="min-h-11 whitespace-normal px-0 text-foreground underline transition-colors hover:text-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring" asChild>
            <Link href="/login">
              Create a free account <ArrowRight aria-hidden="true" />
            </Link>
          </Button>
        </div>
      </CalculatorFrame>
    </div>
  );
}

const panelClass = "rounded-lg focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring";

function RoiAssumptions({ children }: { children: ReactNode }) {
  return (
    <Card className={worksheetCard}>
      <CardContent className="space-y-5">
        <h2 className="text-xl font-semibold tracking-tight">Assumptions</h2>
        {children}
      </CardContent>
    </Card>
  );
}

function RoiResults({ id, title, amount, monthly, children }: {
  id: string;
  title: string;
  amount: number;
  monthly?: boolean;
  children: ReactNode;
}) {
  return (
    <section aria-labelledby={id} className="min-w-0 rounded-lg border border-border bg-muted p-4 sm:p-6">
      <h2 id={id} className="text-xl font-semibold tracking-tight">{title}</h2>
      <p role="status" className={"mt-3 " + worksheetFigure}>
        {formatCurrency(amount)}
        {monthly && Number.isFinite(amount) && (
          <span className="ms-1 text-base font-medium text-muted-foreground">
            <span aria-hidden="true">/mo</span>
            <span className="sr-only"> per month</span>
          </span>
        )}
      </p>
      <dl className="mt-5 divide-y divide-border border-t border-border">
        {children}
      </dl>
    </section>
  );
}

function RoiField({
  id,
  label,
  unit,
  value,
  step,
  onChange,
}: {
  id: string;
  label: string;
  unit?: "$";
  value: number;
  step?: string;
  onChange: (value: number) => void;
}) {
  return (
    <div className="min-w-0 space-y-1.5">
      <Label htmlFor={id} className="leading-snug">{label}</Label>
      <div className="relative">
        {unit && (
          <span aria-hidden="true" className="pointer-events-none absolute inset-y-0 start-3 flex items-center text-sm text-muted-foreground">
            {unit}
          </span>
        )}
        <Input
          id={id}
          name={id}
          type="number"
          inputMode="decimal"
          aria-describedby={unit ? "roi-currency" : undefined}
          step={step}
          value={value}
          onChange={(event) => onChange(Number(event.target.value))}
          className={worksheetInput + (unit ? " ps-7" : "")}
        />
      </div>
    </div>
  );
}

function ResultRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-baseline justify-between gap-3 py-2 text-sm">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="min-w-0 text-end font-medium tabular-nums [overflow-wrap:anywhere]">{value}</dd>
    </div>
  );
}
