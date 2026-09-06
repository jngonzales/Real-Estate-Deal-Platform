import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import { FundingManagementClient } from "./funding-management-client";
import { getAllFundingRequests } from "@/lib/actions/investor-actions";
import { WorkspaceHeading } from "@/components/layout/workspace-heading";

export default async function FundingManagementPage() {
  const supabase = await createClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    redirect("/login");
  }
  
  // Check if user is admin or underwriter
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();
  
  if (!["admin", "underwriter"].includes(profile?.role || "")) {
    redirect("/dashboard");
  }
  
  const { requests, error } = await getAllFundingRequests();
  
  return (
    <div className="mx-auto min-w-0 max-w-7xl space-y-6">
      <WorkspaceHeading title="Funding requests" />
      
      {error ? (
        <div role="alert" className="rounded-lg border border-border bg-card p-4 text-sm text-destructive">{error}</div>
      ) : (
        <FundingManagementClient requests={requests || []} />
      )}
    </div>
  );
}
