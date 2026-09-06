"use client";

import { useState } from "react";
import Link from "next/link";
import { WorkspaceHeading } from "@/components/layout/workspace-heading";
import { formatWorksheetCurrency, worksheetAction, worksheetCard, worksheetFigure, worksheetGrid, worksheetInput, worksheetResult } from "@/app/calculators/_components/worksheet";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Home, Droplets, Zap, Wind, PaintBucket, TreePine, Wrench, ChevronDown, ChevronUp } from "@/components/ui/icons";

interface RepairCategory {
  id: string;
  name: string;
  icon: React.ElementType;
  items: RepairItem[];
}

interface RepairItem {
  id: string;
  name: string;
  unit: string;
  lowCost: number;
  midCost: number;
  highCost: number;
  quantity: number;
  selected: boolean;
}

const initialCategories: RepairCategory[] = [
  {
    id: "roof",
    name: "Roofing",
    icon: Home,
    items: [
      { id: "roof-shingles", name: "Shingle Roof (per sqft)", unit: "sqft", lowCost: 3, midCost: 5, highCost: 8, quantity: 0, selected: false },
      { id: "roof-flat", name: "Flat Roof Repair", unit: "job", lowCost: 2000, midCost: 4000, highCost: 7000, quantity: 0, selected: false },
      { id: "roof-gutters", name: "Gutters", unit: "linear ft", lowCost: 5, midCost: 8, highCost: 15, quantity: 0, selected: false },
      { id: "roof-fascia", name: "Fascia & Soffit", unit: "linear ft", lowCost: 8, midCost: 15, highCost: 25, quantity: 0, selected: false },
    ],
  },
  {
    id: "plumbing",
    name: "Plumbing",
    icon: Droplets,
    items: [
      { id: "plumb-water-heater", name: "Water Heater", unit: "each", lowCost: 800, midCost: 1500, highCost: 2500, quantity: 0, selected: false },
      { id: "plumb-toilet", name: "Toilet", unit: "each", lowCost: 150, midCost: 300, highCost: 500, quantity: 0, selected: false },
      { id: "plumb-faucet", name: "Faucet", unit: "each", lowCost: 100, midCost: 200, highCost: 400, quantity: 0, selected: false },
      { id: "plumb-repipe", name: "Re-pipe (whole house)", unit: "job", lowCost: 3000, midCost: 6000, highCost: 12000, quantity: 0, selected: false },
      { id: "plumb-sewer", name: "Sewer Line Repair", unit: "job", lowCost: 2000, midCost: 5000, highCost: 10000, quantity: 0, selected: false },
    ],
  },
  {
    id: "electrical",
    name: "Electrical",
    icon: Zap,
    items: [
      { id: "elec-panel", name: "Electrical Panel", unit: "each", lowCost: 1500, midCost: 2500, highCost: 4000, quantity: 0, selected: false },
      { id: "elec-outlet", name: "Outlet/Switch", unit: "each", lowCost: 75, midCost: 150, highCost: 250, quantity: 0, selected: false },
      { id: "elec-rewire", name: "Rewire (whole house)", unit: "job", lowCost: 5000, midCost: 10000, highCost: 20000, quantity: 0, selected: false },
      { id: "elec-light", name: "Light Fixture", unit: "each", lowCost: 50, midCost: 150, highCost: 300, quantity: 0, selected: false },
    ],
  },
  {
    id: "hvac",
    name: "HVAC",
    icon: Wind,
    items: [
      { id: "hvac-furnace", name: "Furnace", unit: "each", lowCost: 2000, midCost: 4000, highCost: 7000, quantity: 0, selected: false },
      { id: "hvac-ac", name: "Central AC", unit: "each", lowCost: 3000, midCost: 5000, highCost: 8000, quantity: 0, selected: false },
      { id: "hvac-ductwork", name: "Ductwork", unit: "job", lowCost: 1500, midCost: 3000, highCost: 6000, quantity: 0, selected: false },
      { id: "hvac-minisplit", name: "Mini Split", unit: "each", lowCost: 1500, midCost: 3000, highCost: 5000, quantity: 0, selected: false },
    ],
  },
  {
    id: "interior",
    name: "Interior",
    icon: PaintBucket,
    items: [
      { id: "int-paint", name: "Interior Paint (per sqft)", unit: "sqft", lowCost: 1.5, midCost: 3, highCost: 5, quantity: 0, selected: false },
      { id: "int-flooring", name: "Flooring (per sqft)", unit: "sqft", lowCost: 3, midCost: 6, highCost: 12, quantity: 0, selected: false },
      { id: "int-drywall", name: "Drywall Repair", unit: "sqft", lowCost: 2, midCost: 4, highCost: 8, quantity: 0, selected: false },
      { id: "int-kitchen", name: "Kitchen Remodel", unit: "job", lowCost: 8000, midCost: 20000, highCost: 50000, quantity: 0, selected: false },
      { id: "int-bathroom", name: "Bathroom Remodel", unit: "each", lowCost: 5000, midCost: 12000, highCost: 25000, quantity: 0, selected: false },
      { id: "int-cabinets", name: "Cabinets", unit: "linear ft", lowCost: 150, midCost: 300, highCost: 600, quantity: 0, selected: false },
      { id: "int-countertops", name: "Countertops", unit: "linear ft", lowCost: 40, midCost: 80, highCost: 200, quantity: 0, selected: false },
    ],
  },
  {
    id: "exterior",
    name: "Exterior",
    icon: TreePine,
    items: [
      { id: "ext-siding", name: "Siding (per sqft)", unit: "sqft", lowCost: 4, midCost: 8, highCost: 15, quantity: 0, selected: false },
      { id: "ext-windows", name: "Windows", unit: "each", lowCost: 300, midCost: 600, highCost: 1200, quantity: 0, selected: false },
      { id: "ext-doors", name: "Exterior Door", unit: "each", lowCost: 500, midCost: 1000, highCost: 2000, quantity: 0, selected: false },
      { id: "ext-deck", name: "Deck (per sqft)", unit: "sqft", lowCost: 15, midCost: 30, highCost: 50, quantity: 0, selected: false },
      { id: "ext-concrete", name: "Concrete/Driveway", unit: "sqft", lowCost: 5, midCost: 10, highCost: 20, quantity: 0, selected: false },
      { id: "ext-landscaping", name: "Landscaping", unit: "job", lowCost: 1000, midCost: 3000, highCost: 8000, quantity: 0, selected: false },
    ],
  },
  {
    id: "foundation",
    name: "Foundation & Structure",
    icon: Wrench,
    items: [
      { id: "found-crack", name: "Foundation Crack Repair", unit: "each", lowCost: 250, midCost: 500, highCost: 1000, quantity: 0, selected: false },
      { id: "found-leveling", name: "Foundation Leveling", unit: "job", lowCost: 3000, midCost: 7000, highCost: 15000, quantity: 0, selected: false },
      { id: "found-framing", name: "Framing Repair", unit: "sqft", lowCost: 10, midCost: 20, highCost: 40, quantity: 0, selected: false },
    ],
  },
];

type CostLevel = "low" | "mid" | "high";

export default function RepairEstimatorPage() {
  const [categories, setCategories] = useState<RepairCategory[]>(initialCategories);
  const [costLevel, setCostLevel] = useState<CostLevel>("mid");
  const [expandedCategories, setExpandedCategories] = useState<string[]>(["interior"]);
  const [contingency, setContingency] = useState<number>(10);

  const toggleCategory = (categoryId: string) => {
    setExpandedCategories(prev =>
      prev.includes(categoryId)
        ? prev.filter(id => id !== categoryId)
        : [...prev, categoryId]
    );
  };

  const updateItem = (categoryId: string, itemId: string, field: "quantity" | "selected", value: number | boolean) => {
    setCategories(cats =>
      cats.map(cat => {
        if (cat.id !== categoryId) return cat;
        return {
          ...cat,
          items: cat.items.map(item => {
            if (item.id !== itemId) return item;
            if (field === "selected" && value === true) {
              return { ...item, selected: true, quantity: item.quantity || 1 };
            }
            return { ...item, [field]: value };
          }),
        };
      })
    );
  };

  // Calculate totals
  const getCostForLevel = (item: RepairItem) => {
    if (costLevel === "low") return item.lowCost;
    if (costLevel === "high") return item.highCost;
    return item.midCost;
  };

  const categoryTotals = categories.map(cat => {
    const total = cat.items
      .filter(item => item.selected && item.quantity > 0)
      .reduce((sum, item) => sum + (getCostForLevel(item) * item.quantity), 0);
    return { id: cat.id, name: cat.name, total };
  });

  const subtotal = categoryTotals.reduce((sum, cat) => sum + cat.total, 0);
  const contingencyAmount = subtotal * (contingency / 100);
  const totalRepairs = subtotal + contingencyAmount;

  const selectedItemsCount = categories.reduce((count, cat) => 
    count + cat.items.filter(item => item.selected).length, 0
  );

  return (
    <div className="min-w-0 space-y-6">
      <WorkspaceHeading
        title="Repair estimator"
        description="Build an itemized repair budget."
        actions={<>
          <div className="flex min-w-0 items-center gap-2">
            <Label htmlFor="repair-cost-level" className="text-sm">Cost level</Label>
            <select
              id="repair-cost-level"
              value={costLevel}
              onChange={(e) => setCostLevel(e.target.value as CostLevel)}
              className={worksheetInput + " min-w-0 rounded-md border px-3"}
            >
              <option value="low">Low</option>
              <option value="mid">Medium</option>
              <option value="high">High</option>
            </select>
          </div>
          <Button asChild variant="outline" className={worksheetAction}><Link href="/dashboard/analysis">Back to analysis</Link></Button>
        </>}
      />

      <div className={worksheetGrid}>
        {/* Left: Categories */}
        <div className="min-w-0 space-y-4">
          {/* Quick Templates */}
          <Card className={worksheetCard}>
            <CardHeader>
              <h2 className="text-xl font-semibold tracking-tight">Repair templates</h2>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button
                variant="outline"
                className={worksheetAction + " w-full justify-start"}
                onClick={() => {
                  // Cosmetic rehab preset
                  setCategories(cats => cats.map(cat => ({
                    ...cat,
                    items: cat.items.map(item => {
                      if (["int-paint", "int-flooring", "ext-landscaping"].includes(item.id)) {
                        return { ...item, selected: true, quantity: item.id.includes("sqft") ? 1500 : 1 };
                      }
                      return { ...item, selected: false, quantity: 0 };
                    }),
                  })));
                }}
              >
                Cosmetic Rehab (~$15K)
              </Button>
              <Button
                variant="outline"
                className={worksheetAction + " w-full justify-start"}
                onClick={() => {
                  // Moderate rehab preset
                  setCategories(cats => cats.map(cat => ({
                    ...cat,
                    items: cat.items.map(item => {
                      if (["int-paint", "int-flooring", "int-bathroom", "plumb-water-heater", "elec-panel"].includes(item.id)) {
                        return { ...item, selected: true, quantity: item.id.includes("sqft") ? 1500 : 1 };
                      }
                      return { ...item, selected: false, quantity: 0 };
                    }),
                  })));
                }}
              >
                Moderate Rehab (~$35K)
              </Button>
              <Button
                variant="outline"
                className={worksheetAction + " w-full justify-start"}
                onClick={() => {
                  // Full rehab preset
                  setCategories(cats => cats.map(cat => ({
                    ...cat,
                    items: cat.items.map(item => {
                      if (["int-paint", "int-flooring", "int-kitchen", "int-bathroom", "plumb-water-heater", "elec-panel", "hvac-ac", "roof-shingles", "ext-windows"].includes(item.id)) {
                        const qty = item.unit === "sqft" ? 1800 : item.unit === "each" ? (item.id === "ext-windows" ? 10 : item.id === "int-bathroom" ? 2 : 1) : 1;
                        return { ...item, selected: true, quantity: qty };
                      }
                      return { ...item, selected: false, quantity: 0 };
                    }),
                  })));
                }}
              >
                Full Rehab (~$75K)
              </Button>
            </CardContent>
          </Card>

          {categories.map((category) => {
            const isExpanded = expandedCategories.includes(category.id);
            const categoryTotal = categoryTotals.find(c => c.id === category.id)?.total || 0;
            const selectedCount = category.items.filter(i => i.selected).length;

            return (
              <Card key={category.id} className={worksheetCard + " gap-0 !py-0"}>
                <button
                  type="button"
                  onClick={() => toggleCategory(category.id)}
                  aria-expanded={isExpanded}
                  className="flex min-h-11 w-full min-w-0 items-center justify-between gap-2 rounded-lg px-4 py-3 text-start transition-colors hover:bg-accent focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring sm:px-6"
                >
                  <span className="flex min-w-0 items-center gap-2">
                    <span aria-hidden="true" className="shrink-0 text-muted-foreground"><category.icon className="size-5" /></span>
                    <span className="min-w-0 font-semibold">{category.name}</span>
                  </span>
                  {isExpanded
                    ? <ChevronUp aria-hidden="true" className="size-4 shrink-0 text-muted-foreground" />
                    : <ChevronDown aria-hidden="true" className="size-4 shrink-0 text-muted-foreground" />}
                </button>
                {selectedCount > 0 && (
                  <div className="flex items-baseline justify-between gap-3 px-4 pb-2 text-sm text-muted-foreground sm:px-6">
                    <span>{selectedCount} selected</span>
                    <span className="min-w-0 text-end tabular-nums [overflow-wrap:anywhere]">{formatWorksheetCurrency(categoryTotal)}</span>
                  </div>
                )}

                {isExpanded && (
                  <CardContent className="border-t border-border">
                    <div className="divide-y divide-border">
                      {category.items.map((item) => (
                        <div
                          key={item.id}
                          className="flex min-w-0 flex-wrap items-center gap-x-3 gap-y-2 py-3"
                        >
                          <Checkbox
                            checked={item.selected}
                            aria-label={item.name}
                            onCheckedChange={(checked: boolean | "indeterminate") => 
                              updateItem(category.id, item.id, "selected", !!checked)
                            }
                          />
                          <div className="min-w-0 flex-1 basis-[55%]">
                            <p className="font-medium text-sm">{item.name}</p>
                            <p className="text-xs text-muted-foreground">
                              ${getCostForLevel(item).toLocaleString()} / {item.unit}
                            </p>
                          </div>
                          {item.selected && (
                            <>
                              <div className="w-16 shrink-0">
                                <Input
                                  type="number" inputMode="decimal"
                                  min="0"
                                  value={item.quantity}
                                  aria-label={"Quantity for " + item.name}
                                  onChange={(e) => 
                                    updateItem(category.id, item.id, "quantity", Number(e.target.value))
                                  }
                                  className={worksheetInput + " h-8 text-center"}
                                />
                              </div>
                              <div className="ms-auto min-w-0 max-w-full text-end font-medium tabular-nums [overflow-wrap:anywhere]">
                                {formatWorksheetCurrency(getCostForLevel(item) * item.quantity)}
                              </div>
                            </>
                          )}
                        </div>
                      ))}
                    </div>
                  </CardContent>
                )}
              </Card>
            );
          })}
        </div>

        {/* Right: Summary */}
        <div className="space-y-6">
          <Card className={worksheetResult}>
            <CardHeader><h2 className="text-xl font-semibold tracking-tight">Total repair estimate</h2></CardHeader>
            <CardContent>
              <p role="status" className={worksheetFigure}>{formatWorksheetCurrency(totalRepairs)}</p>
              <p className="mt-2 text-sm text-muted-foreground">{selectedItemsCount} items selected</p>
            </CardContent>
          </Card>

          {/* Breakdown */}
          <Card className={worksheetCard}>
            <CardHeader>
              <h2 className="text-xl font-semibold tracking-tight">Cost breakdown</h2>
            </CardHeader>
            <CardContent className="space-y-4">
              {categoryTotals.filter(c => c.total > 0).map((cat) => (
                <div key={cat.id} className="flex items-baseline justify-between gap-3 text-sm tabular-nums">
                  <span className="text-muted-foreground">{cat.name}</span>
                  <span className="min-w-0 text-end font-medium [overflow-wrap:anywhere]">{formatWorksheetCurrency(cat.total)}</span>
                </div>
              ))}

              {subtotal > 0 && (
                <>
                  <div className="border-t pt-3">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Subtotal</span>
                      <span className="min-w-0 text-end font-medium [overflow-wrap:anywhere]">{formatWorksheetCurrency(subtotal)}</span>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <Label htmlFor="repair-contingency" className="text-sm">Contingency (%)</Label>
                    <Input
                      type="number" inputMode="decimal"
                      min="0"
                      max="50"
                      id="repair-contingency"
                      value={contingency}
                      onChange={(e) => setContingency(Number(e.target.value))}
                      className={worksheetInput + " w-16 h-8 text-center"}
                    />
                    <span className="ms-auto min-w-0 text-end text-sm font-medium tabular-nums [overflow-wrap:anywhere]">
                      +{formatWorksheetCurrency(contingencyAmount)}
                    </span>
                  </div>

                  <div className="border-t pt-3">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold">Total</span>
                      <span className="min-w-0 text-end text-xl font-semibold text-primary tabular-nums [overflow-wrap:anywhere]">
                        {formatWorksheetCurrency(totalRepairs)}
                      </span>
                    </div>
                  </div>
                </>
              )}

              {subtotal === 0 && (
                <p className="text-sm text-muted-foreground text-center py-4">
                  Select repair items to see breakdown
                </p>
              )}
            </CardContent>
          </Card>

          {/* Actions */}
          <Card className={worksheetCard}>
            <CardContent className="pt-6 space-y-3">
              <Button className={worksheetAction + " w-full"} asChild>
                <Link href={`/dashboard/analysis/mao?repairs=${totalRepairs}`}>
                  Calculate MAO
                </Link>
              </Button>
              <Button variant="outline" className={worksheetAction + " w-full"} asChild>
                <Link href="/dashboard/analysis/arv">
                  Back to ARV
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
