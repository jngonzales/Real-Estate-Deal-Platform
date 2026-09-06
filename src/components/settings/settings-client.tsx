"use client";

import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { WorkspaceHeading } from "@/components/layout/workspace-heading";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { 
  updateProfile, 
  updateUnderwritingDefaults, 
  updateNotificationPreferences,
  sendPasswordResetEmail 
} from "@/lib/actions/settings-actions";
import { TwoFactorSetup } from "@/components/auth/two-factor-setup";

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
  profile: Profile | null;
  userEmail: string;
  settings: UserSettings | null;
  loadWarning: boolean;
}

export function SettingsClient({ profile, userEmail, settings, loadWarning }: SettingsClientProps) {
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [fullName, setFullName] = useState(profile?.full_name || "");
  const [phone, setPhone] = useState(profile?.phone || "");
  const [company, setCompany] = useState(profile?.company || "");
  const [savingProfile, setSavingProfile] = useState(false);
  const [isEditingDefaults, setIsEditingDefaults] = useState(false);
  const [targetProfitPercent, setTargetProfitPercent] = useState(settings?.target_profit_percent ?? 20);
  const [holdingPeriodMonths, setHoldingPeriodMonths] = useState(settings?.holding_period_months ?? 6);
  const [monthlyHoldingCost, setMonthlyHoldingCost] = useState(settings?.monthly_holding_cost ?? 1500);
  const [sellingCostsPercent, setSellingCostsPercent] = useState(settings?.selling_costs_percent ?? 8);
  const [savingDefaults, setSavingDefaults] = useState(false);
  const [dealUpdates, setDealUpdates] = useState(settings?.notify_deal_status ?? true);
  const [underwritingComplete, setUnderwritingComplete] = useState(settings?.notify_underwriting_complete ?? true);
  const [weeklySummary, setWeeklySummary] = useState(settings?.notify_weekly_summary ?? false);
  const [savingNotifications, setSavingNotifications] = useState(false);
  const [sendingReset, setSendingReset] = useState(false);
  const [resetSent, setResetSent] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const profileEditRef = useRef<HTMLButtonElement>(null);
  const profileFieldRef = useRef<HTMLInputElement>(null);
  const defaultsEditRef = useRef<HTMLButtonElement>(null);
  const defaultsFieldRef = useRef<HTMLInputElement>(null);
  const previousProfileEdit = useRef(false);
  const previousDefaultsEdit = useRef(false);

  useEffect(() => {
    if (previousProfileEdit.current !== isEditingProfile) {
      previousProfileEdit.current = isEditingProfile;
      (isEditingProfile ? profileFieldRef : profileEditRef).current?.focus();
    }
  }, [isEditingProfile]);

  useEffect(() => {
    if (previousDefaultsEdit.current !== isEditingDefaults) {
      previousDefaultsEdit.current = isEditingDefaults;
      (isEditingDefaults ? defaultsFieldRef : defaultsEditRef).current?.focus();
    }
  }, [isEditingDefaults]);

  const showSuccess = (message: string) => {
    setSuccessMessage(message);
    setError(null);
    toast.success(message);
    setTimeout(() => setSuccessMessage(null), 3000);
  };

  const showError = (message: string) => {
    setError(message);
    setSuccessMessage(null);
    toast.error(message);
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
    <div className="min-w-0 space-y-6">
      <WorkspaceHeading title="Settings" />
      {loadWarning && <p role="alert" className="rounded-lg border border-destructive/40 p-3 text-sm">Some settings could not be loaded.</p>}
      <div role="status" className={successMessage ? "rounded-lg border border-border bg-muted p-3 text-sm" : "sr-only"}>
        {successMessage}
      </div>
      <div role="alert" className={error ? "rounded-lg border border-destructive/40 p-3 text-sm [overflow-wrap:anywhere]" : "sr-only"}>
        {error}
      </div>

      <div className="grid items-start gap-4 xl:grid-cols-2">
        <section aria-labelledby="profile-settings" className="min-w-0 rounded-lg border border-border bg-card p-4 sm:p-6">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h2 id="profile-settings" className="text-lg font-semibold">Profile information</h2>
            {!isEditingProfile && (
              <Button ref={profileEditRef} variant="outline" className="min-h-11" onClick={() => setIsEditingProfile(true)}>Edit profile</Button>
            )}
          </div>
          {isEditingProfile ? (
            <form
              className="mt-4 space-y-4"
              onSubmit={(event) => {
                event.preventDefault();
                if (!savingProfile) void handleSaveProfile();
              }}
            >
              <div className="space-y-1.5">
                <Label htmlFor="profile-email">Email</Label>
                <Input id="profile-email" name="email" type="email" autoComplete="email" value={userEmail} disabled className="min-h-11 bg-muted md:text-base" />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="profile-name">Full name</Label>
                <Input ref={profileFieldRef} id="profile-name" name="fullName" autoComplete="name" value={fullName} onChange={(event) => setFullName(event.target.value)} className="min-h-11 md:text-base" />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="profile-phone">Phone</Label>
                <Input id="profile-phone" name="phone" type="tel" autoComplete="tel" value={phone} onChange={(event) => setPhone(event.target.value)} className="min-h-11 md:text-base" />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="profile-company">Company</Label>
                <Input id="profile-company" name="company" autoComplete="organization" value={company} onChange={(event) => setCompany(event.target.value)} className="min-h-11 md:text-base" />
              </div>
              <div className="flex flex-wrap gap-2">
                <Button type="submit" disabled={savingProfile} className="min-h-11">{savingProfile ? "Saving profile…" : "Save profile"}</Button>
                <Button
                  type="button"
                  variant="outline"
                  disabled={savingProfile}
                  className="min-h-11"
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
            </form>
          ) : (
            <dl className="mt-3 divide-y divide-border [overflow-wrap:anywhere]">
              <SettingValue label="Email" value={userEmail || "Not set"} />
              <SettingValue label="Full name" value={profile?.full_name || "Not set"} />
              <SettingValue label="Phone" value={profile?.phone || "Not set"} />
              <SettingValue label="Company" value={profile?.company || "Not set"} />
              <SettingValue label="Role" value={profile?.role || "Not set"} />
              <SettingValue label="Member since" value={profile?.created_at ? new Date(profile.created_at).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" }) : "Not set"} />
            </dl>
          )}
        </section>

        <section aria-labelledby="security-settings" className="min-w-0 rounded-lg border border-border bg-card p-4 sm:p-6">
          <h2 id="security-settings" className="text-lg font-semibold">Security</h2>
          <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="font-medium">Password</p>
              <p className="text-sm text-muted-foreground">{resetSent ? "Reset email sent" : "Send a link to update your password."}</p>
            </div>
            <Button variant="outline" className="min-h-11" onClick={handlePasswordReset} disabled={sendingReset || resetSent}>
              {sendingReset ? "Sending…" : resetSent ? "Email sent" : "Send reset email"}
            </Button>
          </div>
          <div className="mt-4 border-t border-border pt-4">
            <TwoFactorSetup />
          </div>
        </section>

        <section aria-labelledby="underwriting-settings" className="min-w-0 rounded-lg border border-border bg-card p-4 sm:p-6">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h2 id="underwriting-settings" className="text-lg font-semibold">Underwriting defaults</h2>
            {!isEditingDefaults && (
              <Button ref={defaultsEditRef} variant="outline" className="min-h-11" onClick={() => setIsEditingDefaults(true)}>Edit defaults</Button>
            )}
          </div>
          {isEditingDefaults ? (
            <form
              className="mt-4"
              noValidate
              onSubmit={(event) => {
                event.preventDefault();
                if (!savingDefaults) void handleSaveDefaults();
              }}
            >
              <div className="grid gap-3 sm:grid-cols-2">
                {[
                  { id: "profit-percent", label: "Target profit (%)", value: targetProfitPercent, onChange: setTargetProfitPercent },
                  { id: "holding-period", label: "Holding period (months)", value: holdingPeriodMonths, onChange: setHoldingPeriodMonths },
                  { id: "holding-cost", label: "Monthly holding cost ($)", value: monthlyHoldingCost, onChange: setMonthlyHoldingCost },
                  { id: "selling-cost", label: "Selling costs (% of ARV)", value: sellingCostsPercent, onChange: setSellingCostsPercent },
                ].map(({ id, label, value, onChange }, index) => (
                  <div key={id} className="min-w-0 space-y-1.5">
                    <Label htmlFor={id}>{label}</Label>
                    <Input ref={index === 0 ? defaultsFieldRef : undefined} id={id} name={id} type="number" value={value} onChange={(event) => onChange(Number(event.target.value))} className="min-h-11 tabular-nums md:text-base" />
                  </div>
                ))}
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                <Button type="submit" disabled={savingDefaults} className="min-h-11">{savingDefaults ? "Saving defaults…" : "Save defaults"}</Button>
                <Button
                  type="button"
                  variant="outline"
                  disabled={savingDefaults}
                  className="min-h-11"
                  onClick={() => {
                    setIsEditingDefaults(false);
                    setTargetProfitPercent(settings?.target_profit_percent ?? 20);
                    setHoldingPeriodMonths(settings?.holding_period_months ?? 6);
                    setMonthlyHoldingCost(settings?.monthly_holding_cost ?? 1500);
                    setSellingCostsPercent(settings?.selling_costs_percent ?? 8);
                  }}
                >
                  Cancel
                </Button>
              </div>
            </form>
          ) : (
            <>
              <dl className="mt-3 divide-y divide-border tabular-nums">
                <SettingValue label="Target profit" value={targetProfitPercent + "%"} />
                <SettingValue label="Holding period" value={holdingPeriodMonths + " months"} />
                <SettingValue label="Monthly holding cost" value={"$" + monthlyHoldingCost.toLocaleString()} />
                <SettingValue label="Selling costs" value={sellingCostsPercent + "% of ARV"} />
              </dl>
              <p className="mt-2 text-sm text-muted-foreground">Used for new underwriting analyses.</p>
            </>
          )}
        </section>

        <section aria-labelledby="email-preferences" className="min-w-0 rounded-lg border border-border bg-card p-4 sm:p-6">
          <h2 id="email-preferences" className="text-lg font-semibold">Email notifications</h2>
          <p className="mt-1 text-sm text-muted-foreground">Changes save as you switch each option.</p>
          <div className="mt-3 divide-y divide-border">
            {([
              { key: "deal", label: "Deal status updates", hint: "When deals change status", enabled: dealUpdates },
              { key: "underwriting", label: "Underwriting complete", hint: "When analysis is ready", enabled: underwritingComplete },
              { key: "weekly", label: "Weekly summary", hint: "Pipeline overview email", enabled: weeklySummary },
            ] as const).map(({ key, label, hint, enabled }) => (
              <div key={key} className="flex min-h-11 items-center justify-between gap-3 py-3">
                <div className="min-w-0">
                  <Label htmlFor={"notification-" + key}>{label}</Label>
                  <p id={"notification-hint-" + key} className="mt-1 text-sm text-muted-foreground">{hint}</p>
                </div>
                <Switch
                  id={"notification-" + key}
                  aria-describedby={"notification-hint-" + key}
                  checked={enabled}
                  onCheckedChange={(value) => handleNotificationToggle(key, value)}
                  disabled={savingNotifications}
                />
              </div>
            ))}
          </div>
          <p role="status" className="sr-only">{savingNotifications && "Saving notification preferences…"}</p>
        </section>
      </div>
    </div>
  );
}

function SettingValue({ label, value }: { label: string; value: string }) {
  return (
    <div className="grid gap-1 py-2 text-sm min-[380px]:grid-cols-[minmax(0,2fr)_minmax(0,3fr)] min-[380px]:gap-3">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="min-w-0 font-medium [overflow-wrap:anywhere]">{value}</dd>
    </div>
  );
}
