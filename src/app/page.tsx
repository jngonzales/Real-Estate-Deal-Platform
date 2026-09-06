import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { LandingNav } from "@/components/layout/landing-nav";
import {
  BrandMark,
  ArvGlyph,
  RepairGlyph,
  RoiGlyph,
  MaoGlyph,
  ExchangeGlyph,
  FinancingGlyph,
} from "@/components/brand";

export const metadata: Metadata = {
  title: "LotMerit | Real Estate Deal Analysis Platform",
  description: "Estimate property value, repair costs, and returns with free real estate calculators. Track offers and underwriting with your team in LotMerit.",
  keywords: ["real estate analysis", "deal analysis", "ARV calculator", "investment calculator", "real estate investing", "deal flow management"],
};

const calculators = [
  { title: "ARV Calculator", description: "Estimate after-repair value from comparable sales.", icon: ArvGlyph, href: "/calculators/arv" },
  { title: "Repair Estimator", description: "Estimate repair costs across 30+ categories.", icon: RepairGlyph, href: "/calculators/repairs" },
  { title: "ROI Calculator", description: "Estimate flip and rental returns.", icon: RoiGlyph, href: "/calculators/roi" },
  { title: "MAO Calculator", description: "Calculate your maximum allowable offer.", icon: MaoGlyph, href: "/calculators/mao" },
  { title: "1031 Exchange", description: "Estimate tax deferral savings.", icon: ExchangeGlyph, href: "/calculators/1031" },
  { title: "Financing", description: "Compare loans and payments.", icon: FinancingGlyph, href: "/calculators/financing" },
];

const proFeatures = [
  "Unlimited deals",
  "Advanced calculators",
  "Exports and reports",
  "Priority support",
];

const footerLinks = [
  { label: "Calculators", href: "/calculators" },
  { label: "Pricing", href: "/pricing" },
  { label: "Terms", href: "/terms" },
  { label: "Privacy", href: "/privacy" },
  { label: "Sign in", href: "/login" },
];

const frameClass = "mx-auto max-w-7xl px-4 sm:px-6 lg:px-8";
const focusClass = "focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring";
const actionClass =
  "inline-flex min-h-11 items-center justify-center rounded-lg px-4 py-2 text-sm font-semibold transition-colors duration-150 motion-safe:active:scale-[0.97] sm:px-5";

function ExampleProperty() {
  return (
    <figure className="mt-6 grid min-w-0 overflow-hidden rounded-lg border border-border bg-card lg:grid-cols-[minmax(0,2.3fr)_minmax(0,1fr)]">
      <div className="relative aspect-[3/2] min-w-0 sm:aspect-[2/1]">
        <Image
          src="/example-property.webp"
          alt="Single-story cream house with a front porch and a green front door."
          sizes="(min-width: 1280px) 850px, (min-width: 1024px) 66vw, 94vw"
          fill
          preload
          className="object-cover"
        />
      </div>
      <figcaption className="flex min-w-0 flex-col justify-center gap-4 border-t border-border p-5 sm:p-6 lg:border-s lg:border-t-0 lg:p-7">
        <div>
          <p className="text-sm font-medium text-muted-foreground">Example deal</p>
          <h2 className="mt-1 text-2xl font-semibold tracking-tight">214 Cedar Lane</h2>
          <p className="mt-1 text-sm text-muted-foreground">1,420 sq ft single-family home</p>
        </div>
        <dl className="space-y-2 border-y border-border py-3 text-sm tabular-nums">
          <div className="flex justify-between gap-3">
            <dt className="text-muted-foreground">After-repair value</dt>
            <dd className="font-medium">$244,200</dd>
          </div>
          <div className="flex justify-between gap-3">
            <dt className="text-muted-foreground">Repairs</dt>
            <dd className="font-medium">$31,500</dd>
          </div>
          <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1 pt-1">
            <dt className="font-medium">Maximum offer</dt>
            <dd className="text-2xl font-semibold tracking-tight text-primary">$135,324</dd>
          </div>
        </dl>
        <p className="text-xs leading-relaxed text-muted-foreground">
          Assumes 20% target profit, 8% closing costs, and $9,000 in holding costs.
        </p>
      </figcaption>
    </figure>
  );
}

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background font-sans text-foreground">
      <a href="#home-content" className="lm-skip-link">Skip to content</a>
      <LandingNav />

      <main id="home-content" tabIndex={-1} className={frameClass}>
        <section aria-labelledby="home-heading" className="py-8 sm:py-10 lg:py-12">
          <div className="grid items-end gap-5 lg:grid-cols-[minmax(0,1fr)_max-content] lg:gap-x-8">
            <div className="min-w-0">
              <h1 id="home-heading" className="lm-display text-[clamp(2.5rem,5.5vw,4.5rem)] leading-[1.1] font-semibold tracking-tight">
                Know what to offer.
              </h1>
              <p className="mt-3 max-w-[55ch] text-base leading-relaxed text-muted-foreground sm:text-lg">
                Estimate property value, repair costs, and returns before you make an offer.
              </p>
            </div>
            <div className="flex flex-wrap gap-2 sm:gap-3">
              <Link href="/calculators" className={`${actionClass} ${focusClass} bg-primary text-primary-foreground hover:bg-primary/90`}>
                Browse calculators
              </Link>
              <Link href="/login" className={`${actionClass} ${focusClass} border border-input bg-card hover:bg-accent`}>
                Start free
              </Link>
            </div>
          </div>
          <ExampleProperty />
        </section>

        <div className="grid gap-9 border-t border-border py-9 sm:py-12 lg:grid-cols-[minmax(0,1.45fr)_minmax(0,1fr)] lg:gap-14">
          <section aria-labelledby="calculator-heading" className="min-w-0">
            <div className="mb-2 flex flex-wrap items-baseline justify-between gap-x-4">
              <h2 id="calculator-heading" className="lm-display text-3xl font-semibold tracking-tight">Free investment calculators</h2>
            </div>
            <ul className="divide-y divide-border border-y border-border">
              {calculators.map((calculator) => (
                <li key={calculator.href}>
                  <Link
                    href={calculator.href}
                    className={`${focusClass} grid min-h-11 grid-cols-[1.25rem_minmax(0,1fr)] items-center gap-x-3 gap-y-0.5 py-3 text-sm hover:bg-accent/50 sm:grid-cols-[1.25rem_minmax(9rem,0.7fr)_minmax(0,1fr)]`}
                  >
                    <calculator.icon className="col-start-1 row-start-1 size-5 text-primary" aria-hidden="true" />
                    <span className="col-start-2 font-medium">{calculator.title}</span>
                    <span className="col-start-2 text-muted-foreground sm:col-start-3 sm:row-start-1">{calculator.description}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </section>

          <section aria-labelledby="analysis-heading" className="min-w-0">
            <h2 id="analysis-heading" className="lm-display text-3xl font-semibold tracking-tight">Work through a deal with your team</h2>
            <dl className="mt-4 divide-y divide-border border-y border-border text-sm">
              <div className="py-3">
                <dt className="font-medium">Submit a property</dt>
                <dd className="mt-1 text-muted-foreground">Record the address, asking price, and property details.</dd>
              </div>
              <div className="py-3">
                <dt className="font-medium">Underwrite the deal</dt>
                <dd className="mt-1 text-muted-foreground">Save your value estimate, repair budget, and maximum offer.</dd>
              </div>
              <div className="py-3">
                <dt className="font-medium">Track the offer</dt>
                <dd className="mt-1 text-muted-foreground">See which deals are under review, in contract, or closed.</dd>
              </div>
            </dl>
          </section>
        </div>

        <section aria-labelledby="pro-heading" className="border-t border-border py-9 sm:py-12">
          <div className="grid items-center gap-5 rounded-lg border border-border bg-card p-5 sm:p-6 lg:grid-cols-[max-content_minmax(0,1fr)_max-content] lg:gap-10">
            <div>
              <h2 id="pro-heading" className="lm-display text-3xl font-semibold tracking-tight">Pro</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                <span className="text-2xl font-semibold tracking-tight text-foreground tabular-nums">$79</span>/mo
              </p>
            </div>
            <ul className="grid gap-x-6 gap-y-2 text-sm text-muted-foreground sm:grid-cols-2 lg:max-w-md">
              {proFeatures.map((feature) => <li key={feature}>{feature}</li>)}
            </ul>
            <Link href="/pricing" className={`${actionClass} ${focusClass} justify-self-start border border-input hover:bg-accent`}>
              Start free trial
            </Link>
          </div>
        </section>
      </main>

      <footer className="border-t border-border">
        <div className={`${frameClass} flex flex-wrap items-center justify-between gap-x-6 gap-y-3 py-5`}>
          <BrandMark />
          <nav aria-label="Footer" className="flex flex-wrap gap-x-4 text-sm text-muted-foreground">
            {footerLinks.map((link) => (
              <Link key={link.href} href={link.href} className={`${focusClass} inline-flex min-h-11 items-center hover:text-foreground`}>
                {link.label}
              </Link>
            ))}
          </nav>
          <p className="text-sm text-muted-foreground">© {new Date().getFullYear()} LotMerit.</p>
        </div>
      </footer>
    </div>
  );
}
