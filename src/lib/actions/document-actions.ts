"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";
import { createDealActivity } from "./activity-actions";

export type DocumentStatus = "draft" | "sent" | "viewed" | "signed" | "declined" | "expired";

export type OfferDocument = {
  id: string;
  deal_id: string;
  created_by: string;
  template_type: string;
  pdf_url: string | null;
  sent_at: string | null;
  viewed_at: string | null;
  signed_at: string | null;
  docusign_envelope_id: string | null;
  status: DocumentStatus;
  created_at: string;
  updated_at: string;
};

export async function createOfferDocument(dealId: string, pdfUrl: string, templateType = "standard") {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) return { error: "Not authenticated" };
  
  const { data: doc, error } = await supabase
    .from("offer_documents")
    .insert({
      deal_id: dealId,
      created_by: user.id,
      template_type: templateType,
      pdf_url: pdfUrl,
      status: "draft",
    })
    .select()
    .single();
  
  if (error) {
    console.error("Error creating offer document:", error);
    return { error: "Failed to create offer document" };
  }
  
  // Log activity
  await createDealActivity({
    dealId,
    activityType: "offer_generated",
    description: "Offer document generated",
    metadata: { documentId: doc.id, templateType },
  });
  
  revalidatePath(`/dashboard/deals/${dealId}`);
  return { document: doc, error: null };
}

export async function getOfferDocuments(dealId: string) {
  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from("offer_documents")
    .select(`
      *,
      created_by_profile:created_by(full_name, email)
    `)
    .eq("deal_id", dealId)
    .order("created_at", { ascending: false });
  
  if (error) {
    return { documents: [], error: error.message };
  }
  
  return { documents: data, error: null };
}

export async function updateDocumentStatus(documentId: string, status: DocumentStatus) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) return { error: "Not authenticated" };
  
  const updates: Record<string, unknown> = { 
    status,
    updated_at: new Date().toISOString(),
  };
  
  // Set timestamp based on status
  if (status === "sent") updates.sent_at = new Date().toISOString();
  if (status === "viewed") updates.viewed_at = new Date().toISOString();
  if (status === "signed") updates.signed_at = new Date().toISOString();
  
  const { data: doc, error } = await supabase
    .from("offer_documents")
    .update(updates)
    .eq("id", documentId)
    .select()
    .single();
  
  if (error) {
    return { error: "Failed to update document" };
  }
  
  // Log activity
  if (doc) {
    await createDealActivity({
      dealId: doc.deal_id,
      activityType: status === "sent" ? "offer_sent" : "deal_updated",
      description: `Offer document ${status}`,
      metadata: { documentId, status },
    });
  }
  
  revalidatePath(`/dashboard/deals/${doc?.deal_id}`);
  return { document: doc, error: null };
}

export async function deleteOfferDocument(documentId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) return { error: "Not authenticated" };
  
  // Get document first to check permissions
  const { data: doc } = await supabase
    .from("offer_documents")
    .select("*, deal_id")
    .eq("id", documentId)
    .single();
  
  if (!doc) return { error: "Document not found" };
  
  // Only allow deletion of draft documents
  if (doc.status !== "draft") {
    return { error: "Can only delete draft documents" };
  }
  
  // Delete from storage if exists
  if (doc.pdf_url) {
    const path = doc.pdf_url.split("/").pop();
    if (path) {
      await supabase.storage.from("offer-documents").remove([path]);
    }
  }
  
  const { error } = await supabase
    .from("offer_documents")
    .delete()
    .eq("id", documentId);
  
  if (error) {
    return { error: "Failed to delete document" };
  }
  
  revalidatePath(`/dashboard/deals/${doc.deal_id}`);
  return { error: null };
}

// Upload a document file to storage
export async function uploadOfferDocument(dealId: string, file: File) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) return { error: "Not authenticated" };
  
  const fileName = `${dealId}/${Date.now()}-${file.name}`;
  
  const { data, error } = await supabase.storage
    .from("offer-documents")
    .upload(fileName, file, {
      contentType: file.type,
      upsert: false,
    });
  
  if (error) {
    console.error("Error uploading document:", error);
    return { error: "Failed to upload document" };
  }
  
  const { data: { publicUrl } } = supabase.storage
    .from("offer-documents")
    .getPublicUrl(data.path);
  
  return { url: publicUrl, error: null };
}
