"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Calculator, 
  Home, 
  Hammer, 
  TrendingUp, 
  DollarSign,
  ArrowRight,
  Sparkles,
  Target,
  PiggyBank,
  Percent,
  Clock,
  Zap,
} from "lucide-react";

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
    icon: Home,
    href: "/dashboard/analysis/arv",
    color: "from-emerald-500 to-emerald-600",
    features: ["Comparable sales analysis", "Price per sqft", "Market adjustments"],
  },
  {
    title: "Repair Estimator",
    description: "Estimate repair costs by category and scope",
    icon: Hammer,
    href: "/dashboard/analysis/repairs",
    color: "from-emerald-500 to-emerald-600",
    features: ["Itemized breakdowns", "Regional pricing", "Scope templates"],
  },
  {
    title: "ROI Calculator",
    description: "Calculate returns on your investment",
    icon: TrendingUp,
    href: "/dashboard/analysis/roi",
    color: "from-emerald-500 to-emerald-600",
    features: ["Cash-on-cash return", "IRR projections", "Exit strategies"],
  },
  {
    title: "MAO Calculator",
    description: "Find your Maximum Allowable Offer",
    icon: Target,
    href: "/dashboard/analysis/mao",
    color: "from-emerald-500 to-emerald-600",
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
      {/* Hero Section */}
      <div className="relative overflow-hidden rounded-xl">
        <div className="absolute inset-0 gradient-bg opacity-30" />
        <div className="absolute top-0 left-1/4 w-72 h-72 bg-primary/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-chart-2/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: "1s" }} />
        
        <div className="relative px-6 py-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 rounded-xl bg-primary/10">
                <Calculator className="w-8 h-8 text-primary" />
              </div>
              <div>
                <h1 className="text-3xl font-bold">Analysis Hub</h1>
                <p className="text-muted-foreground">Professional deal analysis tools at your fingertips</p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Quick Analysis Tool */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <Card className="p-6 glass-card">
          <div className="flex items-center gap-2 mb-6">
            <Zap className="w-5 h-5 text-primary" />
            <h2 className="text-xl font-semibold">Quick Analysis</h2>
            <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full">Instant Results</span>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {/* Inputs */}
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="quick-arv" className="flex items-center gap-2">
                  <Home className="w-4 h-4 text-muted-foreground" />
                  After Repair Value (ARV)
                </Label>
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
                <Label htmlFor="quick-repairs" className="flex items-center gap-2">
                  <Hammer className="w-4 h-4 text-muted-foreground" />
                  Estimated Repairs
                </Label>
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
                <Label htmlFor="quick-profit" className="flex items-center gap-2">
                  <Percent className="w-4 h-4 text-muted-foreground" />
                  Target Profit %
                </Label>
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
                <Card className="glass-card">
                  <CardContent className="pt-4">
                    <p className="text-sm text-muted-foreground mb-1">70% Rule Offer</p>
                    <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                      {formatCurrency(mao70)}
                    </p>
                  </CardContent>
                </Card>

                <Card className="glass-card">
                  <CardContent className="pt-4">
                    <p className="text-sm text-muted-foreground mb-1">Custom MAO</p>
                    <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                      {formatCurrency(maoCustom)}
                    </p>
                  </CardContent>
                </Card>
              </div>

              <Card className="glass-card bg-linear-to-r from-green-500/10 to-emerald-500/10 border-green-500/20">
                <CardContent className="pt-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Potential Profit</p>
                      <p className="text-3xl font-bold text-green-600 dark:text-green-400">
                        {formatCurrency(potentialProfit)}
                      </p>
                    </div>
                    <div className="p-3 rounded-full bg-green-500/10">
                      <PiggyBank className="w-8 h-8 text-green-600 dark:text-green-400" />
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
        </Card>
      </motion.div>

      {/* Calculator Cards Grid */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold">Analysis Tools</h2>
          <Link href="/dashboard/submit" className="text-sm text-primary hover:underline flex items-center gap-1">
            Submit a Deal <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {calculatorCards.map((calc, idx) => (
            <motion.div
              key={calc.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 * (idx + 1) }}
            >
              <Link href={calc.href}>
                <Card className="group cursor-pointer overflow-hidden transition-all hover:shadow-xl hover:shadow-primary/5 hover:-translate-y-1">
                  <div className={`h-2 bg-linear-to-r ${calc.color}`} />
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className={`p-3 rounded-xl bg-linear-to-r ${calc.color} text-white`}>
                        <calc.icon className="w-6 h-6" />
                      </div>
                      <ArrowRight className="w-5 h-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
                    </div>
                    <CardTitle className="mt-4">{calc.title}</CardTitle>
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
            </motion.div>
          ))}
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid md:grid-cols-3 gap-4">
        <Card className="glass-card">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-full bg-primary/10">
                <Calculator className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
              </div>
              <div>
                <p className="text-2xl font-bold">5+</p>
                <p className="text-sm text-muted-foreground">Calculator Tools</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-full bg-green-500/10">
                <Clock className="w-6 h-6 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <p className="text-2xl font-bold">&lt;5 min</p>
                <p className="text-sm text-muted-foreground">Full Analysis Time</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-full bg-emerald-500/10">
                <Sparkles className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
              </div>
              <div>
                <p className="text-2xl font-bold">Custom</p>
                <p className="text-sm text-muted-foreground">Formula Builder</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
