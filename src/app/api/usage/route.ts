import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

// Define tier limits directly here to avoid server/client import issues
const TIER_LIMITS = {
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
    dealsPerMonth: 1000,
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

export async function GET() {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);

    // Get user's tier from profile
    const { data: profile } = await supabase
      .from("user_profiles")
      .select("subscription_tier, organization_id")
      .eq("user_id", user.id)
      .single();

    let tier = profile?.subscription_tier || "free";
    const orgId = profile?.organization_id;

    // Check organization subscription if exists
    if (orgId) {
      const { data: org } = await supabase
        .from("organizations")
        .select("subscription_tier")
        .eq("id", orgId)
        .single();

      if (org?.subscription_tier) {
        tier = org.subscription_tier;
      }
    }

    const limits = TIER_LIMITS[tier as keyof typeof TIER_LIMITS] || TIER_LIMITS.free;

    // Count deals this month
    let dealsQuery = supabase
      .from("deals")
      .select("id", { count: "exact", head: true })
      .gte("created_at", startOfMonth.toISOString());

    if (orgId) {
      dealsQuery = dealsQuery.eq("organization_id", orgId);
    } else {
      dealsQuery = dealsQuery.eq("created_by", user.id);
    }

    const { count: dealsCount } = await dealsQuery;

    // Count AI scores this month - handle table not existing gracefully
    let aiScoresCount = 0;
    try {
      const { count } = await supabase
        .from("usage_tracking")
        .select("id", { count: "exact", head: true })
        .eq("user_id", user.id)
        .eq("action_type", "ai_score")
        .gte("created_at", startOfMonth.toISOString());
      aiScoresCount = count || 0;
    } catch {
      // Table doesn't exist yet
    }

    // Count property lookups today
    let lookupsCount = 0;
    try {
      const { count } = await supabase
        .from("usage_tracking")
        .select("id", { count: "exact", head: true })
        .eq("user_id", user.id)
        .eq("action_type", "property_lookup")
        .gte("created_at", startOfDay.toISOString());
      lookupsCount = count || 0;
    } catch {
      // Table doesn't exist yet
    }

    // Count saved formulas
    let formulasCount = 0;
    try {
      const { count } = await supabase
        .from("user_formulas")
        .select("id", { count: "exact", head: true })
        .eq("user_id", user.id);
      formulasCount = count || 0;
    } catch {
      // Table doesn't exist yet
    }

    // Count team members
    let membersCount = 1;
    if (orgId) {
      const { count } = await supabase
        .from("user_profiles")
        .select("id", { count: "exact", head: true })
        .eq("organization_id", orgId);
      membersCount = count || 1;
    }

    const stats = {
      dealsThisMonth: dealsCount || 0,
      aiScoresThisMonth: aiScoresCount,
      propertyLookupsToday: lookupsCount,
      formulasSaved: formulasCount,
      teamMembers: membersCount,
      resetDate: nextMonth.toISOString()
    };

    const calculatePercentage = (used: number, limit: number) => 
      Math.min(100, Math.round((used / limit) * 100));

    return NextResponse.json({
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
    });
  } catch (error) {
    console.error('Usage API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch usage data' },
      { status: 500 }
    );
  }
}
