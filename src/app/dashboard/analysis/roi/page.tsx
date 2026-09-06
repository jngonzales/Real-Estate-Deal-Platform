"use client";

import { useState, useMemo, type ReactNode } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { WorkspaceHeading } from "@/components/layout/workspace-heading";
import {
  formatWorksheetCurrency,
  formatWorksheetPercent,
  worksheetAction,
  worksheetCard,
  worksheetFigure,
  worksheetGrid,
  worksheetInput,
  worksheetPanelFocus,
  worksheetResult,
  worksheetTab,
  worksheetTabs,
  WorksheetMoneyInput,
  WorksheetResultRow,
} from "@/app/calculators/_components/worksheet";

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

  const propertyDetails = (
    <fieldset className="min-w-0">
      <legend className="mb-3 font-semibold">Property details</legend>
      <div className={fieldGrid}>
        <WorksheetMoneyInput id="roi-purchase" label="Purchase price" value={purchasePrice} setValue={setPurchasePrice} />
        <WorksheetMoneyInput id="roi-repairs" label="Repair costs" value={repairCosts} setValue={setRepairCosts} />
        <WorksheetMoneyInput id="roi-buy-closing" label="Buying closing costs" value={closingCostsBuy} setValue={setClosingCostsBuy} />
        <WorksheetMoneyInput id="roi-arv" label="After-repair value" value={arv} setValue={setArv} />
      </div>
      <dl className="mt-3 border-t border-border">
        <WorksheetResultRow label="Total investment" value={formatWorksheetCurrency(totalInvestment)} />
      </dl>
    </fieldset>
  );

  return (
    <div className="min-w-0 space-y-6">
      <WorkspaceHeading
        title="ROI calculator"
        description="Estimate flip profit, rental returns, or cash recovered through a refinance."
        actions={<Button asChild variant="outline" className={worksheetAction}><Link href="/dashboard/analysis">Back to analysis</Link></Button>}
      />

      <Tabs value={strategy} onValueChange={(value) => setStrategy(value as typeof strategy)} className="gap-4">
        <TabsList aria-label="Investment strategy" className={worksheetTabs + " grid-cols-3 sm:max-w-md"}>
          <TabsTrigger value="flip" className={worksheetTab}>Fix &amp; Flip</TabsTrigger>
          <TabsTrigger value="rental" className={worksheetTab}>Buy &amp; Hold</TabsTrigger>
          <TabsTrigger value="brrrr" className={worksheetTab}>BRRRR</TabsTrigger>
        </TabsList>

        <TabsContent value="flip" className={worksheetPanelFocus}>
          <div className={worksheetGrid}>
            <Assumptions>
              {propertyDetails}
              <fieldset className="min-w-0">
                <legend className="mb-3 font-semibold">Holding and sale costs</legend>
                <div className={fieldGrid}>
                  <NumberField id="roi-holding-months" label="Holding period (months)" value={holdingMonths} setValue={setHoldingMonths} />
                  <WorksheetMoneyInput id="roi-holding-cost" label="Monthly holding cost" value={monthlyHoldingCost} setValue={setMonthlyHoldingCost} />
                  <WorksheetMoneyInput id="roi-sell-closing" label="Selling costs (about 8%)" value={closingCostsSell} setValue={setClosingCostsSell} />
                </div>
              </fieldset>
            </Assumptions>
            <AnalysisResult title="Flip profit" value={formatWorksheetCurrency(flipResults.profit)}>
              <WorksheetResultRow label="ROI" value={formatWorksheetPercent(flipResults.roi)} />
              <WorksheetResultRow label="Annualized ROI" value={formatWorksheetPercent(flipResults.annualizedRoi)} />
              <WorksheetResultRow label="Sale price (ARV)" value={formatWorksheetCurrency(arv)} />
              <WorksheetResultRow label="Purchase price" value={formatWorksheetCurrency(purchasePrice)} />
              <WorksheetResultRow label="Repairs" value={formatWorksheetCurrency(repairCosts)} />
              <WorksheetResultRow label="Closing costs" value={formatWorksheetCurrency(closingCostsBuy + closingCostsSell)} />
              <WorksheetResultRow label={"Holding costs (" + holdingMonths + " months)"} value={formatWorksheetCurrency(flipResults.holdingCosts)} />
              <WorksheetResultRow label="Net profit" value={formatWorksheetCurrency(flipResults.profit)} />
            </AnalysisResult>
          </div>
        </TabsContent>

        <TabsContent value="rental" className={worksheetPanelFocus}>
          <div className={worksheetGrid}>
            <Assumptions>
              {propertyDetails}
              <fieldset className="min-w-0">
                <legend className="mb-3 font-semibold">Rent and financing</legend>
                <div className={fieldGrid}>
                  <WorksheetMoneyInput id="roi-rent" label="Monthly rent" value={monthlyRent} setValue={setMonthlyRent} />
                  <WorksheetMoneyInput id="roi-expenses" label="Monthly expenses" value={monthlyExpenses} setValue={setMonthlyExpenses} />
                  <NumberField id="roi-down-payment" label="Down payment (%)" value={downPaymentPercent} setValue={setDownPaymentPercent} />
                  <NumberField id="roi-interest" label="Interest rate (%)" value={interestRate} setValue={setInterestRate} step="0.125" />
                  <NumberField id="roi-loan-term" label="Loan term (years)" value={loanTerm} setValue={setLoanTerm} />
                </div>
              </fieldset>
            </Assumptions>
            <AnalysisResult title="Cash-on-cash return" value={formatWorksheetPercent(rentalResults.cashOnCash)}>
              <WorksheetResultRow label="Monthly rent" value={formatWorksheetCurrency(monthlyRent)} />
              <WorksheetResultRow label="Monthly expenses" value={formatWorksheetCurrency(monthlyExpenses)} />
              <WorksheetResultRow label="Monthly mortgage" value={formatWorksheetCurrency(rentalResults.monthlyMortgage)} />
              <WorksheetResultRow label="Monthly cash flow" value={formatWorksheetCurrency(rentalResults.monthlyCashFlow)} />
              <WorksheetResultRow label="Annual cash flow" value={formatWorksheetCurrency(rentalResults.annualCashFlow)} />
              <WorksheetResultRow label="Cash invested" value={formatWorksheetCurrency(rentalResults.cashInvested)} />
              <WorksheetResultRow label="Cap rate" value={formatWorksheetPercent(rentalResults.capRate)} />
            </AnalysisResult>
          </div>
        </TabsContent>

        <TabsContent value="brrrr" className={worksheetPanelFocus}>
          <div className={worksheetGrid}>
            <Assumptions>
              {propertyDetails}
              <fieldset className="min-w-0">
                <legend className="mb-3 font-semibold">Rent and refinance</legend>
                <div className={fieldGrid}>
                  <WorksheetMoneyInput id="roi-brrrr-rent" label="Monthly rent" value={monthlyRent} setValue={setMonthlyRent} />
                  <WorksheetMoneyInput id="roi-brrrr-expenses" label="Monthly expenses" value={monthlyExpenses} setValue={setMonthlyExpenses} />
                  <NumberField id="roi-refinance-ltv" label="Refinance loan-to-value (%)" value={refinancePercent} setValue={setRefinancePercent} />
                  <NumberField id="roi-refinance-rate" label="Refinance rate (%)" value={refinanceRate} setValue={setRefinanceRate} step="0.125" />
                </div>
              </fieldset>
            </Assumptions>
            <AnalysisResult
              title="BRRRR return"
              value={brrrrResults.infiniteReturn ? <><span aria-hidden="true">∞</span><span className="sr-only">Infinite return</span></> : formatWorksheetPercent(brrrrResults.cashOnCash)}
              detail={brrrrResults.infiniteReturn ? "All invested cash recovered" : `${formatWorksheetCurrency(brrrrResults.actualCashInvested)} left in the deal`}
            >
              <WorksheetResultRow label={"Refinance value (" + refinancePercent + "% LTV)"} value={formatWorksheetCurrency(brrrrResults.refinanceValue)} />
              <WorksheetResultRow label="Total investment" value={formatWorksheetCurrency(totalInvestment)} />
              <WorksheetResultRow label="Cash out at refinance" value={formatWorksheetCurrency(brrrrResults.cashOutAmount)} />
              <WorksheetResultRow label="Cash left in the deal" value={formatWorksheetCurrency(brrrrResults.actualCashInvested)} />
              <WorksheetResultRow label="Monthly cash flow" value={formatWorksheetCurrency(brrrrResults.monthlyCashFlow)} />
            </AnalysisResult>
          </div>
        </TabsContent>
      </Tabs>

      <div className="flex flex-wrap gap-2 border-t border-border pt-4">
        <Button className={worksheetAction} asChild><Link href="/dashboard/submit">Submit this deal</Link></Button>
        <Button variant="outline" className={worksheetAction} asChild><Link href="/dashboard/analysis">Back to analysis</Link></Button>
      </div>
    </div>
  );
}

const fieldGrid = "grid grid-cols-2 items-end gap-x-3 gap-y-4";

function Assumptions({ children }: { children: ReactNode }) {
  return (
    <Card className={worksheetCard}>
      <CardHeader><h2 className="text-xl font-semibold tracking-tight">Assumptions</h2></CardHeader>
      <CardContent className="space-y-5">{children}</CardContent>
    </Card>
  );
}

function AnalysisResult({ title, value, detail, children }: { title: string; value: ReactNode; detail?: string; children: ReactNode }) {
  return (
    <Card className={worksheetResult}>
      <CardHeader><h2 className="text-xl font-semibold tracking-tight">{title}</h2></CardHeader>
      <CardContent>
        <p role="status" className={worksheetFigure}>{value}</p>
        {detail && <p className="mt-2 text-sm text-muted-foreground">{detail}</p>}
        <dl className="mt-4 divide-y divide-border border-y border-border">{children}</dl>
      </CardContent>
    </Card>
  );
}

function NumberField({ id, label, value, setValue, step }: {
  id: string;
  label: string;
  value: number;
  setValue: (value: number) => void;
  step?: string;
}) {
  return (
    <div className="min-w-0 space-y-2">
      <Label htmlFor={id} className="leading-snug">{label}</Label>
      <Input id={id} type="number" inputMode="decimal" value={value} step={step} onChange={(event) => setValue(Number(event.target.value))} className={worksheetInput} />
    </div>
  );
}
