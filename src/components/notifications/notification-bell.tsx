"use client";

import { useState, useEffect, useRef, useId } from "react";
import { useRouter } from "next/navigation";
import { Bell, CheckCheck, FileText, MessageSquare, UserPlus, ArrowRight, X } from "@/components/ui/icons";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { formatDistanceToNow } from "date-fns";
import Link from "next/link";
import {
  getNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  type InAppNotification,
} from "@/lib/actions/notification-actions";

const notificationIcons: Record<string, React.ReactNode> = {
  deal_status_change: <FileText className="h-4 w-4" />,
  deal_assignment: <UserPlus className="h-4 w-4" />,
  new_comment: <MessageSquare className="h-4 w-4" />,
  new_deal: <FileText className="h-4 w-4" />,
  default: <Bell className="h-4 w-4" />,
};

const notificationColors: Record<string, string> = {
  deal_status_change: "bg-muted-foreground/50",
  deal_assignment: "bg-primary",
  new_comment: "bg-muted-foreground/50",
  new_deal: "bg-muted-foreground/50",
  default: "bg-muted-foreground/50",
};

export function NotificationBell() {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<InAppNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const headingId = useId();
  const headingRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    // Initial fetch
    const loadNotifications = async () => {
      const result = await getNotifications();
      if (!result.error) {
        setNotifications(result.notifications);
        setUnreadCount(result.unreadCount);
      }
    };
    loadNotifications();
    
    // Poll for new notifications every 30 seconds
    const interval = setInterval(loadNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleMarkAsRead = async (notificationId: string) => {
    await markNotificationAsRead(notificationId);
    setNotifications((prev) =>
      prev.map((n) => (n.id === notificationId ? { ...n, is_read: true } : n))
    );
    setUnreadCount((prev) => Math.max(0, prev - 1));
  };

  const handleMarkAllAsRead = async () => {
    setIsLoading(true);
    await markAllNotificationsAsRead();
    setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
    setUnreadCount(0);
    setIsLoading(false);
  };

  const handleNotificationClick = async (notification: InAppNotification) => {
    if (!notification.is_read) {
      await handleMarkAsRead(notification.id);
    }
    if (notification.action_url) {
      router.push(notification.action_url);
    }
    setIsOpen(false);
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          className="relative inline-flex size-11 items-center justify-center rounded-lg text-foreground hover:bg-accent focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
          aria-label={unreadCount > 0 ? "Notifications, " + unreadCount + " unread" : "Notifications"}
        >
          <Bell aria-hidden="true" className="size-5" />
          {unreadCount > 0 && (
            <span aria-hidden="true" className="absolute end-0 top-0 grid size-5 place-items-center rounded-full bg-primary text-[10px] font-semibold text-primary-foreground">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
        </button>
      </PopoverTrigger>

      <PopoverContent
        aria-labelledby={headingId}
        align="end"
        collisionPadding={8}
        sideOffset={8}
        onOpenAutoFocus={(event) => {
          event.preventDefault();
          headingRef.current?.focus();
        }}
        className="flex max-h-(--radix-popover-content-available-height) w-[min(24rem,calc(100vw-1rem))] flex-col overflow-hidden rounded-lg border-border bg-card p-0 shadow-sm data-[state=open]:animate-none motion-reduce:animate-none"
      >
          {/* Header */}
          <div className="flex shrink-0 flex-wrap items-center justify-between gap-x-2 border-b border-border px-3 py-1">
            <h2 ref={headingRef} id={headingId} tabIndex={-1} className="rounded-sm font-semibold focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring">Notifications</h2>
            <div className="flex flex-wrap items-center gap-1">
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllAsRead}
                disabled={isLoading}
                className="flex min-h-11 items-center gap-1 rounded-sm px-1.5 text-xs font-medium text-primary hover:underline focus-visible:outline-2 focus-visible:outline-ring"
              >
                <CheckCheck aria-hidden="true" className="size-3" />
                Mark all read
              </button>
            )}
              <button
                type="button"
                aria-label="Close notifications"
                onClick={() => setIsOpen(false)}
                className="grid size-11 place-items-center rounded-md hover:bg-accent focus-visible:outline-2 focus-visible:outline-ring"
              >
                <X aria-hidden="true" className="size-4" />
              </button>
            </div>
          </div>

          {/* Notifications List */}
          <div className="min-h-0 max-h-96 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="px-4 py-8 text-center">
                <Bell className="mx-auto h-8 w-8 text-muted-foreground" />
                <p className="mt-2 text-sm text-muted-foreground">No notifications yet</p>
              </div>
            ) : (
              <div className="divide-y divide-border">
                {notifications.map((notification) => (
                  <button
                    key={notification.id}
                    onClick={() => handleNotificationClick(notification)}
                    className={`w-full px-4 py-3 text-start hover:bg-accent focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-ring ${
                      !notification.is_read ? "bg-accent/40" : ""
                    }`}
                  >
                    <div className="flex gap-3">
                      {/* Icon */}
                      <div
                        aria-hidden="true"
                        className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-primary-foreground ${
                          notificationColors[notification.type] || notificationColors.default
                        }`}
                      >
                        {notificationIcons[notification.type] || notificationIcons.default}
                      </div>

                      {/* Content */}
                      <div className="min-w-0 flex-1 [overflow-wrap:anywhere]">
                        <p className={`text-sm ${!notification.is_read ? "font-semibold" : ""} text-foreground`}>
                          {notification.title}
                        </p>
                        <p className="mt-0.5 text-xs text-muted-foreground">
                          {notification.message}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
                        </p>
                      </div>

                      {/* Unread indicator */}
                      {!notification.is_read && (
                        <div className="shrink-0">
                          <span className="sr-only">Unread</span>
                          <div className="h-2 w-2 rounded-full bg-primary" />
                        </div>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          {notifications.length > 0 && (
            <div className="shrink-0 border-t border-border px-4">
              <Link
                href="/dashboard/notifications"
                onClick={() => setIsOpen(false)}
                className="flex min-h-11 items-center justify-center gap-1 rounded-sm text-sm font-medium text-primary hover:underline focus-visible:outline-2 focus-visible:outline-ring"
              >
                View all notifications
                <ArrowRight aria-hidden="true" className="size-3" />
              </Link>
            </div>
          )}
      </PopoverContent>
    </Popover>
  );
}
