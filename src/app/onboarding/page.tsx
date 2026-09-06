"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PublicPage, publicAction, publicField, publicFocus } from "@/components/layout/public-page";

type AccountType = "solo" | "team" | null;
type InvestorType = "wholesaler" | "flipper" | "buy_and_hold" | "investor" | null;

const optionClass = "flex cursor-pointer items-start gap-3 rounded-lg border border-border bg-card p-4 hover:bg-muted has-[:checked]:border-primary has-[:checked]:bg-accent";
const radioClass = "mt-1 size-4 shrink-0 accent-primary " + publicFocus;

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [accountType, setAccountType] = useState<AccountType>(null);
  const [investorType, setInvestorType] = useState<InvestorType>(null);
  const [organizationName, setOrganizationName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const previousStep = useRef(step);

  useEffect(() => {
    if (previousStep.current !== step) {
      previousStep.current = step;
      headingRef.current?.focus();
    }
  }, [step]);

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
      title: "Independent Investor",
      description: "I work alone analyzing and managing my own deals",
    },
    {
      id: "team" as const,
      title: "Team / Organization",
      description: "I work with a team of agents, underwriters, or partners",
    },
  ];

  const investorTypes = [
    {
      id: "wholesaler" as const,
      title: "Wholesaler",
      description: "Finding and assigning contracts",
    },
    {
      id: "flipper" as const,
      title: "Flipper / Rehabber",
      description: "Renovating and selling properties",
    },
    {
      id: "buy_and_hold" as const,
      title: "Buy & Hold Investor",
      description: "Long-term rental properties",
    },
    {
      id: "investor" as const,
      title: "General Investor",
      description: "Multiple investment strategies",
    },
  ];

  return (
    <PublicPage className="max-w-3xl">
      <p className="mb-2 text-sm text-muted-foreground">Step {step} of {accountType === "team" ? 3 : 2}</p>
      <h1
        ref={headingRef}
        id="onboarding-heading"
        tabIndex={-1}
        className={"text-[1.75rem] font-semibold leading-tight tracking-tight sm:text-4xl " + publicFocus}
      >
        {step === 1 ? "How do you work?" : step === 2 ? "What type of investor are you?" : "Name your organization"}
      </h1>

      {step === 1 && (
        <>
          <fieldset aria-labelledby="onboarding-heading" className="mt-6 grid min-w-0 gap-3 sm:grid-cols-2">
            {accountTypes.map((type) => (
              <label key={type.id} className={optionClass}>
                <input
                  type="radio"
                  name="accountType"
                  value={type.id}
                  checked={accountType === type.id}
                  onChange={() => setAccountType(type.id)}
                  className={radioClass}
                />
                <span className="min-w-0">
                  <span className="block font-medium">{type.title}</span>
                  <span className="mt-1 block text-sm text-muted-foreground">{type.description}</span>
                </span>
              </label>
            ))}
          </fieldset>
          <Button onClick={() => accountType && setStep(2)} disabled={!accountType} className={publicAction + " mt-6"}>
            Continue
          </Button>
        </>
      )}

      {step === 2 && (
        <>
          <fieldset aria-labelledby="onboarding-heading" className="mt-6 grid min-w-0 gap-3 sm:grid-cols-2">
            {investorTypes.map((type) => (
              <label key={type.id} className={optionClass}>
                <input
                  type="radio"
                  name="investorType"
                  value={type.id}
                  checked={investorType === type.id}
                  onChange={() => setInvestorType(type.id)}
                  className={radioClass}
                />
                <span className="min-w-0">
                  <span className="block font-medium">{type.title}</span>
                  <span className="mt-1 block text-sm text-muted-foreground">{type.description}</span>
                </span>
              </label>
            ))}
          </fieldset>
          <div className="mt-6 flex flex-wrap gap-3">
            <Button type="button" variant="outline" onClick={() => setStep(1)} className={publicAction}>Back</Button>
            <Button
              type="button"
              onClick={() => accountType === "team" ? setStep(3) : handleComplete()}
              disabled={!investorType || isLoading}
              className={publicAction}
            >
              {accountType === "team" ? "Continue" : isLoading ? "Setting up…" : "Open workspace"}
            </Button>
          </div>
        </>
      )}

      {step === 3 && accountType === "team" && (
        <form
          onSubmit={(event) => {
            event.preventDefault();
            void handleComplete();
          }}
          className="mt-6 max-w-md"
        >
          <Label htmlFor="organization-name">Organization name</Label>
          <Input
            id="organization-name"
            name="organizationName"
            type="text"
            autoComplete="organization"
            value={organizationName}
            onChange={(event) => setOrganizationName(event.target.value)}
            aria-describedby="organization-name-hint"
            className={publicField + " mt-2"}
          />
          <p id="organization-name-hint" className="mt-2 text-sm text-muted-foreground">
            You can change this later in settings.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Button type="button" variant="outline" onClick={() => setStep(2)} className={publicAction}>Back</Button>
            <Button type="submit" disabled={isLoading} className={publicAction}>
              {isLoading ? "Setting up…" : "Open workspace"}
            </Button>
          </div>
        </form>
      )}

      <div role="alert">
        {error && <p className="mt-4 rounded-lg border border-destructive/40 bg-destructive/5 p-3 text-sm">{error}</p>}
      </div>
      <div role="status" className="sr-only">{isLoading && "Setting up your workspace…"}</div>
      <Button type="button" variant="ghost" onClick={() => router.push("/dashboard")} className={publicAction + " mt-4"}>
        Skip for now
      </Button>
    </PublicPage>
  );
}
