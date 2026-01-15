'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Download, FileSpreadsheet, FileText, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface Deal {
  id: string;
  name: string;
  property_address?: string;
  property_type?: string;
  status: string;
  asking_price?: number;
  arv?: number;
  repair_cost?: number;
  mao?: number;
  ai_score?: number;
  created_at: string;
  updated_at?: string;
  notes?: string;
  [key: string]: string | number | boolean | undefined | null;
}

interface DataExportProps {
  deals: Deal[];
  filename?: string;
}

const EXPORT_FIELDS = [
  { key: 'name', label: 'Deal Name', default: true },
  { key: 'property_address', label: 'Property Address', default: true },
  { key: 'property_type', label: 'Property Type', default: true },
  { key: 'status', label: 'Status', default: true },
  { key: 'asking_price', label: 'Asking Price', default: true },
  { key: 'arv', label: 'ARV', default: true },
  { key: 'repair_cost', label: 'Repair Cost', default: true },
  { key: 'mao', label: 'MAO', default: true },
  { key: 'ai_score', label: 'AI Score', default: true },
  { key: 'created_at', label: 'Created Date', default: true },
  { key: 'updated_at', label: 'Updated Date', default: false },
  { key: 'notes', label: 'Notes', default: false },
];

export function DataExport({ deals, filename = 'deals-export' }: DataExportProps) {
  const [open, setOpen] = useState(false);
  const [selectedFields, setSelectedFields] = useState<string[]>(
    EXPORT_FIELDS.filter(f => f.default).map(f => f.key)
  );
  const [isExporting, setIsExporting] = useState(false);

  const toggleField = (key: string) => {
    setSelectedFields(prev =>
      prev.includes(key)
        ? prev.filter(f => f !== key)
        : [...prev, key]
    );
  };

  const selectAll = () => {
    setSelectedFields(EXPORT_FIELDS.map(f => f.key));
  };

  const deselectAll = () => {
    setSelectedFields([]);
  };

  const formatValue = (value: string | number | boolean | undefined | null): string => {
    if (value === null || value === undefined) return '';
    if (typeof value === 'boolean') return value ? 'Yes' : 'No';
    if (typeof value === 'number') return value.toString();
    // Handle dates
    if (typeof value === 'string' && value.match(/^\d{4}-\d{2}-\d{2}/)) {
      return new Date(value).toLocaleDateString();
    }
    // Escape quotes and handle commas for CSV
    return value;
  };

  const exportToCSV = async () => {
    if (selectedFields.length === 0) {
      toast.error('Please select at least one field to export');
      return;
    }

    setIsExporting(true);
    try {
      // Build headers
      const headers = selectedFields.map(key => {
        const field = EXPORT_FIELDS.find(f => f.key === key);
        return `"${field?.label || key}"`;
      });

      // Build rows
      const rows = deals.map(deal => {
        return selectedFields.map(key => {
          const value = deal[key];
          const formatted = formatValue(value);
          // Escape quotes and wrap in quotes
          return `"${formatted.toString().replace(/"/g, '""')}"`;
        }).join(',');
      });

      // Combine into CSV
      const csv = [headers.join(','), ...rows].join('\n');

      // Create and download file
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `${filename}-${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast.success(`Exported ${deals.length} deals to CSV`);
      setOpen(false);
    } catch {
      toast.error('Failed to export data');
    } finally {
      setIsExporting(false);
    }
  };

  const exportToJSON = async () => {
    if (selectedFields.length === 0) {
      toast.error('Please select at least one field to export');
      return;
    }

    setIsExporting(true);
    try {
      // Filter deals to only include selected fields
      const filteredDeals = deals.map(deal => {
        const filtered: Record<string, string | number | boolean | undefined | null> = {};
        selectedFields.forEach(key => {
          filtered[key] = deal[key];
        });
        return filtered;
      });

      const json = JSON.stringify(filteredDeals, null, 2);

      // Create and download file
      const blob = new Blob([json], { type: 'application/json' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `${filename}-${new Date().toISOString().split('T')[0]}.json`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast.success(`Exported ${deals.length} deals to JSON`);
      setOpen(false);
    } catch {
      toast.error('Failed to export data');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Download className="h-4 w-4 mr-2" />
          Export
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Export Deals</DialogTitle>
          <DialogDescription>
            Select the fields you want to export and choose a format.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Field Selection */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <Label className="text-sm font-medium">Fields to Export</Label>
              <div className="flex gap-2">
                <Button variant="ghost" size="sm" onClick={selectAll}>
                  Select All
                </Button>
                <Button variant="ghost" size="sm" onClick={deselectAll}>
                  Clear
                </Button>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2 max-h-60 overflow-y-auto border rounded-md p-3">
              {EXPORT_FIELDS.map(field => (
                <div key={field.key} className="flex items-center space-x-2">
                  <Checkbox
                    id={field.key}
                    checked={selectedFields.includes(field.key)}
                    onCheckedChange={() => toggleField(field.key)}
                  />
                  <Label
                    htmlFor={field.key}
                    className="text-sm cursor-pointer"
                  >
                    {field.label}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          {/* Export Summary */}
          <div className="bg-muted rounded-md p-3">
            <p className="text-sm text-muted-foreground">
              <strong>{deals.length}</strong> deals with{' '}
              <strong>{selectedFields.length}</strong> fields selected
            </p>
          </div>

          {/* Export Buttons */}
          <div className="flex gap-2">
            <Button
              className="flex-1"
              onClick={exportToCSV}
              disabled={isExporting || selectedFields.length === 0}
            >
              {isExporting ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <FileSpreadsheet className="h-4 w-4 mr-2" />
              )}
              Export CSV
            </Button>
            <Button
              variant="outline"
              className="flex-1"
              onClick={exportToJSON}
              disabled={isExporting || selectedFields.length === 0}
            >
              {isExporting ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <FileText className="h-4 w-4 mr-2" />
              )}
              Export JSON
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// Quick export button for single format
export function QuickExportButton({ deals, format = 'csv' }: { deals: Deal[]; format?: 'csv' | 'json' }) {
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = async () => {
    setIsExporting(true);
    try {
      const fields = EXPORT_FIELDS.filter(f => f.default).map(f => f.key);
      const filename = `deals-export-${new Date().toISOString().split('T')[0]}`;

      if (format === 'csv') {
        const headers = fields.map(key => {
          const field = EXPORT_FIELDS.find(f => f.key === key);
          return `"${field?.label || key}"`;
        });

        const rows = deals.map(deal => {
          return fields.map(key => {
            const value = deal[key];
            const formatted = value === null || value === undefined ? '' : String(value);
            return `"${formatted.replace(/"/g, '""')}"`;
          }).join(',');
        });

        const csv = [headers.join(','), ...rows].join('\n');
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `${filename}.csv`;
        link.click();
      } else {
        const filteredDeals = deals.map(deal => {
          const filtered: Record<string, string | number | boolean | undefined | null> = {};
          fields.forEach(key => {
            filtered[key] = deal[key];
          });
          return filtered;
        });

        const json = JSON.stringify(filteredDeals, null, 2);
        const blob = new Blob([json], { type: 'application/json' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `${filename}.json`;
        link.click();
      }

      toast.success(`Exported ${deals.length} deals`);
    } catch {
      toast.error('Export failed');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <Button variant="ghost" size="sm" onClick={handleExport} disabled={isExporting}>
      {isExporting ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <Download className="h-4 w-4" />
      )}
    </Button>
  );
}
