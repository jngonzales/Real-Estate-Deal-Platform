"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";

export type AttachmentCategory = 
  | "photo"
  | "contract"
  | "inspection"
  | "appraisal"
  | "title"
  | "insurance"
  | "closing"
  | "other";

export interface Attachment {
  id: string;
  deal_id: string;
  property_id: string | null;
  uploaded_by: string;
  file_name: string;
  file_type: string | null;
  file_size: number | null;
  storage_path: string;
  category: AttachmentCategory;
  description: string | null;
  is_public: boolean;
  created_at: string;
}

export async function uploadDealDocument(formData: FormData): Promise<{
  attachment: Attachment | null;
  error: string | null;
}> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    return { attachment: null, error: "Not authenticated" };
  }

  const file = formData.get("file") as File;
  const dealId = formData.get("dealId") as string;
  const category = (formData.get("category") as AttachmentCategory) || "other";

  if (!file || !dealId) {
    return { attachment: null, error: "Missing file or deal ID" };
  }

  try {
    // Upload file to storage
    const fileExt = file.name.split(".").pop();
    const fileName = `${dealId}/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
    
    const { error: uploadError } = await supabase.storage
      .from("deal-documents")
      .upload(fileName, file, {
        contentType: file.type,
        cacheControl: "3600",
      });

    if (uploadError) {
      console.error("Upload error:", uploadError);
      return { attachment: null, error: "Failed to upload file" };
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from("deal-documents")
      .getPublicUrl(fileName);

    // Get property_id from deal
    const { data: deal } = await supabase
      .from("deals")
      .select("property_id")
      .eq("id", dealId)
      .single();

    // Create attachment record
    const { data: attachment, error: dbError } = await supabase
      .from("attachments")
      .insert({
        deal_id: dealId,
        property_id: deal?.property_id || null,
        uploaded_by: user.id,
        file_name: file.name,
        file_type: file.type,
        file_size: file.size,
        storage_path: urlData.publicUrl,
        category,
        is_public: false,
      })
      .select()
      .single();

    if (dbError) {
      console.error("DB error:", dbError);
      // Clean up uploaded file
      await supabase.storage.from("deal-documents").remove([fileName]);
      return { attachment: null, error: "Failed to save attachment record" };
    }

    revalidatePath(`/dashboard/deals/${dealId}`);
    revalidatePath(`/dashboard/deals/${dealId}/documents`);
    
    return { attachment, error: null };
  } catch (error) {
    console.error("Upload error:", error);
    return { attachment: null, error: "An error occurred during upload" };
  }
}

export async function deleteDealDocument(attachmentId: string): Promise<{
  success: boolean;
  error: string | null;
}> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    return { success: false, error: "Not authenticated" };
  }

  try {
    // Get attachment info first
    const { data: attachment } = await supabase
      .from("attachments")
      .select("*")
      .eq("id", attachmentId)
      .single();

    if (!attachment) {
      return { success: false, error: "Attachment not found" };
    }

    // Delete from storage
    if (attachment.storage_path) {
      // Extract path from URL
      const url = new URL(attachment.storage_path);
      const pathParts = url.pathname.split("/storage/v1/object/public/deal-documents/");
      if (pathParts[1]) {
        await supabase.storage.from("deal-documents").remove([pathParts[1]]);
      }
    }

    // Delete record
    const { error } = await supabase
      .from("attachments")
      .delete()
      .eq("id", attachmentId);

    if (error) {
      console.error("Delete error:", error);
      return { success: false, error: "Failed to delete attachment" };
    }

    revalidatePath(`/dashboard/deals/${attachment.deal_id}`);
    revalidatePath(`/dashboard/deals/${attachment.deal_id}/documents`);
    
    return { success: true, error: null };
  } catch (error) {
    console.error("Delete error:", error);
    return { success: false, error: "An error occurred during deletion" };
  }
}

export async function getDealDocuments(dealId: string): Promise<{
  attachments: Attachment[];
  error: string | null;
}> {
  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from("attachments")
    .select("*")
    .eq("deal_id", dealId)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Fetch error:", error);
    return { attachments: [], error: error.message };
  }

  return { attachments: data || [], error: null };
}

export async function updateDocumentCategory(
  attachmentId: string, 
  category: AttachmentCategory
): Promise<{ success: boolean; error: string | null }> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    return { success: false, error: "Not authenticated" };
  }

  const { error } = await supabase
    .from("attachments")
    .update({ category })
    .eq("id", attachmentId);

  if (error) {
    return { success: false, error: error.message };
  }

  return { success: true, error: null };
}
