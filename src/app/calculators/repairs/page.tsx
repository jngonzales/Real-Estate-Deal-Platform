"use client";

import { useState, useMemo, type ComponentType } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  ArrowRight,
  ChevronDown,
  ChevronUp,
  Bath,
  Home,
  PaintBucket,
  Wrench,
  CookingPot,
} from "@/components/ui/icons";
import { PublicHeader } from "@/components/layout/public-header";
import { CalculatorFrame, CalculatorHeading, worksheetCard, worksheetFigure, worksheetGrid, worksheetInput, worksheetResult, worksheetAction, formatWorksheetCurrency, WorksheetResultRow } from "../_components/worksheet";

interface RepairCategory {
  id: string;
  name: string;
  icon: ComponentType<{ className?: string }>;
  items: { id: string; name: string; low: number; mid: number; high: number; }[];
  expanded: boolean;
}

const initialCategories: RepairCategory[] = [
  {
    id: "roofing",
    name: "Roofing",
    icon: Home,
    expanded: true,
    items: [
      { id: "roof-repair", name: "Roof Repair (per sqft)", low: 3, mid: 5, high: 8 },
      { id: "roof-replace", name: "Full Roof Replacement", low: 5000, mid: 8000, high: 15000 },
      { id: "gutters", name: "Gutters & Downspouts", low: 500, mid: 1200, high: 2500 },
    ],
  },
  {
    id: "interior",
    name: "Interior",
    icon: PaintBucket,
    expanded: true,
    items: [
      { id: "paint-interior", name: "Interior Paint (whole house)", low: 2000, mid: 4000, high: 6000 },
      { id: "flooring", name: "Flooring (per sqft)", low: 3, mid: 6, high: 12 },
      { id: "drywall", name: "Drywall Repair", low: 200, mid: 500, high: 1500 },
    ],
  },
  {
    id: "kitchen",
    name: "Kitchen",
    icon: CookingPot,
    expanded: false,
    items: [
      { id: "kitchen-cabinets", name: "Cabinet Refinish/Replace", low: 3000, mid: 8000, high: 20000 },
      { id: "countertops", name: "Countertops", low: 1500, mid: 3500, high: 8000 },
      { id: "appliances", name: "Appliances Package", low: 2000, mid: 4000, high: 8000 },
    ],
  },
  {
    id: "bathroom",
    name: "Bathrooms",
    icon: Bath,
    expanded: false,
    items: [
      { id: "bath-update", name: "Bathroom Update (cosmetic)", low: 2000, mid: 4000, high: 8000 },
      { id: "bath-full", name: "Full Bathroom Remodel", low: 8000, mid: 15000, high: 30000 },
      { id: "toilet", name: "Toilet Replacement", low: 150, mid: 300, high: 500 },
    ],
  },
  {
    id: "mechanical",
    name: "Mechanical",
    icon: Wrench,
    expanded: false,
    items: [
      { id: "hvac", name: "HVAC System", low: 4000, mid: 8000, high: 15000 },
      { id: "water-heater", name: "Water Heater", low: 800, mid: 1500, high: 3000 },
      { id: "electrical-panel", name: "Electrical Panel", low: 1500, mid: 3000, high: 5000 },
    ],
  },
];

export default function PublicRepairsCalculatorPage() {
  const [categories, setCategories] = useState<RepairCategory[]>(initialCategories);
  const [costLevel, setCostLevel] = useState<"low" | "mid" | "high">("mid");
  const [sqft, setSqft] = useState<number>(1800);
  const [contingencyPercent, setContingencyPercent] = useState<number>(10);
  const [selectedItems, setSelectedItems] = useState<Record<string, number>>({});

  const toggleCategory = (id: string) => {
    setCategories(categories.map(c =>
      c.id === id ? { ...c, expanded: !c.expanded } : c
    ));
  };

  const updateItemQty = (itemId: string, qty: number) => {
    setSelectedItems({ ...selectedItems, [itemId]: qty });
  };

  const calculations = useMemo(() => {
    let subtotal = 0;

    categories.forEach(cat => {
      cat.items.forEach(item => {
        const qty = selectedItems[item.id] || 0;
        if (qty > 0) {
          const unitCost = item[costLevel];
          // For per-sqft items, multiply by sqft
          const isPerSqft = item.name.toLowerCase().includes("per sqft");
          subtotal += isPerSqft ? unitCost * sqft * qty : unitCost * qty;
        }
      });
    });

    const contingency = subtotal * (contingencyPercent / 100);
    const total = subtotal + contingency;

    return { subtotal, contingency, total };
  }, [categories, selectedItems, costLevel, sqft, contingencyPercent]);

  // Quick templates
  const applyTemplate = (template: "cosmetic" | "moderate" | "full") => {
    const templates: Record<string, Record<string, number>> = {
      cosmetic: { "paint-interior": 1, "flooring": 1 },
      moderate: { "paint-interior": 1, "flooring": 1, "bath-update": 2, "countertops": 1 },
      full: { "paint-interior": 1, "flooring": 1, "bath-full": 2, "kitchen-cabinets": 1, "countertops": 1, "appliances": 1, "hvac": 1 },
    };
    setSelectedItems(templates[template] || {});
  };

  return (
    <div className="min-h-screen bg-background">
      <a href="#calculator-content" className="lm-skip-link">Skip to content</a>
      <PublicHeader backHref="/calculators" ctaLabel="Save Estimate" />

      <CalculatorFrame id="calculator-content">
        <CalculatorHeading title="Repair Estimator" description="Build a repair budget by category and add a contingency." />

        <div className={worksheetGrid}>
          {/* Left: Inputs */}
          <div className="min-w-0 space-y-4 lg:space-y-5">
            {/* Quick Settings */}
            <Card className={worksheetCard}>
              <CardHeader>
                <h2 className="text-xl font-semibold tracking-tight">Property details</h2>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="repair-square-feet" className="text-muted-foreground">Property Sq Ft</Label>
                    <Input id="repair-square-feet"
                      type="number"
                      inputMode="decimal"
                      value={sqft}
                      onChange={(e) => setSqft(Number(e.target.value))}
                      className={worksheetInput}
                    />
                  </div>
                  <div className="space-y-2">
                    <p id="repair-cost-level" className="text-sm font-medium">Cost Level</p>
                    <div role="group" aria-labelledby="repair-cost-level" className="flex flex-wrap gap-2">
                      {(["low", "mid", "high"] as const).map((level) => (
                        <Button
                          key={level}
                          variant={costLevel === level ? "default" : "outline"}
                          size="sm"
                          aria-pressed={costLevel === level}
                          onClick={() => setCostLevel(level)}
                          className={worksheetAction}
                        >
                          {level.charAt(0).toUpperCase() + level.slice(1)}
                        </Button>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <p className="text-sm font-medium">Repair templates</p>
                  <div className="flex flex-wrap gap-2">
                    <Button variant="outline" size="sm" onClick={() => applyTemplate("cosmetic")} className={worksheetAction}>
                      Cosmetic (~$15K)
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => applyTemplate("moderate")} className={worksheetAction}>
                      Moderate (~$35K)
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => applyTemplate("full")} className={worksheetAction}>
                      Full Rehab (~$75K)
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Contingency */}
            <Card className={worksheetCard}>
              <CardContent>
                <Label htmlFor="repair-contingency" className="text-muted-foreground">Contingency %</Label>
                <div className="flex items-center gap-4 mt-2">
                  <Input id="repair-contingency"
                    type="number"
                    inputMode="decimal"
                    value={contingencyPercent}
                    onChange={(e) => setContingencyPercent(Number(e.target.value))}
                    className={`${worksheetInput} w-20`}
                  />
                  <span className="text-sm text-muted-foreground">Recommended: 10-20%</span>
                </div>
              </CardContent>
            </Card>

            {/* Categories */}
            {categories.map((category) => (
              <Card key={category.id} className={`${worksheetCard} gap-0 py-0 sm:py-0`}>
                <button
                  onClick={() => toggleCategory(category.id)}
                  type="button"
                  aria-expanded={category.expanded}
                  className="flex min-h-11 w-full items-center justify-between gap-3 rounded-lg px-4 py-3 text-left transition-colors hover:bg-accent focus-visible:outline-2 focus-visible:outline-ring sm:px-6"
                >
                  <div className="flex items-center gap-3">
                    <category.icon className="size-5 shrink-0 text-muted-foreground" />
                    <span className="font-semibold text-foreground">{category.name}</span>
                  </div>
                  {category.expanded ? (
                    <ChevronUp aria-hidden="true" className="size-5 shrink-0 text-muted-foreground" />
                  ) : (
                    <ChevronDown aria-hidden="true" className="size-5 shrink-0 text-muted-foreground" />
                  )}
                </button>
                {category.expanded && (
                  <CardContent className="divide-y divide-border border-t border-border">
                    {category.items.map((item) => (
                      <div key={item.id} className="flex items-center justify-between gap-3 py-2">
                        <div>
                          <p className="text-sm text-foreground">{item.name}</p>
                          <p className="text-xs text-muted-foreground">
                            ${item[costLevel].toLocaleString()}
                          </p>
                        </div>
                        <div className="flex shrink-0 items-center gap-2">
                          <Input
                            type="number"
                            inputMode="decimal"
                            min={0}
                            value={selectedItems[item.id] || ""}
                            onChange={(e) => updateItemQty(item.id, Number(e.target.value))}
                            placeholder="0"
                            aria-label={`Quantity for ${item.name}`}
                            className={`${worksheetInput} w-20 text-center`}
                          />
                        </div>
                      </div>
                    ))}
                  </CardContent>
                )}
              </Card>
            ))}
          </div>

          <div className="min-w-0 space-y-4 lg:space-y-5">
            <Card className={worksheetResult}>
              <CardHeader>
                <h2 className="text-xl font-semibold tracking-tight">Total estimate</h2>
              </CardHeader>
              <CardContent>
                <p role="status" className={worksheetFigure}>{formatWorksheetCurrency(calculations.total)}</p>
                <dl className="mt-4 divide-y divide-border border-t border-border">
                  <WorksheetResultRow label="Subtotal" value={formatWorksheetCurrency(calculations.subtotal)} />
                  <WorksheetResultRow label={"Contingency (" + contingencyPercent + "%)"} value={formatWorksheetCurrency(calculations.contingency)} />
                </dl>
              </CardContent>
            </Card>
            {/* CTA */}
            <Card className={worksheetCard}>
              <CardContent>
                <p className="text-muted-foreground mb-4">Continue to MAO Calculator with your repair estimate</p>
                <Button className={worksheetAction} asChild>
                  <Link href={`/calculators/mao?repairs=${Math.round(calculations.total)}`}>
                    Calculate MAO <ArrowRight aria-hidden="true" />
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


