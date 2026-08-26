import { Metadata } from "next";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Calculator, 
  Home, 
  Hammer, 
  TrendingUp, 
  Target,
  ArrowRight,
  Sparkles,
  CheckCircle,
  FileText,
  CreditCard,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Free Real Estate Calculators | DealFlow",
  description: "Free professional real estate investment calculators. Calculate ARV, repair costs, ROI, maximum allowable offer, 1031 exchange, and financing options. No login required.",
  keywords: ["real estate calculator", "ARV calculator", "ROI calculator", "MAO calculator", "repair estimator", "1031 exchange calculator", "financing calculator", "investment analysis"],
};

const calculators = [
  {
    title: "ARV Calculator",
    description: "Calculate After Repair Value using comparable sales and market data",
    icon: Home,
    href: "/calculators/arv",
    color: "from-emerald-500 to-emerald-600",
    features: ["Comparable sales analysis", "Price per square foot", "Income approach"],
  },
  {
    title: "Repair Estimator",
    description: "Estimate repair costs by category with regional pricing",
    icon: Hammer,
    href: "/calculators/repairs",
    color: "from-emerald-500 to-emerald-600",
    features: ["30+ repair items", "Low/Mid/High estimates", "Scope templates"],
  },
  {
    title: "ROI Calculator",
    description: "Calculate returns for flip, rental, and BRRRR strategies",
    icon: TrendingUp,
    href: "/calculators/roi",
    color: "from-emerald-500 to-emerald-600",
    features: ["Cash-on-cash return", "Cap rate analysis", "Multiple exit strategies"],
  },
  {
    title: "MAO Calculator",
    description: "Find your Maximum Allowable Offer with multiple formulas",
    icon: Target,
    href: "/calculators/mao",
    color: "from-emerald-500 to-emerald-600",
    features: ["70% rule", "Custom profit margins", "Deal verdict scoring"],
  },
  {
    title: "1031 Exchange Analyzer",
    description: "Calculate tax deferral and replacement property requirements",
    icon: FileText,
    href: "/calculators/1031",
    color: "from-emerald-500 to-emerald-600",
    features: ["Tax savings calculator", "180-day timeline tracker", "Replacement property matcher"],
  },
  {
    title: "Financing Calculator",
    description: "Compare Hard Money, Conventional, DSCR, and Private Money loans",
    icon: CreditCard,
    href: "/calculators/financing",
    color: "from-cyan-500 to-emerald-500",
    features: ["Compare 4 loan types", "DSCR ratio analysis", "Monthly payment breakdown"],
  },
];

export default function PublicCalculatorsPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-white/10 bg-card/80 backdrop-blur-xl sticky top-0 z-50">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
              <Sparkles className="h-4 w-4 text-white" />
            </div>
            <span className="font-bold text-white">DealFlow</span>
          </Link>
          <div className="flex items-center gap-4">
            <Button variant="ghost" className="text-foreground/90 hover:text-white" asChild>
              <Link href="/login">Log in</Link>
            </Button>
            <Button className="bg-primary" asChild>
              <Link href="/login">Get Started Free</Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="container mx-auto px-4 py-16 text-center">
        <div className="max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm mb-6">
            <Calculator className="w-4 h-4" />
            Free Professional Calculators
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Real Estate Investment{" "}
            <span className="bg-primary bg-clip-text text-transparent">
              Calculators
            </span>
          </h1>
          <p className="text-xl text-muted-foreground mb-8">
            Professional-grade analysis tools used by thousands of real estate investors. 
            No login required. Start analyzing deals in seconds.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            {["ARV", "Repairs", "ROI", "MAO", "1031", "Financing"].map((calc) => (
              <div key={calc} className="flex items-center gap-2 text-muted-foreground">
                <CheckCircle className="w-4 h-4 text-green-500" />
                {calc} Calculator
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Calculator Grid */}
      <section className="container mx-auto px-4 pb-16">
        <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
          {calculators.map((calc) => (
            <Link key={calc.title} href={calc.href}>
              <Card className="group cursor-pointer overflow-hidden transition-all hover:shadow-xl hover:shadow-primary/10 hover:-translate-y-1 bg-secondary/50 border-white/10 h-full">
                <div className={`h-1.5 ${calc.color}`} />
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className={`p-3 rounded-xl ${calc.color} text-white`}>
                      <calc.icon className="w-6 h-6" />
                    </div>
                    <ArrowRight className="w-5 h-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
                  </div>
                  <CardTitle className="mt-4 text-white">{calc.title}</CardTitle>
                  <CardDescription className="text-muted-foreground">{calc.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {calc.features.map((feature) => (
                      <li key={feature} className="flex items-center gap-2 text-sm text-muted-foreground">
                        <CheckCircle className="w-4 h-4 text-green-500" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 pb-16">
        <Card className="bg-primary/10 border border-primary/30 max-w-3xl mx-auto">
          <CardContent className="py-8 text-center">
            <h2 className="text-2xl font-bold text-white mb-4">
              Ready to manage your entire deal flow?
            </h2>
            <p className="text-foreground/90 mb-6">
              Create a free account to save your calculations, collaborate with your team, 
              and access advanced features like deal pipeline, approval workflows, and more.
            </p>
            <Button size="lg" className="bg-primary" asChild>
              <Link href="/login">
                Create Free Account
                <ArrowRight className="w-4 h-4 ml-2" />
              </Link>
            </Button>
          </CardContent>
        </Card>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/10 py-8">
        <div className="container mx-auto px-4 text-center text-muted-foreground text-sm">
          <p>© 2025 DealFlow. Professional real estate investment analysis platform.</p>
        </div>
      </footer>
    </div>
  );
}
