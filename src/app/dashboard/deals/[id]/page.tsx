import { getDeal, getDealAttachments } from "@/lib/actions/deal-actions";
import { DealDetailClient } from "@/components/deals/deal-detail-client";
import { notFound } from "next/navigation";

interface DealPageProps {
  params: Promise<{ id: string }>;
}

export default async function DealPage({ params }: DealPageProps) {
  const { id } = await params;
  
  const [dealResult, attachmentsResult] = await Promise.all([
    getDeal(id),
    getDealAttachments(id),
  ]);

  if (dealResult.error || !dealResult.deal) {
    notFound();
  }

  return (
    <DealDetailClient
      deal={dealResult.deal}
      attachments={attachmentsResult.attachments || []}
    />
  );
}
