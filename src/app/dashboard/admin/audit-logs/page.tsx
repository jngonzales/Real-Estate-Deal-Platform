import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import { getAuditLogs } from "@/lib/actions/audit-actions";
import { AuditLogsClient } from "./audit-logs-client";

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
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
          Audit Logs
        </h1>
        <p className="text-slate-600 dark:text-slate-400">
          Track all system activity and changes
        </p>
      </div>

      <AuditLogsClient 
        initialLogs={logs} 
        totalCount={total}
        error={error}
      />
    </div>
  );
}
