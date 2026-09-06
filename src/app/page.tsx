import Link from "next/link";
import { Metadata } from "next";
import { ArrowRight, Check } from "@/components/ui/icons";
import { LandingNav } from "@/components/layout/landing-nav";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  BrandMark,
  CalculatorGlyph,
  InsightGlyph,
  ReportGlyph,
  ArvGlyph,
  RepairGlyph,
  RoiGlyph,
  MaoGlyph,
  ExchangeGlyph,
  FinancingGlyph,
  HouseSketch,
} from "@/components/brand";

export const metadata: Metadata = {
  title: "LotMerit | Real Estate Deal Analysis Platform",
  description: "Analyze real estate deals with free investment calculators, AI-powered scoring, and team collaboration tools. Built for investors, wholesalers, and agents.",
  keywords: ["real estate analysis", "deal analysis", "ARV calculator", "investment calculator", "real estate investing", "deal flow management"],
};

const calculators = [
  { title: "ARV Calculator", description: "After Repair Value from comps", icon: ArvGlyph, href: "/calculators/arv" },
  { title: "Repair Estimator", description: "Estimate costs, 30+ categories", icon: RepairGlyph, href: "/calculators/repairs" },
  { title: "ROI Calculator", description: "Flip and rental returns", icon: RoiGlyph, href: "/calculators/roi" },
  { title: "MAO Calculator", description: "Maximum Allowable Offer", icon: MaoGlyph, href: "/calculators/mao" },
  { title: "1031 Exchange", description: "Tax deferral savings", icon: ExchangeGlyph, href: "/calculators/1031" },
  { title: "Financing", description: "Loan comparison and payments", icon: FinancingGlyph, href: "/calculators/financing" },
];

const features = [
  {
    icon: CalculatorGlyph,
    title: "Powerful Calculators",
    description: "DCF, LTV, waterfalls, and more. Built for real estate professionals.",
  },
  {
    icon: InsightGlyph,
    title: "Clear Insights",
    description: "Visualize cash flow, returns, and risk at a glance.",
  },
  {
    icon: ReportGlyph,
    title: "Professional Reports",
    description: "Export clean, lender-ready reports in seconds.",
  },
];

const proFeatures = [
  "Unlimited deals",
  "Advanced calculators",
  "Export & reports",
  "Priority support",
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background">
      <LandingNav />

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="mx-auto max-w-7xl px-6 pt-28 pb-16 lg:pt-32 lg:pb-24">
          <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
            <div className="max-w-xl">
              <p className="mb-4 text-sm font-semibold uppercase tracking-[0.2em] text-primary">
                Real Estate Deal Analysis
              </p>
              <h1 className="text-4xl font-bold leading-[1.05] tracking-tight text-foreground sm:text-5xl lg:text-6xl">
                Know your number before you make the offer.
              </h1>
              <p className="mt-5 max-w-md text-lg text-muted-foreground">
                Run ARV, repairs, and max offer on any property in minutes —
                then push it through your team&apos;s pipeline.
              </p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
                <Link
                  href="/login"
                  className="inline-flex h-12 items-center justify-center rounded-lg bg-primary px-6 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
                >
                  Start free
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
                <Link
                  href="/calculators"
                  className="inline-flex h-12 items-center justify-center rounded-lg px-4 text-sm font-semibold text-foreground underline decoration-border decoration-2 underline-offset-4 transition-colors hover:text-primary hover:decoration-primary"
                >
                  See how it works
                </Link>
              </div>
            </div>

            <div className="relative">
              <HouseSketch className="mx-auto w-full max-w-md text-primary/70" />
              <div className="relative z-10 mx-auto -mt-16 w-full max-w-md rotate-[1.5deg] rounded-xl border border-border bg-card p-2 shadow-md sm:-mt-24">
                <div className="overflow-hidden rounded-lg border border-border bg-background">
                  <div className="flex items-center justify-between border-b border-border px-4 py-2.5">
                    <div className="flex items-center gap-2">
                      <BrandMark
                        withWordmark={false}
                        variant="ghost"
                        className="[&>span:first-child]:h-6 [&>span:first-child]:w-6 [&>span:first-child]:rounded-md [&_svg]:h-3.5 [&_svg]:w-3.5"
                      />
                      <span className="text-sm font-semibold text-foreground">
                        Deal analysis
                      </span>
                    </div>
                    <Badge className="border-0 bg-amber-500/90 text-amber-950">
                      Under MAO
                    </Badge>
                  </div>
                  <div className="px-4 pt-3">
                    <p className="text-xs font-medium text-muted-foreground">
                      ARV · 1,420 sqft
                    </p>
                    <p className="mt-0.5 text-3xl font-bold tracking-tight text-primary">
                      $244,200
                    </p>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      Repairs $31,500 · Offer $195,000
                    </p>
                  </div>
                  <table className="mt-3 w-full border-t border-border text-left text-xs">
                    <thead>
                      <tr className="text-muted-foreground">
                        <th className="px-4 py-2 font-medium">Comparable</th>
                        <th className="px-2 py-2 font-medium">Sold</th>
                        <th className="px-2 py-2 font-medium">$/sqft</th>
                        <th className="px-4 py-2 text-right font-medium">Weight</th>
                      </tr>
                    </thead>
                    <tbody className="text-foreground">
                      <tr className="border-t border-border bg-primary/5">
                        <td className="px-4 py-2 font-medium">412 S Willow St</td>
                        <td className="px-2 py-2">$252,000</td>
                        <td className="px-2 py-2">$168</td>
                        <td className="px-4 py-2 text-right">35%</td>
                      </tr>
                      <tr className="border-t border-border">
                        <td className="px-4 py-2 font-medium">1187 Mapson Ave</td>
                        <td className="px-2 py-2">$238,900</td>
                        <td className="px-2 py-2">$159</td>
                        <td className="px-4 py-2 text-right">30%</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features + Pro teaser */}
      <section className="border-t border-border">
        <div className="mx-auto max-w-7xl px-6 py-16">
          <div className="grid gap-4 lg:grid-cols-4">
            {features.map((feature) => (
              <div key={feature.title} className="rounded-xl border border-border bg-card p-6">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-primary/25 bg-primary/10">
                  <feature.icon className="h-5 w-5 text-primary" />
                </div>
                <h3 className="mt-4 text-base font-semibold text-foreground">
                  {feature.title}
                </h3>
                <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
                  {feature.description}
                </p>
              </div>
            ))}

            <Card className="relative border-primary bg-card">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                <Badge className="bg-primary text-primary-foreground border-0">Most Popular</Badge>
              </div>
              <CardHeader className="text-center pb-2">
                <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary">
                  <BrandMark withWordmark={false} variant="solid" className="[&>span:first-child]:bg-transparent" />
                </div>
                <CardTitle className="text-xl text-foreground">Pro</CardTitle>
                <p className="text-sm text-muted-foreground">For serious dealmakers.</p>
              </CardHeader>
              <CardContent className="text-center">
                <div className="mb-6">
                  <span className="text-5xl font-bold text-foreground">$79</span>
                  <span className="text-muted-foreground">/mo</span>
                </div>
                <ul className="space-y-3 text-left">
                  {proFeatures.map((item) => (
                    <li key={item} className="flex items-center gap-3 text-sm text-foreground/90">
                      <Check className="h-5 w-5 text-primary shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
                <Button asChild className="mt-6 w-full">
                  <Link href="/pricing">
                    Start Free Trial
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Calculators strip */}
      <section className="border-t border-border bg-card/40">
        <div className="mx-auto max-w-7xl px-6 py-14">
          <div className="flex items-baseline justify-between">
            <h2 className="text-xl font-semibold text-foreground">Free Investment Calculators</h2>
            <Link href="/calculators" className="text-sm font-medium text-primary hover:text-primary/80">
              View all tools
            </Link>
          </div>
          <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-6">
            {calculators.map((calc) => (
              <Link
                key={calc.title}
                href={calc.href}
                className="group rounded-xl border border-border bg-card p-4 transition-colors hover:border-primary/40"
              >
                <calc.icon className="h-5 w-5 text-primary" />
                <div className="mt-3 text-sm font-semibold text-foreground">{calc.title}</div>
                <div className="mt-1 text-xs text-muted-foreground">{calc.description}</div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="border-t border-border">
        <div className="mx-auto max-w-7xl px-6 py-16">
          <div className="flex flex-col items-start justify-between gap-6 lg:flex-row lg:items-center">
            <div>
              <h2 className="text-2xl font-bold tracking-tight text-foreground">
                Start analyzing deals today
              </h2>
              <p className="mt-2 max-w-lg text-muted-foreground">
                Make data-driven decisions with LotMerit&apos;s powerful analysis platform. Get started in minutes.
              </p>
            </div>
            <Link
              href="/login"
              className="inline-flex h-12 shrink-0 items-center justify-center rounded-lg bg-primary px-6 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
            >
              Start free
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border">
        <div className="mx-auto max-w-7xl px-6 py-10">
          <div className="flex flex-col items-start justify-between gap-6 sm:flex-row sm:items-center">
            <BrandMark variant="solid" />
            <div className="flex items-center gap-6 text-sm text-muted-foreground">
              <Link href="/calculators" className="hover:text-foreground">Calculators</Link>
              <Link href="/pricing" className="hover:text-foreground">Pricing</Link>
              <Link href="/terms" className="hover:text-foreground">Terms</Link>
              <Link href="/privacy" className="hover:text-foreground">Privacy</Link>
              <Link href="/login" className="hover:text-foreground">Sign In</Link>
            </div>
            <div className="text-sm text-muted-foreground">
              © {new Date().getFullYear()} LotMerit. Investment analysis for real estate teams.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
