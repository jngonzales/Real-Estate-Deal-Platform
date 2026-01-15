'use client';

import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
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
  Archive,
  Search,
  MoreVertical,
  RotateCcw,
  Trash2,
  Eye,
  Calendar,
  DollarSign,
} from 'lucide-react';
import { format, formatDistanceToNow } from 'date-fns';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface ArchivedDeal {
  id: string;
  name: string;
  property_address?: string;
  asking_price?: number;
  ai_score?: number;
  status: string;
  archived_at: string;
  archived_reason?: string;
  created_at: string;
}

interface DealArchiveProps {
  archivedDeals: ArchivedDeal[];
  onRestoreDeal?: (dealId: string) => Promise<void>;
  onDeletePermanently?: (dealId: string) => Promise<void>;
  onViewDeal?: (dealId: string) => void;
  className?: string;
}

export function DealArchive({
  archivedDeals,
  onRestoreDeal,
  onDeletePermanently,
  onViewDeal,
  className,
}: DealArchiveProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDeal, setSelectedDeal] = useState<ArchivedDeal | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [restoring, setRestoring] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);

  const filteredDeals = useMemo(() => {
    if (!searchQuery) return archivedDeals;
    const query = searchQuery.toLowerCase();
    return archivedDeals.filter(
      (deal) =>
        deal.name.toLowerCase().includes(query) ||
        deal.property_address?.toLowerCase().includes(query)
    );
  }, [archivedDeals, searchQuery]);

  const handleRestore = async (deal: ArchivedDeal) => {
    setRestoring(deal.id);
    try {
      await onRestoreDeal?.(deal.id);
      toast.success(`"${deal.name}" has been restored`);
    } catch {
      toast.error('Failed to restore deal');
    } finally {
      setRestoring(null);
    }
  };

  const handleDeletePermanently = async () => {
    if (!selectedDeal) return;
    setDeleting(selectedDeal.id);
    try {
      await onDeletePermanently?.(selectedDeal.id);
      toast.success(`"${selectedDeal.name}" has been permanently deleted`);
      setDeleteDialogOpen(false);
      setSelectedDeal(null);
    } catch {
      toast.error('Failed to delete deal');
    } finally {
      setDeleting(null);
    }
  };

  const formatCurrency = (amount?: number) => {
    if (!amount) return '-';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const getScoreColor = (score?: number) => {
    if (!score) return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200';
    if (score >= 80) return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
    if (score >= 60) return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
    return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
  };

  return (
    <Card className={cn('', className)}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Archive className="h-5 w-5" />
              Archived Deals
            </CardTitle>
            <CardDescription>
              {archivedDeals.length} archived deal{archivedDeals.length !== 1 ? 's' : ''}
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {/* Search */}
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search archived deals..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>

        {/* Deals Table */}
        {filteredDeals.length === 0 ? (
          <div className="text-center py-12">
            <Archive className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">
              {searchQuery ? 'No archived deals match your search' : 'No archived deals'}
            </p>
          </div>
        ) : (
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Deal</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Score</TableHead>
                  <TableHead>Archived</TableHead>
                  <TableHead className="w-20"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredDeals.map((deal) => (
                  <TableRow key={deal.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium">{deal.name}</p>
                        {deal.property_address && (
                          <p className="text-sm text-muted-foreground truncate max-w-[200px]">
                            {deal.property_address}
                          </p>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <DollarSign className="h-3 w-3 text-muted-foreground" />
                        {formatCurrency(deal.asking_price)}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={getScoreColor(deal.ai_score)} variant="outline">
                        {deal.ai_score ?? '-'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <Calendar className="h-3 w-3" />
                        <span title={format(new Date(deal.archived_at), 'PPP')}>
                          {formatDistanceToNow(new Date(deal.archived_at), { addSuffix: true })}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => onViewDeal?.(deal.id)}>
                            <Eye className="h-4 w-4 mr-2" />
                            View Details
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleRestore(deal)}
                            disabled={restoring === deal.id}
                          >
                            <RotateCcw className="h-4 w-4 mr-2" />
                            {restoring === deal.id ? 'Restoring...' : 'Restore'}
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => {
                              setSelectedDeal(deal);
                              setDeleteDialogOpen(true);
                            }}
                            className="text-destructive focus:text-destructive"
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete Permanently
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}

        {/* Permanent Delete Confirmation */}
        <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Permanently?</AlertDialogTitle>
              <AlertDialogDescription>
                This will permanently delete &quot;{selectedDeal?.name}&quot;. This action cannot be
                undone and all associated data will be lost.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDeletePermanently}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                disabled={deleting !== null}
              >
                {deleting ? 'Deleting...' : 'Delete Permanently'}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </CardContent>
    </Card>
  );
}
