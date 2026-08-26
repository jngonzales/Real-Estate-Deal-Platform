'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  History,
  Plus,
  Edit,
  DollarSign,
  Tag,
  User,
  FileText,
  MessageSquare,
  ArrowRight,
} from 'lucide-react';
import { format, formatDistanceToNow } from 'date-fns';
import { cn } from '@/lib/utils';

type ChangeType =
  | 'created'
  | 'status_changed'
  | 'price_changed'
  | 'details_updated'
  | 'tag_added'
  | 'tag_removed'
  | 'user_assigned'
  | 'user_removed'
  | 'document_added'
  | 'note_added'
  | 'comment_added';

interface HistoryEntry {
  id: string;
  type: ChangeType;
  field?: string;
  old_value?: string | number;
  new_value?: string | number;
  user_name?: string;
  user_email?: string;
  created_at: string;
}

interface DealHistoryProps {
  dealId: string;
  dealName: string;
  history: HistoryEntry[];
  className?: string;
}

const CHANGE_ICONS: Record<ChangeType, typeof History> = {
  created: Plus,
  status_changed: ArrowRight,
  price_changed: DollarSign,
  details_updated: Edit,
  tag_added: Tag,
  tag_removed: Tag,
  user_assigned: User,
  user_removed: User,
  document_added: FileText,
  note_added: MessageSquare,
  comment_added: MessageSquare,
};

const CHANGE_COLORS: Record<ChangeType, string> = {
  created: 'text-emerald-600 bg-emerald-100 dark:bg-emerald-900/30',
  status_changed: 'text-emerald-600 bg-emerald-100 dark:bg-emerald-900/30',
  price_changed: 'bg-muted text-muted-foreground dark:bg-muted',
  details_updated: 'bg-muted text-muted-foreground dark:bg-muted',
  tag_added: 'bg-muted text-muted-foreground dark:bg-muted',
  tag_removed: 'bg-muted text-muted-foreground dark:bg-muted',
  user_assigned: 'text-emerald-600 bg-emerald-100 dark:bg-emerald-900/30',
  user_removed: 'bg-muted text-muted-foreground dark:bg-muted',
  document_added: 'bg-muted text-muted-foreground dark:bg-muted',
  note_added: 'bg-muted text-muted-foreground dark:bg-muted',
  comment_added: 'bg-muted text-muted-foreground dark:bg-muted',
};

function getChangeDescription(entry: HistoryEntry): string {
  switch (entry.type) {
    case 'created':
      return 'Deal was created';
    case 'status_changed':
      return `Status changed from "${entry.old_value}" to "${entry.new_value}"`;
    case 'price_changed':
      return `Price changed from $${Number(entry.old_value).toLocaleString()} to $${Number(entry.new_value).toLocaleString()}`;
    case 'details_updated':
      return entry.field
        ? `${entry.field} was updated`
        : 'Deal details were updated';
    case 'tag_added':
      return `Tag "${entry.new_value}" was added`;
    case 'tag_removed':
      return `Tag "${entry.old_value}" was removed`;
    case 'user_assigned':
      return `${entry.new_value} was assigned to this deal`;
    case 'user_removed':
      return `${entry.old_value} was removed from this deal`;
    case 'document_added':
      return `Document "${entry.new_value}" was uploaded`;
    case 'note_added':
      return 'A note was added';
    case 'comment_added':
      return 'A comment was added';
    default:
      return 'Change recorded';
  }
}

function formatValue(value?: string | number, type?: ChangeType): React.ReactNode {
  if (value === undefined || value === null) return null;
  
  if (type === 'price_changed' && typeof value === 'number') {
    return `$${value.toLocaleString()}`;
  }
  
  return String(value);
}

export function DealHistory({ dealName, history, className }: DealHistoryProps) {
  // Group history by date
  const groupedHistory = history.reduce((groups, entry) => {
    const date = format(new Date(entry.created_at), 'yyyy-MM-dd');
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(entry);
    return groups;
  }, {} as Record<string, HistoryEntry[]>);

  const sortedDates = Object.keys(groupedHistory).sort((a, b) => b.localeCompare(a));

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
    return format(date, 'MMMM d, yyyy');
  };

  return (
    <Card className={cn('', className)}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <History className="h-5 w-5" />
          Deal History
        </CardTitle>
        <p className="text-sm text-muted-foreground">{dealName}</p>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[400px] pr-4">
          {history.length === 0 ? (
            <div className="text-center py-8">
              <History className="h-10 w-10 mx-auto text-muted-foreground mb-2" />
              <p className="text-sm text-muted-foreground">No history yet</p>
            </div>
          ) : (
            <div className="space-y-6">
              {sortedDates.map((date) => (
                <div key={date}>
                  <h3 className="text-sm font-semibold text-muted-foreground mb-3 sticky top-0 bg-background py-1">
                    {formatDateHeader(date)}
                  </h3>
                  <div className="relative pl-6 border-l-2 border-muted space-y-4">
                    {groupedHistory[date].map((entry) => {
                      const Icon = CHANGE_ICONS[entry.type];
                      const colorClass = CHANGE_COLORS[entry.type];

                      return (
                        <div key={entry.id} className="relative">
                          {/* Timeline dot */}
                          <div
                            className={cn(
                              'absolute -left-[25px] p-1 rounded-full',
                              colorClass
                            )}
                          >
                            <Icon className="h-3 w-3" />
                          </div>

                          {/* Content */}
                          <div className="pb-2">
                            <p className="text-sm">{getChangeDescription(entry)}</p>
                            
                            {/* Value change display */}
                            {entry.type === 'status_changed' && (
                              <div className="flex items-center gap-2 mt-2">
                                <Badge variant="outline" className="text-xs">
                                  {entry.old_value}
                                </Badge>
                                <ArrowRight className="h-3 w-3 text-muted-foreground" />
                                <Badge variant="secondary" className="text-xs">
                                  {entry.new_value}
                                </Badge>
                              </div>
                            )}

                            {entry.type === 'price_changed' && (
                              <div className="flex items-center gap-2 mt-2 text-sm">
                                <span className="text-muted-foreground line-through">
                                  {formatValue(entry.old_value, entry.type)}
                                </span>
                                <ArrowRight className="h-3 w-3 text-muted-foreground" />
                                <span className="font-medium text-green-600">
                                  {formatValue(entry.new_value, entry.type)}
                                </span>
                              </div>
                            )}

                            {/* Meta info */}
                            <div className="flex items-center gap-2 mt-1">
                              <span className="text-xs text-muted-foreground">
                                {format(new Date(entry.created_at), 'h:mm a')}
                              </span>
                              {entry.user_name && (
                                <>
                                  <span className="text-xs text-muted-foreground">•</span>
                                  <span className="text-xs text-muted-foreground">
                                    by {entry.user_name}
                                  </span>
                                </>
                              )}
                            </div>
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

// Compact version for sidebar/detail view
export function DealHistoryCompact({ history, className }: { history: HistoryEntry[]; className?: string }) {
  const recentHistory = history.slice(0, 5);

  return (
    <div className={cn('space-y-2', className)}>
      <h4 className="text-sm font-semibold flex items-center gap-2">
        <History className="h-4 w-4" />
        Recent Changes
      </h4>
      {recentHistory.length === 0 ? (
        <p className="text-xs text-muted-foreground">No changes recorded</p>
      ) : (
        <div className="space-y-2">
          {recentHistory.map((entry) => {
            const Icon = CHANGE_ICONS[entry.type];
            return (
              <div key={entry.id} className="flex items-start gap-2">
                <Icon className="h-3 w-3 mt-0.5 text-muted-foreground shrink-0" />
                <div className="min-w-0">
                  <p className="text-xs truncate">{getChangeDescription(entry)}</p>
                  <p className="text-xs text-muted-foreground">
                    {formatDistanceToNow(new Date(entry.created_at), { addSuffix: true })}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
