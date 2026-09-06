import { Metadata } from "next";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowRight, CheckCircle } from "@/components/ui/icons";
import { PublicHeader } from "@/components/layout/public-header";
import { PublicFooter } from "@/components/layout/public-footer";
import {
  ArvGlyph,
  RepairGlyph,
  RoiGlyph,
  MaoGlyph,
  ExchangeGlyph,
  FinancingGlyph,
  CalculatorGlyph,
} from "@/components/brand";

export const metadata: Metadata = {
  title: "Free Real Estate Calculators | DealFlow",
  description: "Free professional real estate investment calculators. Calculate ARV, repair costs, ROI, maximum allowable offer, 1031 exchange, and financing options. No login required.",
  keywords: ["real estate calculator", "ARV calculator", "ROI calculator", "MAO calculator", "repair estimator", "1031 exchange calculator", "financing calculator", "investment analysis"],
};

const calculators = [
  {
    title: "ARV Calculator",
    description: "Calculate After Repair Value using comparable sales and market data",
    icon: ArvGlyph,
    href: "/calculators/arv",
    features: ["Comparable sales analysis", "Price per square foot", "Income approach"],
  },
  {
    title: "Repair Estimator",
    description: "Estimate repair costs by category with regional pricing",
    icon: RepairGlyph,
    href: "/calculators/repairs",
    features: ["30+ repair items", "Low/Mid/High estimates", "Scope templates"],
  },
  {
    title: "ROI Calculator",
    description: "Calculate returns for flip, rental, and BRRRR strategies",
    icon: RoiGlyph,
    href: "/calculators/roi",
    features: ["Cash-on-cash return", "Cap rate analysis", "Multiple exit strategies"],
  },
  {
    title: "MAO Calculator",
    description: "Find your Maximum Allowable Offer with multiple formulas",
    icon: MaoGlyph,
    href: "/calculators/mao",
    features: ["70% rule", "Custom profit margins", "Deal verdict scoring"],
  },
  {
    title: "1031 Exchange Analyzer",
    description: "Calculate tax deferral and replacement property requirements",
    icon: ExchangeGlyph,
    href: "/calculators/1031",
    features: ["Tax savings calculator", "180-day timeline tracker", "Replacement property matcher"],
  },
  {
    title: "Financing Calculator",
    description: "Compare Hard Money, Conventional, DSCR, and Private Money loans",
    icon: FinancingGlyph,
    href: "/calculators/financing",
    features: ["Compare 4 loan types", "DSCR ratio analysis", "Monthly payment breakdown"],
  },
];

export default function PublicCalculatorsPage() {
  return (
    <div className="min-h-screen bg-background">
      <PublicHeader variant="marketing" />

      {/* Hero */}
      <section className="container mx-auto px-4 py-16 text-center">
        <div className="mx-auto max-w-3xl">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-4 py-2 text-sm text-primary">
            <CalculatorGlyph className="h-4 w-4" />
            Free Professional Calculators
          </div>
          <h1 className="mb-6 text-4xl font-bold text-foreground md:text-5xl">
            Real Estate Investment{" "}
            <span className="text-primary">Calculators</span>
          </h1>
          <p className="mb-8 text-xl text-muted-foreground">
            Professional-grade analysis tools for individual investors and small acquisition teams.
            No login required — start underwriting a deal in under a minute.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            {["ARV", "Repairs", "ROI", "MAO", "1031", "Financing"].map((calc) => (
              <div key={calc} className="flex items-center gap-2 text-muted-foreground">
                <CheckCircle className="h-4 w-4 text-primary" />
                {calc} Calculator
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Calculator Grid */}
      <section className="container mx-auto px-4 pb-16">
        <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
          {calculators.map((calc) => {
            const Icon = calc.icon;
            return (
              <Link key={calc.title} href={calc.href}>
                <Card className="group h-full cursor-pointer border-border bg-card transition-colors hover:border-primary/40">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="rounded-xl bg-primary/10 p-3 text-primary">
                        <Icon className="h-6 w-6" />
                      </div>
                      <ArrowRight className="h-5 w-5 text-muted-foreground transition-all group-hover:translate-x-1 group-hover:text-primary" />
                    </div>
                    <CardTitle className="mt-4 text-foreground">{calc.title}</CardTitle>
                    <CardDescription className="text-muted-foreground">{calc.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {calc.features.map((feature) => (
                        <li key={feature} className="flex items-center gap-2 text-sm text-muted-foreground">
                          <CheckCircle className="h-4 w-4 text-primary" />
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 pb-16">
        <Card className="mx-auto max-w-3xl border-primary/30 bg-primary/5">
          <CardContent className="py-8 text-center">
            <h2 className="mb-4 text-2xl font-bold text-foreground">
              Ready to manage your entire deal flow?
            </h2>
            <p className="mb-6 text-muted-foreground">
              Create a free account to save your calculations, collaborate with your team,
              and access advanced features like deal pipeline, approval workflows, and more.
            </p>
            <Button size="lg" asChild>
              <Link href="/login">
                Create Free Account
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </CardContent>
        </Card>
      </section>

      <PublicFooter />
    </div>
  );
}
