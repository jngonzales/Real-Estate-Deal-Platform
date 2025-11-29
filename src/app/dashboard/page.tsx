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
      created_at,
      property:properties(address, city, state)
    `)
    .eq("agent_id", user?.id)
    .order("created_at", { ascending: false })
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
          <h2 className="text-2xl font-bold text-slate-900">Dashboard</h2>
          <p className="text-slate-600">
            Welcome back! Here&apos;s an overview of your deal pipeline.
          </p>
        </div>
        <Link
          href="/dashboard/submit"
          className="inline-flex items-center gap-2 rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800 transition-colors"
        >
          <Plus className="h-4 w-4" />
          Submit New Deal
        </Link>
      </div>

      {/* Pipeline Value Banner */}
      <div className="rounded-xl bg-gradient-to-r from-slate-900 to-slate-700 p-6 text-white">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-medium text-slate-300">Total Pipeline Value</p>
            <p className="mt-1 text-3xl font-bold">{formatCurrency(pipelineValue)}</p>
            <p className="mt-1 text-sm text-slate-400">
              Across {(submittedCount || 0) + (approvedCount || 0)} active deals
            </p>
          </div>
          <div className="flex items-center gap-2">
            <DollarSign className="h-12 w-12 text-slate-500" />
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.title} className="overflow-hidden">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600">{stat.title}</p>
                  <p className="mt-2 text-3xl font-bold text-slate-900">{stat.value}</p>
                  <p className="mt-1 text-xs text-slate-500">{stat.description}</p>
                </div>
                <div className={`rounded-full p-3 ${stat.bgColor}`}>
                  <stat.icon className={`h-6 w-6 ${stat.color}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Recent Deals */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Recent Deals</CardTitle>
          <Link
            href="/dashboard/deals"
            className="text-sm font-medium text-slate-600 hover:text-slate-900 inline-flex items-center"
          >
            View all
            <ArrowRight className="ml-1 h-4 w-4" />
          </Link>
        </CardHeader>
        <CardContent>
          {recentDeals && recentDeals.length > 0 ? (
            <div className="space-y-4">
              {recentDeals.map((deal: any) => (
                <Link
                  key={deal.id}
                  href={`/dashboard/deals/${deal.id}`}
                  className="flex items-center justify-between rounded-lg border border-slate-200 p-4 hover:bg-slate-50 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-100">
                      <Building2 className="h-5 w-5 text-slate-600" />
                    </div>
                    <div>
                      <p className="font-medium text-slate-900">
                        {deal.property?.address || "Unknown Address"}
                      </p>
                      <p className="text-sm text-slate-500">
                        {deal.property?.city}, {deal.property?.state}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="font-medium text-slate-900">
                        {formatCurrency(deal.asking_price)}
                      </p>
                      <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${statusColors[deal.status]}`}>
                        {deal.status.charAt(0).toUpperCase() + deal.status.slice(1)}
                      </span>
                    </div>
                    <ArrowRight className="h-5 w-5 text-slate-400" />
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="rounded-lg border-2 border-dashed border-slate-200 p-8 text-center">
              <Building2 className="mx-auto h-12 w-12 text-slate-400" />
              <h3 className="mt-4 text-lg font-medium text-slate-900">No deals yet</h3>
              <p className="mt-2 text-sm text-slate-500">
                Get started by submitting your first deal.
              </p>
              <Link
                href="/dashboard/submit"
                className="mt-4 inline-flex items-center rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800"
              >
                <Plus className="mr-2 h-4 w-4" />
                Submit a Deal
              </Link>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quick Tips */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Tips</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="rounded-lg bg-blue-50 p-4">
              <h4 className="font-medium text-blue-900">Submit Deals</h4>
              <p className="mt-1 text-sm text-blue-700">
                Add property details, seller info, and photos to start the underwriting process.
              </p>
            </div>
            <div className="rounded-lg bg-yellow-50 p-4">
              <h4 className="font-medium text-yellow-900">Underwriting</h4>
              <p className="mt-1 text-sm text-yellow-700">
                Calculate MAO using ARV, repair costs, and your target profit margin.
              </p>
            </div>
            <div className="rounded-lg bg-green-50 p-4">
              <h4 className="font-medium text-green-900">Track Progress</h4>
              <p className="mt-1 text-sm text-green-700">
                Use the Kanban board to move deals through your pipeline stages.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
