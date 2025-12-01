import { createClient } from "@/utils/supabase/server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Building2, FileText, DollarSign, TrendingUp, Clock, ArrowRight, Plus, Users } from "lucide-react";
import Link from "next/link";
import { DashboardCharts } from "@/components/dashboard/dashboard-charts";
import { DashboardActivity } from "@/components/dashboard/dashboard-activity";

export default async function DashboardPage() {
  const supabase = await createClient();

  // Get current user and their role
  const { data: { user } } = await supabase.auth.getUser();
  
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user?.id)
    .single();

  const isAdmin = profile?.role === "admin";
  const isUnderwriter = profile?.role === "underwriter";
  const showAllDeals = isAdmin || isUnderwriter;

  // Run ALL queries in parallel for maximum speed
  const agentFilter = !showAllDeals ? user?.id : null;
  
  const [
    dealsCountResult,
    propertiesCountResult,
    submittedCountResult,
    closedCountResult,
    allDealsResult,
    recentDealsResult,
    pipelineResult,
    usersCountResult,
  ] = await Promise.all([
    // Deals count
    agentFilter 
      ? supabase.from("deals").select("*", { count: "exact", head: true }).eq("agent_id", agentFilter)
      : supabase.from("deals").select("*", { count: "exact", head: true }),
    
    // Properties count
    agentFilter
      ? supabase.from("properties").select("*", { count: "exact", head: true }).eq("created_by", agentFilter)
      : supabase.from("properties").select("*", { count: "exact", head: true }),
    
    // Submitted count
    agentFilter
      ? supabase.from("deals").select("*", { count: "exact", head: true }).eq("status", "submitted").eq("agent_id", agentFilter)
      : supabase.from("deals").select("*", { count: "exact", head: true }).eq("status", "submitted"),
    
    // Closed count
    agentFilter
      ? supabase.from("deals").select("*", { count: "exact", head: true }).eq("status", "closed").eq("agent_id", agentFilter)
      : supabase.from("deals").select("*", { count: "exact", head: true }).eq("status", "closed"),
    
    // All deals for chart
    agentFilter
      ? supabase.from("deals").select("status").eq("agent_id", agentFilter)
      : supabase.from("deals").select("status"),
    
    // Recent deals
    agentFilter
      ? supabase.from("deals").select(`
          id, status, asking_price, submitted_at, seller_name,
          property:properties(address, city, state),
          agent:profiles!deals_agent_id_fkey(full_name, email)
        `).eq("agent_id", agentFilter).order("submitted_at", { ascending: false }).limit(5)
      : supabase.from("deals").select(`
          id, status, asking_price, submitted_at, seller_name,
          property:properties(address, city, state),
          agent:profiles!deals_agent_id_fkey(full_name, email)
        `).order("submitted_at", { ascending: false }).limit(5),
    
    // Pipeline value
    agentFilter
      ? supabase.from("deals").select("asking_price").in("status", ["submitted", "needs_info", "underwriting", "offer_prepared", "offer_sent", "in_contract", "funding"]).eq("agent_id", agentFilter)
      : supabase.from("deals").select("asking_price").in("status", ["submitted", "needs_info", "underwriting", "offer_prepared", "offer_sent", "in_contract", "funding"]),
    
    // Users count (admin only)
    isAdmin 
      ? supabase.from("profiles").select("*", { count: "exact", head: true })
      : Promise.resolve({ count: 0 }),
  ]);

  const dealsCount = dealsCountResult.count || 0;
  const propertiesCount = propertiesCountResult.count || 0;
  const submittedCount = submittedCountResult.count || 0;
  const closedCount = closedCountResult.count || 0;
  const allDeals = allDealsResult.data;
  const recentDeals = recentDealsResult.data;
  const pipelineData = pipelineResult.data;
  const usersCount = usersCountResult.count || 0;

  const dealsByStatus = {
    submitted: 0,
    needs_info: 0,
    underwriting: 0,
    offer_prepared: 0,
    offer_sent: 0,
    in_contract: 0,
    funding: 0,
    closed: 0,
    rejected: 0,
  };

  allDeals?.forEach((deal) => {
    if (deal.status in dealsByStatus) {
      dealsByStatus[deal.status as keyof typeof dealsByStatus]++;
    }
  });
  
  const pipelineValue = pipelineData?.reduce((sum, deal) => sum + (deal.asking_price || 0), 0) || 0;

  const stats = [
    {
      title: "Total Deals",
      value: dealsCount ?? 0,
      icon: FileText,
      description: showAllDeals ? "All deals in system" : "Your deals",
      color: "text-blue-600",
      bgColor: "bg-blue-50",
    },
    {
      title: "Properties",
      value: propertiesCount ?? 0,
      icon: Building2,
      description: "Total properties",
      color: "text-purple-600",
      bgColor: "bg-purple-50",
    },
    {
      title: "Pending Review",
      value: submittedCount ?? 0,
      icon: Clock,
      description: "Awaiting underwriting",
      color: "text-yellow-600",
      bgColor: "bg-yellow-50",
    },
    ...(isAdmin ? [{
      title: "Team Members",
      value: usersCount,
      icon: Users,
      description: "Active users",
      color: "text-indigo-600",
      bgColor: "bg-indigo-50",
    }] : [{
      title: "Closed Deals",
      value: closedCount ?? 0,
      icon: TrendingUp,
      description: "Successfully closed",
      color: "text-green-600",
      bgColor: "bg-green-50",
    }]),
  ];

  const statusColors: Record<string, string> = {
    submitted: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
    needs_info: "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400",
    underwriting: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400",
    offer_prepared: "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400",
    offer_sent: "bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-400",
    in_contract: "bg-cyan-100 text-cyan-800 dark:bg-cyan-900/30 dark:text-cyan-400",
    funding: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400",
    closed: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
    rejected: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
  };

  const statusLabels: Record<string, string> = {
    submitted: "Submitted",
    needs_info: "Needs Info",
    underwriting: "Underwriting",
    offer_prepared: "Offer Ready",
    offer_sent: "Offer Sent",
    in_contract: "In Contract",
    funding: "Funding",
    closed: "Closed",
    rejected: "Rejected",
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Dashboard</h2>
          <p className="text-muted-foreground">
            {showAllDeals ? "Company-wide pipeline overview" : "Your deal pipeline at a glance"}
          </p>
        </div>
        <Link
          href="/dashboard/submit"
          className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 transition-colors"
        >
          <Plus className="h-4 w-4" />
          New Deal
        </Link>
      </div>

      {/* Pipeline Value Banner */}
      <div className="rounded-xl bg-linear-to-r from-blue-600 to-blue-800 p-6 text-white dark:from-blue-700 dark:to-blue-900">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-medium text-blue-100">Total Pipeline Value</p>
            <p className="mt-1 text-3xl font-bold">{formatCurrency(pipelineValue)}</p>
            <p className="mt-1 text-sm text-blue-200">
              Across {(dealsCount || 0) - (closedCount || 0) - (dealsByStatus.rejected || 0)} active deals
            </p>
          </div>
          <div className="flex items-center gap-2">
            <DollarSign className="h-12 w-12 text-blue-300/50" />
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.title} className="overflow-hidden border-border bg-card">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">{stat.title}</p>
                  <p className="mt-2 text-3xl font-bold text-foreground">{stat.value}</p>
                  <p className="mt-1 text-xs text-muted-foreground">{stat.description}</p>
                </div>
                <div className={`rounded-full p-3 ${stat.bgColor} dark:bg-opacity-20`}>
                  <stat.icon className={`h-6 w-6 ${stat.color}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts Section */}
      <DashboardCharts dealsByStatus={dealsByStatus} />

      {/* Recent Deals */}
      <Card className="border-border bg-card">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-foreground">Recent Deals</CardTitle>
          <Link
            href="/dashboard/deals"
            className="text-sm font-medium text-muted-foreground hover:text-foreground inline-flex items-center"
          >
            View all
            <ArrowRight className="ml-1 h-4 w-4" />
          </Link>
        </CardHeader>
        <CardContent>
          {recentDeals && recentDeals.length > 0 ? (
            <div className="space-y-4">
              {recentDeals.map((deal) => {
                const property = Array.isArray(deal.property) ? deal.property[0] : deal.property;
                const agent = Array.isArray(deal.agent) ? deal.agent[0] : deal.agent;
                return (
                <Link
                  key={deal.id}
                  href={`/dashboard/deals/${deal.id}`}
                  className="flex items-center justify-between rounded-lg border border-border p-4 hover:bg-accent transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
                      <Building2 className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <div>
                      <p className="font-medium text-foreground">
                        {property?.address || "Unknown Address"}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {property?.city}, {property?.state}
                        {showAllDeals && agent && (
                          <span className="ml-2 text-xs">• {agent.full_name || agent.email}</span>
                        )}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="font-medium text-foreground">
                        {formatCurrency(deal.asking_price)}
                      </p>
                      <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${statusColors[deal.status] || statusColors.submitted}`}>
                        {statusLabels[deal.status] || deal.status}
                      </span>
                    </div>
                    <ArrowRight className="h-5 w-5 text-muted-foreground" />
                  </div>
                </Link>
              )})}
            </div>
          ) : (
            <div className="rounded-lg border-2 border-dashed border-border p-8 text-center">
              <Building2 className="mx-auto h-12 w-12 text-muted-foreground" />
              <h3 className="mt-4 text-lg font-medium text-foreground">No deals yet</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                Start by submitting your first property deal for review.
              </p>
              <Link
                href="/dashboard/submit"
                className="mt-4 inline-flex items-center rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
              >
                <Plus className="mr-2 h-4 w-4" />
                Submit Deal
              </Link>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Activity Feed */}
      <DashboardActivity />

      {/* Quick Tips */}
      <Card className="border-border bg-card">
        <CardHeader>
          <CardTitle className="text-foreground">Getting Started</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="rounded-lg bg-blue-500/10 p-4">
              <h4 className="font-medium text-blue-600 dark:text-blue-400">Submit Deals</h4>
              <p className="mt-1 text-sm text-blue-600/80 dark:text-blue-300">
                Add property details and seller information to begin the review process.
              </p>
            </div>
            <div className="rounded-lg bg-amber-500/10 p-4">
              <h4 className="font-medium text-amber-600 dark:text-amber-400">Underwriting</h4>
              <p className="mt-1 text-sm text-amber-600/80 dark:text-amber-300">
                Calculate maximum allowable offer using ARV and repair estimates.
              </p>
            </div>
            <div className="rounded-lg bg-emerald-500/10 p-4">
              <h4 className="font-medium text-emerald-600 dark:text-emerald-400">Track Progress</h4>
              <p className="mt-1 text-sm text-emerald-600/80 dark:text-emerald-300">
                Monitor your deals through each stage of the pipeline.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
