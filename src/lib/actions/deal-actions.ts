"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";
import { dealSubmissionSchema, type DealSubmissionForm } from "@/lib/schemas/deal-submission";

export type DealStatus = "submitted" | "underwriting" | "approved" | "rejected" | "closed";

export type DealWithProperty = {
  id: string;
  property_id: string;
  agent_id: string;
  status: DealStatus;
  asking_price: number;
  offer_price: number | null;
  seller_name: string;
  seller_phone: string | null;
  seller_email: string | null;
  seller_motivation: string | null;
  notes: string | null;
  created_at: string;
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
  };
};

export async function getDeals(): Promise<{ deals: DealWithProperty[] | null; error: string | null }> {
  const supabase = await createClient();

  const { data: { user }, error: userError } = await supabase.auth.getUser();

  if (userError || !user) {
    return { deals: null, error: "You must be logged in to view deals" };
  }

  const { data: deals, error } = await supabase
    .from("deals")
    .select(`
      *,
      property:properties(*)
    `)
    .eq("agent_id", user.id)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching deals:", error);
    return { deals: null, error: `Failed to fetch deals: ${error.message}` };
  }

  return { deals: deals as DealWithProperty[], error: null };
}

export async function updateDealStatus(dealId: string, status: DealStatus): Promise<{ success: boolean; error: string | null }> {
  const supabase = await createClient();

  const { data: { user }, error: userError } = await supabase.auth.getUser();

  if (userError || !user) {
    return { success: false, error: "You must be logged in to update deals" };
  }

  const { error } = await supabase
    .from("deals")
    .update({ status })
    .eq("id", dealId)
    .eq("agent_id", user.id);

  if (error) {
    console.error("Error updating deal status:", error);
    return { success: false, error: "Failed to update deal status" };
  }

  revalidatePath("/dashboard/deals");
  return { success: true, error: null };
}

export async function getDeal(dealId: string): Promise<{ deal: DealWithProperty | null; error: string | null }> {
  const supabase = await createClient();

  const { data: { user }, error: userError } = await supabase.auth.getUser();

  if (userError || !user) {
    return { deal: null, error: "You must be logged in to view this deal" };
  }

  const { data: deal, error } = await supabase
    .from("deals")
    .select(`
      *,
      property:properties(*)
    `)
    .eq("id", dealId)
    .eq("agent_id", user.id)
    .single();

  if (error) {
    console.error("Error fetching deal:", error);
    return { deal: null, error: "Deal not found" };
  }

  return { deal: deal as DealWithProperty, error: null };
}

export async function getDealAttachments(dealId: string): Promise<{ attachments: any[] | null; error: string | null }> {
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
