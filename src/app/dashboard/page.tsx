import { createClient } from "@/utils/supabase/server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Building2, FileText, DollarSign, TrendingUp, Clock, ArrowRight, Plus } from "lucide-react";
import Link from "next/link";

export default async function DashboardPage() {
  const supabase = await createClient();

  // Get current user
  const { data: { user } } = await supabase.auth.getUser();
  
  // Get counts for dashboard stats
  const { count: dealsCount } = await supabase
    .from("deals")
    .select("*", { count: "exact", head: true })
    .eq("agent_id", user?.id);

  const { count: propertiesCount } = await supabase
    .from("properties")
    .select("*", { count: "exact", head: true })
    .eq("created_by", user?.id);

  const { count: submittedCount } = await supabase
    .from("deals")
    .select("*", { count: "exact", head: true })
    .eq("agent_id", user?.id)
    .eq("status", "submitted");

  const { count: approvedCount } = await supabase
    .from("deals")
    .select("*", { count: "exact", head: true })
    .eq("agent_id", user?.id)
    .eq("status", "approved");

  // Get recent deals
  const { data: recentDeals } = await supabase
    .from("deals")
    .select(`
      id,
      status,
      asking_price,
      submitted_at,
      property:properties(address, city, state)
    `)
    .eq("agent_id", user?.id)
    .order("submitted_at", { ascending: false })
    .limit(5);

  // Calculate total pipeline value
  const { data: pipelineData } = await supabase
    .from("deals")
    .select("asking_price")
    .eq("agent_id", user?.id)
    .in("status", ["submitted", "underwriting", "approved"]);
  
  const pipelineValue = pipelineData?.reduce((sum, deal) => sum + (deal.asking_price || 0), 0) || 0;

  const stats = [
    {
      title: "Total Deals",
      value: dealsCount ?? 0,
      icon: FileText,
      description: "All deals in pipeline",
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
    {
      title: "Approved",
      value: approvedCount ?? 0,
      icon: TrendingUp,
      description: "Ready to close",
      color: "text-green-600",
      bgColor: "bg-green-50",
    },
  ];

  const statusColors: Record<string, string> = {
    submitted: "bg-blue-100 text-blue-800",
    underwriting: "bg-yellow-100 text-yellow-800",
    approved: "bg-green-100 text-green-800",
    rejected: "bg-red-100 text-red-800",
    closed: "bg-slate-100 text-slate-800",
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
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Dashboard</h2>
          <p className="text-slate-600 dark:text-slate-400">
            Your deal pipeline at a glance
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
              Across {(submittedCount || 0) + (approvedCount || 0)} active deals
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
          <Card key={stat.title} className="overflow-hidden border-slate-200 dark:border-slate-800 dark:bg-slate-900">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600 dark:text-slate-400">{stat.title}</p>
                  <p className="mt-2 text-3xl font-bold text-slate-900 dark:text-white">{stat.value}</p>
                  <p className="mt-1 text-xs text-slate-500 dark:text-slate-500">{stat.description}</p>
                </div>
                <div className={`rounded-full p-3 ${stat.bgColor} dark:bg-opacity-20`}>
                  <stat.icon className={`h-6 w-6 ${stat.color}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Recent Deals */}
      <Card className="border-slate-200 dark:border-slate-800 dark:bg-slate-900">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-slate-900 dark:text-white">Recent Deals</CardTitle>
          <Link
            href="/dashboard/deals"
            className="text-sm font-medium text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white inline-flex items-center"
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
                return (
                <Link
                  key={deal.id}
                  href={`/dashboard/deals/${deal.id}`}
                  className="flex items-center justify-between rounded-lg border border-slate-200 p-4 hover:bg-slate-50 transition-colors dark:border-slate-700 dark:hover:bg-slate-800"
                >
                  <div className="flex items-center gap-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-100 dark:bg-slate-800">
                      <Building2 className="h-5 w-5 text-slate-600 dark:text-slate-400" />
                    </div>
                    <div>
                      <p className="font-medium text-slate-900 dark:text-white">
                        {property?.address || "Unknown Address"}
                      </p>
                      <p className="text-sm text-slate-500 dark:text-slate-400">
                        {property?.city}, {property?.state}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="font-medium text-slate-900 dark:text-white">
                        {formatCurrency(deal.asking_price)}
                      </p>
                      <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${statusColors[deal.status]}`}>
                        {deal.status.charAt(0).toUpperCase() + deal.status.slice(1)}
                      </span>
                    </div>
                    <ArrowRight className="h-5 w-5 text-slate-400" />
                  </div>
                </Link>
              )})}
            </div>
          ) : (
            <div className="rounded-lg border-2 border-dashed border-slate-200 p-8 text-center dark:border-slate-700">
              <Building2 className="mx-auto h-12 w-12 text-slate-400" />
              <h3 className="mt-4 text-lg font-medium text-slate-900 dark:text-white">No deals yet</h3>
              <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
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

      {/* Quick Tips */}
      <Card className="border-slate-200 dark:border-slate-800 dark:bg-slate-900">
        <CardHeader>
          <CardTitle className="text-slate-900 dark:text-white">Getting Started</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="rounded-lg bg-blue-50 p-4 dark:bg-blue-900/20">
              <h4 className="font-medium text-blue-900 dark:text-blue-400">Submit Deals</h4>
              <p className="mt-1 text-sm text-blue-700 dark:text-blue-300">
                Add property details and seller information to begin the review process.
              </p>
            </div>
            <div className="rounded-lg bg-amber-50 p-4 dark:bg-amber-900/20">
              <h4 className="font-medium text-amber-900 dark:text-amber-400">Underwriting</h4>
              <p className="mt-1 text-sm text-amber-700 dark:text-amber-300">
                Calculate maximum allowable offer using ARV and repair estimates.
              </p>
            </div>
            <div className="rounded-lg bg-green-50 p-4 dark:bg-green-900/20">
              <h4 className="font-medium text-green-900 dark:text-green-400">Track Progress</h4>
              <p className="mt-1 text-sm text-green-700 dark:text-green-300">
                Monitor your deals through each stage of the pipeline.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
