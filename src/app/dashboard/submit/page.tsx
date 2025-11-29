import { DealSubmissionForm } from "@/components/deals/deal-submission-form";

export default function SubmitDealPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-900">Submit New Deal</h2>
        <p className="text-slate-600">
          Submit a new property deal for underwriting review.
        </p>
      </div>
      <DealSubmissionForm />
    </div>
  );
}
