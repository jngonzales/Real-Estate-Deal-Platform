"use client";

import { useId, useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";

interface NotificationPreferences {
  email: boolean;
  sms: boolean;
  push: boolean;
  digest: "none" | "daily" | "weekly";
  statusChanges: boolean;
  newAssignments: boolean;
  comments: boolean;
  fundingUpdates: boolean;
}

interface NotificationSettingsProps {
  preferences: NotificationPreferences;
  onSave: (preferences: NotificationPreferences) => Promise<void>;
  hasPhone?: boolean;
}

export function NotificationSettings({ preferences, onSave, hasPhone = false }: NotificationSettingsProps) {
  const [settings, setSettings] = useState<NotificationPreferences>(preferences);
  const [isSaving, setIsSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSave = async () => {
    setIsSaving(true);
    setError(null);
    setSaved(false);
    try {
      await onSave(settings);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (error) {
      console.error("Failed to save preferences:", error);
      setError("Could not save preferences. Try again.");
    } finally {
      setIsSaving(false);
    }
  };

  const toggleSetting = (key: keyof NotificationPreferences) => {
    if (typeof settings[key] === "boolean") {
      setSettings(prev => ({ ...prev, [key]: !prev[key] }));
    }
  };

  return (
    <div className="space-y-6">
      {/* Delivery Methods */}
      <div>
        <h2 className="text-lg font-semibold text-foreground mb-4">Delivery Methods</h2>
        <div className="space-y-3">
          <ToggleRow
            title="Email Notifications"
            description="Receive notifications via email"
            enabled={settings.email}
            onToggle={() => toggleSetting("email")}
          />
          <ToggleRow
            title="SMS Notifications"
            description={hasPhone ? "Receive text message alerts" : "Add a phone number to enable SMS"}
            enabled={settings.sms}
            onToggle={() => toggleSetting("sms")}
            disabled={!hasPhone}
          />
          <ToggleRow
            title="Push Notifications"
            description="Receive in-app notifications"
            enabled={settings.push}
            onToggle={() => toggleSetting("push")}
          />
        </div>
      </div>

      {/* Email Digest */}
      <div className="pt-4 border-t border-border">
        <h2 className="text-lg font-semibold text-foreground mb-4">Email Digest</h2>
        <p className="text-sm text-muted-foreground mb-3">
          Receive a summary of all your deal activity
        </p>
        <div role="group" aria-label="Email digest frequency" className="flex flex-wrap gap-2">
          {(["none", "daily", "weekly"] as const).map((option) => (
            <button
              key={option}
              type="button"
              aria-pressed={settings.digest === option}
              onClick={() => setSettings(prev => ({ ...prev, digest: option }))}
              className={`min-h-11 rounded-lg px-3 text-sm font-medium transition-colors motion-reduce:transition-none ${
                settings.digest === option
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground hover:bg-muted/80"
              }`}
            >
              {option === "none" ? "None" : option.charAt(0).toUpperCase() + option.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Notification Types */}
      <div className="pt-4 border-t border-border">
        <h2 className="text-lg font-semibold text-foreground mb-4">Notification Types</h2>
        <div className="space-y-3">
          <ToggleRow
            title="Status Changes"
            description="When your deals move to a new status"
            enabled={settings.statusChanges}
            onToggle={() => toggleSetting("statusChanges")}
          />
          <ToggleRow
            title="New Assignments"
            description="When a deal is assigned to you"
            enabled={settings.newAssignments}
            onToggle={() => toggleSetting("newAssignments")}
          />
          <ToggleRow
            title="Comments"
            description="When someone comments on your deals"
            enabled={settings.comments}
            onToggle={() => toggleSetting("comments")}
          />
          <ToggleRow
            title="Funding Updates"
            description="When there are updates to funding requests"
            enabled={settings.fundingUpdates}
            onToggle={() => toggleSetting("fundingUpdates")}
          />
        </div>
      </div>

      <div className="border-t border-border pt-4">
        <Button type="button" onClick={handleSave} disabled={isSaving} className="min-h-11">
          {isSaving ? "Saving preferences…" : "Save preferences"}
        </Button>
        <div role="status">{saved && <p className="mt-2 text-sm text-muted-foreground">Preferences saved.</p>}</div>
        <div role="alert">{error && <p className="mt-2 text-sm text-destructive">{error}</p>}</div>
      </div>
    </div>
  );
}

function ToggleRow({
  title,
  description,
  enabled,
  onToggle,
  disabled = false,
}: {
  title: string;
  description: string;
  enabled: boolean;
  onToggle: () => void;
  disabled?: boolean;
}) {
  const id = useId();
  return (
    <div className="flex min-h-11 items-center justify-between gap-3 border-b border-border py-3 last:border-b-0">
      <div className="min-w-0">
        <Label htmlFor={id}>{title}</Label>
        <p id={id + "-description"} className="mt-1 text-sm text-muted-foreground">{description}</p>
      </div>
      <Switch
        id={id}
        checked={enabled}
        onCheckedChange={onToggle}
        disabled={disabled}
        aria-describedby={id + "-description"}
      />
    </div>
  );
}
