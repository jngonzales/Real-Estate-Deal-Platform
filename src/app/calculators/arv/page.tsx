"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  ArrowLeft,
  Home,
  Plus,
  Trash2,
  Sparkles,
  ArrowRight,
} from "lucide-react";

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(amount);
}

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
            <Link href="/login">Save Analysis</Link>
          </Button>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-5xl mx-auto">
          {/* Title */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-white mb-2">ARV Calculator</h1>
            <p className="text-muted-foreground">Calculate After Repair Value using comparable sales</p>
          </div>

          <div className="grid lg:grid-cols-3 gap-6">
            {/* Left: Inputs */}
            <div className="lg:col-span-2 space-y-6">
              {/* Subject Property */}
              <Card className="bg-secondary/50 border-white/10">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Home className="w-5 h-5" />
                    Subject Property
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <Label className="text-foreground/90">Square Footage</Label>
                    <Input
                      type="number"
                      value={subjectSqft}
                      onChange={(e) => setSubjectSqft(Number(e.target.value))}
                      className="bg-secondary/50 border-white/10 text-white"
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Comparables */}
              <Card className="bg-secondary/50 border-white/10">
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle className="text-white">Comparable Properties</CardTitle>
                  <Button size="sm" onClick={addComparable} className="bg-primary/20 hover:bg-primary/30 text-primary">
                    <Plus className="w-4 h-4 mr-1" /> Add Comp
                  </Button>
                </CardHeader>
                <CardContent className="space-y-4">
                  {comparables.map((comp, index) => (
                    <div key={comp.id} className="p-4 rounded-lg bg-secondary/30 border border-white/5 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-foreground/90">Comp #{index + 1}</span>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => removeComparable(comp.id)}
                          className="h-8 w-8 text-muted-foreground hover:text-red-400"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                        <div className="col-span-2 lg:col-span-1">
                          <Label className="text-muted-foreground text-xs">Address</Label>
                          <Input
                            value={comp.address}
                            onChange={(e) => updateComparable(comp.id, "address", e.target.value)}
                            placeholder="123 Main St"
                            className="bg-secondary/60 border-white/10 text-white"
                          />
                        </div>
                        <div>
                          <Label className="text-muted-foreground text-xs">Sale Price</Label>
                          <Input
                            type="number"
                            value={comp.salePrice || ""}
                            onChange={(e) => updateComparable(comp.id, "salePrice", Number(e.target.value))}
                            placeholder="280000"
                            className="bg-secondary/60 border-white/10 text-white"
                          />
                        </div>
                        <div>
                          <Label className="text-muted-foreground text-xs">Sq Ft</Label>
                          <Input
                            type="number"
                            value={comp.sqft || ""}
                            onChange={(e) => updateComparable(comp.id, "sqft", Number(e.target.value))}
                            placeholder="1800"
                            className="bg-secondary/60 border-white/10 text-white"
                          />
                        </div>
                        <div>
                          <Label className="text-muted-foreground text-xs">Adjust %</Label>
                          <Input
                            type="number"
                            value={comp.adjustment || ""}
                            onChange={(e) => updateComparable(comp.id, "adjustment", Number(e.target.value))}
                            placeholder="0"
                            className="bg-secondary/60 border-white/10 text-white"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>

            {/* Right: Results */}
            <div className="space-y-6">
              {/* ARV Result */}
              <Card className="bg-primary text-white">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Home className="w-5 h-5" />
                    Estimated ARV
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-4xl font-bold">{formatCurrency(calculations.compArv)}</p>
                  <p className="text-emerald-100 mt-2">Based on {comparables.filter(c => c.salePrice > 0).length} comparables</p>
                </CardContent>
              </Card>

              {/* Price per Sqft */}
              <Card className="bg-secondary/50 border-white/10">
                <CardContent className="pt-6">
                  <div className="space-y-4">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Avg Price/SqFt</span>
                      <span className="text-white font-medium">${calculations.avgPricePerSqft.toFixed(0)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">SqFt Method ARV</span>
                      <span className="text-white font-medium">{formatCurrency(calculations.sqftArv)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Confidence</span>
                      <span className="text-white font-medium">{calculations.confidence}%</span>
                    </div>
                    <div className="h-2 bg-secondary rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-primary"
                        style={{ width: `${calculations.confidence}%` }}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* CTA */}
              <Card className="bg-primary/10 border-primary/30">
                <CardContent className="pt-6 text-center">
                  <p className="text-foreground/90 mb-4">Save your analysis and continue with repair estimates</p>
                  <Button className="w-full bg-primary" asChild>
                    <Link href="/login">
                      Continue with Repairs <ArrowRight className="w-4 h-4 ml-2" />
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
