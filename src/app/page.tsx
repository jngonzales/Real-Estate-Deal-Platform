import Link from "next/link";
import Image from "next/image";
import { Metadata } from "next";
import {
  Calculator,
  Home,
  Hammer,
  TrendingUp,
  Target,
  ArrowRight,
  Check,
  FileText,
  CreditCard,
  Building2,
  Users,
  CircleDollarSign,
  ThumbsUp,
  BarChart3,
  FileDown,
} from "lucide-react";
import { LandingNav } from "@/components/layout/landing-nav";

export const metadata: Metadata = {
  title: "DealFlow | Real Estate Deal Analysis Platform",
  description: "Analyze real estate deals with free investment calculators, AI-powered scoring, and team collaboration tools. Built for investors, wholesalers, and agents.",
  keywords: ["real estate analysis", "deal analysis", "ARV calculator", "investment calculator", "real estate investing", "deal flow management"],
};

const calculators = [
  { title: "ARV Calculator", description: "After Repair Value from comps", icon: Home },
  { title: "Repair Estimator", description: "Estimate costs, 30+ categories", icon: Hammer },
  { title: "ROI Calculator", description: "Flip and rental returns", icon: TrendingUp },
  { title: "MAO Calculator", description: "Maximum Allowable Offer", icon: Target },
  { title: "1031 Exchange", description: "Tax deferral savings", icon: FileText },
  { title: "Financing", description: "Loan comparison and payments", icon: CreditCard },
];

const features = [
  {
    icon: Calculator,
    title: "Powerful Calculators",
    description: "DCF, LTV, waterfalls, and more. Built for real estate professionals.",
  },
  {
    icon: BarChart3,
    title: "Clear Insights",
    description: "Visualize cash flow, returns, and risk at a glance.",
  },
  {
    icon: FileDown,
    title: "Professional Reports",
    description: "Export clean, lender-ready reports in seconds.",
  },
];

const stats = [
  { icon: Building2, value: "25K+", label: "Deals Analyzed" },
  { icon: Users, value: "4.2K+", label: "Active Users" },
  { icon: CircleDollarSign, value: "$8.7B+", label: "Total Deal Volume" },
  { icon: ThumbsUp, value: "98%", label: "User Satisfaction" },
];

const proFeatures = [
  "Unlimited deals",
  "Advanced calculators",
  "Export & reports",
  "Priority support",
];

const calculatorHrefs: Record<string, string> = {
  "ARV Calculator": "/calculators/arv",
  "Repair Estimator": "/calculators/repairs",
  "ROI Calculator": "/calculators/roi",
  "MAO Calculator": "/calculators/mao",
  "1031 Exchange": "/calculators/1031",
  Financing: "/calculators/financing",
};

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background">
      <LandingNav />

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="mx-auto max-w-7xl px-6 pt-28 pb-16 lg:pt-32 lg:pb-20">
          <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
            <div className="max-w-xl">
              <p className="mb-4 text-sm font-semibold uppercase tracking-[0.2em] text-primary">
                Real Estate Deal Analysis
              </p>
              <h1 className="text-4xl font-bold leading-[1.05] tracking-tight text-foreground sm:text-5xl lg:text-6xl">
                Analyze Real Estate Deals Like a Pro
              </h1>
              <p className="mt-5 max-w-md text-lg text-muted-foreground">
                Underwrite faster. Model smarter. Make better deal decisions.
              </p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Link
                  href="/login"
                  className="inline-flex h-12 items-center justify-center rounded-lg bg-primary px-6 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
                >
                  Start Analyzing Deals
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
                <Link
                  href="/calculators"
                  className="inline-flex h-12 items-center justify-center rounded-lg border border-input bg-transparent px-6 text-sm font-semibold text-foreground transition-colors hover:bg-secondary"
                >
                  View Calculators
                </Link>
              </div>
            </div>

            <div className="relative">
              <div className="overflow-hidden rounded-2xl border border-border shadow-xl shadow-black/30">
                <Image
                  src="/screenshots/dealflow-hero.jpg"
                  alt="DealFlow deal analysis screen - 123 Market Street"
                  width={832}
                  height={468}
                  className="h-auto w-full"
                  priority
                />
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

            <div className="rounded-xl border border-border bg-card p-6">
              <h3 className="text-base font-semibold text-foreground">Pro</h3>
              <p className="text-sm text-muted-foreground">For serious dealmakers.</p>
              <div className="mt-3 flex items-baseline gap-1">
                <span className="text-3xl font-bold text-foreground">$79</span>
                <span className="text-sm text-muted-foreground">/mo</span>
              </div>
              <ul className="mt-4 space-y-2">
                {proFeatures.map((item) => (
                  <li key={item} className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Check className="h-3.5 w-3.5 text-primary" />
                    {item}
                  </li>
                ))}
              </ul>
              <Link
                href="/pricing"
                className="mt-5 block w-full rounded-lg bg-primary py-2.5 text-center text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
              >
                Start Free Trial
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Stats strip */}
      <section className="border-t border-border">
        <div className="mx-auto max-w-7xl px-6 py-10">
          <div className="grid grid-cols-2 gap-6 lg:grid-cols-4">
            {stats.map((stat) => (
              <div key={stat.label} className="flex items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-primary/25 bg-primary/10">
                  <stat.icon className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <div className="text-xl font-bold text-foreground">{stat.value}</div>
                  <div className="text-sm text-muted-foreground">{stat.label}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Calculators strip */}
      <section className="border-t border-border bg-card/40">
        <div className="mx-auto max-w-7xl px-6 py-14">
          <div className="flex items-baseline justify-between">
            <h2 className="text-xl font-semibold text-foreground">Free Investment Calculators</h2>
            <Link href="/calculators" className="text-sm font-medium text-emerald-400 hover:text-emerald-300">
              View all tools
            </Link>
          </div>
          <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-6">
            {calculators.map((calc) => (
              <Link
                key={calc.title}
                href={calculatorHrefs[calc.title]}
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
                Make data-driven decisions with DealFlow&apos;s powerful analysis platform. Get started in minutes.
              </p>
            </div>
            <Link
              href="/login"
              className="inline-flex h-12 shrink-0 items-center justify-center rounded-lg bg-primary px-6 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
            >
              Start Analyzing Deals
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border">
        <div className="mx-auto max-w-7xl px-6 py-10">
          <div className="flex flex-col items-start justify-between gap-6 sm:flex-row sm:items-center">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
                <Calculator className="h-4 w-4 text-primary-foreground" />
              </div>
              <span className="font-semibold text-foreground">DealFlow</span>
            </div>
            <div className="flex items-center gap-6 text-sm text-muted-foreground">
              <Link href="/calculators" className="hover:text-foreground">Calculators</Link>
              <Link href="/pricing" className="hover:text-foreground">Pricing</Link>
              <Link href="/terms" className="hover:text-foreground">Terms</Link>
              <Link href="/privacy" className="hover:text-foreground">Privacy</Link>
              <Link href="/login" className="hover:text-foreground">Sign In</Link>
            </div>
            <div className="text-sm text-muted-foreground">
              © {new Date().getFullYear()} DealFlow. Investment analysis for real estate teams.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
