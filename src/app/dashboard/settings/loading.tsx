import { WorkspaceHeading } from "@/components/layout/workspace-heading";

export default function SettingsLoading() {
  return (
    <div className="space-y-6">
      <WorkspaceHeading title="Settings" />
      <div role="status" className="text-muted-foreground">Loading settings…</div>
      <div className="grid gap-4 xl:grid-cols-2" aria-hidden="true">
        {[0, 1, 2, 3].map((index) => (
          <div key={index} className="space-y-4 rounded-lg border border-border bg-card p-4 sm:p-6">
            <div className="h-5 w-36 max-w-full rounded bg-muted motion-safe:animate-pulse" />
            <div className="h-4 w-56 max-w-full rounded bg-muted motion-safe:animate-pulse" />
            <div className="h-4 w-44 max-w-full rounded bg-muted motion-safe:animate-pulse" />
          </div>
        ))}
      </div>
    </div>
  );
}
