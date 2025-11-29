import { getDeal, getDealAttachments } from "@/lib/actions/deal-actions";
import { getCurrentUserProfile } from "@/lib/actions/user-actions";
import { DealDetailClient } from "@/components/deals/deal-detail-client";
import { notFound } from "next/navigation";

interface DealPageProps {
  params: Promise<{ id: string }>;
}

export default async function DealPage({ params }: DealPageProps) {
  const { id } = await params;
  
  const [dealResult, attachmentsResult, profileResult] = await Promise.all([
    getDeal(id),
    getDealAttachments(id),
    getCurrentUserProfile(),
  ]);

  if (dealResult.error || !dealResult.deal) {
    notFound();
  }

  const isAdmin = profileResult.profile?.role === "admin" || profileResult.profile?.role === "underwriter";

  return (
    <DealDetailClient
      deal={dealResult.deal}
      attachments={attachmentsResult.attachments || []}
      isAdmin={isAdmin}
    />
  );
}
