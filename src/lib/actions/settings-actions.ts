"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/utils/supabase/server";

interface UpdateProfileData {
  fullName: string;
  phone: string;
  company: string;
}

export async function updateProfile(data: UpdateProfileData) {
  const supabase = await createClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    return { error: "Not authenticated" };
  }

  const { error } = await supabase
    .from("profiles")
    .update({
      full_name: data.fullName,
      phone: data.phone || null,
      company: data.company || null,
    })
    .eq("id", user.id);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/dashboard/settings");
  return { success: true };
}

interface UnderwritingDefaults {
  targetProfitPercent: number;
  holdingPeriodMonths: number;
  monthlyHoldingCost: number;
  sellingCostsPercent: number;
}

export async function updateUnderwritingDefaults(data: UnderwritingDefaults) {
  const supabase = await createClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    return { error: "Not authenticated" };
  }

  // Upsert - insert if not exists, update if exists
  const { error } = await supabase
    .from("user_settings")
    .upsert({
      user_id: user.id,
      target_profit_percent: data.targetProfitPercent,
      holding_period_months: data.holdingPeriodMonths,
      monthly_holding_cost: data.monthlyHoldingCost,
      selling_costs_percent: data.sellingCostsPercent,
    }, {
      onConflict: "user_id"
    });

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/dashboard/settings");
  return { success: true };
}

interface NotificationPreferences {
  notifyDealStatus: boolean;
  notifyUnderwritingComplete: boolean;
  notifyWeeklySummary: boolean;
}

export async function updateNotificationPreferences(data: NotificationPreferences) {
  const supabase = await createClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    return { error: "Not authenticated" };
  }

  // Upsert - insert if not exists, update if exists
  const { error } = await supabase
    .from("user_settings")
    .upsert({
      user_id: user.id,
      notify_deal_status: data.notifyDealStatus,
      notify_underwriting_complete: data.notifyUnderwritingComplete,
      notify_weekly_summary: data.notifyWeeklySummary,
    }, {
      onConflict: "user_id"
    });

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/dashboard/settings");
  return { success: true };
}

export async function sendPasswordResetEmail() {
  const supabase = await createClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user || !user.email) {
    return { error: "Not authenticated" };
  }

  const { error } = await supabase.auth.resetPasswordForEmail(user.email, {
    redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://real-estate-deal-platform.vercel.app'}/auth/callback?next=/dashboard/settings`,
  });

  if (error) {
    return { error: error.message };
  }

  return { success: true };
}

export async function getUserSettings() {
  const supabase = await createClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    return { error: "Not authenticated", settings: null };
  }

  const { data: settings, error } = await supabase
    .from("user_settings")
    .select("*")
    .eq("user_id", user.id)
    .single();

  if (error && error.code !== "PGRST116") { // PGRST116 = no rows returned
    return { error: error.message, settings: null };
  }

  return { settings, error: null };
}
