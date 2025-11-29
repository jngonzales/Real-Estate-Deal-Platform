"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { User, Shield, Bell, Calculator, Loader2, Check, Mail } from "lucide-react";
import { 
  updateProfile, 
  updateUnderwritingDefaults, 
  updateNotificationPreferences,
  sendPasswordResetEmail 
} from "@/lib/actions/settings-actions";

interface Profile {
  id: string;
  email: string;
  full_name: string | null;
  role: string;
  phone: string | null;
  company: string | null;
  created_at: string;
}

interface UserSettings {
  target_profit_percent: number;
  holding_period_months: number;
  monthly_holding_cost: number;
  selling_costs_percent: number;
  notify_deal_status: boolean;
  notify_underwriting_complete: boolean;
  notify_weekly_summary: boolean;
}

interface SettingsClientProps {
  profile: Profile;
  userEmail: string;
  settings: UserSettings | null;
}

export function SettingsClient({ profile, userEmail, settings }: SettingsClientProps) {
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [fullName, setFullName] = useState(profile?.full_name || "");
  const [phone, setPhone] = useState(profile?.phone || "");
  const [company, setCompany] = useState(profile?.company || "");
  const [savingProfile, setSavingProfile] = useState(false);
  const [isEditingDefaults, setIsEditingDefaults] = useState(false);
  const [targetProfitPercent, setTargetProfitPercent] = useState(settings?.target_profit_percent || 20);
  const [holdingPeriodMonths, setHoldingPeriodMonths] = useState(settings?.holding_period_months || 6);
  const [monthlyHoldingCost, setMonthlyHoldingCost] = useState(settings?.monthly_holding_cost || 1500);
  const [sellingCostsPercent, setSellingCostsPercent] = useState(settings?.selling_costs_percent || 8);
  const [savingDefaults, setSavingDefaults] = useState(false);
  const [dealUpdates, setDealUpdates] = useState(settings?.notify_deal_status ?? true);
  const [underwritingComplete, setUnderwritingComplete] = useState(settings?.notify_underwriting_complete ?? true);
  const [weeklySummary, setWeeklySummary] = useState(settings?.notify_weekly_summary ?? false);
  const [savingNotifications, setSavingNotifications] = useState(false);
  const [sendingReset, setSendingReset] = useState(false);
  const [resetSent, setResetSent] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const showSuccess = (message: string) => {
    setSuccessMessage(message);
    setError(null);
    setTimeout(() => setSuccessMessage(null), 3000);
  };

  const showError = (message: string) => {
    setError(message);
    setSuccessMessage(null);
  };

  const handleSaveProfile = async () => {
    setSavingProfile(true);
    setError(null);
    const result = await updateProfile({ fullName, phone, company });
    setSavingProfile(false);
    if (result.error) {
      showError(result.error);
    } else {
      showSuccess("Profile updated successfully!");
      setIsEditingProfile(false);
    }
  };

  const handleSaveDefaults = async () => {
    setSavingDefaults(true);
    setError(null);
    const result = await updateUnderwritingDefaults({
      targetProfitPercent,
      holdingPeriodMonths,
      monthlyHoldingCost,
      sellingCostsPercent,
    });
    setSavingDefaults(false);
    if (result.error) {
      showError(result.error);
    } else {
      showSuccess("Underwriting defaults saved!");
      setIsEditingDefaults(false);
    }
  };

  const handleNotificationToggle = async (type: "deal" | "underwriting" | "weekly", newValue: boolean) => {
    if (type === "deal") setDealUpdates(newValue);
    if (type === "underwriting") setUnderwritingComplete(newValue);
    if (type === "weekly") setWeeklySummary(newValue);
    setSavingNotifications(true);
    const result = await updateNotificationPreferences({
      notifyDealStatus: type === "deal" ? newValue : dealUpdates,
      notifyUnderwritingComplete: type === "underwriting" ? newValue : underwritingComplete,
      notifyWeeklySummary: type === "weekly" ? newValue : weeklySummary,
    });
    setSavingNotifications(false);
    if (result.error) {
      if (type === "deal") setDealUpdates(!newValue);
      if (type === "underwriting") setUnderwritingComplete(!newValue);
      if (type === "weekly") setWeeklySummary(!newValue);
      showError(result.error);
    }
  };

  const handlePasswordReset = async () => {
    setSendingReset(true);
    setError(null);
    const result = await sendPasswordResetEmail();
    setSendingReset(false);
    if (result.error) {
      showError(result.error);
    } else {
      setResetSent(true);
      showSuccess("Password reset email sent! Check your inbox.");
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-900">Settings</h2>
        <p className="text-slate-600">Manage your account and preferences.</p>
      </div>
      {successMessage && (
        <div className="rounded-lg border border-green-200 bg-green-50 p-4 flex items-center gap-2">
          <Check className="h-5 w-5 text-green-600" />
          <p className="text-green-800">{successMessage}</p>
        </div>
      )}
      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4">
          <p className="text-red-800">{error}</p>
        </div>
      )}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <User className="h-5 w-5 text-slate-400" />
                <CardTitle>Profile Information</CardTitle>
              </div>
              {!isEditingProfile && (
                <Button variant="outline" size="sm" onClick={() => setIsEditingProfile(true)}>Edit</Button>
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
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-600">Full Name</label>
                  <Input value={fullName} onChange={(e) => setFullName(e.target.value)} className="mt-1" />
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-600">Phone</label>
                  <Input value={phone} onChange={(e) => setPhone(e.target.value)} className="mt-1" />
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-600">Company</label>
                  <Input value={company} onChange={(e) => setCompany(e.target.value)} className="mt-1" />
                </div>
                <div className="flex gap-2">
                  <Button onClick={handleSaveProfile} disabled={savingProfile} className="flex-1">
                    {savingProfile ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Saving...</> : "Save Changes"}
                  </Button>
                  <Button variant="outline" onClick={() => { setIsEditingProfile(false); setFullName(profile?.full_name || ""); setPhone(profile?.phone || ""); setCompany(profile?.company || ""); }}>Cancel</Button>
                </div>
              </div>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2">
                <div><label className="text-sm font-medium text-slate-600">Email</label><p className="mt-1 text-slate-900">{userEmail}</p></div>
                <div><label className="text-sm font-medium text-slate-600">Full Name</label><p className="mt-1 text-slate-900">{profile?.full_name || "Not set"}</p></div>
                <div><label className="text-sm font-medium text-slate-600">Phone</label><p className="mt-1 text-slate-900">{profile?.phone || "Not set"}</p></div>
                <div><label className="text-sm font-medium text-slate-600">Company</label><p className="mt-1 text-slate-900">{profile?.company || "Not set"}</p></div>
                <div><label className="text-sm font-medium text-slate-600">Role</label><p className="mt-1 text-slate-900 capitalize">{profile?.role || "Agent"}</p></div>
                <div><label className="text-sm font-medium text-slate-600">Member Since</label><p className="mt-1 text-slate-900">{profile?.created_at ? new Date(profile.created_at).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" }) : "N/A"}</p></div>
              </div>
            )}
          </CardContent>
        </Card>
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
                <p className="text-sm text-slate-500">{resetSent ? "Reset email sent!" : "Send a password reset email"}</p>
              </div>
              <Button variant="outline" size="sm" onClick={handlePasswordReset} disabled={sendingReset || resetSent}>
                {sendingReset ? <Loader2 className="h-4 w-4 animate-spin" /> : resetSent ? <><Mail className="mr-2 h-4 w-4" />Sent</> : "Reset"}
              </Button>
            </div>
            <div className="flex items-center justify-between rounded-lg border border-slate-200 p-4">
              <div>
                <p className="font-medium text-slate-900">Two-Factor Authentication</p>
                <p className="text-sm text-slate-500">Coming soon</p>
              </div>
              <Button variant="outline" size="sm" disabled>Enable</Button>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Calculator className="h-5 w-5 text-slate-400" />
                <CardTitle>Underwriting Defaults</CardTitle>
              </div>
              {!isEditingDefaults && (
                <Button variant="outline" size="sm" onClick={() => setIsEditingDefaults(true)}>Edit</Button>
              )}
            </div>
            <CardDescription>Default values for deal analysis</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {isEditingDefaults ? (
              <div className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div><label className="text-sm font-medium text-slate-600">Target Profit %</label><Input type="number" value={targetProfitPercent} onChange={(e) => setTargetProfitPercent(Number(e.target.value))} className="mt-1" /></div>
                  <div><label className="text-sm font-medium text-slate-600">Holding Period (months)</label><Input type="number" value={holdingPeriodMonths} onChange={(e) => setHoldingPeriodMonths(Number(e.target.value))} className="mt-1" /></div>
                  <div><label className="text-sm font-medium text-slate-600">Monthly Holding Cost ($)</label><Input type="number" value={monthlyHoldingCost} onChange={(e) => setMonthlyHoldingCost(Number(e.target.value))} className="mt-1" /></div>
                  <div><label className="text-sm font-medium text-slate-600">Selling Costs (% of ARV)</label><Input type="number" value={sellingCostsPercent} onChange={(e) => setSellingCostsPercent(Number(e.target.value))} className="mt-1" /></div>
                </div>
                <div className="flex gap-2">
                  <Button onClick={handleSaveDefaults} disabled={savingDefaults} className="flex-1">
                    {savingDefaults ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Saving...</> : "Save Defaults"}
                  </Button>
                  <Button variant="outline" onClick={() => { setIsEditingDefaults(false); setTargetProfitPercent(settings?.target_profit_percent || 20); setHoldingPeriodMonths(settings?.holding_period_months || 6); setMonthlyHoldingCost(settings?.monthly_holding_cost || 1500); setSellingCostsPercent(settings?.selling_costs_percent || 8); }}>Cancel</Button>
                </div>
              </div>
            ) : (
              <>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div><label className="text-sm font-medium text-slate-600">Target Profit %</label><p className="mt-1 text-slate-900">{targetProfitPercent}%</p></div>
                  <div><label className="text-sm font-medium text-slate-600">Holding Period</label><p className="mt-1 text-slate-900">{holdingPeriodMonths} months</p></div>
                  <div><label className="text-sm font-medium text-slate-600">Monthly Holding Cost</label><p className="mt-1 text-slate-900">${monthlyHoldingCost.toLocaleString()}</p></div>
                  <div><label className="text-sm font-medium text-slate-600">Selling Costs</label><p className="mt-1 text-slate-900">{sellingCostsPercent}% of ARV</p></div>
                </div>
                <p className="text-xs text-slate-500">These defaults will be used when creating new underwriting analyses.</p>
              </>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Bell className="h-5 w-5 text-slate-400" />
              <CardTitle>Notifications</CardTitle>
              {savingNotifications && <Loader2 className="h-4 w-4 animate-spin text-slate-400" />}
            </div>
            <CardDescription>Email notification preferences</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div><p className="font-medium text-slate-900">Deal Status Updates</p><p className="text-sm text-slate-500">When deals change status</p></div>
              <button onClick={() => handleNotificationToggle("deal", !dealUpdates)} disabled={savingNotifications} className={`h-6 w-11 rounded-full p-1 transition-colors ${dealUpdates ? "bg-slate-900" : "bg-slate-200"}`}><div className={`h-4 w-4 rounded-full bg-white transition-transform ${dealUpdates ? "translate-x-5" : "translate-x-0"}`} /></button>
            </div>
            <div className="flex items-center justify-between">
              <div><p className="font-medium text-slate-900">Underwriting Complete</p><p className="text-sm text-slate-500">When analysis is ready</p></div>
              <button onClick={() => handleNotificationToggle("underwriting", !underwritingComplete)} disabled={savingNotifications} className={`h-6 w-11 rounded-full p-1 transition-colors ${underwritingComplete ? "bg-slate-900" : "bg-slate-200"}`}><div className={`h-4 w-4 rounded-full bg-white transition-transform ${underwritingComplete ? "translate-x-5" : "translate-x-0"}`} /></button>
            </div>
            <div className="flex items-center justify-between">
              <div><p className="font-medium text-slate-900">Weekly Summary</p><p className="text-sm text-slate-500">Pipeline overview email</p></div>
              <button onClick={() => handleNotificationToggle("weekly", !weeklySummary)} disabled={savingNotifications} className={`h-6 w-11 rounded-full p-1 transition-colors ${weeklySummary ? "bg-slate-900" : "bg-slate-200"}`}><div className={`h-4 w-4 rounded-full bg-white transition-transform ${weeklySummary ? "translate-x-5" : "translate-x-0"}`} /></button>
            </div>
            <p className="text-xs text-slate-500">Preferences are saved automatically when toggled.</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
