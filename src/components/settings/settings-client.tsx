"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { User, Shield, Bell, Calculator, Loader2, Check } from "lucide-react";
import { updateProfile } from "@/lib/actions/settings-actions";

interface Profile {
  id: string;
  email: string;
  full_name: string | null;
  role: string;
  phone: string | null;
  company: string | null;
  created_at: string;
}

interface SettingsClientProps {
  profile: Profile;
  userEmail: string;
}

export function SettingsClient({ profile, userEmail }: SettingsClientProps) {
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [fullName, setFullName] = useState(profile?.full_name || "");
  const [phone, setPhone] = useState(profile?.phone || "");
  const [company, setCompany] = useState(profile?.company || "");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Notification states
  const [dealUpdates, setDealUpdates] = useState(true);
  const [underwritingComplete, setUnderwritingComplete] = useState(true);
  const [weeklySummary, setWeeklySummary] = useState(false);

  const handleSaveProfile = async () => {
    setSaving(true);
    setError(null);
    
    const result = await updateProfile({
      fullName,
      phone,
      company,
    });

    setSaving(false);

    if (result.error) {
      setError(result.error);
    } else {
      setSaved(true);
      setIsEditingProfile(false);
      setTimeout(() => setSaved(false), 2000);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-900">Settings</h2>
        <p className="text-slate-600">Manage your account and preferences.</p>
      </div>

      {saved && (
        <div className="rounded-lg border border-green-200 bg-green-50 p-4 flex items-center gap-2">
          <Check className="h-5 w-5 text-green-600" />
          <p className="text-green-800">Profile updated successfully!</p>
        </div>
      )}

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4">
          <p className="text-red-800">{error}</p>
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Profile Information */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <User className="h-5 w-5 text-slate-400" />
                <CardTitle>Profile Information</CardTitle>
              </div>
              {!isEditingProfile && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsEditingProfile(true)}
                >
                  Edit
                </Button>
              )}
            </div>
            <CardDescription>Your account details</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {isEditingProfile ? (
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-slate-600">Email</label>
                  <Input value={userEmail} disabled className="mt-1 bg-slate-50" />
                  <p className="text-xs text-slate-500 mt-1">Email cannot be changed</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-600">Full Name</label>
                  <Input
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Enter your full name"
                    className="mt-1"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-600">Phone</label>
                  <Input
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="(555) 123-4567"
                    className="mt-1"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-600">Company</label>
                  <Input
                    value={company}
                    onChange={(e) => setCompany(e.target.value)}
                    placeholder="Your company name"
                    className="mt-1"
                  />
                </div>
                <div className="flex gap-2">
                  <Button
                    onClick={handleSaveProfile}
                    disabled={saving}
                    className="flex-1"
                  >
                    {saving ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      "Save Changes"
                    )}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setIsEditingProfile(false);
                      setFullName(profile?.full_name || "");
                      setPhone(profile?.phone || "");
                      setCompany(profile?.company || "");
                    }}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="text-sm font-medium text-slate-600">Email</label>
                  <p className="mt-1 text-slate-900">{userEmail}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-600">Full Name</label>
                  <p className="mt-1 text-slate-900">{profile?.full_name || "Not set"}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-600">Phone</label>
                  <p className="mt-1 text-slate-900">{profile?.phone || "Not set"}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-600">Company</label>
                  <p className="mt-1 text-slate-900">{profile?.company || "Not set"}</p>
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
            )}
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
                <p className="text-sm text-slate-500">Managed by Supabase Auth</p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  alert("Password reset email will be sent to your email address. This feature requires Supabase email configuration.");
                }}
              >
                Reset
              </Button>
            </div>
            <div className="flex items-center justify-between rounded-lg border border-slate-200 p-4">
              <div>
                <p className="font-medium text-slate-900">Two-Factor Authentication</p>
                <p className="text-sm text-slate-500">Not available in this version</p>
              </div>
              <Button variant="outline" size="sm" disabled>
                Enable
              </Button>
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
            <p className="text-xs text-slate-500">
              These defaults are applied when creating new underwriting analyses. Edit them in the underwriting form.
            </p>
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
              <button
                onClick={() => setDealUpdates(!dealUpdates)}
                className={`h-6 w-11 rounded-full p-1 transition-colors ${
                  dealUpdates ? "bg-slate-900" : "bg-slate-200"
                }`}
              >
                <div
                  className={`h-4 w-4 rounded-full bg-white transition-transform ${
                    dealUpdates ? "translate-x-5" : "translate-x-0"
                  }`}
                />
              </button>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-slate-900">Underwriting Complete</p>
                <p className="text-sm text-slate-500">When analysis is ready</p>
              </div>
              <button
                onClick={() => setUnderwritingComplete(!underwritingComplete)}
                className={`h-6 w-11 rounded-full p-1 transition-colors ${
                  underwritingComplete ? "bg-slate-900" : "bg-slate-200"
                }`}
              >
                <div
                  className={`h-4 w-4 rounded-full bg-white transition-transform ${
                    underwritingComplete ? "translate-x-5" : "translate-x-0"
                  }`}
                />
              </button>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-slate-900">Weekly Summary</p>
                <p className="text-sm text-slate-500">Pipeline overview email</p>
              </div>
              <button
                onClick={() => setWeeklySummary(!weeklySummary)}
                className={`h-6 w-11 rounded-full p-1 transition-colors ${
                  weeklySummary ? "bg-slate-900" : "bg-slate-200"
                }`}
              >
                <div
                  className={`h-4 w-4 rounded-full bg-white transition-transform ${
                    weeklySummary ? "translate-x-5" : "translate-x-0"
                  }`}
                />
              </button>
            </div>
            <p className="text-xs text-slate-500">
              Email notifications require SMTP configuration in Supabase.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
