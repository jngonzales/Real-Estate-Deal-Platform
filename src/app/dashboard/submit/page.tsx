import { DealSubmissionForm } from "@/components/deals/deal-submission-form";
import { WorkspaceHeading } from "@/components/layout/workspace-heading";

export default function SubmitDealPage() {
  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <WorkspaceHeading title="Submit a deal" description="Send a property and its estimates to underwriting." />
      <DealSubmissionForm />
    </div>
  );
}
