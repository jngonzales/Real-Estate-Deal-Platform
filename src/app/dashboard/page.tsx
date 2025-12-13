import { createClient } from "@/utils/supabase/server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Building2, FileText, DollarSign, TrendingUp, Clock, ArrowRight, Plus, Users, Sparkles } from "lucide-react";
import Link from "next/link";
import { DashboardCharts } from "@/components/dashboard/dashboard-charts";
import { DashboardActivity } from "@/components/dashboard/dashboard-activity";
import { PremiumHeader } from "@/components/layout/premium-header";
import { PremiumCard } from "@/components/ui/premium-card";
import { PremiumBadge } from "@/components/ui/premium-badge";

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
    <div className="space-y-6 gradient-bg min-h-screen">
      {/* Premium Header */}
      <PremiumHeader
        title="Dashboard"
        subtitle={showAllDeals ? "Company-wide pipeline overview" : "Your deal pipeline at a glance"}
        stats={[
          {
            label: "Pipeline Value",
            value: formatCurrency(pipelineValue),
            trend: 12.5,
            icon: <DollarSign className="w-6 h-6 text-primary" />,
          },
          {
            label: "Active Deals",
            value: String((dealsCount || 0) - (closedCount || 0) - (dealsByStatus.rejected || 0)),
            trend: 8,
            icon: <TrendingUp className="w-6 h-6 text-chart-2" />,
          },
          {
            label: "Closed This Month",
            value: String(closedCount ?? 0),
            trend: -3,
            icon: <FileText className="w-6 h-6 text-chart-3" />,
          },
        ]}
      />

      <div className="px-6 pb-6 space-y-6">
        {/* Quick Actions with Premium Badge */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            <h2 className="text-lg font-semibold text-foreground">Quick Actions</h2>
            <PremiumBadge variant="premium" pulse>Pro</PremiumBadge>
          </div>
          <Link
            href="/dashboard/submit"
            className="btn-premium inline-flex items-center gap-2 rounded-lg px-6 py-3 text-sm font-semibold text-white shadow-lg hover:shadow-xl transition-all"
          >
            <Plus className="h-4 w-4" />
            New Deal
          </Link>
        </div>

        {/* Stats Grid with enhanced hover */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat, idx) => {
            const Icon = stat.icon;
            return (
              <PremiumCard 
                key={stat.title} 
                title={stat.title}
                description={stat.description}
                gradient
                delay={idx * 0.1}
              >
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <p className="text-3xl font-bold text-foreground">{stat.value}</p>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <TrendingUp className="h-3 w-3 text-green-500" />
                      <span className="text-green-500">+12%</span>
                      <span>vs last month</span>
                    </div>
                  </div>
                  <div className={`rounded-full p-3 ${stat.bgColor} dark:bg-opacity-20 ring-2 ring-white/20 shadow-lg`}>
                    <Icon className={`h-6 w-6 ${stat.color}`} />
                  </div>
                </div>
              </PremiumCard>
            );
          })}
        </div>

        {/* Charts Section with Premium Title */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-semibold text-foreground">Pipeline Analytics</h2>
            <PremiumBadge variant="success">Live Data</PremiumBadge>
          </div>
          <DashboardCharts dealsByStatus={dealsByStatus} />
        </div>

        {/* Recent Deals with Premium Styling */}
        <Card className="glass-card card-hover overflow-hidden border-2">
          <CardHeader className="flex flex-row items-center justify-between bg-linear-to-r from-primary/5 to-transparent">
            <div className="flex items-center gap-2">
              <CardTitle className="text-foreground">Recent Deals</CardTitle>
              <PremiumBadge variant="default" className="text-xs">
                {recentDeals?.length || 0} Active
              </PremiumBadge>
            </div>
            <Link
              href="/dashboard/deals"
              className="text-sm font-medium text-primary hover:text-primary/80 inline-flex items-center gap-1 group"
            >
              View all
              <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </CardHeader>
          <CardContent className="pt-6">
            {recentDeals && recentDeals.length > 0 ? (
              <div className="space-y-3">
                {recentDeals.map((deal) => {
                  const property = Array.isArray(deal.property) ? deal.property[0] : deal.property;
                  const agent = Array.isArray(deal.agent) ? deal.agent[0] : deal.agent;
                  return (
                    <Link
                      key={deal.id}
                      href={`/dashboard/deals/${deal.id}`}
                      className="group flex items-center justify-between rounded-xl border-2 border-border bg-card p-4 hover:border-primary/50 hover:bg-accent/50 transition-all duration-300 hover:shadow-lg"
                    >
                      <div className="flex items-center gap-4">
                        <div className="relative flex h-12 w-12 items-center justify-center rounded-xl bg-linear-to-br from-primary/10 to-primary/5 ring-2 ring-primary/10 group-hover:ring-primary/30 transition-all">
                          <Building2 className="h-6 w-6 text-primary" />
                          <div className="absolute -top-1 -right-1">
                            <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse shadow-lg shadow-green-500/50" />
                          </div>
                        </div>
                        <div>
                          <p className="font-semibold text-foreground group-hover:text-primary transition-colors">
                            {property?.address || "Unknown Address"}
                          </p>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <span>{property?.city}, {property?.state}</span>
                            {showAllDeals && agent && (
                              <>
                                <span className="text-xs">•</span>
                                <span className="text-xs font-medium">{agent.full_name || agent.email}</span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right space-y-1">
                          <p className="text-lg font-bold text-foreground">
                            {formatCurrency(deal.asking_price)}
                          </p>
                          <PremiumBadge 
                            variant={deal.status === 'closed' ? 'success' : deal.status === 'rejected' ? 'destructive' : 'default'}
                            className="text-xs"
                          >
                            {statusLabels[deal.status] || deal.status}
                          </PremiumBadge>
                        </div>
                        <ArrowRight className="h-5 w-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
                      </div>
                    </Link>
                  );
                })}
              </div>
            ) : (
              <div className="rounded-xl border-2 border-dashed border-border/50 bg-linear-to-br from-muted/30 to-transparent p-12 text-center">
                <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-linear-to-br from-primary/10 to-primary/5 ring-4 ring-primary/5 mx-auto">
                  <Building2 className="h-8 w-8 text-primary" />
                </div>
                <h3 className="mt-6 text-xl font-semibold text-foreground">No deals yet</h3>
                <p className="mt-2 text-sm text-muted-foreground max-w-sm mx-auto">
                  Start by submitting your first property deal for review and watch your pipeline grow.
                </p>
                <Link
                  href="/dashboard/submit"
                  className="mt-6 inline-flex items-center gap-2 rounded-lg bg-linear-to-r from-primary to-primary/80 px-6 py-3 text-sm font-semibold text-white shadow-lg hover:shadow-xl hover:scale-105 transition-all"
                >
                  <Plus className="h-4 w-4" />
                  Submit First Deal
                </Link>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Activity Feed */}
        <DashboardActivity />

        {/* Quick Tips with Premium Cards */}
        <Card className="glass-card overflow-hidden border-2">
          <CardHeader className="bg-linear-to-r from-primary/5 to-transparent">
            <div className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              <CardTitle className="text-foreground">Getting Started</CardTitle>
              <PremiumBadge variant="premium" className="text-xs">New</PremiumBadge>
            </div>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="group relative rounded-xl bg-linear-to-br from-blue-500/10 to-blue-600/5 p-6 hover:from-blue-500/20 hover:to-blue-600/10 transition-all duration-300 border-2 border-blue-500/10 hover:border-blue-500/30 hover:shadow-lg hover:shadow-blue-500/10 overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-full blur-2xl group-hover:bg-blue-500/10 transition-colors" />
                <div className="relative">
                  <div className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-blue-500/20 mb-3">
                    <FileText className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <h4 className="font-semibold text-blue-600 dark:text-blue-400 mb-2">Submit Deals</h4>
                  <p className="text-sm text-blue-600/70 dark:text-blue-300/70">
                    Add property details and seller information to begin the review process.
                  </p>
                </div>
              </div>

              <div className="group relative rounded-xl bg-linear-to-br from-amber-500/10 to-amber-600/5 p-6 hover:from-amber-500/20 hover:to-amber-600/10 transition-all duration-300 border-2 border-amber-500/10 hover:border-amber-500/30 hover:shadow-lg hover:shadow-amber-500/10 overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/5 rounded-full blur-2xl group-hover:bg-amber-500/10 transition-colors" />
                <div className="relative">
                  <div className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-amber-500/20 mb-3">
                    <DollarSign className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                  </div>
                  <h4 className="font-semibold text-amber-600 dark:text-amber-400 mb-2">Underwriting</h4>
                  <p className="text-sm text-amber-600/70 dark:text-amber-300/70">
                    Calculate maximum allowable offer using ARV and repair estimates.
                  </p>
                </div>
              </div>

              <div className="group relative rounded-xl bg-linear-to-br from-emerald-500/10 to-emerald-600/5 p-6 hover:from-emerald-500/20 hover:to-emerald-600/10 transition-all duration-300 border-2 border-emerald-500/10 hover:border-emerald-500/30 hover:shadow-lg hover:shadow-emerald-500/10 overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full blur-2xl group-hover:bg-emerald-500/10 transition-colors" />
                <div className="relative">
                  <div className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-500/20 mb-3">
                    <TrendingUp className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                  </div>
                  <h4 className="font-semibold text-emerald-600 dark:text-emerald-400 mb-2">Track Progress</h4>
                  <p className="text-sm text-emerald-600/70 dark:text-emerald-300/70">
                    Monitor your deals through each stage of the pipeline.
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
