"use client";

import { useState } from "react";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { DollarSign, ArrowRight, PiggyBank, Percent } from "@/components/ui/icons";
import {
  CalculatorGlyph,
  ArvGlyph,
  RepairGlyph,
  RoiGlyph,
  MaoGlyph,
} from "@/components/brand";

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(amount);
}

const calculatorCards = [
  {
    title: "ARV Calculator",
    description: "Calculate After Repair Value using multiple methods",
    icon: ArvGlyph,
    href: "/dashboard/analysis/arv",
    features: ["Comparable sales analysis", "Price per sqft", "Market adjustments"],
  },
  {
    title: "Repair Estimator",
    description: "Estimate repair costs by category and scope",
    icon: RepairGlyph,
    href: "/dashboard/analysis/repairs",
    features: ["Itemized breakdowns", "Regional pricing", "Scope templates"],
  },
  {
    title: "ROI Calculator",
    description: "Calculate returns on your investment",
    icon: RoiGlyph,
    href: "/dashboard/analysis/roi",
    features: ["Cash-on-cash return", "IRR projections", "Exit strategies"],
  },
  {
    title: "MAO Calculator",
    description: "Find your Maximum Allowable Offer",
    icon: MaoGlyph,
    href: "/dashboard/analysis/mao",
    features: ["70% rule", "Custom formulas", "Profit margins"],
  },
];

export default function AnalysisHubPage() {
  // Quick calculator state
  const [quickArv, setQuickArv] = useState<number>(250000);
  const [quickRepairs, setQuickRepairs] = useState<number>(35000);
  const [quickProfitMargin, setQuickProfitMargin] = useState<number>(20);

  // Quick calculations
  const mao70 = quickArv * 0.7 - quickRepairs;
  const maoCustom = quickArv * (1 - quickProfitMargin / 100) - quickRepairs - (quickArv * 0.08);
  const potentialProfit = quickArv - maoCustom - quickRepairs;

  return (
    <div className="space-y-8">
      {/* Hero */}
      <div className="flex items-center gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
          <CalculatorGlyph className="h-7 w-7" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-foreground">Analysis Hub</h1>
          <p className="text-muted-foreground">Professional deal analysis tools at your fingertips</p>
        </div>
      </div>

      {/* Quick Analysis Tool */}
      <Card className="border-border bg-card">
        <CardHeader className="flex flex-row items-center gap-2 space-y-0 pb-4">
          <h2 className="text-xl font-semibold text-foreground">Quick Analysis</h2>
          <Badge variant="secondary">Instant Results</Badge>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-8">
            {/* Inputs */}
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="quick-arv">After Repair Value (ARV)</Label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="quick-arv"
                    type="number"
                    value={quickArv}
                    onChange={(e) => setQuickArv(Number(e.target.value))}
                    className="pl-9"
                    placeholder="250000"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="quick-repairs">Estimated Repairs</Label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="quick-repairs"
                    type="number"
                    value={quickRepairs}
                    onChange={(e) => setQuickRepairs(Number(e.target.value))}
                    className="pl-9"
                    placeholder="35000"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="quick-profit">Target Profit %</Label>
                <div className="relative">
                  <Input
                    id="quick-profit"
                    type="number"
                    value={quickProfitMargin}
                    onChange={(e) => setQuickProfitMargin(Number(e.target.value))}
                    className="pr-9"
                    placeholder="20"
                  />
                  <Percent className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                </div>
              </div>
            </div>

            {/* Results */}
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <Card className="border-border bg-background">
                  <CardContent className="pt-4">
                    <p className="text-sm text-muted-foreground mb-1">70% Rule Offer</p>
                    <p className="text-2xl font-bold text-foreground">
                      {formatCurrency(mao70)}
                    </p>
                  </CardContent>
                </Card>

                <Card className="border-border bg-background">
                  <CardContent className="pt-4">
                    <p className="text-sm text-muted-foreground mb-1">Custom MAO</p>
                    <p className="text-2xl font-bold text-foreground">
                      {formatCurrency(maoCustom)}
                    </p>
                  </CardContent>
                </Card>
              </div>

              <Card className="border-border bg-background">
                <CardContent className="pt-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Potential Profit</p>
                      <p className="text-3xl font-bold text-foreground">
                        {formatCurrency(potentialProfit)}
                      </p>
                    </div>
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
                      <PiggyBank className="w-6 h-6" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Button asChild className="w-full">
                <Link href="/dashboard/analysis/mao">
                  Open Full Calculator <ArrowRight className="w-4 h-4 ml-2" />
                </Link>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Calculator Cards Grid */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold">Analysis Tools</h2>
          <Link href="/dashboard/submit" className="text-sm text-primary hover:underline flex items-center gap-1">
            Submit a Deal <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {calculatorCards.map((calc) => (
            <Link key={calc.title} href={calc.href}>
              <Card className="group border-border bg-card transition-colors hover:border-primary/40">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
                      <calc.icon className="h-6 w-6" />
                    </div>
                    <ArrowRight className="w-5 h-5 text-muted-foreground transition-all group-hover:text-primary" />
                  </div>
                  <CardTitle className="mt-4 text-foreground">{calc.title}</CardTitle>
                  <CardDescription>{calc.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {calc.features.map((feature) => (
                      <li key={feature} className="flex items-center gap-2 text-sm text-muted-foreground">
                        <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid md:grid-cols-3 gap-4">
        <Card className="border-border bg-card">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
                <CalculatorGlyph className="h-6 w-6" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">5+</p>
                <p className="text-sm text-muted-foreground">Calculator Tools</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border bg-card">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
                <CalculatorGlyph className="h-6 w-6" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">&lt;5 min</p>
                <p className="text-sm text-muted-foreground">Full Analysis Time</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border bg-card">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
                <CalculatorGlyph className="h-6 w-6" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">Custom</p>
                <p className="text-sm text-muted-foreground">Formula Builder</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
