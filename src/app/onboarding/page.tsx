"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { Building2, User, Users, ArrowRight, Briefcase, Home, TrendingUp, CheckCircle } from "@/components/ui/icons";
import { motion } from "framer-motion";

type AccountType = "solo" | "team" | null;
type InvestorType = "wholesaler" | "flipper" | "buy_and_hold" | "investor" | null;

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [accountType, setAccountType] = useState<AccountType>(null);
  const [investorType, setInvestorType] = useState<InvestorType>(null);
  const [organizationName, setOrganizationName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleComplete = async () => {
    if (!accountType) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        router.push("/login");
        return;
      }

      // Get user's organization
      const { data: profile } = await supabase
        .from("profiles")
        .select("organization_id")
        .eq("id", user.id)
        .single();

      if (profile?.organization_id) {
        // Update organization with the selected type and name
        const updates: Record<string, unknown> = {
          settings: {
            account_type: accountType,
            investor_type: investorType,
            onboarding_completed: true,
          },
          updated_at: new Date().toISOString(),
        };

        // Set appropriate name based on account type
        if (accountType === "team" && organizationName.trim()) {
          updates.name = organizationName.trim();
        } else if (accountType === "solo") {
          // For solo users, set a generic name (won't be displayed prominently)
          updates.name = "Personal Workspace";
        }

        await supabase
          .from("organizations")
          .update(updates)
          .eq("id", profile.organization_id);
      }

      // Redirect to dashboard
      router.push("/dashboard");
    } catch (err) {
      console.error("Onboarding error:", err);
      setError("Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const accountTypes = [
    {
      id: "solo" as const,
      icon: User,
      title: "Independent Investor",
      description: "I work alone analyzing and managing my own deals",
      features: ["Personal deal pipeline", "All calculators", "PDF reports"],
    },
    {
      id: "team" as const,
      icon: Users,
      title: "Team / Organization",
      description: "I work with a team of agents, underwriters, or partners",
      features: ["Team collaboration", "Role-based access", "Shared deal flow"],
    },
  ];

  const investorTypes = [
    {
      id: "wholesaler" as const,
      icon: TrendingUp,
      title: "Wholesaler",
      description: "Finding and assigning contracts",
    },
    {
      id: "flipper" as const,
      icon: Home,
      title: "Flipper / Rehabber",
      description: "Renovating and selling properties",
    },
    {
      id: "buy_and_hold" as const,
      icon: Building2,
      title: "Buy & Hold Investor",
      description: "Long-term rental properties",
    },
    {
      id: "investor" as const,
      icon: Briefcase,
      title: "General Investor",
      description: "Multiple investment strategies",
    },
  ];

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <div className="w-full max-w-2xl">
        {/* Progress indicator */}
        <div className="mb-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <div className={`h-2 w-16 rounded-full ${step >= 1 ? "bg-primary" : "bg-secondary"}`} />
            <div className={`h-2 w-16 rounded-full ${step >= 2 ? "bg-primary" : "bg-secondary"}`} />
            {accountType === "team" && (
              <div className={`h-2 w-16 rounded-full ${step >= 3 ? "bg-primary" : "bg-secondary"}`} />
            )}
          </div>
          <p className="text-center text-muted-foreground text-sm">
            Step {step} of {accountType === "team" ? 3 : 2}
          </p>
        </div>

        <motion.div
          key={step}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.3 }}
        >
          {/* Step 1: Account Type */}
          {step === 1 && (
            <div className="text-center">
              <h1 className="text-3xl font-bold text-white mb-2">Welcome to LotMerit</h1>
              <p className="text-muted-foreground mb-8">Let&apos;s set up your account. How do you work?</p>

              <div className="grid gap-4 sm:grid-cols-2">
                {accountTypes.map((type) => (
                  <button
                    key={type.id}
                    onClick={() => setAccountType(type.id)}
                    className={`relative p-6 rounded-xl border text-left transition-all ${
                      accountType === type.id
                        ? "border-emerald-500 bg-primary/10 ring-2 ring-primary/20"
                        : "border-border bg-muted/40 hover:border-border"
                    }`}
                  >
                    {accountType === type.id && (
                      <div className="absolute top-4 right-4">
                        <CheckCircle className="h-5 w-5 text-emerald-500" />
                      </div>
                    )}
                    <type.icon className={`h-10 w-10 mb-4 ${
                      accountType === type.id ? "text-emerald-500" : "text-muted-foreground"
                    }`} />
                    <h3 className="text-lg font-semibold text-white mb-1">{type.title}</h3>
                    <p className="text-sm text-muted-foreground mb-4">{type.description}</p>
                    <ul className="space-y-1">
                      {type.features.map((feature, i) => (
                        <li key={i} className="text-xs text-muted-foreground flex items-center gap-2">
                          <div className="h-1 w-1 rounded-full bg-secondary" />
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </button>
                ))}
              </div>

              <button
                onClick={() => accountType && setStep(2)}
                disabled={!accountType}
                className="mt-8 inline-flex items-center gap-2 rounded-lg bg-primary px-8 py-3 font-medium text-white disabled:opacity-50 disabled:cursor-not-allowed hover:opacity-90 transition-opacity"
              >
                Continue
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          )}

          {/* Step 2: Investor Type */}
          {step === 2 && (
            <div className="text-center">
              <h1 className="text-3xl font-bold text-white mb-2">What type of investor are you?</h1>
              <p className="text-muted-foreground mb-8">This helps us customize your experience</p>

              <div className="grid gap-3 sm:grid-cols-2">
                {investorTypes.map((type) => (
                  <button
                    key={type.id}
                    onClick={() => setInvestorType(type.id)}
                    className={`relative p-4 rounded-xl border text-left transition-all ${
                      investorType === type.id
                        ? "border-emerald-500 bg-primary/10 ring-2 ring-primary/20"
                        : "border-border bg-muted/40 hover:border-border"
                    }`}
                  >
                    {investorType === type.id && (
                      <div className="absolute top-3 right-3">
                        <CheckCircle className="h-5 w-5 text-emerald-500" />
                      </div>
                    )}
                    <div className="flex items-start gap-3">
                      <type.icon className={`h-8 w-8 ${
                        investorType === type.id ? "text-emerald-500" : "text-muted-foreground"
                      }`} />
                      <div>
                        <h3 className="font-semibold text-white">{type.title}</h3>
                        <p className="text-sm text-muted-foreground">{type.description}</p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>

              <div className="mt-8 flex items-center justify-center gap-4">
                <button
                  onClick={() => setStep(1)}
                  className="text-muted-foreground hover:text-white transition-colors"
                >
                  Back
                </button>
                <button
                  onClick={() => accountType === "team" ? setStep(3) : handleComplete()}
                  disabled={!investorType || isLoading}
                  className="inline-flex items-center gap-2 rounded-lg bg-primary px-8 py-3 font-medium text-white disabled:opacity-50 disabled:cursor-not-allowed hover:opacity-90 transition-opacity"
                >
                  {accountType === "team" ? "Continue" : isLoading ? "Setting up..." : "Get Started"}
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}

          {/* Step 3: Organization Name (Team only) */}
          {step === 3 && accountType === "team" && (
            <div className="text-center">
              <h1 className="text-3xl font-bold text-white mb-2">Name your organization</h1>
              <p className="text-muted-foreground mb-8">You can change this later in settings</p>

              <div className="max-w-md mx-auto">
                <input
                  type="text"
                  value={organizationName}
                  onChange={(e) => setOrganizationName(e.target.value)}
                  placeholder="e.g., ABC Investments, Smith Capital, ..."
                  className="w-full px-4 py-3 rounded-lg bg-card border border-border text-white placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none"
                />
              </div>

              {error && (
                <p className="mt-4 text-sm text-red-400">{error}</p>
              )}

              <div className="mt-8 flex items-center justify-center gap-4">
                <button
                  onClick={() => setStep(2)}
                  className="text-muted-foreground hover:text-white transition-colors"
                >
                  Back
                </button>
                <button
                  onClick={handleComplete}
                  disabled={isLoading}
                  className="inline-flex items-center gap-2 rounded-lg bg-primary px-8 py-3 font-medium text-white disabled:opacity-50 disabled:cursor-not-allowed hover:opacity-90 transition-opacity"
                >
                  {isLoading ? "Setting up..." : "Get Started"}
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}
        </motion.div>

        {/* Skip option */}
        <p className="mt-8 text-center text-sm text-muted-foreground">
          <button
            onClick={() => router.push("/dashboard")}
            className="hover:text-foreground/90 transition-colors"
          >
            Skip for now
          </button>
        </p>
      </div>
    </div>
  );
}
