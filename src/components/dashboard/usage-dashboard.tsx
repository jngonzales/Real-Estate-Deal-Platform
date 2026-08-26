"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  FileText, 
  Sparkles, 
  Search, 
  Calculator, 
  Users, 
  Crown, 
  Zap,
  ArrowRight,
  Loader2
} from "lucide-react";

interface UsageData {
  tier: string;
  limits: {
    dealsPerMonth: number;
    aiScoresPerMonth: number;
    propertyLookupsPerDay: number;
    formulasAllowed: number;
    teamMembersAllowed: number;
  };
  stats: {
    dealsThisMonth: number;
    aiScoresThisMonth: number;
    propertyLookupsToday: number;
    formulasSaved: number;
    teamMembers: number;
    resetDate: string;
  };
  percentages: {
    deals: number;
    aiScores: number;
    lookups: number;
    formulas: number;
    teamMembers: number;
  };
}

const tierColors = {
  free: "bg-gray-500",
  basic: "bg-primary",
  pro: "bg-primary",
  enterprise: "bg-amber-500"
};

const tierLabels = {
  free: "Free",
  basic: "Basic",
  pro: "Pro",
  enterprise: "Enterprise"
};

export function UsageDashboard() {
  const [usage, setUsage] = useState<UsageData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchUsage();
  }, []);

  const fetchUsage = async () => {
    try {
      const response = await fetch("/api/usage");
      if (!response.ok) throw new Error("Failed to fetch usage");
      const data = await response.json();
      setUsage(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="py-8 flex justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  if (error || !usage) {
    return (
      <Card>
        <CardContent className="py-8 text-center text-muted-foreground">
          {error || "Unable to load usage data"}
        </CardContent>
      </Card>
    );
  }

  const resetDate = new Date(usage.stats.resetDate);
  const daysUntilReset = Math.ceil((resetDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24));

  const usageItems = [
    {
      label: "Deals Analyzed",
      icon: FileText,
      used: usage.stats.dealsThisMonth,
      limit: usage.limits.dealsPerMonth,
      percentage: usage.percentages.deals,
      period: "this month"
    },
    {
      label: "AI Scores",
      icon: Sparkles,
      used: usage.stats.aiScoresThisMonth,
      limit: usage.limits.aiScoresPerMonth,
      percentage: usage.percentages.aiScores,
      period: "this month"
    },
    {
      label: "Property Lookups",
      icon: Search,
      used: usage.stats.propertyLookupsToday,
      limit: usage.limits.propertyLookupsPerDay,
      percentage: usage.percentages.lookups,
      period: "today"
    },
    {
      label: "Saved Formulas",
      icon: Calculator,
      used: usage.stats.formulasSaved,
      limit: usage.limits.formulasAllowed,
      percentage: usage.percentages.formulas,
      period: "total"
    },
    {
      label: "Team Members",
      icon: Users,
      used: usage.stats.teamMembers,
      limit: usage.limits.teamMembersAllowed,
      percentage: usage.percentages.teamMembers,
      period: "seats"
    }
  ];

  return (
    <div className="space-y-6">
      {/* Current Plan */}
      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Crown className="h-5 w-5 text-yellow-500" />
                Your Plan
              </CardTitle>
              <CardDescription>
                {daysUntilReset} days until monthly reset
              </CardDescription>
            </div>
            <Badge 
              className={`${tierColors[usage.tier as keyof typeof tierColors]} text-white px-3 py-1`}
            >
              {tierLabels[usage.tier as keyof typeof tierLabels]}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          {usage.tier === "free" && (
            <div className="mt-4 p-4 bg-primary/10 rounded-lg border border-emerald-500/20">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium flex items-center gap-2">
                    <Zap className="h-4 w-4 text-emerald-500" />
                    Upgrade to Pro
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Unlimited deals, AI scores, and more!
                  </p>
                </div>
                <Button size="sm" className="bg-primary">
                  Upgrade <ArrowRight className="h-4 w-4 ml-1" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Usage Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {usageItems.map((item) => {
          const Icon = item.icon;
          const isNearLimit = item.percentage >= 80;
          const isAtLimit = item.percentage >= 100;

          return (
            <Card key={item.label}>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className={`p-2 rounded-lg ${isAtLimit ? 'bg-red-100 dark:bg-red-900/30' : isNearLimit ? 'bg-yellow-100 dark:bg-yellow-900/30' : 'bg-primary/10'}`}>
                      <Icon className={`h-4 w-4 ${isAtLimit ? 'text-red-600' : isNearLimit ? 'text-yellow-600' : 'text-primary'}`} />
                    </div>
                    <span className="font-medium text-sm">{item.label}</span>
                  </div>
                  <span className="text-xs text-muted-foreground">{item.period}</span>
                </div>

                <div className="space-y-2">
                  <div className="flex items-end justify-between">
                    <span className={`text-2xl font-bold ${isAtLimit ? 'text-red-600' : ''}`}>
                      {item.used}
                    </span>
                    <span className="text-sm text-muted-foreground">
                      / {item.limit >= 999999 ? '∞' : item.limit}
                    </span>
                  </div>
                  <Progress 
                    value={Math.min(100, item.percentage)} 
                    className={`h-2 ${isAtLimit ? '[&>div]:bg-red-500' : isNearLimit ? '[&>div]:bg-yellow-500' : ''}`}
                  />
                  {isAtLimit && (
                    <p className="text-xs text-red-600 mt-1">
                      Limit reached - upgrade for more
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Pricing Tiers Preview */}
      {usage.tier === "free" && (
        <Card>
          <CardHeader>
            <CardTitle>Upgrade Options</CardTitle>
            <CardDescription>
              Choose the plan that fits your deal flow
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-3">
              {/* Basic */}
              <div className="p-4 border rounded-lg">
                <h3 className="font-bold text-lg">Basic</h3>
                <p className="text-2xl font-bold mt-1">$79<span className="text-sm text-muted-foreground">/mo</span></p>
                <ul className="mt-4 space-y-2 text-sm">
                  <li>✓ 25 deals/month</li>
                  <li>✓ 100 AI scores/month</li>
                  <li>✓ 50 property lookups/day</li>
                  <li>✓ 10 saved formulas</li>
                  <li>✓ 3 team members</li>
                </ul>
                <Button className="w-full mt-4" variant="outline">
                  Choose Basic
                </Button>
              </div>

              {/* Pro */}
              <div className="p-4 border-2 border-primary rounded-lg relative">
                <Badge className="absolute -top-2 left-1/2 -translate-x-1/2 bg-primary">
                  Most Popular
                </Badge>
                <h3 className="font-bold text-lg">Pro</h3>
                <p className="text-2xl font-bold mt-1">$199<span className="text-sm text-muted-foreground">/mo</span></p>
                <ul className="mt-4 space-y-2 text-sm">
                  <li>✓ Unlimited deals</li>
                  <li>✓ 1000 AI scores/month</li>
                  <li>✓ 200 property lookups/day</li>
                  <li>✓ 50 saved formulas</li>
                  <li>✓ 10 team members</li>
                </ul>
                <Button className="w-full mt-4">
                  Choose Pro
                </Button>
              </div>

              {/* Enterprise */}
              <div className="p-4 border rounded-lg bg-muted/50">
                <h3 className="font-bold text-lg">Enterprise</h3>
                <p className="text-2xl font-bold mt-1">Custom</p>
                <ul className="mt-4 space-y-2 text-sm">
                  <li>✓ Unlimited everything</li>
                  <li>✓ White-label options</li>
                  <li>✓ Custom integrations</li>
                  <li>✓ Dedicated support</li>
                  <li>✓ SLA guarantee</li>
                </ul>
                <Button className="w-full mt-4" variant="outline">
                  Contact Sales
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
