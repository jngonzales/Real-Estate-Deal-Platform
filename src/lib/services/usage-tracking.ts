/**
 * Freemium Usage Tracking Service
 * 
 * Implements the freemium model from task2.md:
 * - Free tier: 3 deals/month
 * - Basic tier: 25 deals/month ($79/mo)
 * - Pro tier: Unlimited deals ($199/mo)
 * 
 * This tracks deal usage per user/organization and enforces limits.
 */

import { createClient } from "@/utils/supabase/server";

export interface UsageLimits {
  tier: "free" | "basic" | "pro" | "enterprise";
  dealsPerMonth: number;
  aiScoresPerMonth: number;
  propertyLookupsPerDay: number;
  formulasAllowed: number;
  teamMembersAllowed: number;
}

export interface UsageStats {
  dealsThisMonth: number;
  aiScoresThisMonth: number;
  propertyLookupsToday: number;
  formulasSaved: number;
  teamMembers: number;
  resetDate: Date;
}

export interface UsageCheckResult {
  allowed: boolean;
  remaining: number;
  limit: number;
  upgradeMessage?: string;
}

// Tier limits - adjust as needed for monetization
export const TIER_LIMITS: Record<string, UsageLimits> = {
  free: {
    tier: "free",
    dealsPerMonth: 3,
    aiScoresPerMonth: 10,
    propertyLookupsPerDay: 5,
    formulasAllowed: 2,
    teamMembersAllowed: 1
  },
  basic: {
    tier: "basic",
    dealsPerMonth: 25,
    aiScoresPerMonth: 100,
    propertyLookupsPerDay: 50,
    formulasAllowed: 10,
    teamMembersAllowed: 3
  },
  pro: {
    tier: "pro",
    dealsPerMonth: 1000, // Essentially unlimited
    aiScoresPerMonth: 1000,
    propertyLookupsPerDay: 200,
    formulasAllowed: 50,
    teamMembersAllowed: 10
  },
  enterprise: {
    tier: "enterprise",
    dealsPerMonth: 999999,
    aiScoresPerMonth: 999999,
    propertyLookupsPerDay: 999999,
    formulasAllowed: 999999,
    teamMembersAllowed: 999999
  }
};

/**
 * Get user's current tier from subscription status
 */
export async function getUserTier(userId: string): Promise<UsageLimits> {
  const supabase = await createClient();
  
  // Check if user has a subscription
  const { data: profile } = await supabase
    .from("user_profiles")
    .select("subscription_tier, organization_id")
    .eq("user_id", userId)
    .single();

  if (!profile) {
    return TIER_LIMITS.free;
  }

  // Check organization subscription if exists
  if (profile.organization_id) {
    const { data: org } = await supabase
      .from("organizations")
      .select("subscription_tier")
      .eq("id", profile.organization_id)
      .single();

    if (org?.subscription_tier) {
      return TIER_LIMITS[org.subscription_tier] || TIER_LIMITS.free;
    }
  }

  return TIER_LIMITS[profile.subscription_tier] || TIER_LIMITS.free;
}

/**
 * Get current usage stats for a user
 */
export async function getUsageStats(userId: string): Promise<UsageStats> {
  const supabase = await createClient();
  
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);

  // Get user's organization
  const { data: profile } = await supabase
    .from("user_profiles")
    .select("organization_id")
    .eq("user_id", userId)
    .single();

  const orgId = profile?.organization_id;

  // Count deals this month
  let dealsQuery = supabase
    .from("deals")
    .select("id", { count: "exact", head: true })
    .gte("created_at", startOfMonth.toISOString());

  if (orgId) {
    dealsQuery = dealsQuery.eq("organization_id", orgId);
  } else {
    dealsQuery = dealsQuery.eq("created_by", userId);
  }

  const { count: dealsCount } = await dealsQuery;

  // Count AI scores this month (from usage tracking table if exists)
  const { count: aiScoresCount } = await supabase
    .from("usage_tracking")
    .select("id", { count: "exact", head: true })
    .eq("user_id", userId)
    .eq("action_type", "ai_score")
    .gte("created_at", startOfMonth.toISOString());

  // Count property lookups today
  const { count: lookupsCount } = await supabase
    .from("usage_tracking")
    .select("id", { count: "exact", head: true })
    .eq("user_id", userId)
    .eq("action_type", "property_lookup")
    .gte("created_at", startOfDay.toISOString());

  // Count saved formulas
  const { count: formulasCount } = await supabase
    .from("user_formulas")
    .select("id", { count: "exact", head: true })
    .eq("user_id", userId);

  // Count team members
  let membersCount = 1;
  if (orgId) {
    const { count } = await supabase
      .from("user_profiles")
      .select("id", { count: "exact", head: true })
      .eq("organization_id", orgId);
    membersCount = count || 1;
  }

  return {
    dealsThisMonth: dealsCount || 0,
    aiScoresThisMonth: aiScoresCount || 0,
    propertyLookupsToday: lookupsCount || 0,
    formulasSaved: formulasCount || 0,
    teamMembers: membersCount,
    resetDate: nextMonth
  };
}

/**
 * Check if a specific action is allowed
 */
export async function checkUsageLimit(
  userId: string,
  action: "create_deal" | "ai_score" | "property_lookup" | "save_formula" | "add_team_member"
): Promise<UsageCheckResult> {
  const [limits, stats] = await Promise.all([
    getUserTier(userId),
    getUsageStats(userId)
  ]);

  switch (action) {
    case "create_deal":
      return {
        allowed: stats.dealsThisMonth < limits.dealsPerMonth,
        remaining: Math.max(0, limits.dealsPerMonth - stats.dealsThisMonth),
        limit: limits.dealsPerMonth,
        upgradeMessage: stats.dealsThisMonth >= limits.dealsPerMonth
          ? `You've reached your ${limits.dealsPerMonth} deals/month limit. Upgrade to analyze more deals!`
          : undefined
      };

    case "ai_score":
      return {
        allowed: stats.aiScoresThisMonth < limits.aiScoresPerMonth,
        remaining: Math.max(0, limits.aiScoresPerMonth - stats.aiScoresThisMonth),
        limit: limits.aiScoresPerMonth,
        upgradeMessage: stats.aiScoresThisMonth >= limits.aiScoresPerMonth
          ? `You've used all ${limits.aiScoresPerMonth} AI scores this month. Upgrade for more!`
          : undefined
      };

    case "property_lookup":
      return {
        allowed: stats.propertyLookupsToday < limits.propertyLookupsPerDay,
        remaining: Math.max(0, limits.propertyLookupsPerDay - stats.propertyLookupsToday),
        limit: limits.propertyLookupsPerDay,
        upgradeMessage: stats.propertyLookupsToday >= limits.propertyLookupsPerDay
          ? `You've reached your daily property lookup limit. Upgrade for more lookups!`
          : undefined
      };

    case "save_formula":
      return {
        allowed: stats.formulasSaved < limits.formulasAllowed,
        remaining: Math.max(0, limits.formulasAllowed - stats.formulasSaved),
        limit: limits.formulasAllowed,
        upgradeMessage: stats.formulasSaved >= limits.formulasAllowed
          ? `You've saved ${limits.formulasAllowed} formulas. Upgrade to save more!`
          : undefined
      };

    case "add_team_member":
      return {
        allowed: stats.teamMembers < limits.teamMembersAllowed,
        remaining: Math.max(0, limits.teamMembersAllowed - stats.teamMembers),
        limit: limits.teamMembersAllowed,
        upgradeMessage: stats.teamMembers >= limits.teamMembersAllowed
          ? `Your team has ${limits.teamMembersAllowed} members. Upgrade for more seats!`
          : undefined
      };

    default:
      return { allowed: true, remaining: 999, limit: 999 };
  }
}

/**
 * Track usage action (call after successful action)
 */
export async function trackUsage(
  userId: string,
  actionType: string,
  metadata?: Record<string, unknown>
): Promise<void> {
  const supabase = await createClient();

  await supabase.from("usage_tracking").insert({
    user_id: userId,
    action_type: actionType,
    metadata,
    created_at: new Date().toISOString()
  }).throwOnError();
}

/**
 * Get usage summary for display in UI
 */
export async function getUsageSummary(userId: string): Promise<{
  tier: string;
  limits: UsageLimits;
  stats: UsageStats;
  percentages: {
    deals: number;
    aiScores: number;
    lookups: number;
    formulas: number;
    teamMembers: number;
  };
}> {
  const [limits, stats] = await Promise.all([
    getUserTier(userId),
    getUsageStats(userId)
  ]);

  const calculatePercentage = (used: number, limit: number) => 
    Math.min(100, Math.round((used / limit) * 100));

  return {
    tier: limits.tier,
    limits,
    stats,
    percentages: {
      deals: calculatePercentage(stats.dealsThisMonth, limits.dealsPerMonth),
      aiScores: calculatePercentage(stats.aiScoresThisMonth, limits.aiScoresPerMonth),
      lookups: calculatePercentage(stats.propertyLookupsToday, limits.propertyLookupsPerDay),
      formulas: calculatePercentage(stats.formulasSaved, limits.formulasAllowed),
      teamMembers: calculatePercentage(stats.teamMembers, limits.teamMembersAllowed)
    }
  };
}
