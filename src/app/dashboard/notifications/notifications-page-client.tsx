"use client";

import { useState } from "react";
import { Bell, Settings } from "lucide-react";
import { NotificationList, Notification } from "@/components/notifications/notification-list";
import { NotificationSettings } from "@/components/notifications/notification-settings";
import { markNotificationAsRead, markAllNotificationsAsRead, deleteNotification, updateNotificationPreferences } from "@/lib/actions/notification-actions";

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

interface NotificationsPageClientProps {
  notifications: Notification[];
  preferences: NotificationPreferences;
  hasPhone: boolean;
}

export function NotificationsPageClient({ 
  notifications: initialNotifications, 
  preferences,
  hasPhone,
}: NotificationsPageClientProps) {
  const [notifications, setNotifications] = useState<Notification[]>(initialNotifications);
  const [activeTab, setActiveTab] = useState<"notifications" | "settings">("notifications");

  const handleMarkAsRead = async (id: string) => {
    await markNotificationAsRead(id);
    setNotifications(prev => prev.map(n => 
      n.id === id ? { ...n, is_read: true } : n
    ));
  };

  const handleMarkAllAsRead = async () => {
    await markAllNotificationsAsRead();
    setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
  };

  const handleDelete = async (id: string) => {
    await deleteNotification(id);
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const handleSavePreferences = async (newPrefs: NotificationPreferences) => {
    await updateNotificationPreferences(newPrefs);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">Notifications</h1>
        <p className="text-muted-foreground">Manage your notifications and preferences</p>
      </div>

      {/* Tabs */}
      <div className="border-b border-border">
        <nav className="flex gap-6">
          <button
            onClick={() => setActiveTab("notifications")}
            className={`flex items-center gap-2 pb-3 border-b-2 transition-colors ${
              activeTab === "notifications"
                ? "border-blue-500 text-blue-600"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            <Bell className="h-4 w-4" />
            Notifications
            {notifications.filter(n => !n.is_read).length > 0 && (
              <span className="px-1.5 py-0.5 text-xs rounded-full bg-blue-500 text-white">
                {notifications.filter(n => !n.is_read).length}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab("settings")}
            className={`flex items-center gap-2 pb-3 border-b-2 transition-colors ${
              activeTab === "settings"
                ? "border-blue-500 text-blue-600"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            <Settings className="h-4 w-4" />
            Settings
          </button>
        </nav>
      </div>

      {/* Content */}
      <div className="bg-card rounded-lg border border-border p-6">
        {activeTab === "notifications" ? (
          <NotificationList
            notifications={notifications}
            onMarkAsRead={handleMarkAsRead}
            onMarkAllAsRead={handleMarkAllAsRead}
            onDelete={handleDelete}
          />
        ) : (
          <NotificationSettings
            preferences={preferences}
            onSave={handleSavePreferences}
            hasPhone={hasPhone}
          />
        )}
      </div>
    </div>
  );
}
