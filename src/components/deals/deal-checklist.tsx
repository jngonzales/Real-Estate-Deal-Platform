'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Progress } from '@/components/ui/progress';
import {
  Plus,
  Trash2,
  CheckSquare,
  ListTodo,
  GripVertical,
} from '@/components/ui/icons';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface ChecklistItem {
  id: string;
  text: string;
  completed: boolean;
  category?: string;
}

interface DealChecklistProps {
  dealId: string;
  items?: ChecklistItem[];
  onUpdate?: (items: ChecklistItem[]) => void;
  className?: string;
}

// Default checklist template for real estate deals
const DEFAULT_CHECKLIST: Omit<ChecklistItem, 'id'>[] = [
  // Due Diligence
  { text: 'Verify property ownership', completed: false, category: 'Due Diligence' },
  { text: 'Review title report', completed: false, category: 'Due Diligence' },
  { text: 'Check for liens/encumbrances', completed: false, category: 'Due Diligence' },
  { text: 'Verify property taxes', completed: false, category: 'Due Diligence' },
  { text: 'Review HOA documents (if applicable)', completed: false, category: 'Due Diligence' },
  // Property Inspection
  { text: 'Schedule property walkthrough', completed: false, category: 'Inspection' },
  { text: 'Get repair estimates', completed: false, category: 'Inspection' },
  { text: 'Check foundation/structure', completed: false, category: 'Inspection' },
  { text: 'Inspect roof condition', completed: false, category: 'Inspection' },
  { text: 'Check electrical/plumbing', completed: false, category: 'Inspection' },
  // Financial Analysis
  { text: 'Calculate ARV', completed: false, category: 'Financial' },
  { text: 'Determine MAO', completed: false, category: 'Financial' },
  { text: 'Verify comparable sales', completed: false, category: 'Financial' },
  { text: 'Get hard money quote (if needed)', completed: false, category: 'Financial' },
  { text: 'Calculate holding costs', completed: false, category: 'Financial' },
  // Acquisition
  { text: 'Submit offer', completed: false, category: 'Acquisition' },
  { text: 'Negotiate terms', completed: false, category: 'Acquisition' },
  { text: 'Sign purchase agreement', completed: false, category: 'Acquisition' },
  { text: 'Open escrow', completed: false, category: 'Acquisition' },
  { text: 'Schedule closing', completed: false, category: 'Acquisition' },
];

export function DealChecklist({
  dealId,
  items: initialItems,
  onUpdate,
  className,
}: DealChecklistProps) {
  const [items, setItems] = useState<ChecklistItem[]>(() => {
    if (initialItems && initialItems.length > 0) {
      return initialItems;
    }
    // Generate IDs for default items
    return DEFAULT_CHECKLIST.map((item, index) => ({
      ...item,
      id: `${dealId}-item-${index}`,
    }));
  });
  const [newItemText, setNewItemText] = useState('');
  const [filterCategory, setFilterCategory] = useState<string | null>(null);

  useEffect(() => {
    onUpdate?.(items);
  }, [items, onUpdate]);

  const categories = Array.from(new Set(items.map(item => item.category).filter(Boolean)));
  
  const filteredItems = filterCategory
    ? items.filter(item => item.category === filterCategory)
    : items;

  const completedCount = items.filter(item => item.completed).length;
  const progress = items.length > 0 ? (completedCount / items.length) * 100 : 0;

  const toggleItem = (id: string) => {
    setItems(prev =>
      prev.map(item =>
        item.id === id ? { ...item, completed: !item.completed } : item
      )
    );
  };

  const addItem = () => {
    if (!newItemText.trim()) {
      return;
    }
    
    const newItem: ChecklistItem = {
      id: `${dealId}-item-${Date.now()}`,
      text: newItemText.trim(),
      completed: false,
      category: filterCategory || undefined,
    };
    
    setItems(prev => [...prev, newItem]);
    setNewItemText('');
    toast.success('Item added');
  };

  const deleteItem = (id: string) => {
    setItems(prev => prev.filter(item => item.id !== id));
    toast.success('Item removed');
  };

  const resetChecklist = () => {
    setItems(
      DEFAULT_CHECKLIST.map((item, index) => ({
        ...item,
        id: `${dealId}-item-${index}`,
      }))
    );
    toast.success('Checklist reset');
  };

  const markAllComplete = () => {
    setItems(prev => prev.map(item => ({ ...item, completed: true })));
    toast.success('All items marked complete');
  };

  return (
    <Card className={className}>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <ListTodo className="h-4 w-4" />
            Deal Checklist
          </CardTitle>
          <div className="flex items-center gap-2">
            <Badge variant="secondary">
              {completedCount}/{items.length}
            </Badge>
            <Button variant="ghost" size="sm" onClick={resetChecklist}>
              Reset
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Progress Bar */}
        <div className="space-y-1">
          <Progress value={progress} className="h-2" />
          <p className="text-xs text-muted-foreground text-right">
            {progress.toFixed(0)}% complete
          </p>
        </div>

        {/* Category Filter */}
        {categories.length > 0 && (
          <div className="flex flex-wrap gap-1">
            <Badge
              variant={filterCategory === null ? 'default' : 'outline'}
              className="cursor-pointer"
              onClick={() => setFilterCategory(null)}
            >
              All
            </Badge>
            {categories.map(category => (
              <Badge
                key={category}
                variant={filterCategory === category ? 'default' : 'outline'}
                className="cursor-pointer"
                onClick={() => setFilterCategory(category || null)}
              >
                {category}
              </Badge>
            ))}
          </div>
        )}

        {/* Checklist Items */}
        <ScrollArea className="h-[300px]">
          <div className="space-y-2">
            {filteredItems.map(item => (
              <div
                key={item.id}
                className={cn(
                  'flex items-center gap-2 p-2 rounded-md hover:bg-muted group',
                  item.completed && 'bg-muted/50'
                )}
              >
                <GripVertical className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 cursor-grab" />
                <Checkbox
                  checked={item.completed}
                  onCheckedChange={() => toggleItem(item.id)}
                />
                <span
                  className={cn(
                    'flex-1 text-sm',
                    item.completed && 'line-through text-muted-foreground'
                  )}
                >
                  {item.text}
                </span>
                {item.category && (
                  <Badge variant="outline" className="text-xs">
                    {item.category}
                  </Badge>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  className="opacity-0 group-hover:opacity-100"
                  onClick={() => deleteItem(item.id)}
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
            ))}
          </div>
        </ScrollArea>

        {/* Add New Item */}
        <div className="flex gap-2">
          <Input
            placeholder="Add new item..."
            value={newItemText}
            onChange={e => setNewItemText(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && addItem()}
          />
          <Button onClick={addItem} size="sm">
            <Plus className="h-4 w-4" />
          </Button>
        </div>

        {/* Quick Actions */}
        <div className="flex gap-2 pt-2 border-t">
          <Button
            variant="outline"
            size="sm"
            className="flex-1"
            onClick={markAllComplete}
          >
            <CheckSquare className="h-4 w-4 mr-2" />
            Mark All Complete
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

// Compact checklist for quick view
export function CompactChecklist({
  items,
  maxItems = 5,
}: {
  items: ChecklistItem[];
  maxItems?: number;
}) {
  const completedCount = items.filter(i => i.completed).length;
  const incompleteItems = items.filter(i => !i.completed).slice(0, maxItems);
  
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-sm">
        <span className="font-medium">Checklist</span>
        <Badge variant="secondary">{completedCount}/{items.length}</Badge>
      </div>
      <Progress value={(completedCount / items.length) * 100} className="h-1" />
      <div className="space-y-1">
        {incompleteItems.map(item => (
          <div key={item.id} className="flex items-center gap-2 text-sm">
            <div className="w-3 h-3 rounded border border-muted-foreground" />
            <span className="truncate text-muted-foreground">{item.text}</span>
          </div>
        ))}
        {items.filter(i => !i.completed).length > maxItems && (
          <p className="text-xs text-muted-foreground">
            +{items.filter(i => !i.completed).length - maxItems} more items
          </p>
        )}
      </div>
    </div>
  );
}
