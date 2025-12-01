"use client";

import { useState } from "react";
import { Bell, Mail, MessageSquare, Smartphone, Save, Check } from "lucide-react";

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

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await onSave(settings);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (error) {
      console.error("Failed to save preferences:", error);
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
        <h3 className="text-lg font-semibold text-foreground mb-4">Delivery Methods</h3>
        <div className="space-y-3">
          <ToggleRow
            icon={<Mail className="h-5 w-5" />}
            title="Email Notifications"
            description="Receive notifications via email"
            enabled={settings.email}
            onToggle={() => toggleSetting("email")}
          />
          <ToggleRow
            icon={<Smartphone className="h-5 w-5" />}
            title="SMS Notifications"
            description={hasPhone ? "Receive text message alerts" : "Add a phone number to enable SMS"}
            enabled={settings.sms}
            onToggle={() => toggleSetting("sms")}
            disabled={!hasPhone}
          />
          <ToggleRow
            icon={<Bell className="h-5 w-5" />}
            title="Push Notifications"
            description="Receive in-app notifications"
            enabled={settings.push}
            onToggle={() => toggleSetting("push")}
          />
        </div>
      </div>

      {/* Email Digest */}
      <div className="pt-4 border-t border-border">
        <h3 className="text-lg font-semibold text-foreground mb-4">Email Digest</h3>
        <p className="text-sm text-muted-foreground mb-3">
          Receive a summary of all your deal activity
        </p>
        <div className="flex gap-3">
          {(["none", "daily", "weekly"] as const).map((option) => (
            <button
              key={option}
              onClick={() => setSettings(prev => ({ ...prev, digest: option }))}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                settings.digest === option
                  ? "bg-blue-600 text-white"
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
        <h3 className="text-lg font-semibold text-foreground mb-4">Notification Types</h3>
        <div className="space-y-3">
          <ToggleRow
            icon={<div className="w-5 h-5 rounded-full bg-blue-500" />}
            title="Status Changes"
            description="When your deals move to a new status"
            enabled={settings.statusChanges}
            onToggle={() => toggleSetting("statusChanges")}
          />
          <ToggleRow
            icon={<div className="w-5 h-5 rounded-full bg-purple-500" />}
            title="New Assignments"
            description="When a deal is assigned to you"
            enabled={settings.newAssignments}
            onToggle={() => toggleSetting("newAssignments")}
          />
          <ToggleRow
            icon={<MessageSquare className="h-5 w-5 text-green-500" />}
            title="Comments"
            description="When someone comments on your deals"
            enabled={settings.comments}
            onToggle={() => toggleSetting("comments")}
          />
          <ToggleRow
            icon={<div className="w-5 h-5 rounded-full bg-emerald-500" />}
            title="Funding Updates"
            description="When there are updates to funding requests"
            enabled={settings.fundingUpdates}
            onToggle={() => toggleSetting("fundingUpdates")}
          />
        </div>
      </div>

      {/* Save Button */}
      <div className="pt-4 border-t border-border">
        <button
          onClick={handleSave}
          disabled={isSaving}
          className="inline-flex items-center gap-2 px-6 py-2.5 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700 disabled:opacity-50"
        >
          {isSaving ? (
            <>
              <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Saving...
            </>
          ) : saved ? (
            <>
              <Check className="h-4 w-4" />
              Saved!
            </>
          ) : (
            <>
              <Save className="h-4 w-4" />
              Save Preferences
            </>
          )}
        </button>
      </div>
    </div>
  );
}

function ToggleRow({
  icon,
  title,
  description,
  enabled,
  onToggle,
  disabled = false,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  enabled: boolean;
  onToggle: () => void;
  disabled?: boolean;
}) {
  return (
    <div className={`flex items-center justify-between p-4 rounded-lg bg-card border border-border ${disabled ? "opacity-50" : ""}`}>
      <div className="flex items-center gap-3">
        <div className="text-muted-foreground">{icon}</div>
        <div>
          <p className="font-medium text-foreground">{title}</p>
          <p className="text-sm text-muted-foreground">{description}</p>
        </div>
      </div>
      <button
        onClick={onToggle}
        disabled={disabled}
        className={`relative w-12 h-6 rounded-full transition-colors ${
          enabled 
            ? "bg-blue-600" 
            : "bg-slate-300 dark:bg-slate-600"
        } ${disabled ? "cursor-not-allowed" : "cursor-pointer"}`}
      >
        <div
          className={`absolute top-1 w-4 h-4 rounded-full shadow-sm transition-transform ${
            enabled 
              ? "translate-x-7 bg-white" 
              : "translate-x-1 bg-white dark:bg-slate-300"
          }`}
        />
      </button>
    </div>
  );
}
