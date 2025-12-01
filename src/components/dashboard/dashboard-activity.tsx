"use client";

import { useEffect, useState, useMemo, useRef } from "react";
import { createClient } from "@/utils/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ActivityFeed, Activity } from "@/components/ui/activity-feed";
import { useRealtimeActivity } from "@/lib/hooks/use-realtime";
import { Activity as ActivityIcon, ArrowRight } from "lucide-react";
import Link from "next/link";

export function DashboardActivity() {
  const [fetchedActivities, setFetchedActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const hasFetchedRef = useRef(false);
  const supabase = createClient();

  // Subscribe to real-time activity updates
  const { activities: realtimeActivities } = useRealtimeActivity(10);

  // Merge activities using useMemo
  const activities = useMemo(() => {
    // Map realtime activities to Activity type
    const mapped: Activity[] = realtimeActivities.map(item => ({
      id: item.id,
      type: item.type as Activity["type"],
      description: item.description,
      user: { name: "User" },
      timestamp: new Date(item.created_at),
      deal: item.deal_id ? { id: item.deal_id, address: "" } : undefined,
      metadata: item.metadata as Record<string, string>,
    }));
    
    const combined = [...mapped, ...fetchedActivities];
    const unique = combined.filter((item, index, self) => 
      index === self.findIndex((t) => t.id === item.id)
    );
    return unique.slice(0, 10);
  }, [realtimeActivities, fetchedActivities]);

  // Fetch initial activities
  useEffect(() => {
    if (hasFetchedRef.current) return;
    hasFetchedRef.current = true;

    async function fetchActivities() {
      const { data } = await supabase
        .from("deal_activities")
        .select(`
          id,
          deal_id,
          activity_type,
          description,
          metadata,
          created_at,
          user:profiles(full_name, email)
        `)
        .order("created_at", { ascending: false })
        .limit(10);

      if (data) {
        const formattedActivities: Activity[] = data.map((item) => ({
          id: item.id,
          type: item.activity_type as Activity["type"],
          description: item.description,
          user: {
            name: (item.user as { full_name?: string; email?: string })?.full_name || 
                  (item.user as { full_name?: string; email?: string })?.email || 
                  "Unknown",
          },
          timestamp: new Date(item.created_at),
          deal: item.deal_id ? { id: item.deal_id, address: "" } : undefined,
          metadata: item.metadata as Record<string, string>,
        }));
        setFetchedActivities(formattedActivities);
      }
      setLoading(false);
    }

    fetchActivities();
  }, [supabase]);

  return (
    <Card className="border-border bg-card">
      <CardHeader className="flex flex-row items-center justify-between">
        <div className="flex items-center gap-2">
          <ActivityIcon className="h-5 w-5 text-muted-foreground" />
          <CardTitle className="text-foreground">Recent Activity</CardTitle>
        </div>
        <Link
          href="/dashboard/notifications"
          className="text-sm font-medium text-muted-foreground hover:text-foreground inline-flex items-center"
        >
          View all
          <ArrowRight className="ml-1 h-4 w-4" />
        </Link>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-start gap-3 animate-pulse">
                <div className="h-8 w-8 rounded-full bg-muted" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 w-3/4 rounded bg-muted" />
                  <div className="h-3 w-1/4 rounded bg-muted" />
                </div>
              </div>
            ))}
          </div>
        ) : activities.length > 0 ? (
          <ActivityFeed activities={activities} maxItems={5} />
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            <ActivityIcon className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No recent activity</p>
            <p className="text-sm mt-1">Activity will appear here as deals are updated</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
