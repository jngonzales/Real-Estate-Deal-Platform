import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import { getAuditLogs } from "@/lib/actions/audit-actions";
import { AuditLogsClient } from "./audit-logs-client";
import { WorkspaceHeading } from "@/components/layout/workspace-heading";

export default async function AuditLogsPage() {
  const supabase = await createClient();

  const { data: { user }, error: userError } = await supabase.auth.getUser();

  if (userError || !user) {
    redirect("/login");
  }

  // Check if user is admin
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "admin") {
    redirect("/dashboard");
  }

  // Fetch initial audit logs
  const { logs, total, error } = await getAuditLogs({ limit: 50 });

  return (
    <div className="mx-auto min-w-0 max-w-7xl space-y-6">
      <WorkspaceHeading title="Audit logs" />

      <AuditLogsClient 
        initialLogs={logs} 
        totalCount={total}
        error={error}
      />
    </div>
  );
}
