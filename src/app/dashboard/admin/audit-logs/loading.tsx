import { WorkspaceHeading } from "@/components/layout/workspace-heading";

export default function AuditLogsLoading() {
  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <WorkspaceHeading title="Audit logs" />
      <p role="status" className="rounded-lg border border-border bg-card p-4 text-sm text-muted-foreground">Loading audit logs…</p>
    </div>
  );
}
