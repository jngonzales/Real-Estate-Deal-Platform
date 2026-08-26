import Stripe from "stripe";

// Server-side Stripe instance.
// Lazy-init guard: `new Stripe(undefined)` throws at module load, breaking the
// build for anyone without STRIPE_SECRET_KEY set. Routes guard with `if (!stripe)`.
export const stripe = process.env.STRIPE_SECRET_KEY
  ? new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: "2025-12-15.clover",
      typescript: true,
    })
  : null;

// Pricing plans configuration
export const PLANS = {
  free: {
    name: "Free",
    description: "Get started with basic features",
    price: 0,
    priceId: null,
    features: [
      "5 deals per month",
      "Basic calculators",
      "Email support",
      "Single user",
    ],
    limits: {
      dealsPerMonth: 5,
      aiScoresPerMonth: 3,
      teamMembers: 1,
      customFormulas: 2,
    },
  },
  pro: {
    name: "Pro",
    description: "For serious investors",
    price: 49,
    priceId: process.env.STRIPE_PRO_PRICE_ID || "price_pro_monthly",
    features: [
      "Unlimited deals",
      "AI deal scoring",
      "Custom formulas",
      "Priority support",
      "Up to 5 team members",
      "Advanced analytics",
      "PDF exports",
    ],
    limits: {
      dealsPerMonth: -1, // unlimited
      aiScoresPerMonth: 100,
      teamMembers: 5,
      customFormulas: 20,
    },
  },
  enterprise: {
    name: "Enterprise",
    description: "For teams and organizations",
    price: 149,
    priceId: process.env.STRIPE_ENTERPRISE_PRICE_ID || "price_enterprise_monthly",
    features: [
      "Everything in Pro",
      "Unlimited team members",
      "Custom integrations",
      "Dedicated support",
      "White-label options",
      "API access",
      "SSO/SAML",
      "SLA guarantee",
    ],
    limits: {
      dealsPerMonth: -1,
      aiScoresPerMonth: -1,
      teamMembers: -1,
      customFormulas: -1,
    },
  },
} as const;

export type PlanType = keyof typeof PLANS;

// Helper to get plan by price ID
export function getPlanByPriceId(priceId: string): PlanType | null {
  for (const [key, plan] of Object.entries(PLANS)) {
    if (plan.priceId === priceId) {
      return key as PlanType;
    }
  }
  return null;
}

// Format price for display
export function formatPrice(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
  }).format(amount);
}
