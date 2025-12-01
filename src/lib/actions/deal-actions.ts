"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";
import { dealSubmissionSchema, type DealSubmissionForm } from "@/lib/schemas/deal-submission";
import { notifyStatusChange, notifyAssignment, notifyNewDeal } from "./notification-actions";
import { createAuditLog } from "./audit-actions";

export type Attachment = {
  id: string;
  deal_id: string;
  file_name: string;
  file_url: string;
  file_type: string;
  created_at: string;
};

export type DealStatus = "submitted" | "needs_info" | "underwriting" | "offer_prepared" | "offer_sent" | "in_contract" | "funding" | "closed" | "rejected";

export type DealWithProperty = {
  id: string;
  property_id: string;
  agent_id: string;
  assigned_to: string | null;
  status: DealStatus;
  asking_price: number;
  offer_price: number | null;
  seller_name: string;
  seller_phone: string | null;
  seller_email: string | null;
  seller_motivation: string | null;
  notes: string | null;
  submitted_at: string;
  updated_at: string;
  property: {
    id: string;
    address: string;
    city: string;
    state: string;
    zip: string;
    county: string | null;
    property_type: string;
    bedrooms: number | null;
    bathrooms: number | null;
    sqft: number | null;
    year_built: number | null;
  } | null;
  agent?: {
    full_name: string | null;
    email: string;
  } | null;
  assignee?: {
    full_name: string | null;
    email: string;
  } | null;
};

export async function getDeals(): Promise<{ deals: DealWithProperty[] | null; error: string | null; isAdmin: boolean }> {
  const supabase = await createClient();

  const { data: { user }, error: userError } = await supabase.auth.getUser();

  if (userError || !user) {
    return { deals: null, error: "You must be logged in to view deals", isAdmin: false };
  }

  // Check user role
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  const isAdminOrUnderwriter = profile?.role === "admin" || profile?.role === "underwriter";

  // Fetch deals - admins/underwriters see all, agents see their own
  let dealsQuery = supabase
    .from("deals")
    .select("*")
    .order("submitted_at", { ascending: false });

  if (!isAdminOrUnderwriter) {
    dealsQuery = dealsQuery.eq("agent_id", user.id);
  }

  const { data: deals, error: dealsError } = await dealsQuery;

  if (dealsError) {
    console.error("Error fetching deals:", dealsError);
    return { deals: null, error: `Failed to fetch deals: ${dealsError.message}`, isAdmin: isAdminOrUnderwriter };
  }

  if (!deals || deals.length === 0) {
    return { deals: [], error: null, isAdmin: isAdminOrUnderwriter };
  }

  // Get unique property IDs
  const propertyIds = [...new Set(deals.map(d => d.property_id))];
  const agentIds = [...new Set(deals.map(d => d.agent_id))];
  const assigneeIds = [...new Set(deals.map(d => d.assigned_to).filter(Boolean))];
  const allUserIds = [...new Set([...agentIds, ...assigneeIds])];

  // Fetch properties and users in parallel
  const [propertiesResult, usersResult] = await Promise.all([
    supabase.from("properties").select("*").in("id", propertyIds),
    isAdminOrUnderwriter && allUserIds.length > 0
      ? supabase.from("profiles").select("id, full_name, email").in("id", allUserIds)
      : Promise.resolve({ data: null, error: null }),
  ]);

  if (propertiesResult.error) {
    console.error("Error fetching properties:", propertiesResult.error);
    return { deals: null, error: `Failed to fetch properties: ${propertiesResult.error.message}`, isAdmin: isAdminOrUnderwriter };
  }

  // Create maps for quick lookup
  const propertyMap = new Map(propertiesResult.data?.map(p => [p.id, p]) || []);
  const agentMap = new Map(usersResult.data?.map(u => [u.id, u]) || []);
  const assigneeMap = new Map(usersResult.data?.map(u => [u.id, u]) || []);

  // Combine deals with their properties
  const dealsWithProperties = deals.map(deal => ({
    ...deal,
    property: propertyMap.get(deal.property_id) || null,
    agent: isAdminOrUnderwriter ? agentMap.get(deal.agent_id) || null : null,
    assignee: isAdminOrUnderwriter && deal.assigned_to ? assigneeMap.get(deal.assigned_to) || null : null,
  }));

  return { deals: dealsWithProperties as DealWithProperty[], error: null, isAdmin: isAdminOrUnderwriter };
}

export async function updateDealStatus(dealId: string, status: DealStatus): Promise<{ success: boolean; error: string | null }> {
  const supabase = await createClient();

  const { data: { user }, error: userError } = await supabase.auth.getUser();

  if (userError || !user) {
    return { success: false, error: "You must be logged in to update deals" };
  }

  // Get current deal status before update
  const { data: currentDeal } = await supabase
    .from("deals")
    .select("status")
    .eq("id", dealId)
    .single();

  const oldStatus = currentDeal?.status;

  // Check user role
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  const isAdminOrUnderwriter = profile?.role === "admin" || profile?.role === "underwriter";

  // Admins can update any deal, agents can only update their own
  let updateQuery = supabase
    .from("deals")
    .update({ status, updated_at: new Date().toISOString() })
    .eq("id", dealId);

  if (!isAdminOrUnderwriter) {
    updateQuery = updateQuery.eq("agent_id", user.id);
  }

  const { error } = await updateQuery;

  if (error) {
    console.error("Error updating deal status:", error);
    return { success: false, error: "Failed to update deal status" };
  }

  // Create audit log
  createAuditLog({
    action: "update",
    entityType: "deal",
    entityId: dealId,
    oldValues: { status: oldStatus },
    newValues: { status },
    metadata: { field: "status" },
  }).catch(console.error);

  // Send notification if status changed
  if (oldStatus && oldStatus !== status) {
    notifyStatusChange(dealId, oldStatus, status).catch(console.error);
  }

  revalidatePath("/dashboard/deals");
  return { success: true, error: null };
}

export async function assignDeal(dealId: string, assigneeId: string | null): Promise<{ success: boolean; error: string | null }> {
  const supabase = await createClient();

  const { data: { user }, error: userError } = await supabase.auth.getUser();

  if (userError || !user) {
    return { success: false, error: "You must be logged in to assign deals" };
  }

  // Check user role - only admins and underwriters can assign deals
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  const isAdminOrUnderwriter = profile?.role === "admin" || profile?.role === "underwriter";

  if (!isAdminOrUnderwriter) {
    return { success: false, error: "Only admins and underwriters can assign deals" };
  }

  // If assigning to someone, verify they exist and are an underwriter or admin
  if (assigneeId) {
    const { data: assigneeProfile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", assigneeId)
      .single();

    if (!assigneeProfile || !["admin", "underwriter"].includes(assigneeProfile.role)) {
      return { success: false, error: "Can only assign deals to admins or underwriters" };
    }
  }

  const { error } = await supabase
    .from("deals")
    .update({ assigned_to: assigneeId, updated_at: new Date().toISOString() })
    .eq("id", dealId);

  if (error) {
    console.error("Error assigning deal:", error);
    return { success: false, error: "Failed to assign deal" };
  }

  // Send notification if assigned to someone
  if (assigneeId) {
    notifyAssignment(dealId, assigneeId).catch(console.error);
  }

  revalidatePath("/dashboard/deals");
  revalidatePath(`/dashboard/deals/${dealId}`);
  return { success: true, error: null };
}

export async function getDeal(dealId: string): Promise<{ deal: DealWithProperty | null; error: string | null }> {
  const supabase = await createClient();

  const { data: { user }, error: userError } = await supabase.auth.getUser();

  if (userError || !user) {
    return { deal: null, error: "You must be logged in to view this deal" };
  }

  // Check user role
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  const isAdminOrUnderwriter = profile?.role === "admin" || profile?.role === "underwriter";

  // Fetch deal - admins can see any deal
  let dealQuery = supabase
    .from("deals")
    .select("*")
    .eq("id", dealId);

  if (!isAdminOrUnderwriter) {
    dealQuery = dealQuery.eq("agent_id", user.id);
  }

  const { data: deal, error: dealError } = await dealQuery.single();

  if (dealError) {
    console.error("Error fetching deal:", dealError);
    return { deal: null, error: "Deal not found" };
  }

  // Fetch property separately
  const { data: property, error: propertyError } = await supabase
    .from("properties")
    .select("*")
    .eq("id", deal.property_id)
    .single();

  if (propertyError) {
    console.error("Error fetching property:", propertyError);
    return { deal: null, error: "Property not found" };
  }

  return { deal: { ...deal, property } as DealWithProperty, error: null };
}

export async function getDealAttachments(dealId: string): Promise<{ attachments: Attachment[] | null; error: string | null }> {
  const supabase = await createClient();

  const { data: { user }, error: userError } = await supabase.auth.getUser();

  if (userError || !user) {
    return { attachments: null, error: "You must be logged in" };
  }

  const { data: attachments, error } = await supabase
    .from("attachments")
    .select("*")
    .eq("deal_id", dealId)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching attachments:", error);
    return { attachments: null, error: "Failed to fetch attachments" };
  }

  return { attachments, error: null };
}

export async function submitDeal(data: DealSubmissionForm) {
  const supabase = await createClient();
  
  // Get current user
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  
  if (userError || !user) {
    return { error: "You must be logged in to submit a deal" };
  }

  // Validate data
  const validationResult = dealSubmissionSchema.safeParse(data);
  if (!validationResult.success) {
    return { error: validationResult.error.issues[0].message };
  }

  const validData = validationResult.data;

  try {
    // 1. Create the property
    const { data: property, error: propertyError } = await supabase
      .from("properties")
      .insert({
        created_by: user.id,
        address: validData.address,
        city: validData.city,
        state: validData.state,
        zip: validData.zip,
        county: validData.county || null,
        property_type: validData.propertyType,
        bedrooms: validData.bedrooms || null,
        bathrooms: validData.bathrooms || null,
        sqft: validData.sqft || null,
        year_built: validData.yearBuilt || null,
      })
      .select()
      .single();

    if (propertyError) {
      console.error("Property error:", propertyError);
      return { error: "Failed to create property: " + propertyError.message };
    }

    // 2. Create the deal
    const { data: deal, error: dealError } = await supabase
      .from("deals")
      .insert({
        property_id: property.id,
        agent_id: user.id,
        status: "submitted",
        asking_price: validData.askingPrice,
        seller_name: validData.sellerName,
        seller_phone: validData.sellerPhone || null,
        seller_email: validData.sellerEmail || null,
        seller_motivation: validData.sellerMotivation || null,
        notes: validData.notes || null,
      })
      .select()
      .single();

    if (dealError) {
      console.error("Deal error:", dealError);
      return { error: "Failed to create deal: " + dealError.message };
    }

    // 3. Create attachments if photos were uploaded
    if (validData.photos && validData.photos.length > 0) {
      const attachments = validData.photos.map((url) => ({
        deal_id: deal.id,
        uploaded_by: user.id,
        file_name: url.split("/").pop() || "photo",
        file_url: url,
        file_type: "photo" as const,
      }));

      const { error: attachmentError } = await supabase
        .from("attachments")
        .insert(attachments);

      if (attachmentError) {
        console.error("Attachment error:", attachmentError);
        // Don't fail the whole submission for attachment errors
      }
    }

    revalidatePath("/dashboard");
    revalidatePath("/dashboard/deals");
    
    // Create audit log for new deal
    createAuditLog({
      action: "create",
      entityType: "deal",
      entityId: deal.id,
      newValues: {
        address: validData.address,
        city: validData.city,
        state: validData.state,
        asking_price: validData.askingPrice,
        seller_name: validData.sellerName,
      },
    }).catch(console.error);
    
    // Send notifications for new deal (async, don't await)
    notifyNewDeal(deal.id).catch(console.error);
    
    return { success: true, dealId: deal.id };
  } catch (error) {
    console.error("Submission error:", error);
    return { error: "An unexpected error occurred" };
  }
}

export async function uploadPhoto(formData: FormData) {
  const supabase = await createClient();
  
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  
  if (userError || !user) {
    return { error: "You must be logged in to upload photos" };
  }

  const file = formData.get("file") as File;
  if (!file) {
    return { error: "No file provided" };
  }

  // Generate unique filename
  const fileExt = file.name.split(".").pop();
  const fileName = `${user.id}/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;

  const { data, error } = await supabase.storage
    .from("deal-attachments")
    .upload(fileName, file);

  if (error) {
    console.error("Upload error:", error);
    return { error: "Failed to upload file: " + error.message };
  }

  // Get public URL
  const { data: { publicUrl } } = supabase.storage
    .from("deal-attachments")
    .getPublicUrl(data.path);

  return { success: true, url: publicUrl };
}

// Underwriting Types
export type UnderwritingRecord = {
  id: string;
  deal_id: string;
  underwriter_id: string;
  arv: number;
  repair_estimate: number;
  max_offer: number;
  recommended_offer: number | null;
  profit_estimate: number | null;
  notes: string | null;
  status: "draft" | "submitted" | "approved" | "rejected";
  created_at: string;
  updated_at: string;
};

export async function getUnderwriting(dealId: string): Promise<{ underwriting: UnderwritingRecord | null; error: string | null }> {
  const supabase = await createClient();

  const { data: { user }, error: userError } = await supabase.auth.getUser();

  if (userError || !user) {
    return { underwriting: null, error: "You must be logged in" };
  }

  const { data: underwriting, error } = await supabase
    .from("underwriting_records")
    .select("*")
    .eq("deal_id", dealId)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) {
    console.error("Error fetching underwriting:", error);
    return { underwriting: null, error: "Failed to fetch underwriting" };
  }

  return { underwriting, error: null };
}

export async function saveUnderwriting(data: {
  dealId: string;
  arv: number;
  repairEstimate: number;
  maxOffer: number;
  recommendedOffer?: number;
  profitEstimate?: number;
  notes?: string;
  status?: "draft" | "submitted" | "approved" | "rejected";
}): Promise<{ success: boolean; underwriting?: UnderwritingRecord; error: string | null }> {
  const supabase = await createClient();

  const { data: { user }, error: userError } = await supabase.auth.getUser();

  if (userError || !user) {
    return { success: false, error: "You must be logged in" };
  }

  // Check if underwriting record exists for this deal
  const { data: existing } = await supabase
    .from("underwriting_records")
    .select("id")
    .eq("deal_id", data.dealId)
    .maybeSingle();

  const underwritingData = {
    deal_id: data.dealId,
    underwriter_id: user.id,
    arv: data.arv,
    repair_estimate: data.repairEstimate,
    max_offer: data.maxOffer,
    recommended_offer: data.recommendedOffer || null,
    profit_estimate: data.profitEstimate || null,
    notes: data.notes || null,
    status: data.status || "draft",
  };

  let result;
  if (existing) {
    // Update existing record
    result = await supabase
      .from("underwriting_records")
      .update(underwritingData)
      .eq("id", existing.id)
      .select()
      .single();
  } else {
    // Insert new record
    result = await supabase
      .from("underwriting_records")
      .insert(underwritingData)
      .select()
      .single();
  }

  if (result.error) {
    console.error("Error saving underwriting:", result.error);
    return { success: false, error: "Failed to save underwriting: " + result.error.message };
  }

  revalidatePath(`/dashboard/deals/${data.dealId}`);
  revalidatePath(`/dashboard/deals/${data.dealId}/underwriting`);

  return { success: true, underwriting: result.data, error: null };
}

export async function updateDealOfferPrice(dealId: string, offerPrice: number): Promise<{ success: boolean; error: string | null }> {
  const supabase = await createClient();

  const { data: { user }, error: userError } = await supabase.auth.getUser();

  if (userError || !user) {
    return { success: false, error: "You must be logged in" };
  }

  const { error } = await supabase
    .from("deals")
    .update({ offer_price: offerPrice })
    .eq("id", dealId)
    .eq("agent_id", user.id);

  if (error) {
    console.error("Error updating offer price:", error);
    return { success: false, error: "Failed to update offer price" };
  }

  revalidatePath(`/dashboard/deals/${dealId}`);
  revalidatePath("/dashboard/deals");

  return { success: true, error: null };
}

export async function getDealTimelineData(dealId: string): Promise<{
  underwriting: { created_at: string; max_offer: number; underwriter?: { full_name?: string } } | null;
  commentsCount: number;
  photosCount: number;
  agent: { full_name?: string; email?: string } | null;
  assignee: { full_name?: string } | null;
  error: string | null;
}> {
  const supabase = await createClient();

  const { data: { user }, error: userError } = await supabase.auth.getUser();

  if (userError || !user) {
    return { underwriting: null, commentsCount: 0, photosCount: 0, agent: null, assignee: null, error: "Not authenticated" };
  }

  // Get underwriting record
  const { data: underwriting } = await supabase
    .from("underwriting_records")
    .select(`
      created_at,
      max_offer,
      underwriter:profiles!underwriting_records_underwriter_id_fkey(full_name)
    `)
    .eq("deal_id", dealId)
    .order("created_at", { ascending: false })
    .limit(1)
    .single();

  // Get comments count
  const { count: commentsCount } = await supabase
    .from("deal_comments")
    .select("*", { count: "exact", head: true })
    .eq("deal_id", dealId);

  // Get photos count
  const { count: photosCount } = await supabase
    .from("attachments")
    .select("*", { count: "exact", head: true })
    .eq("deal_id", dealId);

  // Get deal with agent and assignee
  const { data: deal } = await supabase
    .from("deals")
    .select(`
      agent:profiles!deals_agent_id_fkey(full_name, email),
      assignee:profiles!deals_assigned_to_fkey(full_name)
    `)
    .eq("id", dealId)
    .single();

  return {
    underwriting: underwriting ? {
      created_at: underwriting.created_at,
      max_offer: underwriting.max_offer,
      underwriter: Array.isArray(underwriting.underwriter) ? underwriting.underwriter[0] : underwriting.underwriter,
    } : null,
    commentsCount: commentsCount || 0,
    photosCount: photosCount || 0,
    agent: deal?.agent ? (Array.isArray(deal.agent) ? deal.agent[0] : deal.agent) : null,
    assignee: deal?.assignee ? (Array.isArray(deal.assignee) ? deal.assignee[0] : deal.assignee) : null,
    error: null,
  };
}
