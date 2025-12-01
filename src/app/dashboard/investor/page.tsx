import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import { InvestorDashboardClient } from "./investor-dashboard-client";
import { getInvestorDashboard } from "@/lib/actions/investor-actions";

export default async function InvestorDashboardPage() {
  const supabase = await createClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    redirect("/login");
  }
  
  // Check if user is investor
  const { data: profile } = await supabase
    .from("profiles")
    .select("role, full_name")
    .eq("id", user.id)
    .single();
  
  if (profile?.role !== "investor") {
    redirect("/dashboard");
  }
  
  const dashboardData = await getInvestorDashboard();
  
  if (dashboardData.error) {
    redirect("/dashboard");
  }
  
  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
          Investor Dashboard
        </h1>
        <p className="text-slate-600 dark:text-slate-400">
          Welcome back, {profile?.full_name || user.email}
        </p>
      </div>
      
      <InvestorDashboardClient
        availableDeals={dashboardData.availableDeals || []}
        myDeals={dashboardData.myDeals || []}
        fundingRequests={dashboardData.fundingRequests || []}
        stats={dashboardData.stats || {
          totalFunded: 0,
          pendingFunding: 0,
          activeDeals: 0,
          closedDeals: 0,
          totalInvested: 0,
          totalReturns: 0,
          roi: 0,
        }}
      />
    </div>
  );
}
