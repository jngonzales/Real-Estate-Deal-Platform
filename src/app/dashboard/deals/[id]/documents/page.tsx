import { createClient } from "@/utils/supabase/server";
import { redirect, notFound } from "next/navigation";
import { DocumentsPageClient } from "./documents-page-client";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function DealDocumentsPage({ params }: PageProps) {
  const { id } = await params;
  const supabase = await createClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  // Get deal info
  const { data: deal, error } = await supabase
    .from("deals")
    .select(`
      id,
      property_id,
      properties(address, city, state)
    `)
    .eq("id", id)
    .single();

  if (error || !deal) {
    notFound();
  }

  // Get attachments for this deal
  const { data: attachments } = await supabase
    .from("attachments")
    .select(`
      id,
      file_name,
      file_type,
      file_size,
      storage_path,
      category,
      description,
      created_at,
      uploaded_by(full_name, email)
    `)
    .eq("deal_id", id)
    .order("created_at", { ascending: false });

  // Transform to Document type
  const documents = (attachments || []).map(att => {
    const uploader = Array.isArray(att.uploaded_by) ? att.uploaded_by[0] : att.uploaded_by;
    return {
      id: att.id,
      file_name: att.file_name,
      file_type: att.file_type || "application/octet-stream",
      file_size: att.file_size || 0,
      storage_path: att.storage_path,
      category: att.category || "other",
      description: att.description,
      version: 1,
      uploaded_by: {
        full_name: uploader?.full_name || "Unknown",
        email: uploader?.email || "",
      },
      created_at: att.created_at,
      is_public: false,
    };
  });

  const propData = Array.isArray(deal.properties) ? deal.properties[0] : deal.properties;
  const dealAddress = propData 
    ? `${propData.address}, ${propData.city}, ${propData.state}`
    : "Unknown Property";

  return (
    <DocumentsPageClient 
      dealId={id}
      dealAddress={dealAddress}
      documents={documents}
    />
  );
}
