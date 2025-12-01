"use client"

import * as React from "react"
import { formatDistanceToNow } from "date-fns"
import {
  FileText,
  MessageSquare,
  DollarSign,
  CheckCircle,
  XCircle,
  Clock,
  User,
  Edit,
  Plus,
  Trash2,
  ArrowRight,
} from "lucide-react"
import { cn } from "@/lib/utils"

export interface Activity {
  id: string
  type: 
    | "deal_created"
    | "deal_updated"
    | "status_changed"
    | "comment_added"
    | "offer_made"
    | "underwriting_completed"
    | "deal_assigned"
    | "document_uploaded"
    | "deal_closed"
    | "deal_rejected"
  description: string
  user: {
    name: string
    avatar?: string
  }
  deal?: {
    id: string
    address: string
  }
  metadata?: Record<string, string>
  timestamp: Date
}

interface ActivityFeedProps {
  activities: Activity[]
  maxItems?: number
  className?: string
  onActivityClick?: (activity: Activity) => void
}

const activityIcons: Record<Activity["type"], React.ElementType> = {
  deal_created: Plus,
  deal_updated: Edit,
  status_changed: ArrowRight,
  comment_added: MessageSquare,
  offer_made: DollarSign,
  underwriting_completed: CheckCircle,
  deal_assigned: User,
  document_uploaded: FileText,
  deal_closed: CheckCircle,
  deal_rejected: XCircle,
}

const activityColors: Record<Activity["type"], string> = {
  deal_created: "bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400",
  deal_updated: "bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400",
  status_changed: "bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400",
  comment_added: "bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400",
  offer_made: "bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400",
  underwriting_completed: "bg-cyan-100 text-cyan-600 dark:bg-cyan-900/30 dark:text-cyan-400",
  deal_assigned: "bg-indigo-100 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400",
  document_uploaded: "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400",
  deal_closed: "bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400",
  deal_rejected: "bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400",
}

export function ActivityFeed({
  activities,
  maxItems = 10,
  className,
  onActivityClick,
}: ActivityFeedProps) {
  const displayedActivities = activities.slice(0, maxItems)

  if (activities.length === 0) {
    return (
      <div className={cn("flex flex-col items-center justify-center py-8 text-center", className)}>
        <Clock className="h-8 w-8 text-muted-foreground mb-2" />
        <p className="text-sm text-muted-foreground">No recent activity</p>
      </div>
    )
  }

  return (
    <div className={cn("space-y-1", className)}>
      {displayedActivities.map((activity, index) => {
        const Icon = activityIcons[activity.type]
        const colorClass = activityColors[activity.type]
        
        return (
          <div
            key={activity.id}
            onClick={() => onActivityClick?.(activity)}
            className={cn(
              "flex gap-3 p-3 rounded-lg transition-colors",
              onActivityClick && "cursor-pointer hover:bg-muted/50"
            )}
          >
            {/* Timeline connector */}
            <div className="relative flex flex-col items-center">
              <div className={cn("flex h-8 w-8 items-center justify-center rounded-full", colorClass)}>
                <Icon className="h-4 w-4" />
              </div>
              {index < displayedActivities.length - 1 && (
                <div className="w-px flex-1 bg-border mt-2" />
              )}
            </div>
            
            {/* Content */}
            <div className="flex-1 min-w-0 pt-1">
              <p className="text-sm">
                <span className="font-medium">{activity.user.name}</span>
                {" "}
                <span className="text-muted-foreground">{activity.description}</span>
              </p>
              
              {activity.deal && (
                <p className="text-xs text-muted-foreground mt-0.5 truncate">
                  {activity.deal.address}
                </p>
              )}
              
              <p className="text-xs text-muted-foreground mt-1">
                {formatDistanceToNow(activity.timestamp, { addSuffix: true })}
              </p>
            </div>
          </div>
        )
      })}
      
      {activities.length > maxItems && (
        <button className="w-full py-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
          View {activities.length - maxItems} more activities
        </button>
      )}
    </div>
  )
}

// Compact version for sidebar/widgets
export function ActivityFeedCompact({
  activities,
  maxItems = 5,
  className,
}: Omit<ActivityFeedProps, "onActivityClick">) {
  const displayedActivities = activities.slice(0, maxItems)

  return (
    <div className={cn("space-y-3", className)}>
      {displayedActivities.map((activity) => {
        const Icon = activityIcons[activity.type]
        const colorClass = activityColors[activity.type]
        
        return (
          <div key={activity.id} className="flex items-start gap-2">
            <div className={cn("flex h-6 w-6 shrink-0 items-center justify-center rounded-full", colorClass)}>
              <Icon className="h-3 w-3" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs truncate">
                <span className="font-medium">{activity.user.name}</span>
                {" "}
                {activity.description}
              </p>
              <p className="text-xs text-muted-foreground">
                {formatDistanceToNow(activity.timestamp, { addSuffix: true })}
              </p>
            </div>
          </div>
        )
      })}
    </div>
  )
}
