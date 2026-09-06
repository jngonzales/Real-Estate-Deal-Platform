'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Bell,
  Plus,
  Clock,
  Calendar,
  Trash2,
  Edit,
  CheckCircle,
  AlertCircle,
} from '@/components/ui/icons';
import { format, formatDistanceToNow, isPast, isToday } from 'date-fns';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

type ReminderPriority = 'low' | 'medium' | 'high';

interface Reminder {
  id: string;
  title: string;
  description?: string;
  due_date: string;
  deal_id?: string;
  deal_name?: string;
  priority: ReminderPriority;
  completed: boolean;
  created_at: string;
}

interface RemindersProps {
  reminders: Reminder[];
  onCreateReminder?: (reminder: Omit<Reminder, 'id' | 'created_at' | 'completed'>) => Promise<void>;
  onUpdateReminder?: (id: string, updates: Partial<Reminder>) => Promise<void>;
  onDeleteReminder?: (id: string) => Promise<void>;
  onToggleComplete?: (id: string, completed: boolean) => Promise<void>;
  deals?: { id: string; name: string }[];
  className?: string;
}

const PRIORITY_COLORS = {
  low: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200',
  medium: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
  high: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
};

export function Reminders({
  reminders,
  onCreateReminder,
  onUpdateReminder,
  onDeleteReminder,
  onToggleComplete,
  deals = [],
  className,
}: RemindersProps) {
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editingReminder, setEditingReminder] = useState<Reminder | null>(null);
  const [newReminder, setNewReminder] = useState({
    title: '',
    description: '',
    due_date: '',
    deal_id: '',
    priority: 'medium' as ReminderPriority,
  });
  const [saving, setSaving] = useState(false);
  const [showCompleted, setShowCompleted] = useState(false);

  // Sort reminders: overdue first, then by date
  const sortedReminders = [...reminders]
    .filter((r) => showCompleted || !r.completed)
    .sort((a, b) => {
      if (a.completed !== b.completed) return a.completed ? 1 : -1;
      const aOverdue = isPast(new Date(a.due_date));
      const bOverdue = isPast(new Date(b.due_date));
      if (aOverdue !== bOverdue) return aOverdue ? -1 : 1;
      return new Date(a.due_date).getTime() - new Date(b.due_date).getTime();
    });

  const overdueCount = reminders.filter(
    (r) => !r.completed && isPast(new Date(r.due_date))
  ).length;
  const todayCount = reminders.filter(
    (r) => !r.completed && isToday(new Date(r.due_date))
  ).length;

  const handleCreate = async () => {
    if (!newReminder.title.trim()) {
      toast.error('Please enter a title');
      return;
    }
    if (!newReminder.due_date) {
      toast.error('Please set a due date');
      return;
    }

    setSaving(true);
    try {
      const deal = deals.find((d) => d.id === newReminder.deal_id);
      await onCreateReminder?.({
        title: newReminder.title.trim(),
        description: newReminder.description.trim(),
        due_date: newReminder.due_date,
        deal_id: newReminder.deal_id || undefined,
        deal_name: deal?.name,
        priority: newReminder.priority,
      });
      toast.success('Reminder created');
      setCreateDialogOpen(false);
      setNewReminder({
        title: '',
        description: '',
        due_date: '',
        deal_id: '',
        priority: 'medium',
      });
    } catch {
      toast.error('Failed to create reminder');
    } finally {
      setSaving(false);
    }
  };

  const handleUpdate = async () => {
    if (!editingReminder) return;

    setSaving(true);
    try {
      await onUpdateReminder?.(editingReminder.id, {
        title: editingReminder.title,
        description: editingReminder.description,
        due_date: editingReminder.due_date,
        priority: editingReminder.priority,
      });
      toast.success('Reminder updated');
      setEditingReminder(null);
    } catch {
      toast.error('Failed to update reminder');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await onDeleteReminder?.(id);
      toast.success('Reminder deleted');
    } catch {
      toast.error('Failed to delete reminder');
    }
  };

  const handleToggle = async (reminder: Reminder) => {
    try {
      await onToggleComplete?.(reminder.id, !reminder.completed);
      toast.success(reminder.completed ? 'Marked as incomplete' : 'Marked as complete');
    } catch {
      toast.error('Failed to update reminder');
    }
  };

  const getStatusIcon = (reminder: Reminder) => {
    if (reminder.completed) {
      return <CheckCircle className="h-4 w-4 text-green-500" />;
    }
    if (isPast(new Date(reminder.due_date))) {
      return <AlertCircle className="h-4 w-4 text-red-500" />;
    }
    if (isToday(new Date(reminder.due_date))) {
      return <Clock className="h-4 w-4 text-yellow-500" />;
    }
    return <Calendar className="h-4 w-4 text-muted-foreground" />;
  };

  return (
    <Card className={cn('', className)}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              Reminders
            </CardTitle>
            <div className="flex gap-2 mt-1">
              {overdueCount > 0 && (
                <Badge variant="destructive" className="text-xs">
                  {overdueCount} overdue
                </Badge>
              )}
              {todayCount > 0 && (
                <Badge variant="secondary" className="text-xs">
                  {todayCount} due today
                </Badge>
              )}
            </div>
          </div>
          <Button size="sm" onClick={() => setCreateDialogOpen(true)}>
            <Plus className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-2 mb-3">
          <Checkbox
            id="show-completed"
            checked={showCompleted}
            onCheckedChange={(checked) => setShowCompleted(checked === true)}
          />
          <Label htmlFor="show-completed" className="text-sm cursor-pointer">
            Show completed
          </Label>
        </div>

        <ScrollArea className="h-[300px]">
          {sortedReminders.length === 0 ? (
            <div className="text-center py-8">
              <Bell className="h-10 w-10 mx-auto text-muted-foreground mb-2" />
              <p className="text-sm text-muted-foreground">No reminders</p>
            </div>
          ) : (
            <div className="space-y-2">
              {sortedReminders.map((reminder) => (
                <div
                  key={reminder.id}
                  className={cn(
                    'flex items-start gap-3 p-3 rounded-lg border transition-colors',
                    reminder.completed && 'opacity-60',
                    !reminder.completed && isPast(new Date(reminder.due_date)) && 'border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-900/20',
                    !reminder.completed && isToday(new Date(reminder.due_date)) && 'border-yellow-200 bg-yellow-50 dark:border-yellow-800 dark:bg-yellow-900/20'
                  )}
                >
                  <Checkbox
                    checked={reminder.completed}
                    onCheckedChange={() => handleToggle(reminder)}
                    className="mt-1"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      {getStatusIcon(reminder)}
                      <p
                        className={cn(
                          'font-medium truncate',
                          reminder.completed && 'line-through'
                        )}
                      >
                        {reminder.title}
                      </p>
                    </div>
                    {reminder.description && (
                      <p className="text-sm text-muted-foreground mt-1 line-clamp-1">
                        {reminder.description}
                      </p>
                    )}
                    <div className="flex items-center gap-2 mt-2">
                      <Badge
                        variant="outline"
                        className={cn('text-xs', PRIORITY_COLORS[reminder.priority])}
                      >
                        {reminder.priority}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {formatDistanceToNow(new Date(reminder.due_date), { addSuffix: true })}
                      </span>
                      {reminder.deal_name && (
                        <Badge variant="secondary" className="text-xs">
                          {reminder.deal_name}
                        </Badge>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => setEditingReminder(reminder)}
                    >
                      <Edit className="h-3 w-3" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => handleDelete(reminder.id)}
                    >
                      <Trash2 className="h-3 w-3 text-destructive" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>

        {/* Create Dialog */}
        <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create Reminder</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  value={newReminder.title}
                  onChange={(e) =>
                    setNewReminder({ ...newReminder, title: e.target.value })
                  }
                  placeholder="Call back about offer..."
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description (optional)</Label>
                <Input
                  id="description"
                  value={newReminder.description}
                  onChange={(e) =>
                    setNewReminder({ ...newReminder, description: e.target.value })
                  }
                  placeholder="Additional details..."
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="due_date">Due Date</Label>
                  <Input
                    id="due_date"
                    type="datetime-local"
                    value={newReminder.due_date}
                    onChange={(e) =>
                      setNewReminder({ ...newReminder, due_date: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="priority">Priority</Label>
                  <Select
                    value={newReminder.priority}
                    onValueChange={(value: ReminderPriority) =>
                      setNewReminder({ ...newReminder, priority: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              {deals.length > 0 && (
                <div className="space-y-2">
                  <Label htmlFor="deal">Link to Deal (optional)</Label>
                  <Select
                    value={newReminder.deal_id}
                    onValueChange={(value) =>
                      setNewReminder({ ...newReminder, deal_id: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a deal" />
                    </SelectTrigger>
                    <SelectContent>
                      {deals.map((deal) => (
                        <SelectItem key={deal.id} value={deal.id}>
                          {deal.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setCreateDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreate} disabled={saving}>
                {saving ? 'Creating...' : 'Create Reminder'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Edit Dialog */}
        <Dialog open={!!editingReminder} onOpenChange={() => setEditingReminder(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Reminder</DialogTitle>
            </DialogHeader>
            {editingReminder && (
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-title">Title</Label>
                  <Input
                    id="edit-title"
                    value={editingReminder.title}
                    onChange={(e) =>
                      setEditingReminder({ ...editingReminder, title: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-description">Description</Label>
                  <Input
                    id="edit-description"
                    value={editingReminder.description || ''}
                    onChange={(e) =>
                      setEditingReminder({ ...editingReminder, description: e.target.value })
                    }
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="edit-due_date">Due Date</Label>
                    <Input
                      id="edit-due_date"
                      type="datetime-local"
                      value={format(new Date(editingReminder.due_date), "yyyy-MM-dd'T'HH:mm")}
                      onChange={(e) =>
                        setEditingReminder({ ...editingReminder, due_date: e.target.value })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit-priority">Priority</Label>
                    <Select
                      value={editingReminder.priority}
                      onValueChange={(value: ReminderPriority) =>
                        setEditingReminder({ ...editingReminder, priority: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Low</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            )}
            <DialogFooter>
              <Button variant="outline" onClick={() => setEditingReminder(null)}>
                Cancel
              </Button>
              <Button onClick={handleUpdate} disabled={saving}>
                {saving ? 'Saving...' : 'Save Changes'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
}
