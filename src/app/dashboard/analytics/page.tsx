import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import { AnalyticsClient } from "./analytics-client";

export default async function AnalyticsPage() {
  const supabase = await createClient();

  const { data: { user }, error: userError } = await supabase.auth.getUser();

  if (userError || !user) {
    redirect("/login");
  }

  // Check if user is admin or underwriter
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profile?.role === "agent") {
    redirect("/dashboard");
  }

  // Fetch all data in parallel for maximum speed
  const [dealsResult, agentsResult] = await Promise.all([
    supabase
      .from("deals")
      .select(`
        id,
        status,
        asking_price,
        offer_price,
        agent_id,
        assigned_to,
        submitted_at,
        updated_at,
        properties(address, city, state, property_type)
      `)
      .order("submitted_at", { ascending: false }),
    supabase
      .from("profiles")
      .select("id, full_name, email, role")
      .eq("role", "agent"),
  ]);

  const deals = dealsResult.data;
  const agents = agentsResult.data;

  // Calculate metrics
  const totalDeals = deals?.length || 0;
  const closedDeals = deals?.filter(d => d.status === "closed") || [];
  const activeDeals = deals?.filter(d => !["closed", "rejected"].includes(d.status)) || [];
  const rejectedDeals = deals?.filter(d => d.status === "rejected") || [];

  // Calculate total values
  const totalPipelineValue = activeDeals.reduce((sum, d) => sum + (d.asking_price || 0), 0);
  const totalClosedValue = closedDeals.reduce((sum, d) => sum + (d.offer_price || d.asking_price || 0), 0);

  // Status distribution
  const statusCounts: Record<string, number> = {};
  deals?.forEach(deal => {
    statusCounts[deal.status] = (statusCounts[deal.status] || 0) + 1;
  });

  // Agent performance
  const agentPerformance = agents?.map(agent => {
    const agentDeals = deals?.filter(d => d.agent_id === agent.id) || [];
    const agentClosed = agentDeals.filter(d => d.status === "closed");
    const agentActive = agentDeals.filter(d => !["closed", "rejected"].includes(d.status));
    
    return {
      id: agent.id,
      name: agent.full_name || agent.email,
      totalDeals: agentDeals.length,
      closedDeals: agentClosed.length,
      activeDeals: agentActive.length,
      closedValue: agentClosed.reduce((sum, d) => sum + (d.offer_price || d.asking_price || 0), 0),
      conversionRate: agentDeals.length > 0 
        ? Math.round((agentClosed.length / agentDeals.length) * 100) 
        : 0,
    };
  }).sort((a, b) => b.closedDeals - a.closedDeals) || [];

  // Monthly trends (last 6 months)
  const monthlyData: { month: string; submitted: number; closed: number; value: number }[] = [];
  const now = new Date();
  for (let i = 5; i >= 0; i--) {
    const monthDate = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const monthEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 0);
    const monthName = monthDate.toLocaleDateString("en-US", { month: "short", year: "2-digit" });
    
    const monthDeals = deals?.filter(d => {
      const submittedDate = new Date(d.submitted_at);
      return submittedDate >= monthDate && submittedDate <= monthEnd;
    }) || [];
    
    const monthClosed = deals?.filter(d => {
      if (d.status !== "closed") return false;
      const updatedDate = new Date(d.updated_at);
      return updatedDate >= monthDate && updatedDate <= monthEnd;
    }) || [];

    monthlyData.push({
      month: monthName,
      submitted: monthDeals.length,
      closed: monthClosed.length,
      value: monthClosed.reduce((sum, d) => sum + (d.offer_price || d.asking_price || 0), 0),
    });
  }

  // Property type distribution
  const propertyTypes: Record<string, number> = {};
  deals?.forEach(deal => {
    const type = (deal.properties as { property_type?: string })?.property_type || "other";
    propertyTypes[type] = (propertyTypes[type] || 0) + 1;
  });

  // Average days in pipeline (rough calculation)
  const avgDaysInPipeline = closedDeals.length > 0
    ? Math.round(closedDeals.reduce((sum, d) => {
        const days = Math.ceil((new Date(d.updated_at).getTime() - new Date(d.submitted_at).getTime()) / (1000 * 60 * 60 * 24));
        return sum + days;
      }, 0) / closedDeals.length)
    : 0;

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
          Analytics Dashboard
        </h1>
        <p className="text-slate-600 dark:text-slate-400">
          Performance metrics and pipeline insights
        </p>
      </div>

      <AnalyticsClient
        metrics={{
          totalDeals,
          activeDeals: activeDeals.length,
          closedDeals: closedDeals.length,
          rejectedDeals: rejectedDeals.length,
          totalPipelineValue,
          totalClosedValue,
          avgDaysInPipeline,
          conversionRate: totalDeals > 0 ? Math.round((closedDeals.length / totalDeals) * 100) : 0,
        }}
        statusCounts={statusCounts}
        agentPerformance={agentPerformance}
        monthlyData={monthlyData}
        propertyTypes={propertyTypes}
      />
    </div>
  );
}
