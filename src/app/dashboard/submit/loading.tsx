import { WorkspaceHeading } from "@/components/layout/workspace-heading";

export default function SubmitLoading() {
  return (
    <div className="mx-auto max-w-4xl space-y-6" aria-busy="true">
      <WorkspaceHeading title="Submit a deal" description="Send a property and its estimates to underwriting." />
      <p role="status" className="text-sm text-muted-foreground">Loading intake form…</p>
      <div aria-hidden="true" className="grid gap-4 rounded-lg border border-border bg-card p-4 sm:grid-cols-2 sm:p-6">
        {Array.from({ length: 6 }, (_, index) => (
          <div key={index} className="space-y-2">
            <div className="h-4 w-24 rounded bg-muted" />
            <div className="h-11 rounded-md bg-muted" />
          </div>
        ))}
      </div>
    </div>
  );
}
