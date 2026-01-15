"use client";

import { useMemo } from "react";
import { 
  Clock, 
  Plus, 
  Edit, 
  Trash2,
  ArrowRight,
  User,
  MessageSquare,
  Tag
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface ActivityItem {
  id: string;
  type: "create" | "update" | "delete" | "status_change" | "comment" | "assign" | "tag";
  description: string;
  timestamp: string;
  user?: {
    name: string;
    email?: string;
  };
  dealId?: string;
  dealTitle?: string;
  metadata?: Record<string, unknown>;
}

interface RecentActivityProps {
  activities: ActivityItem[];
  maxItems?: number;
  className?: string;
  compact?: boolean;
}

const ACTIVITY_ICONS: Record<ActivityItem["type"], React.ReactNode> = {
  create: <Plus className="h-4 w-4" />,
  update: <Edit className="h-4 w-4" />,
  delete: <Trash2 className="h-4 w-4" />,
  status_change: <ArrowRight className="h-4 w-4" />,
  comment: <MessageSquare className="h-4 w-4" />,
  assign: <User className="h-4 w-4" />,
  tag: <Tag className="h-4 w-4" />,
};

const ACTIVITY_COLORS: Record<ActivityItem["type"], string> = {
  create: "bg-green-500/20 text-green-500",
  update: "bg-blue-500/20 text-blue-500",
  delete: "bg-red-500/20 text-red-500",
  status_change: "bg-purple-500/20 text-purple-500",
  comment: "bg-yellow-500/20 text-yellow-500",
  assign: "bg-cyan-500/20 text-cyan-500",
  tag: "bg-pink-500/20 text-pink-500",
};

function formatRelativeTime(timestamp: string): string {
  const now = new Date();
  const date = new Date(timestamp);
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  
  return date.toLocaleDateString();
}

export function RecentActivity({ 
  activities, 
  maxItems = 10, 
  className,
  compact = false 
}: RecentActivityProps) {
  const displayedActivities = useMemo(() => {
    return activities.slice(0, maxItems);
  }, [activities, maxItems]);

  if (compact) {
    return (
      <Card className={className}>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <Clock className="h-5 w-5 text-primary" />
            Recent Activity
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {displayedActivities.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">
              No recent activity
            </p>
          ) : (
            displayedActivities.map((activity) => (
              <div 
                key={activity.id}
                className="flex items-center gap-3 text-sm"
              >
                <div className={cn(
                  "p-1.5 rounded-full",
                  ACTIVITY_COLORS[activity.type]
                )}>
                  {ACTIVITY_ICONS[activity.type]}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="truncate">{activity.description}</p>
                </div>
                <span className="text-xs text-muted-foreground whitespace-nowrap">
                  {formatRelativeTime(activity.timestamp)}
                </span>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <Clock className="h-5 w-5 text-primary" />
          Recent Activity
          <Badge variant="secondary" className="ml-2">
            {activities.length}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {displayedActivities.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Clock className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p className="text-lg font-medium">No recent activity</p>
            <p className="text-sm">Activity will appear here as you work</p>
          </div>
        ) : (
          <div className="relative">
            {/* Timeline line */}
            <div className="absolute left-5 top-2 bottom-2 w-0.5 bg-border" />
            
            <div className="space-y-4">
              {displayedActivities.map((activity) => (
                <div 
                  key={activity.id}
                  className="relative flex items-start gap-4 pl-2"
                >
                  {/* Icon */}
                  <div className={cn(
                    "relative z-10 p-2 rounded-full border-2 border-background",
                    ACTIVITY_COLORS[activity.type]
                  )}>
                    {ACTIVITY_ICONS[activity.type]}
                  </div>
                  
                  {/* Content */}
                  <div className="flex-1 min-w-0 pt-0.5">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="text-sm">{activity.description}</p>
                        {activity.dealTitle && (
                          <p className="text-xs text-muted-foreground mt-0.5">
                            Deal: {activity.dealTitle}
                          </p>
                        )}
                      </div>
                      <span className="text-xs text-muted-foreground whitespace-nowrap">
                        {formatRelativeTime(activity.timestamp)}
                      </span>
                    </div>
                    {activity.user && (
                      <div className="flex items-center gap-1 mt-1">
                        <User className="h-3 w-3 text-muted-foreground" />
                        <span className="text-xs text-muted-foreground">
                          {activity.user.name}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// Generate demo activity data for testing
export function generateDemoActivities(): ActivityItem[] {
  const now = new Date();
  
  return [
    {
      id: "1",
      type: "create",
      description: "New deal created: 123 Main Street",
      timestamp: new Date(now.getTime() - 5 * 60000).toISOString(),
      user: { name: "John Doe" },
      dealTitle: "123 Main Street"
    },
    {
      id: "2",
      type: "status_change",
      description: "Deal moved from Lead to Analyzing",
      timestamp: new Date(now.getTime() - 30 * 60000).toISOString(),
      user: { name: "Jane Smith" },
      dealTitle: "456 Oak Avenue"
    },
    {
      id: "3",
      type: "comment",
      description: "Added comment: 'Great potential for flip'",
      timestamp: new Date(now.getTime() - 2 * 3600000).toISOString(),
      user: { name: "Mike Johnson" },
      dealTitle: "789 Pine Road"
    },
    {
      id: "4",
      type: "update",
      description: "Updated asking price to $350,000",
      timestamp: new Date(now.getTime() - 5 * 3600000).toISOString(),
      user: { name: "John Doe" },
      dealTitle: "123 Main Street"
    },
    {
      id: "5",
      type: "assign",
      description: "Assigned to Sarah Wilson for review",
      timestamp: new Date(now.getTime() - 24 * 3600000).toISOString(),
      user: { name: "Admin" },
      dealTitle: "321 Elm Street"
    },
    {
      id: "6",
      type: "tag",
      description: "Added tag: Hot Deal",
      timestamp: new Date(now.getTime() - 48 * 3600000).toISOString(),
      user: { name: "Jane Smith" },
      dealTitle: "456 Oak Avenue"
    },
  ];
}
