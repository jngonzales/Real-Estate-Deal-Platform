"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Plus,
  Trash2,
  ArrowRight,
} from "@/components/ui/icons";
import { PublicHeader } from "@/components/layout/public-header";
import { CalculatorFrame, CalculatorHeading, worksheetCard, worksheetFigure, worksheetGrid, worksheetInput, worksheetResult, worksheetAction, formatWorksheetCurrency, WorksheetResultRow } from "../_components/worksheet";

interface Comparable {
  id: string;
  address: string;
  salePrice: number;
  sqft: number;
  adjustment: number;
}

export default function PublicARVCalculatorPage() {
  const [subjectSqft, setSubjectSqft] = useState<number>(1800);
  const [comparables, setComparables] = useState<Comparable[]>([
    { id: "1", address: "123 Oak St", salePrice: 280000, sqft: 1750, adjustment: 0 },
    { id: "2", address: "456 Elm St", salePrice: 295000, sqft: 1900, adjustment: -5 },
    { id: "3", address: "789 Pine St", salePrice: 265000, sqft: 1650, adjustment: 5 },
  ]);

  const addComparable = () => {
    setComparables([
      ...comparables,
      { id: Date.now().toString(), address: "", salePrice: 0, sqft: 0, adjustment: 0 },
    ]);
  };

  const removeComparable = (id: string) => {
    setComparables(comparables.filter((c) => c.id !== id));
  };

  const updateComparable = (id: string, field: keyof Comparable, value: string | number) => {
    setComparables(
      comparables.map((c) => (c.id === id ? { ...c, [field]: value } : c))
    );
  };

  // Calculations
  const calculations = useMemo(() => {
    const validComps = comparables.filter((c) => c.salePrice > 0);
    if (validComps.length === 0) return { compArv: 0, sqftArv: 0, avgPricePerSqft: 0, confidence: 0 };

    // Comp-based ARV with adjustments
    const adjustedPrices = validComps.map((c) => c.salePrice * (1 + c.adjustment / 100));
    const compArv = adjustedPrices.reduce((a, b) => a + b, 0) / adjustedPrices.length;

    // Price per sqft method
    const validSqftComps = validComps.filter((c) => c.sqft > 0);
    const avgPricePerSqft = validSqftComps.length > 0
      ? validSqftComps.reduce((acc, c) => acc + c.salePrice / c.sqft, 0) / validSqftComps.length
      : 0;
    const sqftArv = avgPricePerSqft * subjectSqft;

    // Confidence based on number of comps
    const confidence = Math.min(validComps.length * 25, 100);

    return { compArv, sqftArv, avgPricePerSqft, confidence };
  }, [comparables, subjectSqft]);

  return (
    <div className="min-h-screen bg-background">
      <a href="#calculator-content" className="lm-skip-link">Skip to content</a>
      <PublicHeader backHref="/calculators" ctaLabel="Save Analysis" />

      <CalculatorFrame id="calculator-content">
        <CalculatorHeading title="ARV Calculator" description="Estimate after-repair value from comparable sales." />

        <div className={worksheetGrid}>
          {/* Left: Inputs */}
          <div className="min-w-0 space-y-4 lg:space-y-5">
            {/* Subject Property */}
            <Card className={worksheetCard}>
              <CardHeader>
                <h2 className="text-xl font-semibold tracking-tight">Subject property</h2>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Label htmlFor="arv-subject-square-feet" className="text-muted-foreground">Square Footage</Label>
                  <Input id="arv-subject-square-feet"
                    type="number"
                    inputMode="decimal"
                    value={subjectSqft}
                    onChange={(e) => setSubjectSqft(Number(e.target.value))}
                    className={worksheetInput}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Comparables */}
            <Card className={worksheetCard}>
              <CardHeader className="flex flex-wrap items-center justify-between gap-3">
                <h2 className="text-xl font-semibold tracking-tight">Comparable properties</h2>
                <Button onClick={addComparable} className={worksheetAction}>
                  <Plus aria-hidden="true" /> Add comparable
                </Button>
              </CardHeader>
              <CardContent className="space-y-4">
                {comparables.map((comp, index) => (
                  <div key={comp.id} className="space-y-3 border-t border-border pt-3 first:border-t-0 first:pt-0">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-muted-foreground">Comparable {index + 1}</span>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => removeComparable(comp.id)}
                        aria-label={`Remove comparable ${index + 1}`}
                        className={worksheetAction + " size-11 text-muted-foreground hover:text-destructive"}
                      >
                        <Trash2 aria-hidden="true" />
                      </Button>
                    </div>
                    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                      <div className="col-span-full">
                        <Label htmlFor={`arv-${comp.id}-address`} className="leading-snug text-muted-foreground">Address</Label>
                        <Input id={`arv-${comp.id}-address`}
                          value={comp.address}
                          onChange={(e) => updateComparable(comp.id, "address", e.target.value)}
                          placeholder="123 Main St"
                          className={worksheetInput}
                        />
                      </div>
                      <div>
                        <Label htmlFor={`arv-${comp.id}-price`} className="leading-snug text-muted-foreground">Sale Price</Label>
                        <Input id={`arv-${comp.id}-price`}
                          type="number"
                          inputMode="decimal"
                          value={comp.salePrice || ""}
                          onChange={(e) => updateComparable(comp.id, "salePrice", Number(e.target.value))}
                          placeholder="280000"
                          className={worksheetInput}
                        />
                      </div>
                      <div>
                        <Label htmlFor={`arv-${comp.id}-sqft`} className="leading-snug text-muted-foreground">Sq Ft</Label>
                        <Input id={`arv-${comp.id}-sqft`}
                          type="number"
                          inputMode="decimal"
                          value={comp.sqft || ""}
                          onChange={(e) => updateComparable(comp.id, "sqft", Number(e.target.value))}
                          placeholder="1800"
                          className={worksheetInput}
                        />
                      </div>
                      <div>
                        <Label htmlFor={`arv-${comp.id}-adjustment`} className="leading-snug text-muted-foreground">Adjust %</Label>
                        <Input id={`arv-${comp.id}-adjustment`}
                          type="number"
                          inputMode="decimal"
                          value={comp.adjustment || ""}
                          onChange={(e) => updateComparable(comp.id, "adjustment", Number(e.target.value))}
                          placeholder="0"
                          className={worksheetInput}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          <div className="min-w-0 space-y-4 lg:space-y-5">
            <Card className={worksheetResult}>
              <CardHeader>
                <h2 className="text-xl font-semibold tracking-tight">Estimated ARV</h2>
              </CardHeader>
              <CardContent>
                <p role="status" className={worksheetFigure}>{formatWorksheetCurrency(calculations.compArv)}</p>
                <p className="mt-2 text-sm text-muted-foreground">Based on {comparables.filter(c => c.salePrice > 0).length} comparables</p>
                <dl className="mt-4 divide-y divide-border border-t border-border">
                  <WorksheetResultRow label="Average price per sq ft" value={formatWorksheetCurrency(calculations.avgPricePerSqft)} />
                  <WorksheetResultRow label="ARV by square footage" value={formatWorksheetCurrency(calculations.sqftArv)} />
                  <WorksheetResultRow label="Confidence" value={calculations.confidence + "%"} />
                </dl>
              </CardContent>
            </Card>
            {/* CTA */}
            <Card className={worksheetCard}>
              <CardContent>
                <p className="mb-4 text-muted-foreground">Save your analysis and continue with repair estimates</p>
                <Button className={worksheetAction} asChild>
                  <Link href="/login">
                    Continue with Repairs <ArrowRight aria-hidden="true" />
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </CalculatorFrame>
    </div>
  );
}

