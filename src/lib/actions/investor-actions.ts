"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";
import { createInAppNotification as createNotification } from "./notification-actions";

export type FundingStatus = "pending" | "under_review" | "approved" | "funded" | "declined" | "withdrawn";

export type InvestorFunding = {
  id: string;
  deal_id: string;
  investor_id: string;
  requested_amount: number;
  approved_amount: number | null;
  funded_amount: number | null;
  status: FundingStatus;
  interest_rate: number | null;
  term_months: number | null;
  notes: string | null;
  requested_at: string;
  approved_at: string | null;
  funded_at: string | null;
};

export type InvestorDeal = {
  id: string;
  status: string;
  asking_price: number;
  offer_price: number | null;
  final_price: number | null;
  priority: string;
  submitted_at: string;
  property: {
    address: string;
    city: string;
    state: string;
    property_type: string;
    bedrooms: number | null;
    bathrooms: number | null;
    sqft: number | null;
  } | null;
  underwriting: {
    arv: number;
    max_offer: number;
    risk_score: number | null;
  } | null;
  funding: InvestorFunding[] | null;
};

export async function isInvestor(): Promise<boolean> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) return false;
  
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();
  
  return profile?.role === "investor";
}

export async function getInvestorDashboard() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) return { error: "Not authenticated" };
  
  // Check if user is investor
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();
  
  if (profile?.role !== "investor") {
    return { error: "Not an investor" };
  }
  
  // Available deals (offer_prepared or offer_sent, no investor yet)
  const { data: availableDeals } = await supabase
    .from("deals")
    .select(`
      id,
      status,
      asking_price,
      offer_price,
      priority,
      submitted_at,
      properties(address, city, state, property_type, bedrooms, bathrooms, sqft),
      underwriting_records(arv, max_offer, risk_score)
    `)
    .in("status", ["offer_prepared", "offer_sent", "in_contract"])
    .is("investor_id", null)
    .order("submitted_at", { ascending: false });
  
  // My funded deals
  const { data: myDeals } = await supabase
    .from("deals")
    .select(`
      id,
      status,
      asking_price,
      offer_price,
      final_price,
      priority,
      submitted_at,
      closed_at,
      properties(address, city, state, property_type, bedrooms, bathrooms, sqft),
      underwriting_records(arv, max_offer, risk_score),
      investor_funding(*)
    `)
    .eq("investor_id", user.id)
    .order("submitted_at", { ascending: false });
  
  // My funding requests
  const { data: myFundingRequests } = await supabase
    .from("investor_funding")
    .select(`
      *,
      deals(
        id,
        status,
        asking_price,
        offer_price,
        properties(address, city, state)
      )
    `)
    .eq("investor_id", user.id)
    .order("requested_at", { ascending: false });
  
  // Calculate stats
  const totalFunded = myFundingRequests
    ?.filter(f => f.status === "funded")
    .reduce((sum, f) => sum + (f.funded_amount || 0), 0) || 0;
  
  const pendingFunding = myFundingRequests
    ?.filter(f => f.status === "pending" || f.status === "under_review")
    .reduce((sum, f) => sum + (f.requested_amount || 0), 0) || 0;
  
  const activeDeals = myDeals?.filter(d => d.status !== "closed" && d.status !== "rejected").length || 0;
  const closedDeals = myDeals?.filter(d => d.status === "closed").length || 0;
  
  // Calculate ROI (simplified)
  const totalInvested = myFundingRequests
    ?.filter(f => f.status === "funded")
    .reduce((sum, f) => sum + (f.funded_amount || 0), 0) || 0;
  
  const totalReturns = myDeals
    ?.filter(d => d.status === "closed")
    .reduce((sum, d) => sum + (d.final_price || d.offer_price || 0), 0) || 0;
  
  const roi = totalInvested > 0 ? ((totalReturns - totalInvested) / totalInvested) * 100 : 0;
  
  return {
    availableDeals: availableDeals?.map(d => ({
      ...d,
      property: Array.isArray(d.properties) ? d.properties[0] : d.properties,
      underwriting: Array.isArray(d.underwriting_records) ? d.underwriting_records[0] : d.underwriting_records,
    })) || [],
    myDeals: myDeals?.map(d => ({
      ...d,
      property: Array.isArray(d.properties) ? d.properties[0] : d.properties,
      underwriting: Array.isArray(d.underwriting_records) ? d.underwriting_records[0] : d.underwriting_records,
      funding: d.investor_funding,
    })) || [],
    fundingRequests: myFundingRequests || [],
    stats: {
      totalFunded,
      pendingFunding,
      activeDeals,
      closedDeals,
      totalInvested,
      totalReturns,
      roi: Math.round(roi * 100) / 100,
    },
    error: null,
  };
}

export async function requestFunding(dealId: string, amount: number, notes?: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) return { error: "Not authenticated" };
  
  // Check if user is investor
  const { data: profile } = await supabase
    .from("profiles")
    .select("role, full_name")
    .eq("id", user.id)
    .single();
  
  if (profile?.role !== "investor") {
    return { error: "Only investors can request funding" };
  }
  
  // Check if already requested for this deal
  const { data: existing } = await supabase
    .from("investor_funding")
    .select("id")
    .eq("deal_id", dealId)
    .eq("investor_id", user.id)
    .single();
  
  if (existing) {
    return { error: "You already have a funding request for this deal" };
  }
  
  // Create funding request
  const { data: funding, error } = await supabase
    .from("investor_funding")
    .insert({
      deal_id: dealId,
      investor_id: user.id,
      requested_amount: amount,
      notes,
      status: "pending",
    })
    .select()
    .single();
  
  if (error) {
    console.error("Error creating funding request:", error);
    return { error: "Failed to create funding request" };
  }
  
  // Get deal info for notification
  const { data: deal } = await supabase
    .from("deals")
    .select("assigned_to, properties(address)")
    .eq("id", dealId)
    .single();
  
  // Notify assigned underwriter/admin
  if (deal?.assigned_to) {
    await createNotification({
      userId: deal.assigned_to,
      type: "funding_request",
      title: "New Funding Request",
      message: `${profile.full_name || "An investor"} requested $${amount.toLocaleString()} funding for ${(deal.properties as { address?: string })?.address || "a deal"}`,
      dealId,
    });
  }
  
  // Notify all admins
  const { data: admins } = await supabase
    .from("profiles")
    .select("id")
    .eq("role", "admin");
  
  for (const admin of admins || []) {
    if (admin.id !== deal?.assigned_to) {
      await createNotification({
        userId: admin.id,
        type: "funding_request",
        title: "New Funding Request",
        message: `${profile.full_name || "An investor"} requested $${amount.toLocaleString()} funding`,
        dealId,
      });
    }
  }
  
  revalidatePath("/dashboard/investor");
  return { funding, error: null };
}

export async function updateFundingStatus(
  fundingId: string, 
  status: FundingStatus, 
  approvedAmount?: number,
  fundedAmount?: number
) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) return { error: "Not authenticated" };
  
  // Check if user is admin or underwriter
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();
  
  if (!["admin", "underwriter"].includes(profile?.role || "")) {
    return { error: "Not authorized" };
  }
  
  const updates: Record<string, unknown> = { 
    status,
    updated_at: new Date().toISOString(),
  };
  
  if (status === "approved" && approvedAmount) {
    updates.approved_amount = approvedAmount;
    updates.approved_at = new Date().toISOString();
  }
  
  if (status === "funded" && fundedAmount) {
    updates.funded_amount = fundedAmount;
    updates.funded_at = new Date().toISOString();
  }
  
  const { data: funding, error } = await supabase
    .from("investor_funding")
    .update(updates)
    .eq("id", fundingId)
    .select(`*, deals(id, properties(address))`)
    .single();
  
  if (error) {
    console.error("Error updating funding:", error);
    return { error: "Failed to update funding" };
  }
  
  // If funded, assign investor to deal
  if (status === "funded" && funding) {
    await supabase
      .from("deals")
      .update({ investor_id: funding.investor_id })
      .eq("id", funding.deal_id);
  }
  
  // Notify investor
  const statusMessages: Record<FundingStatus, string> = {
    pending: "Your funding request is pending",
    under_review: "Your funding request is being reviewed",
    approved: `Your funding request has been approved for $${(approvedAmount || 0).toLocaleString()}`,
    funded: `Funding of $${(fundedAmount || 0).toLocaleString()} has been processed`,
    declined: "Your funding request was declined",
    withdrawn: "Your funding request was withdrawn",
  };
  
  await createNotification({
    userId: funding.investor_id,
    type: "funding_update",
    title: `Funding ${status.charAt(0).toUpperCase() + status.slice(1)}`,
    message: statusMessages[status],
    dealId: funding.deal_id,
  });
  
  revalidatePath("/dashboard/investor");
  revalidatePath("/dashboard/admin");
  return { funding, error: null };
}

export async function withdrawFundingRequest(fundingId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) return { error: "Not authenticated" };
  
  // Verify ownership
  const { data: funding } = await supabase
    .from("investor_funding")
    .select("investor_id, status")
    .eq("id", fundingId)
    .single();
  
  if (funding?.investor_id !== user.id) {
    return { error: "Not authorized" };
  }
  
  if (funding.status === "funded") {
    return { error: "Cannot withdraw funded request" };
  }
  
  const { error } = await supabase
    .from("investor_funding")
    .update({ status: "withdrawn" })
    .eq("id", fundingId);
  
  if (error) {
    return { error: "Failed to withdraw request" };
  }
  
  revalidatePath("/dashboard/investor");
  return { error: null };
}

export async function getInvestors() {
  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from("profiles")
    .select("id, full_name, email, phone, is_active, created_at")
    .eq("role", "investor")
    .order("full_name");
  
  if (error) return { investors: null, error: error.message };
  return { investors: data, error: null };
}

export async function getAllFundingRequests() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) return { requests: null, error: "Not authenticated" };
  
  // Check if admin or underwriter
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();
  
  if (!["admin", "underwriter"].includes(profile?.role || "")) {
    return { requests: null, error: "Not authorized" };
  }
  
  const { data, error } = await supabase
    .from("investor_funding")
    .select(`
      *,
      deals(
        id,
        status,
        asking_price,
        offer_price,
        properties(address, city, state)
      ),
      profiles:investor_id(full_name, email)
    `)
    .order("requested_at", { ascending: false });
  
  if (error) return { requests: null, error: error.message };
  return { requests: data, error: null };
}
