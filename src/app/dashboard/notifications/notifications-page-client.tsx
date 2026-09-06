"use client";

import { useState } from "react";
import { WorkspaceHeading } from "@/components/layout/workspace-heading";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
  loadFailed: boolean;
}

export function NotificationsPageClient({ 
  notifications: initialNotifications, 
  preferences,
  hasPhone,
  loadFailed,
}: NotificationsPageClientProps) {
  const [notifications, setNotifications] = useState<Notification[]>(initialNotifications);
  const [actionError, setActionError] = useState<string | null>(null);

  async function applyNotificationAction(
    action: () => Promise<{ success: boolean }>,
    update: (previous: Notification[]) => Notification[],
    failure: string,
  ) {
    setActionError(null);
    try {
      const result = await action();
      if (result.success) setNotifications(update);
      else setActionError(failure);
    } catch {
      setActionError(failure);
    }
  }

  const handleMarkAsRead = (id: string) => applyNotificationAction(
    () => markNotificationAsRead(id),
    (previous) => previous.map((notification) => notification.id === id ? { ...notification, is_read: true } : notification),
    "Could not mark the notification as read.",
  );

  const handleMarkAllAsRead = () => applyNotificationAction(
    markAllNotificationsAsRead,
    (previous) => previous.map((notification) => ({ ...notification, is_read: true })),
    "Could not mark the notifications as read.",
  );

  const handleDelete = (id: string) => applyNotificationAction(
    () => deleteNotification(id),
    (previous) => previous.filter((notification) => notification.id !== id),
    "Could not delete the notification.",
  );

  const handleSavePreferences = async (newPrefs: NotificationPreferences) => {
    const result = await updateNotificationPreferences(newPrefs);
    if (!result.success) throw new Error("Could not save notification preferences.");
  };

  const unreadCount = notifications.filter((notification) => !notification.is_read).length;

  return (
    <div className="w-full min-w-0 max-w-4xl space-y-6">
      <WorkspaceHeading title="Notifications" />
      <Tabs defaultValue="notifications">
        <TabsList aria-label="Notifications" className="mb-2 h-auto max-w-full flex-wrap">
          <TabsTrigger value="notifications" className="min-h-11">
            Notifications
            {unreadCount > 0 && <span className="rounded bg-muted px-1.5 text-xs tabular-nums">{unreadCount} unread</span>}
          </TabsTrigger>
          <TabsTrigger value="settings" className="min-h-11">Settings</TabsTrigger>
        </TabsList>
        <TabsContent value="notifications" className="min-w-0">
          <div role="alert">
            {actionError && <p className="mb-4 rounded-lg border border-destructive/40 p-3 text-sm">{actionError}</p>}
          </div>
          {loadFailed ? (
            <p role="alert" className="rounded-lg border border-destructive/40 p-4">
              Notifications could not be loaded.
            </p>
          ) : (
            <NotificationList
              notifications={notifications}
              onMarkAsRead={handleMarkAsRead}
              onMarkAllAsRead={handleMarkAllAsRead}
              onDelete={handleDelete}
            />
          )}
        </TabsContent>
        <TabsContent value="settings" className="min-w-0 rounded-lg border border-border bg-card p-4 sm:p-6">
          <NotificationSettings preferences={preferences} onSave={handleSavePreferences} hasPhone={hasPhone} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
