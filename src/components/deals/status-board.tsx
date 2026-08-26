'use client';

import { useState, useMemo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  GripVertical,
  MoreVertical,
  Plus,
  Search,
  Eye,
  Edit,
  Trash2,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface Deal {
  id: string;
  name: string;
  property_address?: string;
  asking_price?: number;
  ai_score?: number;
  status: string;
  created_at: string;
  updated_at?: string;
}

interface StatusBoardProps {
  deals: Deal[];
  onStatusChange?: (dealId: string, newStatus: string) => Promise<void>;
  onViewDeal?: (dealId: string) => void;
  onEditDeal?: (dealId: string) => void;
  onDeleteDeal?: (dealId: string) => void;
  onAddDeal?: (status: string) => void;
  className?: string;
}

interface StatusColumn {
  id: string;
  label: string;
  color: string;
  bgColor: string;
  borderColor: string;
}

const STATUS_COLUMNS: StatusColumn[] = [
  { id: 'new', label: 'New', color: 'text-muted-foreground', bgColor: 'bg-muted', borderColor: 'border-border' },
  { id: 'lead', label: 'Lead', color: 'text-muted-foreground', bgColor: 'bg-muted', borderColor: 'border-border' },
  { id: 'analyzing', label: 'Analyzing', color: 'text-muted-foreground', bgColor: 'bg-muted', borderColor: 'border-border' },
  { id: 'negotiating', label: 'Negotiating', color: 'text-muted-foreground', bgColor: 'bg-muted', borderColor: 'border-border' },
  { id: 'under_contract', label: 'Under Contract', color: 'text-amber-600', bgColor: 'bg-amber-50', borderColor: 'border-amber-200' },
  { id: 'closed', label: 'Closed', color: 'text-emerald-600', bgColor: 'bg-emerald-50', borderColor: 'border-emerald-200' },
  { id: 'lost', label: 'Lost', color: 'text-red-600', bgColor: 'bg-red-50', borderColor: 'border-red-200' },
];

export function StatusBoard({
  deals,
  onStatusChange,
  onViewDeal,
  onEditDeal,
  onDeleteDeal,
  onAddDeal,
  className,
}: StatusBoardProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const visibleColumns = 4; // Number of columns visible at once
  const [startColumn, setStartColumn] = useState<number>(0);

  const filteredDeals = useMemo(() => {
    if (!searchQuery) return deals;
    return deals.filter(deal =>
      deal.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      deal.property_address?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [deals, searchQuery]);

  const dealsByStatus = useMemo(() => {
    const grouped: Record<string, Deal[]> = {};
    STATUS_COLUMNS.forEach(col => {
      grouped[col.id] = [];
    });
    filteredDeals.forEach(deal => {
      const status = deal.status.toLowerCase().replace(/\s+/g, '_');
      if (grouped[status]) {
        grouped[status].push(deal);
      } else {
        // Put unknown statuses in 'new'
        grouped['new'].push(deal);
      }
    });
    return grouped;
  }, [filteredDeals]);

  const handleMoveCard = async (dealId: string, direction: 'left' | 'right') => {
    const deal = deals.find(d => d.id === dealId);
    if (!deal) return;

    const currentStatus = deal.status.toLowerCase().replace(/\s+/g, '_');
    const currentIndex = STATUS_COLUMNS.findIndex(col => col.id === currentStatus);
    
    if (currentIndex === -1) return;
    
    const newIndex = direction === 'left' ? currentIndex - 1 : currentIndex + 1;
    if (newIndex < 0 || newIndex >= STATUS_COLUMNS.length) return;

    const newStatus = STATUS_COLUMNS[newIndex].id;
    
    try {
      await onStatusChange?.(dealId, newStatus);
      toast.success(`Moved to ${STATUS_COLUMNS[newIndex].label}`);
    } catch {
      toast.error('Failed to update status');
    }
  };

  const formatPrice = (price?: number): string => {
    if (!price) return 'N/A';
    if (price >= 1000000) return `$${(price / 1000000).toFixed(1)}M`;
    if (price >= 1000) return `$${(price / 1000).toFixed(0)}K`;
    return `$${price.toLocaleString()}`;
  };

  const getScoreColor = (score?: number): string => {
    if (!score) return 'text-gray-500';
    if (score >= 70) return 'text-green-600';
    if (score >= 50) return 'text-yellow-600';
    return 'text-red-600';
  };

  const visibleStatusColumns = STATUS_COLUMNS.slice(startColumn, startColumn + visibleColumns);
  const canScrollLeft = startColumn > 0;
  const canScrollRight = startColumn + visibleColumns < STATUS_COLUMNS.length;

  return (
    <div className={cn('space-y-4', className)}>
      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search deals..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="pl-8"
          />
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setStartColumn(prev => Math.max(0, prev - 1))}
            disabled={!canScrollLeft}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="text-sm text-muted-foreground">
            {startColumn + 1}-{Math.min(startColumn + visibleColumns, STATUS_COLUMNS.length)} of {STATUS_COLUMNS.length}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setStartColumn(prev => Math.min(STATUS_COLUMNS.length - visibleColumns, prev + 1))}
            disabled={!canScrollRight}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Kanban Board */}
      <div className="grid gap-4" style={{ gridTemplateColumns: `repeat(${visibleColumns}, 1fr)` }}>
        {visibleStatusColumns.map(column => (
          <div
            key={column.id}
            className={cn(
              'flex flex-col rounded-lg border-2',
              column.borderColor,
              column.bgColor
            )}
          >
            {/* Column Header */}
            <div className={cn('p-3 border-b', column.borderColor)}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <h3 className={cn('font-medium', column.color)}>
                    {column.label}
                  </h3>
                  <Badge variant="secondary" className="text-xs">
                    {dealsByStatus[column.id]?.length || 0}
                  </Badge>
                </div>
                {onAddDeal && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 w-6 p-0"
                    onClick={() => onAddDeal(column.id)}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>

            {/* Cards */}
            <div className="flex-1 p-2 space-y-2 min-h-[200px] max-h-[500px] overflow-y-auto">
              {dealsByStatus[column.id]?.map(deal => (
                <Card
                  key={deal.id}
                  className="cursor-pointer hover:shadow-md transition-shadow group"
                >
                  <CardContent className="p-3">
                    <div className="flex items-start gap-2">
                      <GripVertical className="h-4 w-4 text-muted-foreground mt-0.5 opacity-0 group-hover:opacity-100" />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <h4 className="font-medium text-sm truncate">{deal.name}</h4>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100"
                              >
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              {onViewDeal && (
                                <DropdownMenuItem onClick={() => onViewDeal(deal.id)}>
                                  <Eye className="h-4 w-4 mr-2" />
                                  View
                                </DropdownMenuItem>
                              )}
                              {onEditDeal && (
                                <DropdownMenuItem onClick={() => onEditDeal(deal.id)}>
                                  <Edit className="h-4 w-4 mr-2" />
                                  Edit
                                </DropdownMenuItem>
                              )}
                              {onDeleteDeal && (
                                <DropdownMenuItem
                                  onClick={() => onDeleteDeal(deal.id)}
                                  className="text-red-600"
                                >
                                  <Trash2 className="h-4 w-4 mr-2" />
                                  Delete
                                </DropdownMenuItem>
                              )}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                        
                        {deal.property_address && (
                          <p className="text-xs text-muted-foreground truncate mt-1">
                            {deal.property_address}
                          </p>
                        )}
                        
                        <div className="flex items-center justify-between mt-2">
                          <span className="text-sm font-medium">
                            {formatPrice(deal.asking_price)}
                          </span>
                          {deal.ai_score && (
                            <Badge
                              variant="outline"
                              className={cn('text-xs', getScoreColor(deal.ai_score))}
                            >
                              {deal.ai_score}
                            </Badge>
                          )}
                        </div>

                        {/* Quick move buttons */}
                        <div className="flex items-center gap-1 mt-2 opacity-0 group-hover:opacity-100">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 px-2 text-xs"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleMoveCard(deal.id, 'left');
                            }}
                            disabled={STATUS_COLUMNS.findIndex(c => c.id === column.id) === 0}
                          >
                            <ChevronLeft className="h-3 w-3" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 px-2 text-xs"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleMoveCard(deal.id, 'right');
                            }}
                            disabled={STATUS_COLUMNS.findIndex(c => c.id === column.id) === STATUS_COLUMNS.length - 1}
                          >
                            <ChevronRight className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
              
              {dealsByStatus[column.id]?.length === 0 && (
                <div className="flex items-center justify-center h-24 text-sm text-muted-foreground">
                  No deals
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-2 justify-center">
        {STATUS_COLUMNS.map(column => (
          <Badge
            key={column.id}
            variant="outline"
            className={cn('text-xs', column.color, column.bgColor, column.borderColor)}
          >
            {column.label}: {dealsByStatus[column.id]?.length || 0}
          </Badge>
        ))}
      </div>
    </div>
  );
}

// Compact status pills for quick view
export function StatusPills({ deals }: { deals: Deal[] }) {
  const counts = useMemo(() => {
    const grouped: Record<string, number> = {};
    deals.forEach(deal => {
      const status = deal.status.toLowerCase().replace(/\s+/g, '_');
      grouped[status] = (grouped[status] || 0) + 1;
    });
    return grouped;
  }, [deals]);

  return (
    <div className="flex flex-wrap gap-2">
      {STATUS_COLUMNS.filter(col => counts[col.id]).map(column => (
        <Badge
          key={column.id}
          variant="outline"
          className={cn('text-xs', column.color, column.bgColor)}
        >
          {column.label}: {counts[column.id]}
        </Badge>
      ))}
    </div>
  );
}
