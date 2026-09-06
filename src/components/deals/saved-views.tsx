'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import {
  Bookmark,
  Plus,
  MoreVertical,
  Star,
  Edit,
  Trash2,
  Check,
  Filter,
  SortAsc,
  Columns,
} from '@/components/ui/icons';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface SavedViewFilters {
  status?: string[];
  minPrice?: number;
  maxPrice?: number;
  minScore?: number;
  tags?: string[];
  search?: string;
}

interface SavedViewSort {
  field: string;
  direction: 'asc' | 'desc';
}

interface SavedView {
  id: string;
  name: string;
  filters: SavedViewFilters;
  sort?: SavedViewSort;
  columns?: string[];
  isDefault?: boolean;
  created_at: string;
}

interface SavedViewsProps {
  views: SavedView[];
  activeViewId?: string;
  currentFilters: SavedViewFilters;
  currentSort?: SavedViewSort;
  currentColumns?: string[];
  onApplyView: (view: SavedView) => void;
  onSaveView: (view: Omit<SavedView, 'id' | 'created_at'>) => Promise<void>;
  onUpdateView: (id: string, updates: Partial<SavedView>) => Promise<void>;
  onDeleteView: (id: string) => Promise<void>;
  onSetDefault: (id: string) => Promise<void>;
  className?: string;
}

export function SavedViews({
  views,
  activeViewId,
  currentFilters,
  currentSort,
  currentColumns,
  onApplyView,
  onSaveView,
  onUpdateView,
  onDeleteView,
  onSetDefault,
  className,
}: SavedViewsProps) {
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [newViewName, setNewViewName] = useState('');
  const [editingView, setEditingView] = useState<SavedView | null>(null);
  const [saving, setSaving] = useState(false);

  const getFilterSummary = (filters: SavedViewFilters) => {
    const parts: string[] = [];

    if (filters.status?.length) {
      parts.push(`${filters.status.length} status(es)`);
    }
    if (filters.minPrice || filters.maxPrice) {
      parts.push('price range');
    }
    if (filters.minScore) {
      parts.push(`score ≥ ${filters.minScore}`);
    }
    if (filters.tags?.length) {
      parts.push(`${filters.tags.length} tag(s)`);
    }
    if (filters.search) {
      parts.push('search term');
    }

    return parts.length > 0 ? parts.join(', ') : 'No filters';
  };

  const handleSaveNewView = async () => {
    if (!newViewName.trim()) {
      toast.error('Please enter a view name');
      return;
    }

    setSaving(true);
    try {
      await onSaveView({
        name: newViewName.trim(),
        filters: currentFilters,
        sort: currentSort,
        columns: currentColumns,
      });
      toast.success(`View "${newViewName}" saved`);
      setCreateDialogOpen(false);
      setNewViewName('');
    } catch {
      toast.error('Failed to save view');
    } finally {
      setSaving(false);
    }
  };

  const handleUpdateView = async () => {
    if (!editingView) return;

    setSaving(true);
    try {
      await onUpdateView(editingView.id, {
        name: editingView.name,
      });
      toast.success('View updated');
      setEditDialogOpen(false);
      setEditingView(null);
    } catch {
      toast.error('Failed to update view');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteView = async (view: SavedView) => {
    try {
      await onDeleteView(view.id);
      toast.success(`View "${view.name}" deleted`);
    } catch {
      toast.error('Failed to delete view');
    }
  };

  const handleSetDefault = async (view: SavedView) => {
    try {
      await onSetDefault(view.id);
      toast.success(`"${view.name}" is now your default view`);
    } catch {
      toast.error('Failed to set default view');
    }
  };

  const handleUpdateCurrentView = async (view: SavedView) => {
    try {
      await onUpdateView(view.id, {
        filters: currentFilters,
        sort: currentSort,
        columns: currentColumns,
      });
      toast.success(`View "${view.name}" updated with current filters`);
    } catch {
      toast.error('Failed to update view');
    }
  };

  return (
    <Card className={cn('', className)}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2">
            <Bookmark className="h-4 w-4" />
            Saved Views
          </CardTitle>
          <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm" variant="ghost">
                <Plus className="h-4 w-4" />
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Save Current View</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="view-name">View Name</Label>
                  <Input
                    id="view-name"
                    value={newViewName}
                    onChange={(e) => setNewViewName(e.target.value)}
                    placeholder="e.g., High Score Deals"
                  />
                </div>
                <div className="p-3 bg-muted rounded-lg space-y-2">
                  <p className="text-sm font-medium">This view will save:</p>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-sm">
                      <Filter className="h-3 w-3 text-muted-foreground" />
                      <span className="text-muted-foreground">
                        Filters: {getFilterSummary(currentFilters)}
                      </span>
                    </div>
                    {currentSort && (
                      <div className="flex items-center gap-2 text-sm">
                        <SortAsc className="h-3 w-3 text-muted-foreground" />
                        <span className="text-muted-foreground">
                          Sort: {currentSort.field} ({currentSort.direction})
                        </span>
                      </div>
                    )}
                    {currentColumns && (
                      <div className="flex items-center gap-2 text-sm">
                        <Columns className="h-3 w-3 text-muted-foreground" />
                        <span className="text-muted-foreground">
                          {currentColumns.length} visible columns
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setCreateDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleSaveNewView} disabled={saving}>
                  {saving ? 'Saving...' : 'Save View'}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        {views.length === 0 ? (
          <div className="text-center py-6">
            <Bookmark className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
            <p className="text-sm text-muted-foreground">
              No saved views yet
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Apply filters and save them as a view
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {views.map((view) => (
              <div
                key={view.id}
                className={cn(
                  'flex items-center justify-between p-2 rounded-lg hover:bg-muted/50 transition-colors cursor-pointer group',
                  activeViewId === view.id && 'bg-muted'
                )}
                onClick={() => onApplyView(view)}
              >
                <div className="flex items-center gap-2 min-w-0">
                  {view.isDefault && (
                    <Star className="h-3 w-3 text-yellow-500 fill-yellow-500 shrink-0" />
                  )}
                  <div className="min-w-0">
                    <p className="text-sm font-medium truncate">{view.name}</p>
                    <p className="text-xs text-muted-foreground truncate">
                      {getFilterSummary(view.filters)}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  {activeViewId === view.id && (
                    <Badge variant="secondary" className="text-xs">
                      <Check className="h-3 w-3 mr-1" />
                      Active
                    </Badge>
                  )}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 opacity-0 group-hover:opacity-100"
                      >
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem
                        onClick={(e) => {
                          e.stopPropagation();
                          handleUpdateCurrentView(view);
                        }}
                      >
                        <Filter className="h-4 w-4 mr-2" />
                        Update with Current Filters
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={(e) => {
                          e.stopPropagation();
                          setEditingView(view);
                          setEditDialogOpen(true);
                        }}
                      >
                        <Edit className="h-4 w-4 mr-2" />
                        Rename
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={(e) => {
                          e.stopPropagation();
                          handleSetDefault(view);
                        }}
                      >
                        <Star className="h-4 w-4 mr-2" />
                        Set as Default
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteView(view);
                        }}
                        className="text-destructive focus:text-destructive"
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Edit Dialog */}
        <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Rename View</DialogTitle>
            </DialogHeader>
            <div className="py-4">
              <Label htmlFor="edit-view-name">View Name</Label>
              <Input
                id="edit-view-name"
                value={editingView?.name || ''}
                onChange={(e) =>
                  setEditingView(editingView ? { ...editingView, name: e.target.value } : null)
                }
                className="mt-2"
              />
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setEditDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleUpdateView} disabled={saving}>
                {saving ? 'Saving...' : 'Save'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
}
