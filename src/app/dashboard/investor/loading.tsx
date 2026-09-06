import { WorkspaceHeading } from "@/components/layout/workspace-heading";

export default function InvestorLoading() {
  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <WorkspaceHeading title="Investor dashboard" />
      <p role="status" className="rounded-lg border border-border bg-card p-4 text-sm text-muted-foreground">Loading investment data…</p>
    </div>
  );
}
