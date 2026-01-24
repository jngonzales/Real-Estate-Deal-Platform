"use client";

import { useState, useEffect, useCallback, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { 
  Check, 
  X, 
  Zap, 
  Calculator, 
  ArrowRight,
  Sparkles,
  Shield,
  Users,
  Crown,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { getStripe } from "@/lib/stripe-client";

const plans = [
  {
    id: "free",
    name: "Free",
    description: "Get started with basic features",
    price: 0,
    interval: "forever",
    popular: false,
    icon: Calculator,
    features: [
      { text: "5 deals per month", included: true },
      { text: "Basic calculators", included: true },
      { text: "Email support", included: true },
      { text: "Single user", included: true },
      { text: "AI deal scoring", included: false },
      { text: "Custom formulas", included: false },
      { text: "Team collaboration", included: false },
      { text: "API access", included: false },
    ],
    cta: "Get Started",
    href: "/login",
  },
  {
    id: "pro",
    name: "Pro",
    description: "For serious investors",
    price: 49,
    interval: "month",
    popular: true,
    icon: Zap,
    features: [
      { text: "Unlimited deals", included: true },
      { text: "All calculators", included: true },
      { text: "Priority support", included: true },
      { text: "Up to 5 team members", included: true },
      { text: "AI deal scoring (100/mo)", included: true },
      { text: "Custom formulas (20)", included: true },
      { text: "Advanced analytics", included: true },
      { text: "PDF exports", included: true },
    ],
    cta: "Start Pro Trial",
    href: null, // Will use Stripe checkout
  },
  {
    id: "enterprise",
    name: "Enterprise",
    description: "For teams and organizations",
    price: 149,
    interval: "month",
    popular: false,
    icon: Crown,
    features: [
      { text: "Everything in Pro", included: true },
      { text: "Unlimited team members", included: true },
      { text: "Dedicated support", included: true },
      { text: "Unlimited AI scoring", included: true },
      { text: "Unlimited formulas", included: true },
      { text: "Custom integrations", included: true },
      { text: "White-label options", included: true },
      { text: "API access + webhooks", included: true },
    ],
    cta: "Contact Sales",
    href: "mailto:sales@dealflow.app",
  },
];

// Inner component that uses useSearchParams
function PricingContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState<string | null>(null);
  const [autoCheckoutAttempted, setAutoCheckoutAttempted] = useState(false);

  const handleCheckout = useCallback(async (planId: string) => {
    setLoading(planId);
    
    try {
      const response = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          planType: planId,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 401) {
          // Not logged in, redirect to login first
          router.push(`/login?redirect=/pricing&plan=${planId}`);
          return;
        }
        throw new Error(data.error || "Failed to create checkout session");
      }

      // Redirect to Stripe Checkout
      if (data.url) {
        window.location.href = data.url;
      } else if (data.sessionId) {
        const stripe = await getStripe();
        if (stripe) {
          // @ts-expect-error - redirectToCheckout exists on client-side Stripe
          await stripe.redirectToCheckout({ sessionId: data.sessionId });
        }
      }
    } catch (error) {
      console.error("Checkout error:", error);
      toast.error("Failed to start checkout. Please try again.");
    } finally {
      setLoading(null);
    }
  }, [router]);

  // Auto-trigger checkout if coming from login with a plan selected
  useEffect(() => {
    const planFromUrl = searchParams.get("plan");
    if (planFromUrl && !autoCheckoutAttempted && (planFromUrl === "pro" || planFromUrl === "enterprise")) {
      setAutoCheckoutAttempted(true);
      // Small delay to ensure page is loaded
      setTimeout(() => {
        handleCheckout(planFromUrl);
      }, 500);
    }
  }, [searchParams, autoCheckoutAttempted, handleCheckout]);

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
          </div>
        </div>
      </nav>

      {/* Header */}
      <section className="pt-32 pb-16">
        <div className="mx-auto max-w-4xl px-6 text-center">
          <Badge className="mb-6 bg-blue-500/10 text-blue-400 border-blue-500/30">
            <Sparkles className="h-3 w-3 mr-1" />
            Simple, Transparent Pricing
          </Badge>
          <h1 className="text-4xl font-bold text-white sm:text-5xl">
            Choose the plan that&apos;s right for you
          </h1>
          <p className="mt-4 text-lg text-slate-400">
            Start free and scale as you grow. All plans include our core calculators.
          </p>
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="pb-20">
        <div className="mx-auto max-w-6xl px-6">
          <div className="grid gap-8 lg:grid-cols-3">
            {plans.map((plan) => (
              <Card 
                key={plan.id}
                className={`relative bg-slate-900 border-slate-800 ${
                  plan.popular 
                    ? "border-blue-500 shadow-lg shadow-blue-500/20" 
                    : ""
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <Badge className="bg-gradient-to-r from-blue-500 to-purple-600 text-white border-0">
                      Most Popular
                    </Badge>
                  </div>
                )}
                
                <CardHeader className="text-center pb-2">
                  <div className={`mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl ${
                    plan.popular 
                      ? "bg-gradient-to-br from-blue-500 to-purple-600" 
                      : "bg-slate-800"
                  }`}>
                    <plan.icon className="h-7 w-7 text-white" />
                  </div>
                  <CardTitle className="text-xl text-white">{plan.name}</CardTitle>
                  <CardDescription className="text-slate-400">
                    {plan.description}
                  </CardDescription>
                </CardHeader>

                <CardContent className="text-center">
                  <div className="mb-6">
                    <span className="text-5xl font-bold text-white">
                      ${plan.price}
                    </span>
                    {plan.price > 0 && (
                      <span className="text-slate-400">/{plan.interval}</span>
                    )}
                  </div>

                  <ul className="space-y-3 text-left">
                    {plan.features.map((feature, index) => (
                      <li 
                        key={index}
                        className="flex items-center gap-3 text-sm"
                      >
                        {feature.included ? (
                          <Check className="h-5 w-5 text-green-400 shrink-0" />
                        ) : (
                          <X className="h-5 w-5 text-slate-600 shrink-0" />
                        )}
                        <span className={feature.included ? "text-slate-300" : "text-slate-500"}>
                          {feature.text}
                        </span>
                      </li>
                    ))}
                  </ul>
                </CardContent>

                <CardFooter>
                  {plan.href ? (
                    <Button 
                      asChild 
                      className={`w-full ${
                        plan.popular 
                          ? "bg-gradient-to-r from-blue-500 to-purple-600 hover:opacity-90" 
                          : "bg-slate-800 hover:bg-slate-700"
                      }`}
                    >
                      <Link href={plan.href}>
                        {plan.cta}
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Link>
                    </Button>
                  ) : (
                    <Button 
                      onClick={() => handleCheckout(plan.id)}
                      disabled={loading === plan.id}
                      className={`w-full ${
                        plan.popular 
                          ? "bg-gradient-to-r from-blue-500 to-purple-600 hover:opacity-90" 
                          : "bg-slate-800 hover:bg-slate-700"
                      }`}
                    >
                      {loading === plan.id ? (
                        <>
                          <span className="animate-spin mr-2">⏳</span>
                          Processing...
                        </>
                      ) : (
                        <>
                          {plan.cta}
                          <ArrowRight className="ml-2 h-4 w-4" />
                        </>
                      )}
                    </Button>
                  )}
                </CardFooter>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Trust Signals */}
      <section className="py-16 border-t border-slate-800">
        <div className="mx-auto max-w-4xl px-6">
          <div className="grid gap-8 sm:grid-cols-3 text-center">
            <div className="flex flex-col items-center gap-2">
              <Shield className="h-8 w-8 text-green-400" />
              <h3 className="font-medium text-white">Secure Payments</h3>
              <p className="text-sm text-slate-400">
                Powered by Stripe. Your data is encrypted and secure.
              </p>
            </div>
            <div className="flex flex-col items-center gap-2">
              <Users className="h-8 w-8 text-blue-400" />
              <h3 className="font-medium text-white">Cancel Anytime</h3>
              <p className="text-sm text-slate-400">
                No contracts. Cancel your subscription whenever you want.
              </p>
            </div>
            <div className="flex flex-col items-center gap-2">
              <Zap className="h-8 w-8 text-purple-400" />
              <h3 className="font-medium text-white">Instant Access</h3>
              <p className="text-sm text-slate-400">
                Get access to all features immediately after payment.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ or CTA */}
      <section className="py-16 border-t border-slate-800">
        <div className="mx-auto max-w-3xl px-6 text-center">
          <h2 className="text-2xl font-bold text-white">
            Have questions?
          </h2>
          <p className="mt-4 text-slate-400">
            We&apos;re here to help. Contact our team for any questions about pricing or features.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button asChild variant="outline" className="border-slate-600 text-white hover:bg-slate-800">
              <Link href="mailto:support@dealflow.app">
                Contact Support
              </Link>
            </Button>
            <Button asChild className="bg-gradient-to-r from-blue-500 to-purple-600">
              <Link href="/calculators">
                Try Free Calculators
              </Link>
            </Button>
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
            </div>
            <div className="text-sm text-slate-500">
              © {new Date().getFullYear()} DealFlow
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

// Loading fallback for Suspense
function PricingLoading() {
  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center">
      <div className="animate-pulse text-slate-400">Loading pricing...</div>
    </div>
  );
}

// Main export with Suspense boundary
export default function PricingPage() {
  return (
    <Suspense fallback={<PricingLoading />}>
      <PricingContent />
    </Suspense>
  );
}
