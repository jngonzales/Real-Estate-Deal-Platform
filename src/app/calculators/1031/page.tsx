"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  AlertTriangle,
  CheckCircle,
  Info,
} from "@/components/ui/icons";
import { PublicHeader } from "@/components/layout/public-header";
import {
  CalculatorFrame,
  CalculatorHeading,
  WorksheetMoneyInput,
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
} from "../_components/worksheet";

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

  return (
    <div className="min-h-screen bg-background">
      <a href="#calculator-content" className="lm-skip-link">Skip to content</a>
      <PublicHeader backHref="/calculators" ctaLabel="Save Analysis" />
      <CalculatorFrame id="calculator-content">
        <CalculatorHeading
          title="1031 exchange analyzer"
          description="Estimate tax deferral, track deadlines and review replacement property requirements."
        />
        <Tabs defaultValue="calculator" className="gap-4 sm:gap-6">
          <TabsList aria-label="1031 exchange tools" className={worksheetTabs + " grid-cols-3"}>
            <TabsTrigger value="calculator" className={worksheetTab}>Tax calculator</TabsTrigger>
            <TabsTrigger value="timeline" className={worksheetTab}>Timeline tracker</TabsTrigger>
            <TabsTrigger value="replacement" className={worksheetTab + " [overflow-wrap:anywhere]"}>Replacement requirements</TabsTrigger>
          </TabsList>
          <TabsContent value="calculator" className={worksheetPanelFocus}>
            <div className={worksheetGrid}>
              <div className="min-w-0 space-y-4">
                {/* Relinquished Property */}
                <Card className={worksheetCard}>
                  <CardHeader>
                    <h2 className="text-xl font-semibold tracking-tight">Relinquished property</h2>
                    <CardDescription>Property you are selling</CardDescription>
                  </CardHeader>
                  <CardContent className="grid grid-cols-2 items-end gap-3 sm:gap-4">
                    <WorksheetMoneyInput id="exchange-salePrice" label="Sale Price" value={salePrice} setValue={setSalePrice} />
                    <WorksheetMoneyInput id="exchange-originalBasis" label="Original Purchase Price (Basis)" value={originalBasis} setValue={setOriginalBasis} />
                    <WorksheetMoneyInput id="exchange-improvements" label="Capital Improvements" value={improvements} setValue={setImprovements} />
                    <WorksheetMoneyInput id="exchange-depreciation" label="Accumulated Depreciation" value={depreciation} setValue={setDepreciation} />
                    <WorksheetMoneyInput id="exchange-existingMortgage" label="Existing Mortgage Balance" value={existingMortgage} setValue={setExistingMortgage} />
                    <WorksheetMoneyInput id="exchange-sellingCosts" label="Selling Costs (commissions, closing)" value={sellingCosts} setValue={setSellingCosts} />
                  </CardContent>
                </Card>

                {/* Tax Rates */}
                <Card className={worksheetCard}>
                  <CardHeader>
                    <h2 className="text-xl font-semibold tracking-tight">Tax rates</h2>
                    <CardDescription>Federal and state tax rates</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label htmlFor="exchange-federal-rate">Federal Capital Gains Rate (%)</Label>
                      <Input id="exchange-federal-rate"
                        type="number"
                        inputMode="decimal"
                        value={capitalGainsRate}
                        onChange={(e) => setCapitalGainsRate(Number(e.target.value))}
                        className={worksheetInput + " mt-2 min-w-0"}
                        min={0}
                        max={30}
                      />
                      <p className="text-xs text-muted-foreground mt-1">0%, 15%, or 20% depending on income</p>
                    </div>
                    <div>
                      <Label htmlFor="exchange-state-rate">State Capital Gains Rate (%)</Label>
                      <Input id="exchange-state-rate"
                        type="number"
                        inputMode="decimal"
                        value={stateCapitalGainsRate}
                        onChange={(e) => setStateCapitalGainsRate(Number(e.target.value))}
                        className={worksheetInput + " mt-2 min-w-0"}
                        min={0}
                        max={15}
                      />
                    </div>
                    <div className="pt-2 border-t border-border">
                      <div className="flex justify-between gap-3 text-sm">
                        <span className="text-muted-foreground">Depreciation Recapture Rate</span>
                        <span className="text-foreground">25% (Fixed)</span>
                      </div>
                      <div className="flex justify-between gap-3 text-sm mt-1">
                        <span className="text-muted-foreground">Net Investment Income Tax</span>
                        <span className="text-foreground">3.8% (If applicable)</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
              <div className="min-w-0 space-y-4">
                <Card className={worksheetResult}>
                  <CardHeader>
                    <h2 className="text-xl font-semibold tracking-tight">Estimated tax deferred</h2>
                  </CardHeader>
                  <CardContent>
                    <p role="status" className={worksheetFigure}>{formatWorksheetCurrency(calculations.taxSavings)}</p>
                    <dl className="mt-4 divide-y divide-border border-t border-border">
                      <WorksheetResultRow label="Net equity available" value={formatWorksheetCurrency(calculations.netEquity)} />
                      <WorksheetResultRow label="Proceeds if sold without a 1031 exchange" value={formatWorksheetCurrency(calculations.afterTaxProceeds)} />
                    </dl>
                  </CardContent>
                </Card>
                {/* Gain Analysis */}
                <Card className={worksheetCard}>
                  <CardHeader>
                    <h2 className="text-xl font-semibold tracking-tight">Gain analysis</h2>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <div className="flex justify-between gap-3 text-sm">
                        <span className="text-muted-foreground">Sale Price</span>
                        <span className="text-end tabular-nums [overflow-wrap:anywhere]">{formatWorksheetCurrency(salePrice)}</span>
                      </div>
                      <div className="flex justify-between gap-3 text-sm">
                        <span className="text-muted-foreground">- Selling Costs</span>
                        <span className="text-end tabular-nums [overflow-wrap:anywhere]">({formatWorksheetCurrency(sellingCosts)})</span>
                      </div>
                      <div className="flex justify-between gap-3 text-sm">
                        <span className="text-muted-foreground">- Adjusted Basis</span>
                        <span className="text-end tabular-nums [overflow-wrap:anywhere]">({formatWorksheetCurrency(calculations.adjustedBasis)})</span>
                      </div>
                      <div className="flex justify-between gap-3 text-sm pt-2 border-t border-border">
                        <span className="text-muted-foreground">Original Basis: {formatWorksheetCurrency(originalBasis)}</span>
                      </div>
                      <div className="flex justify-between gap-3 text-sm">
                        <span className="text-muted-foreground">+ Improvements: {formatWorksheetCurrency(improvements)}</span>
                      </div>
                      <div className="flex justify-between gap-3 text-sm">
                        <span className="text-muted-foreground">- Depreciation: {formatWorksheetCurrency(depreciation)}</span>
                      </div>
                      <div className="flex justify-between gap-3 pt-3 border-t border-border">
                        <span className="text-foreground font-semibold">Realized Gain</span>
                        <span className="text-end tabular-nums [overflow-wrap:anywhere] font-semibold">{formatWorksheetCurrency(calculations.realizedGain)}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Tax Breakdown */}
                <Card className={worksheetCard}>
                  <CardHeader>
                    <h2 className="text-xl font-semibold tracking-tight">Tax if sold without a 1031 exchange</h2>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex justify-between gap-3 text-sm">
                      <span className="text-muted-foreground">Federal Capital Gains ({capitalGainsRate}%)</span>
                      <span className="text-end tabular-nums [overflow-wrap:anywhere]">{formatWorksheetCurrency(calculations.federalCapitalGainsTax)}</span>
                    </div>
                    <div className="flex justify-between gap-3 text-sm">
                      <span className="text-muted-foreground">Depreciation Recapture (25%)</span>
                      <span className="text-end tabular-nums [overflow-wrap:anywhere]">{formatWorksheetCurrency(calculations.depreciationRecaptureTax)}</span>
                    </div>
                    <div className="flex justify-between gap-3 text-sm">
                      <span className="text-muted-foreground">State Capital Gains ({stateCapitalGainsRate}%)</span>
                      <span className="text-end tabular-nums [overflow-wrap:anywhere]">{formatWorksheetCurrency(calculations.stateCapitalGainsTax)}</span>
                    </div>
                    <div className="flex justify-between gap-3 text-sm">
                      <span className="text-muted-foreground">Net Investment Income Tax (3.8%)</span>
                      <span className="text-end tabular-nums [overflow-wrap:anywhere]">{formatWorksheetCurrency(calculations.niitTax)}</span>
                    </div>
                    <div className="flex justify-between gap-3 pt-3 border-t border-border">
                      <span className="text-foreground font-semibold">Total Tax Liability</span>
                      <span className="text-end tabular-nums [overflow-wrap:anywhere] font-semibold">{formatWorksheetCurrency(calculations.totalTaxIfSold)}</span>
                    </div>
                  </CardContent>
                </Card>

              </div>
            </div>
          </TabsContent>

          <TabsContent value="timeline" className={worksheetPanelFocus + " space-y-4 sm:space-y-6"}>
            <Card className={worksheetCard}>
              <CardHeader>
                <h2 className="text-xl font-semibold tracking-tight">Exchange timeline</h2>
                <CardDescription>
                  The IRS allows 45 days to identify a replacement and 180 days to close.
                </CardDescription>
              </CardHeader>
              <CardContent className="min-w-0 space-y-5">
                <div className="max-w-sm">
                  <Label htmlFor="exchange-sale-date">Sale Date (Close of Relinquished Property)</Label>
                  <Input
                    id="exchange-sale-date"
                    type="date"
                    value={saleDate}
                    onChange={(e) => setSaleDate(e.target.value)}
                    className={worksheetInput + " mt-2 min-w-0"}
                  />
                </div>
                {!Number.isFinite(daysRemaining.daysSinceSale) ? (
                  <p role="status" className="text-sm text-muted-foreground">Enter a sale date to see the deadlines.</p>
                ) : daysRemaining.isExpired ? (
                  <div role="status" className="border-t border-border pt-3">
                    <p className="font-semibold text-destructive">Exchange period expired</p>
                    <p className="mt-1 text-sm text-muted-foreground">The 180-day exchange period has passed. A 1031 exchange is no longer possible for this sale.</p>
                  </div>
                ) : (
                  <dl aria-live="polite" className="grid gap-x-6 gap-y-4 border-t border-border pt-3 sm:grid-cols-2">
                    <div>
                      <dt className="text-sm font-medium text-muted-foreground">Time to identify a replacement</dt>
                      <dd className={"mt-1 text-2xl font-semibold tabular-nums " + (daysRemaining.toIdentification <= 14 ? "text-amber-800 dark:text-amber-300" : "text-foreground")}>
                        {daysRemaining.toIdentification} days
                      </dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-muted-foreground">Time to close</dt>
                      <dd className={"mt-1 text-2xl font-semibold tabular-nums " + (daysRemaining.toClosing <= 30 ? "text-amber-800 dark:text-amber-300" : "text-foreground")}>
                        {daysRemaining.toClosing} days
                      </dd>
                    </div>
                  </dl>
                )}

                {Number.isFinite(daysRemaining.daysSinceSale) && (
                  <ol aria-label="Exchange milestones" className="divide-y divide-border border-y border-border">
                    {timelineEvents.map((event) => (
                      <li key={event.day} className="grid grid-cols-[3.5rem_minmax(0,1fr)] items-baseline gap-x-3 py-3 text-sm">
                        <span className="font-medium text-muted-foreground tabular-nums">Day {event.day}</span>
                        <div>
                          <p className="font-medium">{event.label}</p>
                          <p className="mt-1 text-muted-foreground">{event.description}</p>
                          <p className={"mt-1 capitalize " + (event.status === "current" ? "text-primary" : "text-muted-foreground")}>{event.status}</p>
                        </div>
                      </li>
                    ))}
                  </ol>
                )}
              </CardContent>
            </Card>

            {/* Exchange Rules Summary */}
            <Card className={worksheetCard}>
              <CardHeader>
                <h2 className="text-xl font-semibold tracking-tight">Key 1031 exchange rules</h2>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="border-t border-border pt-3">
                    <h3 className="text-foreground font-medium mb-2">Identification Rules</h3>
                    <ul className="list-disc space-y-2 ps-5 text-sm text-muted-foreground">
                      <li>3-Property Rule: Identify up to 3 properties regardless of value</li>
                      <li>200% Rule: Identify any number if total value ≤ 200% of relinquished</li>
                      <li>95% Rule: Acquire 95% of identified properties&apos; value</li>
                    </ul>
                  </div>
                  <div className="border-t border-border pt-3">
                    <h3 className="text-foreground font-medium mb-2">Critical Requirements</h3>
                    <ul className="list-disc space-y-2 ps-5 text-sm text-muted-foreground">
                      <li>Qualified Intermediary (QI) must hold proceeds</li>
                      <li>Same taxpayer on both properties</li>
                      <li>Investment or business property only</li>
                      <li>No personal residence or vacation homes</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="replacement" className={worksheetPanelFocus + " space-y-4 sm:space-y-6"}>
            <Card className={worksheetCard}>
              <CardHeader>
                <h2 className="text-xl font-semibold tracking-tight">Replacement property requirements</h2>
                <CardDescription>
                  To fully defer taxes, your replacement property must meet these criteria
                </CardDescription>
              </CardHeader>
              <CardContent className="min-w-0 space-y-4 sm:space-y-6">
                <dl className="grid gap-x-6 gap-y-4 md:grid-cols-2">
                  <div className="min-w-0 border-t border-border pt-4">
                    <dt className="font-medium">Minimum purchase price</dt>
                    <dd className="mt-1 text-2xl font-semibold tabular-nums [overflow-wrap:anywhere]">{formatWorksheetCurrency(replacementRequirements.minValue)}</dd>
                    <dd className="mt-2 text-sm text-muted-foreground">Equal to or greater than sale price to defer all gain</dd>
                  </div>
                  <div className="min-w-0 border-t border-border pt-4">
                    <dt className="font-medium">Minimum equity to reinvest</dt>
                    <dd className="mt-1 text-2xl font-semibold tabular-nums [overflow-wrap:anywhere]">{formatWorksheetCurrency(replacementRequirements.minEquity)}</dd>
                    <dd className="mt-2 text-sm text-muted-foreground">All net proceeds must be reinvested</dd>
                  </div>
                  <div className="min-w-0 border-t border-border pt-4">
                    <dt className="font-medium">Minimum debt to assume</dt>
                    <dd className="mt-1 text-2xl font-semibold tabular-nums [overflow-wrap:anywhere]">{formatWorksheetCurrency(replacementRequirements.debtCapacity)}</dd>
                    <dd className="mt-2 text-sm text-muted-foreground">Equal to or greater than the mortgage debt on the original property</dd>
                  </div>
                  <div className="min-w-0 border-t border-border pt-4">
                    <dt className="font-medium">Maximum down payment from the exchange</dt>
                    <dd className="mt-1 text-2xl font-semibold tabular-nums [overflow-wrap:anywhere]">{formatWorksheetCurrency(replacementRequirements.minEquity)}</dd>
                    <dd className="mt-2 text-sm text-muted-foreground">Maximum amount from exchange proceeds</dd>
                  </div>
                </dl>

                {/* Boot Explanation */}
                <div className="border-t border-border pt-4">
                  <div className="flex items-start gap-3">
                    <AlertTriangle aria-hidden="true" className="h-5 w-5 text-amber-700 dark:text-amber-400 shrink-0 mt-0.5" />
                    <div>
                      <h3 className="font-medium text-amber-900 dark:text-amber-300">Understanding &quot;Boot&quot;</h3>
                      <p className="mt-1 text-sm text-foreground">
                        Any cash or non-like-kind property received (called &quot;boot&quot;) is taxable. Common sources of boot include:
                      </p>
                      <ul className="mt-2 list-disc space-y-1 pl-4 text-sm text-muted-foreground">
                        <li>Cash not reinvested in replacement property</li>
                        <li>Reduction in mortgage debt</li>
                        <li>Personal property included in sale</li>
                        <li>Excess exchange proceeds</li>
                      </ul>
                    </div>
                  </div>
                </div>

                {/* Like-Kind Examples */}
                <div>
                  <h3 className="text-foreground font-medium mb-4">Like-Kind Property Examples</h3>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <div className="flex items-center gap-2 mb-3">
                        <CheckCircle aria-hidden="true" className="size-5 shrink-0 text-primary" />
                        <span className="font-medium text-primary">Qualifies as Like-Kind</span>
                      </div>
                      <ul className="list-disc space-y-2 pl-4 text-sm text-muted-foreground">
                        <li>Rental house → Rental apartment</li>
                        <li>Commercial building → Industrial warehouse</li>
                        <li>Vacant land → Shopping center</li>
                        <li>Duplex → Single-family rental</li>
                        <li>Office building → Retail property</li>
                      </ul>
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-3">
                        <AlertTriangle aria-hidden="true" className="size-5 shrink-0 text-destructive" />
                        <span className="font-medium text-destructive">Does NOT Qualify</span>
                      </div>
                      <ul className="list-disc space-y-2 pl-4 text-sm text-muted-foreground">
                        <li>Rental property → Primary residence</li>
                        <li>US property → Foreign property</li>
                        <li>Real estate → Stocks or bonds</li>
                        <li>Investment property → Dealer property (inventory)</li>
                        <li>Property → Partnership interests</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <aside className="mt-8 flex items-start gap-2 rounded-lg border border-border bg-card p-4 text-sm text-muted-foreground">
          <Info aria-hidden="true" className="mt-0.5 size-5 shrink-0 text-primary" />
          <p>Section 1031 allows investors to defer capital gains taxes by reinvesting proceeds from an investment property sale into a like-kind property within specified deadlines.</p>
        </aside>

        <section className="mt-5 flex flex-wrap items-center justify-between gap-4 border-t border-border pt-5">
          <p className="text-sm text-muted-foreground">Save your exchange analysis to track deadlines and replacement properties.</p>
          <div className="flex flex-wrap gap-2">
            <Button asChild className={worksheetAction}><Link href="/login">Save Analysis</Link></Button>
            <Button asChild variant="outline" className={worksheetAction}><Link href="/calculators">Other calculators</Link></Button>
          </div>
        </section>
      </CalculatorFrame>
    </div>
  );
}
