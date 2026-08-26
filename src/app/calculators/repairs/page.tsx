"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  ArrowLeft,
  Hammer,
  Sparkles,
  ArrowRight,
  ChevronDown,
  ChevronUp,
} from "lucide-react";

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(amount);
}

interface RepairCategory {
  id: string;
  name: string;
  icon: string;
  items: { id: string; name: string; low: number; mid: number; high: number; }[];
  expanded: boolean;
}

const initialCategories: RepairCategory[] = [
  {
    id: "roofing",
    name: "Roofing",
    icon: "🏠",
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
    icon: "🪑",
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
    icon: "🍳",
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
    icon: "🚿",
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
    icon: "⚙️",
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
      {/* Header */}
      <header className="border-b border-white/10 bg-card/80 backdrop-blur-xl sticky top-0 z-50">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" className="text-foreground/90 hover:text-white" asChild>
              <Link href="/calculators">
                <ArrowLeft className="h-5 w-5" />
              </Link>
            </Button>
            <Link href="/" className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
                <Sparkles className="h-4 w-4 text-white" />
              </div>
              <span className="font-bold text-white">DealFlow</span>
            </Link>
          </div>
          <Button className="bg-primary" asChild>
            <Link href="/login">Save Estimate</Link>
          </Button>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-5xl mx-auto">
          {/* Title */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-white mb-2">Repair Estimator</h1>
            <p className="text-muted-foreground">Estimate repair costs by category</p>
          </div>

          <div className="grid lg:grid-cols-3 gap-6">
            {/* Left: Inputs */}
            <div className="lg:col-span-2 space-y-6">
              {/* Quick Settings */}
              <Card className="bg-secondary/50 border-white/10">
                <CardHeader>
                  <CardTitle className="text-white">Settings</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-foreground/90">Property Sq Ft</Label>
                      <Input
                        type="number"
                        value={sqft}
                        onChange={(e) => setSqft(Number(e.target.value))}
                        className="bg-secondary/50 border-white/10 text-white"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-foreground/90">Cost Level</Label>
                      <div className="flex gap-2">
                        {(["low", "mid", "high"] as const).map((level) => (
                          <Button
                            key={level}
                            variant={costLevel === level ? "default" : "outline"}
                            size="sm"
                            onClick={() => setCostLevel(level)}
                            className={costLevel === level ? "" : "border-white/10 text-foreground/90"}
                          >
                            {level.charAt(0).toUpperCase() + level.slice(1)}
                          </Button>
                        ))}
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label className="text-foreground/90">Quick Templates</Label>
                    <div className="flex flex-wrap gap-2">
                      <Button variant="outline" size="sm" onClick={() => applyTemplate("cosmetic")} className="border-white/10 text-foreground/90">
                        Cosmetic (~$15K)
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => applyTemplate("moderate")} className="border-white/10 text-foreground/90">
                        Moderate (~$35K)
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => applyTemplate("full")} className="border-white/10 text-foreground/90">
                        Full Rehab (~$75K)
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Categories */}
              {categories.map((category) => (
                <Card key={category.id} className="bg-secondary/50 border-white/10 overflow-hidden">
                  <button
                    onClick={() => toggleCategory(category.id)}
                    className="w-full px-6 py-4 flex items-center justify-between hover:bg-white/5 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{category.icon}</span>
                      <span className="font-semibold text-white">{category.name}</span>
                    </div>
                    {category.expanded ? (
                      <ChevronUp className="w-5 h-5 text-muted-foreground" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-muted-foreground" />
                    )}
                  </button>
                  {category.expanded && (
                    <CardContent className="border-t border-white/10 space-y-3 pb-4">
                      {category.items.map((item) => (
                        <div key={item.id} className="flex items-center justify-between py-2">
                          <div>
                            <p className="text-sm text-white">{item.name}</p>
                            <p className="text-xs text-muted-foreground">
                              ${item[costLevel].toLocaleString()}
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            <Input
                              type="number"
                              min={0}
                              value={selectedItems[item.id] || ""}
                              onChange={(e) => updateItemQty(item.id, Number(e.target.value))}
                              placeholder="0"
                              className="w-20 bg-secondary/50 border-white/10 text-white text-center"
                            />
                          </div>
                        </div>
                      ))}
                    </CardContent>
                  )}
                </Card>
              ))}
            </div>

            {/* Right: Results */}
            <div className="space-y-6">
              {/* Total */}
              <Card className="bg-primary text-white sticky top-20">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Hammer className="w-5 h-5" />
                    Total Estimate
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-4xl font-bold">{formatCurrency(calculations.total)}</p>
                  <div className="mt-4 space-y-2 text-amber-100">
                    <div className="flex justify-between text-sm">
                      <span>Subtotal</span>
                      <span>{formatCurrency(calculations.subtotal)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Contingency ({contingencyPercent}%)</span>
                      <span>{formatCurrency(calculations.contingency)}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Contingency */}
              <Card className="bg-secondary/50 border-white/10">
                <CardContent className="pt-6">
                  <Label className="text-foreground/90">Contingency %</Label>
                  <div className="flex items-center gap-4 mt-2">
                    <Input
                      type="number"
                      value={contingencyPercent}
                      onChange={(e) => setContingencyPercent(Number(e.target.value))}
                      className="w-20 bg-secondary/50 border-white/10 text-white"
                    />
                    <span className="text-sm text-muted-foreground">Recommended: 10-20%</span>
                  </div>
                </CardContent>
              </Card>

              {/* CTA */}
              <Card className="bg-primary/10 border-primary/30">
                <CardContent className="pt-6 text-center">
                  <p className="text-foreground/90 mb-4">Continue to MAO Calculator with your repair estimate</p>
                  <Button className="w-full bg-primary" asChild>
                    <Link href={`/calculators/mao?repairs=${Math.round(calculations.total)}`}>
                      Calculate MAO <ArrowRight className="w-4 h-4 ml-2" />
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
