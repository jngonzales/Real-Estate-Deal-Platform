import { createClient } from "@/utils/supabase/server";
import type { Attachment } from "@/lib/actions/attachment-actions";
import { redirect, notFound } from "next/navigation";
import { DocumentsPageClient } from "./documents-page-client";

interface PageProps {
  params: Promise<{ id: string }>;
}

type AttachmentRow = Pick<Attachment, "id" | "file_name" | "created_at"> &
  Partial<Attachment> & {
    file_url?: string | null;
    file_path?: string | null;
  };

const documentStoragePrefix = "/storage/v1/object/public/deal-documents/";

export default async function DealDocumentsPage({ params }: PageProps) {
  const { id } = await params;
  const supabase = await createClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("organization_id")
    .eq("id", user.id)
    .single();
  const organizationId = profile?.organization_id;
  const legacyScope = `and(organization_id.is.null,or(agent_id.eq.${user.id},assigned_to.eq.${user.id}))`;

  // Get deal info
  const { data: deal, error } = await supabase
    .from("deals")
    .select(`
      id,
      property_id,
      properties(address, city, state)
    `)
    .eq("id", id)
    .or(organizationId ? `organization_id.eq.${organizationId},${legacyScope}` : legacyScope)
    .single();

  if (error || !deal) {
    notFound();
  }

  // Intake photos and document uploads can have different stored metadata.
  const { data: attachments, error: attachmentsError } = await supabase
    .from("attachments")
    .select("*")
    .eq("deal_id", id)
    .order("created_at", { ascending: false });

  const rows = (attachments ?? []) as AttachmentRow[];
  const uploaderIds = [...new Set(rows.flatMap(({ uploaded_by }) => uploaded_by ? [uploaded_by] : []))];
  const uploaderScope = organizationId ? { organization_id: organizationId } : { id: user.id };
  const { data: uploaders } = uploaderIds.length > 0
    ? await supabase.from("profiles").select("id, full_name, email").match(uploaderScope).in("id", uploaderIds)
    : { data: [] };
  const uploaderById = new Map((uploaders ?? []).map((uploader) => [uploader.id, uploader] as const));

  const documents = rows.map(att => {
    const uploader = att.uploaded_by ? uploaderById.get(att.uploaded_by) : undefined;
    const isIntakePhoto = att.file_type === "photo";
    const storageUrl = att.storage_path && URL.canParse(att.storage_path) ? new URL(att.storage_path) : null;
    const canDelete = Boolean(
      storageUrl && (storageUrl.protocol === "https:" || storageUrl.protocol === "http:") &&
      storageUrl.pathname.startsWith(documentStoragePrefix) && storageUrl.pathname.length > documentStoragePrefix.length
    );
    return {
      id: att.id,
      file_name: att.file_name,
      file_type: isIntakePhoto ? "image/*" : att.file_type || "application/octet-stream",
      file_size: att.file_size ?? 0,
      storage_path: att.storage_path || att.file_url || att.file_path || "",
      canDelete,
      category: att.category ?? (isIntakePhoto ? "photo" : "other"),
      description: att.description ?? undefined,
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
  return (
    <DocumentsPageClient
      dealId={id}
      dealAddress={propData?.address}
      dealLocation={[propData?.city, propData?.state].filter(Boolean).join(", ")}
      documents={documents}
      loadError={Boolean(attachmentsError)}
    />
  );
}
