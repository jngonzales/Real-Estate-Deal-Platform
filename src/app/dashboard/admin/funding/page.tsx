import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import { FundingManagementClient } from "./funding-management-client";
import { getAllFundingRequests } from "@/lib/actions/investor-actions";

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
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
          Funding Requests
        </h1>
        <p className="text-slate-600 dark:text-slate-400">
          Manage investor funding requests
        </p>
      </div>
      
      {error ? (
        <div className="text-red-500">{error}</div>
      ) : (
        <FundingManagementClient requests={requests || []} />
      )}
    </div>
  );
}
