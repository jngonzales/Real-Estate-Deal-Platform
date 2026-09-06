import { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "@/components/ui/icons";
import { Button } from "@/components/ui/button";
import { PublicHeader } from "@/components/layout/public-header";
import { PublicFooter } from "@/components/layout/public-footer";
import { ArvGlyph, RepairGlyph, RoiGlyph, MaoGlyph, ExchangeGlyph, FinancingGlyph } from "@/components/brand";
import { CalculatorFrame, CalculatorHeading, worksheetAction } from "./_components/worksheet";

export const metadata: Metadata = {
  title: "Free Real Estate Calculators | LotMerit",
  description: "Free professional real estate investment calculators. Calculate ARV, repair costs, ROI, maximum allowable offer, 1031 exchange, and financing options. No login required.",
  keywords: ["real estate calculator", "ARV calculator", "ROI calculator", "MAO calculator", "repair estimator", "1031 exchange calculator", "financing calculator", "investment analysis"],
};

const calculatorGroups = [
  {
    id: "evaluate",
    title: "Evaluate a deal",
    tools: [
      { title: "ARV calculator", description: "Estimate after-repair value from comparable sales.", icon: ArvGlyph, href: "/calculators/arv" },
      { title: "Repair estimator", description: "Price repairs by category and add a contingency.", icon: RepairGlyph, href: "/calculators/repairs" },
      { title: "MAO calculator", description: "Find a maximum offer based on costs and target profit.", icon: MaoGlyph, href: "/calculators/mao" },
      { title: "ROI calculator", description: "Estimate flip profit and rental cash flow.", icon: RoiGlyph, href: "/calculators/roi" },
    ],
  },
  {
    id: "finance",
    title: "Plan a purchase or sale",
    tools: [
      { title: "Financing calculator", description: "Compare payments and costs for four types of loans.", icon: FinancingGlyph, href: "/calculators/financing" },
      { title: "1031 exchange analyzer", description: "Estimate tax deferral and track exchange deadlines.", icon: ExchangeGlyph, href: "/calculators/1031" },
    ],
  },
];

export default function PublicCalculatorsPage() {
  return (
    <div className="min-h-screen bg-background">
      <a href="#calculator-content" className="lm-skip-link">Skip to content</a>
      <PublicHeader variant="marketing" />
      <CalculatorFrame id="calculator-content">
        <CalculatorHeading title="Real estate calculators" description="Estimate property value, repair costs, and returns. No account required." />
        <div className="grid items-start gap-7 lg:grid-cols-[minmax(0,3fr)_minmax(0,2fr)] lg:gap-12">
          {calculatorGroups.map(({ id, title, tools }) => (
            <section key={id} aria-labelledby={id} className="min-w-0">
              <h2 id={id} className="mb-3 text-xl font-semibold tracking-tight">{title}</h2>
              <ul className="divide-y divide-border border-y border-border">
                {tools.map(({ title, description, icon: Icon, href }) => (
                  <li key={href}>
                    <Link
                      href={href}
                      className="group grid min-h-16 grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3 px-2 py-3 hover:bg-accent/40 focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-ring sm:px-3"
                    >
                      <Icon aria-hidden="true" className="size-5 text-primary" />
                      <div>
                        <span className="font-semibold">{title}</span>
                        <p className="mt-0.5 text-sm text-muted-foreground">{description}</p>
                      </div>
                      <ArrowRight aria-hidden="true" className="size-4 text-muted-foreground group-hover:text-primary" />
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>
        <section className="mt-8 flex flex-wrap items-center justify-between gap-4 rounded-lg border border-border bg-card p-4 sm:p-6">
          <div>
            <h2 className="text-lg font-semibold">Save your analysis</h2>
            <p className="mt-1 text-sm text-muted-foreground">Create a free account to save calculations and manage your deals.</p>
          </div>
          <Button asChild className={worksheetAction}>
            <Link href="/login">Create free account</Link>
          </Button>
        </section>
      </CalculatorFrame>
      <PublicFooter />
    </div>
  );
}
