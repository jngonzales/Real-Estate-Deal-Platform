"use client";

import { useState } from "react";
import Link from "next/link";
import { WorkspaceHeading } from "@/components/layout/workspace-heading";
import { formatWorksheetCurrency, worksheetAction, worksheetCard, worksheetFigure, worksheetGrid, worksheetInput, worksheetResult, worksheetPanelFocus, worksheetTab, worksheetTabs, WorksheetResultRow } from "@/app/calculators/_components/worksheet";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DollarSign, SquareIcon, MapPin, Plus, Trash2 } from "@/components/ui/icons";

interface Comparable {
  id: string;
  address: string;
  salePrice: number;
  sqft: number;
  beds: number;
  baths: number;
  condition: "inferior" | "similar" | "superior";
  adjustment: number;
}

const conditionAdjustments = {
  inferior: 10,
  similar: 0,
  superior: -10,
};

export default function ARVCalculatorPage() {
  const [method, setMethod] = useState<"comps" | "sqft" | "income">("comps");

  // Subject property
  const [subjectSqft, setSubjectSqft] = useState<number>(1800);
  const [subjectBeds, setSubjectBeds] = useState<number>(3);
  const [subjectBaths, setSubjectBaths] = useState<number>(2);

  // Comparables method
  const [comparables, setComparables] = useState<Comparable[]>([
    { id: "1", address: "123 Main St", salePrice: 275000, sqft: 1750, beds: 3, baths: 2, condition: "similar", adjustment: 0 },
    { id: "2", address: "456 Oak Ave", salePrice: 285000, sqft: 1900, beds: 3, baths: 2, condition: "superior", adjustment: -10 },
    { id: "3", address: "789 Pine Rd", salePrice: 260000, sqft: 1650, beds: 3, baths: 2, condition: "inferior", adjustment: 10 },
  ]);

  // Sqft method
  const [pricePerSqft, setPricePerSqft] = useState<number>(150);

  // Income method
  const [monthlyRent, setMonthlyRent] = useState<number>(2200);
  const [capRate, setCapRate] = useState<number>(8);
  const [expenses, setExpenses] = useState<number>(35); // percentage

  // Add comparable
  const addComparable = () => {
    const newComp: Comparable = {
      id: Date.now().toString(),
      address: "",
      salePrice: 0,
      sqft: 0,
      beds: 3,
      baths: 2,
      condition: "similar",
      adjustment: 0,
    };
    setComparables([...comparables, newComp]);
  };

  // Update comparable
  const updateComparable = (id: string, field: keyof Comparable, value: string | number) => {
    setComparables(comps => 
      comps.map(c => {
        if (c.id !== id) return c;
        const updated = { ...c, [field]: value };
        if (field === "condition") {
          updated.adjustment = conditionAdjustments[value as keyof typeof conditionAdjustments];
        }
        return updated;
      })
    );
  };

  // Remove comparable
  const removeComparable = (id: string) => {
    setComparables(comps => comps.filter(c => c.id !== id));
  };

  // Calculate ARV based on method
  const calculateARV = () => {
    if (method === "comps" && comparables.length > 0) {
      const adjustedPrices = comparables.map(c => {
        const adjustedPrice = c.salePrice * (1 + c.adjustment / 100);
        return adjustedPrice;
      });
      return adjustedPrices.reduce((a, b) => a + b, 0) / adjustedPrices.length;
    }

    if (method === "sqft") {
      return subjectSqft * pricePerSqft;
    }

    if (method === "income") {
      const annualRent = monthlyRent * 12;
      const netOperatingIncome = annualRent * (1 - expenses / 100);
      return netOperatingIncome / (capRate / 100);
    }

    return 0;
  };

  const arv = calculateARV();
  const avgPricePerSqft = arv / subjectSqft;

  // Confidence calculation (simplified)
  const getConfidence = () => {
    if (method === "comps") {
      if (comparables.length >= 4) return { level: "High", color: "text-primary", percent: 90 };
      if (comparables.length >= 2) return { level: "Medium", color: "text-amber-800 dark:text-amber-300", percent: 70 };
      return { level: "Low", color: "text-red-600", percent: 50 };
    }
    return { level: "Medium", color: "text-amber-800 dark:text-amber-300", percent: 70 };
  };

  const confidence = getConfidence();

  return (
    <div className="min-w-0 space-y-6">
      <WorkspaceHeading
        title="ARV calculator"
        description="Estimate after-repair value from sales, square footage, or income."
        actions={<>

          <Button asChild variant="outline" className={worksheetAction}><Link href="/dashboard/analysis">Back to analysis</Link></Button>
        </>}
      />

      <div className={worksheetGrid}>
        {/* Left: Subject Property + Inputs */}
        <div className="min-w-0 space-y-6">
          {/* Subject Property */}
          <Card className={worksheetCard}>
            <CardHeader>
              <h2 className="text-xl font-semibold tracking-tight">Subject Property</h2>
              <CardDescription>Enter your property details</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 items-end gap-3 sm:grid-cols-3">
                <div className="space-y-2">
                  <Label htmlFor="sqft">Square Feet</Label>
                  <div className="relative">
                    <SquareIcon aria-hidden="true" className="absolute start-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="sqft"
                      type="number" inputMode="decimal"
                      value={subjectSqft}
                      onChange={(e) => setSubjectSqft(Number(e.target.value))}
                      className={worksheetInput + " ps-9"}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="beds">Bedrooms</Label>
                  <Input className={worksheetInput}
                    id="beds"
                    type="number" inputMode="decimal"
                    value={subjectBeds}
                    onChange={(e) => setSubjectBeds(Number(e.target.value))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="baths">Bathrooms</Label>
                  <Input className={worksheetInput}
                    id="baths"
                    type="number" inputMode="decimal"
                    step="0.5"
                    value={subjectBaths}
                    onChange={(e) => setSubjectBaths(Number(e.target.value))}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Calculation Method Tabs */}
          <Card className={worksheetCard}>
            <CardHeader>
              <h2 className="text-xl font-semibold tracking-tight">Calculation Method</h2>
            </CardHeader>
            <CardContent>
              <Tabs value={method} onValueChange={(v) => setMethod(v as typeof method)}>
                <TabsList aria-label="Valuation method" className={worksheetTabs + " grid-cols-3"}>
                  <TabsTrigger value="comps" className={worksheetTab}>Comparables</TabsTrigger>
                  <TabsTrigger value="sqft" className={worksheetTab}>Price/SqFt</TabsTrigger>
                  <TabsTrigger value="income" className={worksheetTab}>Income</TabsTrigger>
                </TabsList>

                {/* Comparables Tab */}
                <TabsContent value="comps" className={worksheetPanelFocus + " mt-4 space-y-4"}>
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <p className="text-sm text-muted-foreground">
                      Add recently sold comparable properties (last 6 months)
                    </p>
                    <Button size="sm" onClick={addComparable} className={worksheetAction}>
                      <Plus className="w-4 h-4 mr-2" /> Add Comp
                    </Button>
                  </div>

                  <div className="space-y-4">
                    {comparables.map((comp, idx) => (
                      <div
                        key={comp.id}
                        className="space-y-3 border-t border-border pt-4"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-medium">Comp #{idx + 1}</span>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeComparable(comp.id)}
                            aria-label={"Remove comparable " + (idx + 1)}
                            className={worksheetAction + " w-11"}
                          >
                            <Trash2 aria-hidden="true" className="text-destructive" />
                          </Button>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                          <div className="col-span-2 min-w-0 space-y-2">
                            <Label htmlFor={"arv-" + comp.id + "-address"} className="leading-snug">Address</Label>
                            <div className="relative">
                              <MapPin aria-hidden="true" className="absolute start-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                              <Input id={"arv-" + comp.id + "-address"}
                                value={comp.address}
                                onChange={(e) => updateComparable(comp.id, "address", e.target.value)}
                                placeholder="123 Main St"
                                className={worksheetInput + " ps-9"}
                              />
                            </div>
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor={"arv-" + comp.id + "-salePrice"} className="leading-snug">Sale Price</Label>
                            <div className="relative">
                              <DollarSign aria-hidden="true" className="absolute start-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                              <Input id={"arv-" + comp.id + "-salePrice"}
                                type="number" inputMode="decimal"
                                value={comp.salePrice || ""}
                                onChange={(e) => updateComparable(comp.id, "salePrice", Number(e.target.value))}
                                className={worksheetInput + " ps-9"}
                              />
                            </div>
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor={"arv-" + comp.id + "-sqft"} className="leading-snug">Square Feet</Label>
                            <Input className={worksheetInput} id={"arv-" + comp.id + "-sqft"}
                              type="number" inputMode="decimal"
                              value={comp.sqft || ""}
                              onChange={(e) => updateComparable(comp.id, "sqft", Number(e.target.value))}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor={"arv-" + comp.id + "-beds"} className="leading-snug">Beds</Label>
                            <Input className={worksheetInput} id={"arv-" + comp.id + "-beds"}
                              type="number" inputMode="decimal"
                              value={comp.beds}
                              onChange={(e) => updateComparable(comp.id, "beds", Number(e.target.value))}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor={"arv-" + comp.id + "-baths"} className="leading-snug">Baths</Label>
                            <Input className={worksheetInput} id={"arv-" + comp.id + "-baths"}
                              type="number" inputMode="decimal"
                              step="0.5"
                              value={comp.baths}
                              onChange={(e) => updateComparable(comp.id, "baths", Number(e.target.value))}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor={"arv-" + comp.id + "-condition"} className="leading-snug">Condition vs Subject</Label>
                            <select id={"arv-" + comp.id + "-condition"}
                              value={comp.condition}
                              onChange={(e) => updateComparable(comp.id, "condition", e.target.value)}
                              className={worksheetInput + " w-full rounded-md border px-2"}
                            >
                              <option value="inferior">Inferior (+10%)</option>
                              <option value="similar">Similar (0%)</option>
                              <option value="superior">Superior (-10%)</option>
                            </select>
                          </div>
                          <div className="space-y-2">
                            <p className="text-sm font-medium">Adjusted price</p>
                            <div className="min-h-11 rounded-md border border-border bg-muted px-3 py-2 text-sm tabular-nums [overflow-wrap:anywhere]">
                              {formatWorksheetCurrency(comp.salePrice * (1 + comp.adjustment / 100))}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </TabsContent>

                {/* Price per SqFt Tab */}
                <TabsContent value="sqft" className={worksheetPanelFocus + " mt-4 space-y-4"}>
                  <p className="text-sm text-muted-foreground">
                    Use market average price per square foot for the area
                  </p>
                  <div className="max-w-xs space-y-2">
                    <Label htmlFor="arv-pricePerSqft" className="leading-snug">Price per Square Foot</Label>
                    <div className="relative">
                      <DollarSign aria-hidden="true" className="absolute start-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input id="arv-pricePerSqft"
                        type="number" inputMode="decimal"
                        value={pricePerSqft}
                        onChange={(e) => setPricePerSqft(Number(e.target.value))}
                        className={worksheetInput + " ps-9"}
                      />
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {subjectSqft} sqft × ${pricePerSqft}/sqft = {formatWorksheetCurrency(subjectSqft * pricePerSqft)}
                    </p>
                  </div>
                </TabsContent>

                {/* Income Approach Tab */}
                <TabsContent value="income" className={worksheetPanelFocus + " mt-4 space-y-4"}>
                  <p className="text-sm text-muted-foreground">
                    Calculate value based on rental income potential (best for rentals)
                  </p>
                  <div className="grid sm:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="arv-monthlyRent" className="leading-snug">Monthly Rent</Label>
                      <div className="relative">
                        <DollarSign aria-hidden="true" className="absolute start-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input id="arv-monthlyRent"
                          type="number" inputMode="decimal"
                          value={monthlyRent}
                          onChange={(e) => setMonthlyRent(Number(e.target.value))}
                          className={worksheetInput + " ps-9"}
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="arv-capRate" className="leading-snug">Cap Rate (%)</Label>
                      <Input className={worksheetInput} id="arv-capRate"
                        type="number" inputMode="decimal"
                        step="0.5"
                        value={capRate}
                        onChange={(e) => setCapRate(Number(e.target.value))}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="arv-expenses" className="leading-snug">Operating Expenses (%)</Label>
                      <Input className={worksheetInput} id="arv-expenses"
                        type="number" inputMode="decimal"
                        value={expenses}
                        onChange={(e) => setExpenses(Number(e.target.value))}
                      />
                    </div>
                  </div>
                  <div className="text-sm text-muted-foreground space-y-1">
                    <p>Annual Rent: {formatWorksheetCurrency(monthlyRent * 12)}</p>
                    <p>NOI (after {expenses}% expenses): {formatWorksheetCurrency(monthlyRent * 12 * (1 - expenses / 100))}</p>
                    <p>Value at {capRate}% cap: {formatWorksheetCurrency(arv)}</p>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>

        {/* Right: Results */}
        <div className="space-y-6">
          <Card className={worksheetResult}>
            <CardHeader><h2 className="text-xl font-semibold tracking-tight">Estimated ARV</h2></CardHeader>
            <CardContent>
              <p role="status" className={worksheetFigure}>{formatWorksheetCurrency(arv)}</p>
              <dl className="mt-4 divide-y divide-border border-t border-border">
                <WorksheetResultRow label="Price per sq ft" value={formatWorksheetCurrency(avgPricePerSqft)} />
                <WorksheetResultRow label="Confidence" value={confidence.level + " (" + confidence.percent + "%)"} />
              </dl>
              {method === "comps" && comparables.length < 3 && (
                <p className="mt-2 text-sm text-muted-foreground">Add comparables to increase confidence.</p>
              )}
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card className={worksheetCard}>
            <CardHeader>
              <CardTitle>Next Steps</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button className={worksheetAction + " w-full"} asChild>
                <Link href="/dashboard/analysis/repairs">
                  Estimate repairs
                </Link>
              </Button>
              <Button variant="outline" className={worksheetAction + " w-full"} asChild>
                <Link href="/dashboard/analysis/mao">
                  Calculate MAO
                </Link>
              </Button>
              <Button variant="ghost" className={worksheetAction + " w-full"} asChild>
                <Link href="/dashboard/submit">
                  Submit This Deal
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
