'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  ChevronDown,
  Trash2,
  Archive,
  Tag,
  FolderOpen,
  Download,
  CheckCircle,
  XCircle,
  Loader2,
  Eye,
  Fire,
  Hourglass,
  Phone,
  Star,
} from '@/components/ui/icons';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface BulkActionsProps {
  selectedIds: string[];
  totalItems: number;
  onSelectAll: () => void;
  onClearSelection: () => void;
  onDelete?: (ids: string[]) => Promise<void>;
  onArchive?: (ids: string[]) => Promise<void>;
  onStatusChange?: (ids: string[], status: string) => Promise<void>;
  onTagAdd?: (ids: string[], tag: string) => Promise<void>;
  onExport?: (ids: string[]) => Promise<void>;
  className?: string;
}

const STATUS_OPTIONS = [
  { value: 'new', label: 'New' },
  { value: 'lead', label: 'Lead' },
  { value: 'analyzing', label: 'Analyzing' },
  { value: 'negotiating', label: 'Negotiating' },
  { value: 'under_contract', label: 'Under Contract' },
  { value: 'closed', label: 'Closed' },
  { value: 'lost', label: 'Lost' },
  { value: 'on_hold', label: 'On Hold' },
];

export function BulkActions({
  selectedIds,
  totalItems,
  onSelectAll,
  onClearSelection,
  onDelete,
  onArchive,
  onStatusChange,
  onTagAdd,
  onExport,
  className,
}: BulkActionsProps) {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [statusValue, setStatusValue] = useState<string>('');
  const [tagValue, setTagValue] = useState<string>('');

  const hasSelection = selectedIds.length > 0;
  const isAllSelected = selectedIds.length === totalItems && totalItems > 0;

  const handleDelete = async () => {
    if (!onDelete) return;
    setIsProcessing(true);
    try {
      await onDelete(selectedIds);
      toast.success(`Deleted ${selectedIds.length} items`);
      onClearSelection();
    } catch {
      toast.error('Failed to delete items');
    } finally {
      setIsProcessing(false);
      setShowDeleteDialog(false);
    }
  };

  const handleArchive = async () => {
    if (!onArchive) return;
    setIsProcessing(true);
    try {
      await onArchive(selectedIds);
      toast.success(`Archived ${selectedIds.length} items`);
      onClearSelection();
    } catch {
      toast.error('Failed to archive items');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleStatusChange = async (status: string) => {
    if (!onStatusChange) return;
    setIsProcessing(true);
    try {
      await onStatusChange(selectedIds, status);
      toast.success(`Updated status for ${selectedIds.length} items`);
      onClearSelection();
    } catch {
      toast.error('Failed to update status');
    } finally {
      setIsProcessing(false);
      setStatusValue('');
    }
  };

  const handleTagAdd = async (tag: string) => {
    if (!onTagAdd) return;
    setIsProcessing(true);
    try {
      await onTagAdd(selectedIds, tag);
      toast.success(`Added tag to ${selectedIds.length} items`);
    } catch {
      toast.error('Failed to add tag');
    } finally {
      setIsProcessing(false);
      setTagValue('');
    }
  };

  const handleExport = async () => {
    if (!onExport) return;
    setIsProcessing(true);
    try {
      await onExport(selectedIds);
      toast.success(`Exported ${selectedIds.length} items`);
    } catch {
      toast.error('Failed to export items');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <>
      <div
        className={cn(
          'flex items-center gap-3 p-3 bg-muted rounded-lg transition-all',
          !hasSelection && 'opacity-50',
          className
        )}
      >
        {/* Selection checkbox */}
        <Checkbox
          checked={isAllSelected}
          onCheckedChange={() => (isAllSelected ? onClearSelection() : onSelectAll())}
          aria-label="Select all"
        />

        {/* Selection count */}
        <div className="flex items-center gap-2">
          <Badge variant={hasSelection ? 'default' : 'secondary'}>
            {selectedIds.length} selected
          </Badge>
          {hasSelection && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onClearSelection}
              className="h-6 text-xs"
            >
              Clear
            </Button>
          )}
        </div>

        {/* Divider */}
        <div className="h-4 w-px bg-border" />

        {/* Status Change */}
        {onStatusChange && (
          <Select
            value={statusValue}
            onValueChange={value => {
              setStatusValue(value);
              handleStatusChange(value);
            }}
            disabled={!hasSelection || isProcessing}
          >
            <SelectTrigger className="w-40 h-8">
              <SelectValue placeholder="Change status" />
            </SelectTrigger>
            <SelectContent>
              {STATUS_OPTIONS.map(status => (
                <SelectItem key={status.value} value={status.value}>
                  {status.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}

        {/* Add Tag */}
        {onTagAdd && (
          <Select
            value={tagValue}
            onValueChange={value => {
              setTagValue(value);
              handleTagAdd(value);
            }}
            disabled={!hasSelection || isProcessing}
          >
            <SelectTrigger className="w-32 h-8">
              <Tag className="h-3 w-3 mr-1" />
              <SelectValue placeholder="Add tag" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="hot"><Fire className="mr-1.5 inline h-3 w-3" />Hot</SelectItem>
              <SelectItem value="priority"><Star className="mr-1.5 inline h-3 w-3" />Priority</SelectItem>
              <SelectItem value="follow_up"><Phone className="mr-1.5 inline h-3 w-3" />Follow Up</SelectItem>
              <SelectItem value="pending"><Hourglass className="mr-1.5 inline h-3 w-3" />Pending</SelectItem>
              <SelectItem value="review"><Eye className="mr-1.5 inline h-3 w-3" />Review</SelectItem>
            </SelectContent>
          </Select>
        )}

        {/* More actions dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className="h-8"
              disabled={!hasSelection || isProcessing}
            >
              {isProcessing ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <>
                  More
                  <ChevronDown className="h-4 w-4 ml-1" />
                </>
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {onExport && (
              <DropdownMenuItem onClick={handleExport}>
                <Download className="h-4 w-4 mr-2" />
                Export Selected
              </DropdownMenuItem>
            )}
            {onArchive && (
              <DropdownMenuItem onClick={handleArchive}>
                <Archive className="h-4 w-4 mr-2" />
                Archive Selected
              </DropdownMenuItem>
            )}
            <DropdownMenuItem>
              <FolderOpen className="h-4 w-4 mr-2" />
              Move to Folder
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            {onStatusChange && (
              <>
                <DropdownMenuItem onClick={() => handleStatusChange('closed')}>
                  <CheckCircle className="h-4 w-4 mr-2 text-green-500" />
                  Mark as Closed
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleStatusChange('lost')}>
                  <XCircle className="h-4 w-4 mr-2 text-red-500" />
                  Mark as Lost
                </DropdownMenuItem>
              </>
            )}
            {onDelete && (
              <>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => setShowDeleteDialog(true)}
                  className="text-red-600"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete Selected
                </DropdownMenuItem>
              </>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete {selectedIds.length} items?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the
              selected deals and all associated data.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-red-600 hover:bg-red-700"
            >
              {isProcessing ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <Trash2 className="h-4 w-4 mr-2" />
              )}
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

// Hook for managing selection state
export function useBulkSelection<T extends { id: string }>(items: T[]) {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const toggleItem = (id: string) => {
    setSelectedIds(prev =>
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const selectAll = () => {
    setSelectedIds(items.map(item => item.id));
  };

  const clearSelection = () => {
    setSelectedIds([]);
  };

  const isSelected = (id: string) => selectedIds.includes(id);

  return {
    selectedIds,
    toggleItem,
    selectAll,
    clearSelection,
    isSelected,
    selectedItems: items.filter(item => selectedIds.includes(item.id)),
  };
}
