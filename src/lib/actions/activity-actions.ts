"use server";

import { createClient } from "@/utils/supabase/server";

export type ActivityType = 
  | "deal_created"
  | "deal_updated"
  | "status_changed"
  | "assigned"
  | "comment_added"
  | "document_uploaded"
  | "underwriting_completed"
  | "offer_generated"
  | "offer_sent"
  | "funding_requested"
  | "funding_approved"
  | "deal_closed";

export type DealActivity = {
  id: string;
  deal_id: string;
  user_id: string;
  activity_type: ActivityType;
  description: string;
  metadata: Record<string, unknown> | null;
  created_at: string;
  user?: {
    full_name: string | null;
    email: string;
  };
};

export async function createDealActivity(data: {
  dealId: string;
  activityType: ActivityType;
  description: string;
  metadata?: Record<string, unknown>;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) return { error: "Not authenticated" };
  
  const { data: activity, error } = await supabase
    .from("deal_activities")
    .insert({
      deal_id: data.dealId,
      user_id: user.id,
      activity_type: data.activityType,
      description: data.description,
      metadata: data.metadata || null,
    })
    .select()
    .single();
  
  if (error) {
    console.error("Error creating activity:", error);
    return { error: "Failed to log activity" };
  }
  
  return { activity, error: null };
}

export async function getDealActivities(dealId: string, limit = 50) {
  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from("deal_activities")
    .select(`
      *,
      profiles:user_id(full_name, email)
    `)
    .eq("deal_id", dealId)
    .order("created_at", { ascending: false })
    .limit(limit);
  
  if (error) {
    console.error("Error fetching activities:", error);
    return { activities: [], error: error.message };
  }
  
  return { 
    activities: data.map(a => ({
      ...a,
      user: a.profiles,
    })) as DealActivity[], 
    error: null 
  };
}

export async function getRecentActivities(limit = 20) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) return { activities: [], error: "Not authenticated" };
  
  // Check role
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();
  
  let query = supabase
    .from("deal_activities")
    .select(`
      *,
      profiles:user_id(full_name, email),
      deals(
        id,
        status,
        properties(address, city, state)
      )
    `)
    .order("created_at", { ascending: false })
    .limit(limit);
  
  // If not admin/underwriter, only show own deal activities
  if (profile?.role === "agent") {
    const { data: userDeals } = await supabase
      .from("deals")
      .select("id")
      .eq("agent_id", user.id);
    
    const dealIds = userDeals?.map(d => d.id) || [];
    if (dealIds.length > 0) {
      query = query.in("deal_id", dealIds);
    } else {
      return { activities: [], error: null };
    }
  }
  
  const { data, error } = await query;
  
  if (error) {
    return { activities: [], error: error.message };
  }
  
  return { 
    activities: data.map(a => ({
      ...a,
      user: a.profiles,
    })), 
    error: null 
  };
}

// Activity type display helpers
export function getActivityIcon(type: ActivityType): string {
  const icons: Record<ActivityType, string> = {
    deal_created: "📝",
    deal_updated: "✏️",
    status_changed: "🔄",
    assigned: "👤",
    comment_added: "💬",
    document_uploaded: "📎",
    underwriting_completed: "📊",
    offer_generated: "📄",
    offer_sent: "📧",
    funding_requested: "💰",
    funding_approved: "✅",
    deal_closed: "🎉",
  };
  return icons[type] || "📌";
}

export function getActivityLabel(type: ActivityType): string {
  const labels: Record<ActivityType, string> = {
    deal_created: "Deal Created",
    deal_updated: "Deal Updated",
    status_changed: "Status Changed",
    assigned: "Assigned",
    comment_added: "Comment Added",
    document_uploaded: "Document Uploaded",
    underwriting_completed: "Underwriting Completed",
    offer_generated: "Offer Generated",
    offer_sent: "Offer Sent",
    funding_requested: "Funding Requested",
    funding_approved: "Funding Approved",
    deal_closed: "Deal Closed",
  };
  return labels[type] || type;
}
