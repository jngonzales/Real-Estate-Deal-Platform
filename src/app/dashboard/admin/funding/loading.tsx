import { WorkspaceHeading } from "@/components/layout/workspace-heading";

export default function FundingLoading() {
  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <WorkspaceHeading title="Funding requests" />
      <p role="status" className="rounded-lg border border-border bg-card p-4 text-sm text-muted-foreground">Loading funding requests…</p>
    </div>
  );
}
