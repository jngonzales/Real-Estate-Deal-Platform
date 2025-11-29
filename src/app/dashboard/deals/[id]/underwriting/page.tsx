import { getDeal, getUnderwriting } from "@/lib/actions/deal-actions";
import { UnderwritingClient } from "@/components/deals/underwriting-client";
import { notFound } from "next/navigation";

interface UnderwritingPageProps {
  params: Promise<{ id: string }>;
}

export default async function UnderwritingPage({ params }: UnderwritingPageProps) {
  const { id } = await params;
  
  const [dealResult, underwritingResult] = await Promise.all([
    getDeal(id),
    getUnderwriting(id),
  ]);

  if (dealResult.error || !dealResult.deal) {
    notFound();
  }

  return (
    <UnderwritingClient
      deal={dealResult.deal}
      existingUnderwriting={underwritingResult.underwriting}
    />
  );
}
