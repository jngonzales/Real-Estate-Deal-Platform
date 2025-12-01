"use client"

import * as React from "react"
import { createClient } from "@/utils/supabase/client"
import type { RealtimeChannel } from "@supabase/supabase-js"

// Types for real-time events
export interface RealtimeEvent {
  id: string
  type: "deal" | "comment" | "notification" | "activity"
  action: "INSERT" | "UPDATE" | "DELETE"
  data: Record<string, unknown>
  timestamp: Date
}

interface UseRealtimeOptions {
  table: string
  schema?: string
  filter?: string
  onInsert?: (payload: Record<string, unknown>) => void
  onUpdate?: (payload: Record<string, unknown>) => void
  onDelete?: (payload: Record<string, unknown>) => void
  enabled?: boolean
}

// Hook for subscribing to real-time database changes
export function useRealtime({
  table,
  schema = "public",
  filter,
  onInsert,
  onUpdate,
  onDelete,
  enabled = true,
}: UseRealtimeOptions) {
  const [isConnected, setIsConnected] = React.useState(false)
  const channelRef = React.useRef<RealtimeChannel | null>(null)
  const supabase = createClient()

  React.useEffect(() => {
    if (!enabled) return

    const channelName = `${schema}:${table}${filter ? `:${filter}` : ""}`
    
    const channel = supabase
      .channel(channelName)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema,
          table,
          filter,
        },
        (payload) => {
          const data = payload.new as Record<string, unknown>
          const oldData = payload.old as Record<string, unknown>

          switch (payload.eventType) {
            case "INSERT":
              onInsert?.(data)
              break
            case "UPDATE":
              onUpdate?.({ ...data, _old: oldData })
              break
            case "DELETE":
              onDelete?.(oldData)
              break
          }
        }
      )
      .subscribe((status) => {
        setIsConnected(status === "SUBSCRIBED")
      })

    channelRef.current = channel

    return () => {
      channel.unsubscribe()
    }
  }, [table, schema, filter, onInsert, onUpdate, onDelete, enabled, supabase])

  return { isConnected }
}

// Hook for subscribing to multiple tables
export function useRealtimeMultiple(
  subscriptions: UseRealtimeOptions[],
  enabled = true
) {
  const [connections, setConnections] = React.useState<Record<string, boolean>>({})
  const channelsRef = React.useRef<RealtimeChannel[]>([])
  const supabase = createClient()

  React.useEffect(() => {
    if (!enabled) {
      channelsRef.current.forEach(ch => ch.unsubscribe())
      channelsRef.current = []
      return
    }

    const channels: RealtimeChannel[] = []

    subscriptions.forEach((sub, index) => {
      const channelName = `multi:${sub.table}:${index}`
      
      const channel = supabase
        .channel(channelName)
        .on(
          "postgres_changes",
          {
            event: "*",
            schema: sub.schema || "public",
            table: sub.table,
            filter: sub.filter,
          },
          (payload) => {
            const data = payload.new as Record<string, unknown>
            const oldData = payload.old as Record<string, unknown>

            switch (payload.eventType) {
              case "INSERT":
                sub.onInsert?.(data)
                break
              case "UPDATE":
                sub.onUpdate?.({ ...data, _old: oldData })
                break
              case "DELETE":
                sub.onDelete?.(oldData)
                break
            }
          }
        )
        .subscribe((status) => {
          setConnections(prev => ({
            ...prev,
            [sub.table]: status === "SUBSCRIBED"
          }))
        })

      channels.push(channel)
    })

    channelsRef.current = channels

    return () => {
      channels.forEach(ch => ch.unsubscribe())
    }
  }, [subscriptions, enabled, supabase])

  const allConnected = Object.values(connections).every(Boolean)
  return { connections, allConnected }
}

// Hook for presence (who's online)
export function usePresence(roomName: string, userInfo: Record<string, unknown>) {
  const [users, setUsers] = React.useState<Record<string, unknown>[]>([])
  const [isConnected, setIsConnected] = React.useState(false)
  const supabase = createClient()

  React.useEffect(() => {
    const channel = supabase.channel(roomName)

    channel
      .on("presence", { event: "sync" }, () => {
        const state = channel.presenceState()
        const presentUsers = Object.values(state).flat() as Record<string, unknown>[]
        setUsers(presentUsers)
      })
      .on("presence", { event: "join" }, ({ newPresences }) => {
        setUsers(prev => [...prev, ...(newPresences as Record<string, unknown>[])])
      })
      .on("presence", { event: "leave" }, ({ leftPresences }) => {
        const leftIds = (leftPresences as Record<string, unknown>[]).map(p => p.id)
        setUsers(prev => prev.filter(u => !leftIds.includes(u.id)))
      })
      .subscribe(async (status) => {
        if (status === "SUBSCRIBED") {
          await channel.track(userInfo)
          setIsConnected(true)
        }
      })

    return () => {
      channel.unsubscribe()
    }
  }, [roomName, userInfo, supabase])

  return { users, isConnected }
}

// Activity feed with real-time updates
interface ActivityItem {
  id: string
  type: string
  description: string
  user_id: string
  deal_id?: string
  created_at: string
  metadata?: Record<string, unknown>
}

export function useRealtimeActivity(limit = 20) {
  const [activities, setActivities] = React.useState<ActivityItem[]>([])
  const [loading, setLoading] = React.useState(true)
  const supabase = createClient()

  // Initial load
  React.useEffect(() => {
    const loadActivities = async () => {
      const { data } = await supabase
        .from("deal_activities")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(limit)

      if (data) {
        setActivities(data)
      }
      setLoading(false)
    }

    loadActivities()
  }, [limit, supabase])

  // Real-time subscription
  useRealtime({
    table: "deal_activities",
    onInsert: (payload) => {
      setActivities(prev => [payload as unknown as ActivityItem, ...prev.slice(0, limit - 1)])
    },
  })

  return { activities, loading }
}

// Notifications with real-time updates  
interface Notification {
  id: string
  user_id: string
  type: string
  title: string
  message: string
  deal_id?: string
  is_read: boolean
  created_at: string
}

export function useRealtimeNotifications(userId: string | undefined) {
  const [notifications, setNotifications] = React.useState<Notification[]>([])
  const [unreadCount, setUnreadCount] = React.useState(0)
  const [loading, setLoading] = React.useState(true)
  const supabase = createClient()

  // Initial load
  React.useEffect(() => {
    if (!userId) return

    const loadNotifications = async () => {
      const { data } = await supabase
        .from("notifications")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
        .limit(50)

      if (data) {
        setNotifications(data)
        setUnreadCount(data.filter(n => !n.is_read).length)
      }
      setLoading(false)
    }

    loadNotifications()
  }, [userId, supabase])

  // Real-time subscription for new notifications
  useRealtime({
    table: "notifications",
    filter: userId ? `user_id=eq.${userId}` : undefined,
    enabled: !!userId,
    onInsert: (payload) => {
      const notification = payload as unknown as Notification
      setNotifications(prev => [notification, ...prev])
      if (!notification.is_read) {
        setUnreadCount(prev => prev + 1)
      }
    },
    onUpdate: (payload) => {
      const notification = payload as unknown as Notification
      setNotifications(prev =>
        prev.map(n => n.id === notification.id ? notification : n)
      )
      // Recalculate unread count
      setNotifications(prev => {
        setUnreadCount(prev.filter(n => !n.is_read).length)
        return prev
      })
    },
  })

  const markAsRead = async (notificationId: string) => {
    await supabase
      .from("notifications")
      .update({ is_read: true, read_at: new Date().toISOString() })
      .eq("id", notificationId)
  }

  const markAllAsRead = async () => {
    if (!userId) return
    await supabase
      .from("notifications")
      .update({ is_read: true, read_at: new Date().toISOString() })
      .eq("user_id", userId)
      .eq("is_read", false)
  }

  return { notifications, unreadCount, loading, markAsRead, markAllAsRead }
}

// Connection status indicator component
export function RealtimeStatus({ isConnected }: { isConnected: boolean }) {
  return (
    <div className="flex items-center gap-1.5 text-xs">
      <div
        className={`h-2 w-2 rounded-full ${
          isConnected ? "bg-green-500" : "bg-red-500"
        }`}
      />
      <span className="text-muted-foreground">
        {isConnected ? "Live" : "Connecting..."}
      </span>
    </div>
  )
}
