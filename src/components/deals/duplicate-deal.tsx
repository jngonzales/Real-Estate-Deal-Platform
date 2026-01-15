'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog';
import { Copy, Check } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface Deal {
  id: string;
  name: string;
  property_address?: string;
  asking_price?: number;
  arv?: number;
  repair_cost?: number;
  status?: string;
  notes?: string;
  tags?: string[];
  [key: string]: unknown;
}

interface DuplicateDealProps {
  deal: Deal;
  onDuplicate: (deal: Omit<Deal, 'id'>) => Promise<{ id: string }>;
  className?: string;
}

interface DuplicateOptions {
  includeNotes: boolean;
  includeTags: boolean;
  includeContacts: boolean;
  includeDocuments: boolean;
  newName: string;
}

export function DuplicateDeal({ deal, onDuplicate, className }: DuplicateDealProps) {
  const [open, setOpen] = useState(false);
  const [duplicating, setDuplicating] = useState(false);
  const [options, setOptions] = useState<DuplicateOptions>({
    includeNotes: true,
    includeTags: true,
    includeContacts: true,
    includeDocuments: false,
    newName: `${deal.name} (Copy)`,
  });

  const handleDuplicate = async () => {
    if (!options.newName.trim()) {
      toast.error('Please enter a name for the new deal');
      return;
    }

    setDuplicating(true);
    try {
      // Create the duplicated deal object
      const duplicatedDeal: Omit<Deal, 'id'> = {
        name: options.newName.trim(),
        property_address: deal.property_address,
        asking_price: deal.asking_price,
        arv: deal.arv,
        repair_cost: deal.repair_cost,
        status: 'new', // Always start as new
      };

      // Include optional fields based on options
      if (options.includeNotes && deal.notes) {
        duplicatedDeal.notes = deal.notes;
      }

      if (options.includeTags && deal.tags) {
        duplicatedDeal.tags = [...deal.tags];
      }

      const result = await onDuplicate(duplicatedDeal);
      
      toast.success(
        <div className="flex items-center gap-2">
          <Check className="h-4 w-4" />
          <span>Deal duplicated successfully</span>
        </div>
      );
      
      setOpen(false);
      
      // Reset for next use
      setOptions({
        ...options,
        newName: `${deal.name} (Copy)`,
      });

      return result;
    } catch {
      toast.error('Failed to duplicate deal');
    } finally {
      setDuplicating(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className={cn('', className)}>
          <Copy className="h-4 w-4 mr-2" />
          Duplicate
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Duplicate Deal</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6 py-4">
          {/* New Deal Name */}
          <div className="space-y-2">
            <Label htmlFor="new-name">New Deal Name</Label>
            <Input
              id="new-name"
              value={options.newName}
              onChange={(e) => setOptions({ ...options, newName: e.target.value })}
              placeholder="Enter name for duplicated deal"
            />
          </div>

          {/* What to Include */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">What to include:</Label>
            
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="include-notes"
                  checked={options.includeNotes}
                  onCheckedChange={(checked) =>
                    setOptions({ ...options, includeNotes: checked === true })
                  }
                />
                <Label htmlFor="include-notes" className="text-sm cursor-pointer">
                  Notes
                </Label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="include-tags"
                  checked={options.includeTags}
                  onCheckedChange={(checked) =>
                    setOptions({ ...options, includeTags: checked === true })
                  }
                />
                <Label htmlFor="include-tags" className="text-sm cursor-pointer">
                  Tags
                </Label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="include-contacts"
                  checked={options.includeContacts}
                  onCheckedChange={(checked) =>
                    setOptions({ ...options, includeContacts: checked === true })
                  }
                />
                <Label htmlFor="include-contacts" className="text-sm cursor-pointer">
                  Linked Contacts
                </Label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="include-documents"
                  checked={options.includeDocuments}
                  onCheckedChange={(checked) =>
                    setOptions({ ...options, includeDocuments: checked === true })
                  }
                />
                <Label htmlFor="include-documents" className="text-sm cursor-pointer">
                  Documents (references only)
                </Label>
              </div>
            </div>
          </div>

          {/* Summary of what will be copied */}
          <div className="p-3 bg-muted rounded-lg">
            <p className="text-sm font-medium mb-2">Will be copied:</p>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• Basic deal information (address, prices, ARV)</li>
              {options.includeNotes && deal.notes && <li>• Notes</li>}
              {options.includeTags && deal.tags?.length && (
                <li>• {deal.tags.length} tag(s)</li>
              )}
              {options.includeContacts && <li>• Contact links</li>}
              {options.includeDocuments && <li>• Document references</li>}
            </ul>
            <p className="text-xs text-muted-foreground mt-2">
              Status will be set to &quot;New&quot;
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleDuplicate} disabled={duplicating}>
            {duplicating ? (
              <>
                <Copy className="h-4 w-4 mr-2 animate-pulse" />
                Duplicating...
              </>
            ) : (
              <>
                <Copy className="h-4 w-4 mr-2" />
                Duplicate Deal
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// Quick duplicate button (single click, uses defaults)
interface QuickDuplicateProps {
  deal: Deal;
  onDuplicate: (deal: Omit<Deal, 'id'>) => Promise<{ id: string }>;
  className?: string;
}

export function QuickDuplicate({ deal, onDuplicate, className }: QuickDuplicateProps) {
  const [duplicating, setDuplicating] = useState(false);

  const handleQuickDuplicate = async () => {
    setDuplicating(true);
    try {
      const duplicatedDeal: Omit<Deal, 'id'> = {
        name: `${deal.name} (Copy)`,
        property_address: deal.property_address,
        asking_price: deal.asking_price,
        arv: deal.arv,
        repair_cost: deal.repair_cost,
        status: 'new',
        notes: deal.notes,
        tags: deal.tags ? [...deal.tags] : undefined,
      };

      await onDuplicate(duplicatedDeal);
      toast.success('Deal duplicated');
    } catch {
      toast.error('Failed to duplicate deal');
    } finally {
      setDuplicating(false);
    }
  };

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={handleQuickDuplicate}
      disabled={duplicating}
      className={cn('h-8 w-8', className)}
      title="Duplicate deal"
    >
      <Copy className={cn('h-4 w-4', duplicating && 'animate-pulse')} />
    </Button>
  );
}
