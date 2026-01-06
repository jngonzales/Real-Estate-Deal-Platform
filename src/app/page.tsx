import Link from "next/link";
import { Metadata } from "next";
import { 
  Calculator, 
  Home, 
  Hammer, 
  TrendingUp, 
  Target,
  ArrowRight,
  CheckCircle,
  Users,
  Shield,
  Zap,
  BarChart3,
  FileText,
  CreditCard,
} from "lucide-react";

export const metadata: Metadata = {
  title: "DealFlow | Free Real Estate Deal Analysis Platform",
  description: "Analyze real estate deals like a pro. Free investment calculators, ARV analysis, repair estimators, and team collaboration tools for real estate investors.",
  keywords: ["real estate analysis", "deal analysis", "ARV calculator", "investment calculator", "real estate investing", "deal flow management"],
};

const calculators = [
  {
    title: "ARV Calculator",
    description: "Calculate After Repair Value using comparable sales",
    icon: Home,
    href: "/calculators/arv",
    color: "from-blue-500 to-cyan-500",
  },
  {
    title: "Repair Estimator",
    description: "Estimate repair costs with 30+ categories",
    icon: Hammer,
    href: "/calculators/repairs",
    color: "from-orange-500 to-amber-500",
  },
  {
    title: "ROI Calculator",
    description: "Calculate returns for flip & rental strategies",
    icon: TrendingUp,
    href: "/calculators/roi",
    color: "from-green-500 to-emerald-500",
  },
  {
    title: "MAO Calculator",
    description: "Find Maximum Allowable Offer for any deal",
    icon: Target,
    href: "/calculators/mao",
    color: "from-purple-500 to-pink-500",
  },
  {
    title: "1031 Exchange",
    description: "Calculate tax savings with 1031 exchange",
    icon: FileText,
    href: "/calculators/1031",
    color: "from-indigo-500 to-violet-500",
  },
  {
    title: "Financing",
    description: "Compare loan options and monthly payments",
    icon: CreditCard,
    href: "/calculators/financing",
    color: "from-teal-500 to-emerald-500",
  },
];

const features = [
  {
    icon: Calculator,
    title: "Pro-Level Calculators",
    description: "6 professional calculators used by top investors. ARV, MAO, ROI, repairs, financing, and 1031 analysis.",
  },
  {
    icon: BarChart3,
    title: "AI Deal Scoring",
    description: "Get an instant 1-100 score on any deal with AI-powered analysis of property, financials, and market factors.",
  },
  {
    icon: Users,
    title: "Team Collaboration",
    description: "Agents submit deals, underwriters analyze, and investors approve. Full workflow management.",
  },
  {
    icon: Shield,
    title: "Enterprise-Grade Security",
    description: "Bank-level encryption for your deal data. Secure authentication and role-based access controls.",
  },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-slate-950">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-slate-800 bg-slate-950/80 backdrop-blur-lg">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-purple-600">
              <Calculator className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-bold text-white">DealFlow</span>
          </Link>
          <div className="flex items-center gap-4">
            <Link 
              href="/calculators" 
              className="text-sm font-medium text-slate-300 hover:text-white"
            >
              Calculators
            </Link>
            <Link 
              href="/login" 
              className="text-sm font-medium text-slate-300 hover:text-white"
            >
              Sign In
            </Link>
            <Link 
              href="/login" 
              className="rounded-lg bg-gradient-to-r from-blue-500 to-purple-600 px-4 py-2 text-sm font-medium text-white hover:opacity-90"
            >
              Get Started Free
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-32 pb-20">
        {/* Background Gradient */}
        <div className="absolute inset-0 bg-gradient-to-b from-blue-500/10 via-purple-500/5 to-transparent" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[600px] w-[600px] rounded-full bg-blue-500/20 blur-[120px]" />
        
        <div className="relative mx-auto max-w-7xl px-6">
          <div className="text-center">
            <div className="mb-6 inline-flex items-center rounded-full border border-blue-500/30 bg-blue-500/10 px-4 py-2 text-sm text-blue-400">
              <Zap className="mr-2 h-4 w-4" />
              Professional Real Estate Analysis Tools
            </div>
            <h1 className="text-5xl font-bold leading-tight tracking-tight text-white sm:text-6xl lg:text-7xl">
              Analyze Real Estate Deals
              <br />
              <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                Like a Pro
              </span>
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-lg text-slate-400">
              Professional-grade investment analysis for real estate teams. Fast calculations. Better decisions. Smarter deals.
            </p>
            <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Link
                href="/calculators"
                className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-blue-500 to-purple-600 px-8 py-4 text-lg font-medium text-white shadow-lg shadow-blue-500/25 hover:opacity-90"
              >
                <Calculator className="h-5 w-5" />
                Use Free Calculators
                <ArrowRight className="h-5 w-5" />
              </Link>
              <Link
                href="/login"
                className="flex items-center gap-2 rounded-lg border border-slate-700 bg-slate-900 px-8 py-4 text-lg font-medium text-white hover:border-slate-600 hover:bg-slate-800"
              >
                Start Team Dashboard
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Calculator Grid */}
      <section className="relative py-20 bg-slate-900/50">
        <div className="mx-auto max-w-7xl px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-white sm:text-4xl">
              Free Investment Calculators
            </h2>
            <p className="mt-4 text-lg text-slate-400">
              Professional-grade tools • No login required • Use instantly
            </p>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {calculators.map((calc) => (
              <Link
                key={calc.title}
                href={calc.href}
                className="group relative overflow-hidden rounded-2xl border border-slate-800 bg-slate-900 p-6 hover:border-slate-700 transition-all hover:shadow-xl hover:shadow-blue-500/10"
              >
                <div className="absolute top-0 right-0 h-32 w-32 translate-x-8 -translate-y-8 rounded-full bg-gradient-to-br opacity-20 blur-2xl transition-opacity group-hover:opacity-40"
                  style={{ backgroundImage: `linear-gradient(to bottom right, var(--tw-gradient-stops))` }}
                />
                <div className={`inline-flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br ${calc.color}`}>
                  <calc.icon className="h-6 w-6 text-white" />
                </div>
                <h3 className="mt-4 text-lg font-semibold text-white group-hover:text-blue-400 transition-colors">
                  {calc.title}
                </h3>
                <p className="mt-2 text-sm text-slate-400">
                  {calc.description}
                </p>
                <div className="mt-4 flex items-center text-sm font-medium text-blue-400">
                  Use Calculator
                  <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-20">
        <div className="mx-auto max-w-7xl px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-white sm:text-4xl">
              Everything You Need for Deal Analysis
            </h2>
            <p className="mt-4 text-lg text-slate-400">
              More than calculators. A complete platform for real estate teams.
            </p>
          </div>
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {features.map((feature) => (
              <div key={feature.title} className="text-center">
                <div className="mx-auto inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500/20 to-purple-500/20 border border-blue-500/30">
                  <feature.icon className="h-7 w-7 text-blue-400" />
                </div>
                <h3 className="mt-4 text-lg font-semibold text-white">
                  {feature.title}
                </h3>
                <p className="mt-2 text-sm text-slate-400">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Social Proof */}
      <section className="py-20 bg-slate-900/50">
        <div className="mx-auto max-w-7xl px-6">
          <div className="rounded-3xl border border-slate-800 bg-gradient-to-br from-slate-900 to-slate-950 p-8 sm:p-12">
            <div className="grid gap-8 sm:grid-cols-3 text-center">
              <div>
                <div className="text-4xl font-bold text-white">10,000+</div>
                <div className="mt-2 text-slate-400">Deals Analyzed</div>
              </div>
              <div>
                <div className="text-4xl font-bold text-white">$2.5B+</div>
                <div className="mt-2 text-slate-400">Property Value Calculated</div>
              </div>
              <div>
                <div className="text-4xl font-bold text-white">500+</div>
                <div className="mt-2 text-slate-400">Active Teams</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="mx-auto max-w-3xl px-6 text-center">
          <h2 className="text-3xl font-bold text-white sm:text-4xl">
            Start Analyzing Deals Today
          </h2>
          <p className="mt-4 text-lg text-slate-400">
            Make data-driven decisions with DealFlow&apos;s powerful analysis platform.
            Get started in minutes.
          </p>
          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link
              href="/calculators"
              className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-blue-500 to-purple-600 px-8 py-4 text-lg font-medium text-white shadow-lg shadow-blue-500/25 hover:opacity-90"
            >
              <Calculator className="h-5 w-5" />
              Try Calculators
            </Link>
            <Link
              href="/login"
              className="flex items-center gap-2 rounded-lg border border-slate-700 bg-slate-900 px-8 py-4 text-lg font-medium text-white hover:border-slate-600 hover:bg-slate-800"
            >
              Get Started
              <ArrowRight className="h-5 w-5" />
            </Link>
          </div>
          <div className="mt-8 flex items-center justify-center gap-6 text-sm text-slate-400">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-400" />
              Quick setup
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-400" />
              Full-featured platform
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-400" />
              Instant access
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-800 bg-slate-950 py-12">
        <div className="mx-auto max-w-7xl px-6">
          <div className="flex flex-col items-center justify-between gap-6 sm:flex-row">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-purple-600">
                <Calculator className="h-4 w-4 text-white" />
              </div>
              <span className="font-semibold text-white">DealFlow</span>
            </div>
            <div className="flex items-center gap-6 text-sm text-slate-400">
              <Link href="/calculators" className="hover:text-white">Calculators</Link>
              <Link href="/terms" className="hover:text-white">Terms</Link>
              <Link href="/privacy" className="hover:text-white">Privacy</Link>
              <Link href="/login" className="hover:text-white">Sign In</Link>
            </div>
            <div className="text-sm text-slate-500">
              © {new Date().getFullYear()} DealFlow. Investment analysis for real estate teams.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
