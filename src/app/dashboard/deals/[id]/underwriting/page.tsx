import { getDeal, getUnderwriting } from "@/lib/actions/deal-actions";
import { UnderwritingClient } from "@/components/deals/underwriting-client";
import { DealWorkspaceHeading } from "@/components/deals/deal-workspace-heading";
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

  if (underwritingResult.error) {
    return (
      <div className="space-y-6">
        <DealWorkspaceHeading
          address={dealResult.deal.property?.address}
          section="Underwriting"
          status={dealResult.deal.status}
          backHref={"/dashboard/deals/" + id}
          backLabel="Back to deal"
        />
        <p role="alert" className="rounded-lg border border-border bg-card p-4 text-sm">
          The underwriting worksheet could not be loaded. Refresh the page to try again.
        </p>
      </div>
    );
  }

  return (
    <UnderwritingClient
      deal={dealResult.deal}
      existingUnderwriting={underwritingResult.underwriting}
    />
  );
}
