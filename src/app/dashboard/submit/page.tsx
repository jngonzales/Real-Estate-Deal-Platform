import { DealSubmissionForm } from "@/components/deals/deal-submission-form";

export default function SubmitDealPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground dark:text-white">Submit New Deal</h2>
        <p className="text-muted-foreground dark:text-muted-foreground">
          Submit a new property deal for underwriting review. Complete each step to analyze the deal.
        </p>
      </div>
      <DealSubmissionForm />
    </div>
  );
}
