import { createClient } from "@/utils/supabase/server";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { User, Shield, Bell, Calculator } from "lucide-react";

export default async function SettingsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  // Get profile data
  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user?.id)
    .single();

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-900">Settings</h2>
        <p className="text-slate-600">Manage your account and preferences.</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Profile Information */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <User className="h-5 w-5 text-slate-400" />
              <CardTitle>Profile Information</CardTitle>
            </div>
            <CardDescription>Your account details</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="text-sm font-medium text-slate-600">Email</label>
                <p className="mt-1 text-slate-900">{user?.email}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-slate-600">Full Name</label>
                <p className="mt-1 text-slate-900">{profile?.full_name || "Not set"}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-slate-600">Role</label>
                <p className="mt-1 text-slate-900 capitalize">{profile?.role || "Agent"}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-slate-600">Member Since</label>
                <p className="mt-1 text-slate-900">
                  {profile?.created_at
                    ? new Date(profile.created_at).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })
                    : "N/A"}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Security */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-slate-400" />
              <CardTitle>Security</CardTitle>
            </div>
            <CardDescription>Account security settings</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between rounded-lg border border-slate-200 p-4">
              <div>
                <p className="font-medium text-slate-900">Password</p>
                <p className="text-sm text-slate-500">Last changed: Never</p>
              </div>
              <button className="rounded-lg border border-slate-200 px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50">
                Change
              </button>
            </div>
            <div className="flex items-center justify-between rounded-lg border border-slate-200 p-4">
              <div>
                <p className="font-medium text-slate-900">Two-Factor Authentication</p>
                <p className="text-sm text-slate-500">Not enabled</p>
              </div>
              <button className="rounded-lg border border-slate-200 px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50">
                Enable
              </button>
            </div>
          </CardContent>
        </Card>

        {/* Underwriting Defaults */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Calculator className="h-5 w-5 text-slate-400" />
              <CardTitle>Underwriting Defaults</CardTitle>
            </div>
            <CardDescription>Default values for deal analysis</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="text-sm font-medium text-slate-600">Target Profit %</label>
                <p className="mt-1 text-slate-900">20%</p>
              </div>
              <div>
                <label className="text-sm font-medium text-slate-600">Holding Period</label>
                <p className="mt-1 text-slate-900">6 months</p>
              </div>
              <div>
                <label className="text-sm font-medium text-slate-600">Monthly Holding Cost</label>
                <p className="mt-1 text-slate-900">$1,500</p>
              </div>
              <div>
                <label className="text-sm font-medium text-slate-600">Selling Costs</label>
                <p className="mt-1 text-slate-900">8% of ARV</p>
              </div>
            </div>
            <button className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50">
              Edit Defaults
            </button>
          </CardContent>
        </Card>

        {/* Notifications */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Bell className="h-5 w-5 text-slate-400" />
              <CardTitle>Notifications</CardTitle>
            </div>
            <CardDescription>Email notification preferences</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-slate-900">Deal Status Updates</p>
                <p className="text-sm text-slate-500">When deals change status</p>
              </div>
              <div className="h-6 w-11 rounded-full bg-slate-900 p-1">
                <div className="h-4 w-4 translate-x-5 rounded-full bg-white transition-transform" />
              </div>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-slate-900">Underwriting Complete</p>
                <p className="text-sm text-slate-500">When analysis is ready</p>
              </div>
              <div className="h-6 w-11 rounded-full bg-slate-900 p-1">
                <div className="h-4 w-4 translate-x-5 rounded-full bg-white transition-transform" />
              </div>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-slate-900">Weekly Summary</p>
                <p className="text-sm text-slate-500">Pipeline overview email</p>
              </div>
              <div className="h-6 w-11 rounded-full bg-slate-200 p-1">
                <div className="h-4 w-4 rounded-full bg-white transition-transform" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
