'use client';

import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  History,
  Search,
  Plus,
  Edit,
  Trash2,
  Archive,
  CheckCircle,
  XCircle,
  DollarSign,
  MessageSquare,
  UserPlus,
  FileText,
  Calculator,
  Mail,
  Filter,
} from 'lucide-react';
import { format, formatDistanceToNow } from 'date-fns';
import { cn } from '@/lib/utils';

type ActivityType =
  | 'deal_created'
  | 'deal_updated'
  | 'deal_deleted'
  | 'deal_archived'
  | 'deal_won'
  | 'deal_lost'
  | 'price_changed'
  | 'comment_added'
  | 'user_assigned'
  | 'document_uploaded'
  | 'calculation_run'
  | 'email_sent';

interface ActivityItem {
  id: string;
  type: ActivityType;
  deal_id?: string;
  deal_name?: string;
  user_name?: string;
  user_email?: string;
  description: string;
  metadata?: Record<string, unknown>;
  created_at: string;
}

interface ActivityLogProps {
  activities: ActivityItem[];
  onViewDeal?: (dealId: string) => void;
  className?: string;
}

const ACTIVITY_ICONS: Record<ActivityType, typeof Plus> = {
  deal_created: Plus,
  deal_updated: Edit,
  deal_deleted: Trash2,
  deal_archived: Archive,
  deal_won: CheckCircle,
  deal_lost: XCircle,
  price_changed: DollarSign,
  comment_added: MessageSquare,
  user_assigned: UserPlus,
  document_uploaded: FileText,
  calculation_run: Calculator,
  email_sent: Mail,
};

const ACTIVITY_COLORS: Record<ActivityType, string> = {
  deal_created: 'text-emerald-600 bg-emerald-100 dark:bg-emerald-900/30',
  deal_updated: 'bg-muted text-muted-foreground dark:bg-muted',
  deal_deleted: 'text-red-600 bg-red-100 dark:bg-red-900/30',
  deal_archived: 'bg-muted text-muted-foreground dark:bg-muted',
  deal_won: 'text-emerald-600 bg-emerald-100 dark:bg-emerald-900/30',
  deal_lost: 'text-red-600 bg-red-100 dark:bg-red-900/30',
  price_changed: 'bg-muted text-muted-foreground dark:bg-muted',
  comment_added: 'bg-muted text-muted-foreground dark:bg-muted',
  user_assigned: 'text-emerald-600 bg-emerald-100 dark:bg-emerald-900/30',
  document_uploaded: 'bg-muted text-muted-foreground dark:bg-muted',
  calculation_run: 'bg-muted text-muted-foreground dark:bg-muted',
  email_sent: 'bg-muted text-muted-foreground dark:bg-muted',
};

const ACTIVITY_LABELS: Record<ActivityType, string> = {
  deal_created: 'Created',
  deal_updated: 'Updated',
  deal_deleted: 'Deleted',
  deal_archived: 'Archived',
  deal_won: 'Won',
  deal_lost: 'Lost',
  price_changed: 'Price',
  comment_added: 'Comment',
  user_assigned: 'Assigned',
  document_uploaded: 'Document',
  calculation_run: 'Calculation',
  email_sent: 'Email',
};

export function ActivityLog({
  activities,
  onViewDeal,
  className,
}: ActivityLogProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');

  const filteredActivities = useMemo(() => {
    let result = activities;

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (activity) =>
          activity.description.toLowerCase().includes(query) ||
          activity.deal_name?.toLowerCase().includes(query) ||
          activity.user_name?.toLowerCase().includes(query)
      );
    }

    if (typeFilter !== 'all') {
      result = result.filter((activity) => activity.type === typeFilter);
    }

    return result;
  }, [activities, searchQuery, typeFilter]);

  // Group activities by date
  const groupedActivities = useMemo(() => {
    const groups: Record<string, ActivityItem[]> = {};
    
    filteredActivities.forEach((activity) => {
      const date = format(new Date(activity.created_at), 'yyyy-MM-dd');
      if (!groups[date]) {
        groups[date] = [];
      }
      groups[date].push(activity);
    });

    return Object.entries(groups).sort(([a], [b]) => b.localeCompare(a));
  }, [filteredActivities]);

  const formatDateHeader = (dateStr: string) => {
    const date = new Date(dateStr);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (format(date, 'yyyy-MM-dd') === format(today, 'yyyy-MM-dd')) {
      return 'Today';
    }
    if (format(date, 'yyyy-MM-dd') === format(yesterday, 'yyyy-MM-dd')) {
      return 'Yesterday';
    }
    return format(date, 'EEEE, MMMM d, yyyy');
  };

  return (
    <Card className={cn('', className)}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <History className="h-5 w-5" />
          Activity Log
        </CardTitle>
      </CardHeader>
      <CardContent>
        {/* Filters */}
        <div className="flex gap-3 mb-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search activities..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="w-[180px]">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Filter type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Activities</SelectItem>
              <SelectItem value="deal_created">Created</SelectItem>
              <SelectItem value="deal_updated">Updated</SelectItem>
              <SelectItem value="deal_won">Won</SelectItem>
              <SelectItem value="deal_lost">Lost</SelectItem>
              <SelectItem value="price_changed">Price Changes</SelectItem>
              <SelectItem value="comment_added">Comments</SelectItem>
              <SelectItem value="user_assigned">Assignments</SelectItem>
              <SelectItem value="document_uploaded">Documents</SelectItem>
              <SelectItem value="email_sent">Emails</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Activity List */}
        <ScrollArea className="h-[500px] pr-4">
          {groupedActivities.length === 0 ? (
            <div className="text-center py-12">
              <History className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">
                {searchQuery || typeFilter !== 'all'
                  ? 'No activities match your filters'
                  : 'No activity yet'}
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {groupedActivities.map(([date, dayActivities]) => (
                <div key={date}>
                  <h3 className="text-sm font-semibold text-muted-foreground mb-3 sticky top-0 bg-background py-1">
                    {formatDateHeader(date)}
                  </h3>
                  <div className="space-y-3">
                    {dayActivities.map((activity) => {
                      const Icon = ACTIVITY_ICONS[activity.type];
                      const colorClass = ACTIVITY_COLORS[activity.type];
                      const label = ACTIVITY_LABELS[activity.type];

                      return (
                        <div
                          key={activity.id}
                          className="flex items-start gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors"
                        >
                          <div className={cn('p-2 rounded-full shrink-0', colorClass)}>
                            <Icon className="h-4 w-4" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <Badge variant="outline" className="text-xs">
                                {label}
                              </Badge>
                              <span className="text-xs text-muted-foreground">
                                {formatDistanceToNow(new Date(activity.created_at), {
                                  addSuffix: true,
                                })}
                              </span>
                            </div>
                            <p className="text-sm">{activity.description}</p>
                            {activity.deal_name && (
                              <Button
                                variant="link"
                                size="sm"
                                className="h-auto p-0 text-xs"
                                onClick={() => activity.deal_id && onViewDeal?.(activity.deal_id)}
                              >
                                View: {activity.deal_name}
                              </Button>
                            )}
                            {activity.user_name && (
                              <p className="text-xs text-muted-foreground mt-1">
                                by {activity.user_name}
                              </p>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
