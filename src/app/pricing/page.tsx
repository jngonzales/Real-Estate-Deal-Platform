"use client";

import { useState, useEffect, useCallback, useRef, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Check, X } from "@/components/ui/icons";
import { Button } from "@/components/ui/button";
import { PublicHeading, PublicPage, publicAction, publicLink } from "@/components/layout/public-page";
import { PublicFooter } from "@/components/layout/public-footer";
import { toast } from "sonner";
import { getStripe } from "@/lib/stripe-client";

const pricingLinks = [
  { href: "/calculators", label: "Calculators" },
  { href: "/login", label: "Sign in" },
];

const plans = [
  {
    id: "free",
    name: "Free",
    price: 0,
    interval: "forever",
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
    cta: "Start free",
    href: "/login",
  },
  {
    id: "pro",
    name: "Pro",
    price: 79,
    interval: "month",
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
    cta: "Choose Pro",
    href: null, // Will use Stripe checkout
  },
  {
    id: "enterprise",
    name: "Enterprise",
    price: 149,
    interval: "month",
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
    cta: "Contact sales",
    href: "mailto:sales@dealflow.app",
  },
];

// Inner component that uses useSearchParams
function PricingContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const planFromUrl = searchParams.get("plan");
  const [loading, setLoading] = useState<string | null>(null);
  const autoCheckoutAttempted = useRef(false);

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
          // Stripe.js redirectToCheckout lives on the runtime Stripe object but isn't in the
          // server-side types. Use a narrow cast to a record we can probe.
          const stripeWithRedirect = stripe as unknown as {
            redirectToCheckout?: (options: { sessionId: string }) => Promise<{ error?: { message?: string } }>;
          };
          if (typeof stripeWithRedirect.redirectToCheckout === "function") {
            await stripeWithRedirect.redirectToCheckout({ sessionId: data.sessionId });
          } else {
            throw new Error("Stripe.js did not load correctly. Please refresh and try again.");
          }
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
    if (autoCheckoutAttempted.current || (planFromUrl !== "pro" && planFromUrl !== "enterprise")) return;

    const checkoutTimer = window.setTimeout(() => {
      autoCheckoutAttempted.current = true;
      void handleCheckout(planFromUrl);
    }, 500);

    return () => window.clearTimeout(checkoutTimer);
  }, [planFromUrl, handleCheckout]);

  return (
    <PublicPage links={pricingLinks} footer={<PublicFooter />}>
      <PublicHeading>Pricing</PublicHeading>
      <p className="mt-2 text-muted-foreground">Compare plan limits, calculators, and team access.</p>

      <div className="mt-6 grid gap-4 md:grid-cols-3">
        {plans.map((plan) => (
          <section key={plan.id} aria-labelledby={plan.id + "-plan"} className="min-w-0 rounded-lg border border-border bg-card p-4 sm:p-5">
            <h2 id={plan.id + "-plan"} className="text-xl font-semibold">{plan.name}</h2>
            <p className="mt-2 flex flex-wrap items-baseline gap-x-2 gap-y-1">
              <span className="text-3xl font-semibold tabular-nums">{"$"}{plan.price}</span>
              <span className="text-sm text-muted-foreground">{plan.price === 0 ? plan.interval : "per " + plan.interval}</span>
            </p>
            {plan.href ? (
              <Button asChild variant="outline" className={publicAction + " mt-4 w-full"}>
                <Link href={plan.href}>{plan.cta}</Link>
              </Button>
            ) : (
              <>
                <Button
                  type="button"
                  onClick={() => handleCheckout(plan.id)}
                  disabled={loading === plan.id}
                  className={publicAction + " mt-4 w-full"}
                >
                  {loading === plan.id ? "Starting checkout…" : plan.cta}
                </Button>
                <div role="status" className="sr-only">{loading === plan.id && "Starting checkout…"}</div>
              </>
            )}
            <ul className="mt-5 space-y-2 border-t border-border pt-4 text-sm">
              {plan.features.map((feature) => (
                <li key={feature.text} className="flex items-start gap-2">
                  {feature.included ? (
                    <Check aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-primary" />
                  ) : (
                    <X aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
                  )}
                  <span className={feature.included ? undefined : "text-muted-foreground"}>
                    {!feature.included && <span className="sr-only">Unavailable on this plan. </span>}
                    {feature.text}
                  </span>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>

      <div className="mt-7 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm">
        <Link href="mailto:support@dealflow.app" className={publicLink + " inline-flex min-h-11 items-center"}>Contact support</Link>
        <Link href="/calculators" className={publicLink + " inline-flex min-h-11 items-center"}>Browse calculators</Link>
      </div>
    </PublicPage>
  );
}

function PricingLoading() {
  return (
    <PublicPage links={pricingLinks}>
      <PublicHeading>Pricing</PublicHeading>
      <p role="status" className="mt-2 text-muted-foreground">Loading plans…</p>
    </PublicPage>
  );
}

export default function PricingPage() {
  return (
    <Suspense fallback={<PricingLoading />}>
      <PricingContent />
    </Suspense>
  );
}
