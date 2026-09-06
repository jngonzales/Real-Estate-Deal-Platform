"use client";

import { useState } from "react";
import { formatDistanceToNow } from "date-fns";
import { Button } from "@/components/ui/button";
import { Check, Trash2 } from "@/components/ui/icons";
import Link from "next/link";

export interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  deal_id: string | null;
  action_url: string | null;
  is_read: boolean;
  created_at: string;
}

interface NotificationListProps {
  notifications: Notification[];
  onMarkAsRead: (id: string) => Promise<void>;
  onMarkAllAsRead: () => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}

export function NotificationList({
  notifications,
  onMarkAsRead,
  onMarkAllAsRead,
  onDelete,
}: NotificationListProps) {
  const [filter, setFilter] = useState<"all" | "unread">("all");
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const filteredNotifications = filter === "unread"
    ? notifications.filter(n => !n.is_read)
    : notifications;

  const unreadCount = notifications.filter(n => !n.is_read).length;

  const handleDelete = async (id: string) => {
    setDeletingId(id);
    try {
      await onDelete(id);
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div role="group" aria-label="Filter notifications" className="flex flex-wrap gap-2">
          <Button
            type="button"
            variant={filter === "all" ? "secondary" : "ghost"}
            aria-pressed={filter === "all"}
            className="min-h-11"
            onClick={() => setFilter("all")}
          >
            All
          </Button>
          <Button
            type="button"
            variant={filter === "unread" ? "secondary" : "ghost"}
            aria-pressed={filter === "unread"}
            className="min-h-11"
            onClick={() => setFilter("unread")}
          >
            Unread
          </Button>
        </div>
        {unreadCount > 0 && (
          <Button type="button" variant="outline" className="min-h-11" onClick={onMarkAllAsRead}>
            Mark all as read
          </Button>
        )}
      </div>

      {filteredNotifications.length === 0 ? (
        <section className="rounded-lg border border-border bg-card p-4 sm:p-6">
          <h2 className="font-semibold">{notifications.length === 0 ? "No notifications yet" : "No unread notifications"}</h2>
        </section>
      ) : (
        <ul aria-label="Notifications" className="divide-y divide-border rounded-lg border border-border bg-card">
          {filteredNotifications.map((notification) => (
            <li key={notification.id} className="min-w-0 p-4 [overflow-wrap:anywhere] sm:px-6">
              <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                <h2 className="font-semibold">{notification.title}</h2>
                {!notification.is_read && (
                  <span className="rounded bg-primary/10 px-1.5 py-0.5 text-xs font-medium text-primary">Unread</span>
                )}
              </div>
              <p className="mt-1 text-sm text-muted-foreground">{notification.message}</p>
              <div className="mt-2 flex flex-wrap items-center justify-between gap-x-4 gap-y-1">
                <time dateTime={notification.created_at} className="text-sm text-muted-foreground">
                  {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
                </time>
                <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                  {notification.action_url && (
                    <Link href={notification.action_url} className="inline-flex min-h-11 items-center text-sm text-primary underline underline-offset-4">
                      View details
                    </Link>
                  )}
                  {!notification.is_read && (
                    <Button type="button" variant="ghost" size="icon" className="size-11" onClick={() => onMarkAsRead(notification.id)} aria-label="Mark as read">
                      <Check aria-hidden="true" />
                    </Button>
                  )}
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="size-11 text-muted-foreground hover:text-destructive"
                    onClick={() => handleDelete(notification.id)}
                    disabled={deletingId === notification.id}
                    aria-label={deletingId === notification.id ? "Deleting notification" : "Delete notification"}
                  >
                    <Trash2 aria-hidden="true" />
                  </Button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
