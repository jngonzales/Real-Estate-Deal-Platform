'use client';

import { useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Upload,
  FileSpreadsheet,
  AlertCircle,
  CheckCircle,
  X,
  ArrowRight,
  Download,
} from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface ImportDealsProps {
  onImport: (deals: ParsedDeal[]) => Promise<void>;
  className?: string;
}

interface ParsedDeal {
  name: string;
  property_address?: string;
  asking_price?: number;
  arv?: number;
  repair_cost?: number;
  status?: string;
  notes?: string;
  [key: string]: string | number | undefined;
}

interface ColumnMapping {
  csvColumn: string;
  dealField: string;
}

const DEAL_FIELDS = [
  { value: 'skip', label: 'Skip this column' },
  { value: 'name', label: 'Deal Name (required)' },
  { value: 'property_address', label: 'Property Address' },
  { value: 'asking_price', label: 'Asking Price' },
  { value: 'arv', label: 'After Repair Value (ARV)' },
  { value: 'repair_cost', label: 'Repair Cost' },
  { value: 'status', label: 'Status' },
  { value: 'notes', label: 'Notes' },
  { value: 'city', label: 'City' },
  { value: 'state', label: 'State' },
  { value: 'zip_code', label: 'ZIP Code' },
  { value: 'sqft', label: 'Square Footage' },
  { value: 'bedrooms', label: 'Bedrooms' },
  { value: 'bathrooms', label: 'Bathrooms' },
  { value: 'year_built', label: 'Year Built' },
  { value: 'property_type', label: 'Property Type' },
];

type ImportStep = 'upload' | 'mapping' | 'preview' | 'importing' | 'complete';

export function ImportDeals({ onImport, className }: ImportDealsProps) {
  const [step, setStep] = useState<ImportStep>('upload');
  const [file, setFile] = useState<File | null>(null);
  const [csvHeaders, setCsvHeaders] = useState<string[]>([]);
  const [csvData, setCsvData] = useState<string[][]>([]);
  const [mappings, setMappings] = useState<ColumnMapping[]>([]);
  const [parsedDeals, setParsedDeals] = useState<ParsedDeal[]>([]);
  const [importProgress, setImportProgress] = useState(0);
  const [errors, setErrors] = useState<string[]>([]);
  const [successCount, setSuccessCount] = useState(0);

  const parseCSV = (text: string) => {
    const lines = text.split(/\r?\n/).filter((line) => line.trim());
    if (lines.length < 2) {
      throw new Error('CSV must have at least a header row and one data row');
    }

    // Simple CSV parsing (handles basic cases)
    const parseRow = (row: string) => {
      const result: string[] = [];
      let current = '';
      let inQuotes = false;

      for (let i = 0; i < row.length; i++) {
        const char = row[i];
        if (char === '"') {
          inQuotes = !inQuotes;
        } else if (char === ',' && !inQuotes) {
          result.push(current.trim());
          current = '';
        } else {
          current += char;
        }
      }
      result.push(current.trim());
      return result;
    };

    const headers = parseRow(lines[0]);
    const data = lines.slice(1).map(parseRow);

    return { headers, data };
  };

  const handleFileUpload = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const selectedFile = e.target.files?.[0];
      if (!selectedFile) return;

      if (!selectedFile.name.endsWith('.csv')) {
        toast.error('Please upload a CSV file');
        return;
      }

      setFile(selectedFile);

      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const text = event.target?.result as string;
          const { headers, data } = parseCSV(text);

          setCsvHeaders(headers);
          setCsvData(data);

          // Auto-map columns based on header names
          const autoMappings = headers.map((header) => {
            const lowerHeader = header.toLowerCase().replace(/[_\s-]/g, '');
            let matchedField = 'skip';

            // Try to auto-match
            if (lowerHeader.includes('name') || lowerHeader.includes('title')) {
              matchedField = 'name';
            } else if (lowerHeader.includes('address')) {
              matchedField = 'property_address';
            } else if (lowerHeader.includes('price') || lowerHeader.includes('asking')) {
              matchedField = 'asking_price';
            } else if (lowerHeader.includes('arv') || lowerHeader.includes('afterrepair')) {
              matchedField = 'arv';
            } else if (lowerHeader.includes('repair') || lowerHeader.includes('rehab')) {
              matchedField = 'repair_cost';
            } else if (lowerHeader.includes('status')) {
              matchedField = 'status';
            } else if (lowerHeader.includes('note') || lowerHeader.includes('comment')) {
              matchedField = 'notes';
            } else if (lowerHeader.includes('city')) {
              matchedField = 'city';
            } else if (lowerHeader.includes('state')) {
              matchedField = 'state';
            } else if (lowerHeader.includes('zip')) {
              matchedField = 'zip_code';
            }

            return { csvColumn: header, dealField: matchedField };
          });

          setMappings(autoMappings);
          setStep('mapping');
          toast.success(`Loaded ${data.length} rows from CSV`);
        } catch (err) {
          toast.error(err instanceof Error ? err.message : 'Failed to parse CSV');
        }
      };

      reader.readAsText(selectedFile);
    },
    []
  );

  const handleMappingChange = (csvColumn: string, newField: string) => {
    setMappings((prev) =>
      prev.map((m) => (m.csvColumn === csvColumn ? { ...m, dealField: newField } : m))
    );
  };

  const handlePreview = () => {
    // Check if name field is mapped
    const hasNameMapping = mappings.some((m) => m.dealField === 'name');
    if (!hasNameMapping) {
      toast.error('You must map a column to "Deal Name"');
      return;
    }

    // Parse deals from CSV data using mappings
    const deals: ParsedDeal[] = csvData.map((row) => {
      const deal: ParsedDeal = { name: '' };

      mappings.forEach((mapping, index) => {
        if (mapping.dealField !== 'skip' && row[index]) {
          const value = row[index];

          // Convert numeric fields
          if (['asking_price', 'arv', 'repair_cost', 'sqft', 'bedrooms', 'bathrooms', 'year_built'].includes(mapping.dealField)) {
            const numValue = parseFloat(value.replace(/[^0-9.-]/g, ''));
            if (!isNaN(numValue)) {
              deal[mapping.dealField] = numValue;
            }
          } else {
            deal[mapping.dealField] = value;
          }
        }
      });

      return deal;
    });

    // Filter out deals without names
    const validDeals = deals.filter((d) => d.name && d.name.trim());
    const invalidCount = deals.length - validDeals.length;

    if (invalidCount > 0) {
      setErrors([`${invalidCount} row(s) skipped due to missing deal name`]);
    }

    setParsedDeals(validDeals);
    setStep('preview');
  };

  const handleImport = async () => {
    setStep('importing');
    setImportProgress(0);
    setSuccessCount(0);

    try {
      // Simulate progress for batched import
      const batchSize = 10;
      const batches = Math.ceil(parsedDeals.length / batchSize);

      for (let i = 0; i < batches; i++) {
        setImportProgress(Math.round(((i + 1) / batches) * 100));
        // Simulate network delay
        await new Promise((r) => setTimeout(r, 200));
      }

      await onImport(parsedDeals);
      setSuccessCount(parsedDeals.length);
      setStep('complete');
      toast.success(`Successfully imported ${parsedDeals.length} deals`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Import failed');
      setStep('preview');
    }
  };

  const handleReset = () => {
    setStep('upload');
    setFile(null);
    setCsvHeaders([]);
    setCsvData([]);
    setMappings([]);
    setParsedDeals([]);
    setImportProgress(0);
    setErrors([]);
    setSuccessCount(0);
  };

  const downloadTemplate = () => {
    const template = 'Deal Name,Property Address,Asking Price,ARV,Repair Cost,Status,Notes\n';
    const blob = new Blob([template], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'deal-import-template.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <Card className={cn('', className)}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Upload className="h-5 w-5" />
          Import Deals
        </CardTitle>
        <CardDescription>
          Import deals from a CSV file
        </CardDescription>
      </CardHeader>
      <CardContent>
        {/* Step Indicators */}
        <div className="flex items-center gap-2 mb-6">
          {(['upload', 'mapping', 'preview', 'complete'] as const).map((s, index) => (
            <div key={s} className="flex items-center">
              <div
                className={cn(
                  'w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium',
                  step === s || (step === 'importing' && s === 'preview')
                    ? 'bg-primary text-primary-foreground'
                    : ['complete'].includes(step) ||
                      (['mapping', 'preview', 'importing'].includes(step) && s === 'upload') ||
                      (['preview', 'importing'].includes(step) && s === 'mapping')
                    ? 'bg-green-500 text-white'
                    : 'bg-muted text-muted-foreground'
                )}
              >
                {index + 1}
              </div>
              {index < 3 && (
                <ArrowRight className="h-4 w-4 mx-2 text-muted-foreground" />
              )}
            </div>
          ))}
        </div>

        {/* Upload Step */}
        {step === 'upload' && (
          <div className="space-y-4">
            <div
              className="border-2 border-dashed rounded-lg p-8 text-center hover:border-primary/50 transition-colors cursor-pointer"
              onClick={() => document.getElementById('csv-upload')?.click()}
            >
              <FileSpreadsheet className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-lg font-medium mb-2">Drop your CSV file here</p>
              <p className="text-sm text-muted-foreground mb-4">
                or click to browse
              </p>
              <Input
                id="csv-upload"
                type="file"
                accept=".csv"
                className="hidden"
                onChange={handleFileUpload}
              />
            </div>
            <div className="flex justify-center">
              <Button variant="outline" size="sm" onClick={downloadTemplate}>
                <Download className="h-4 w-4 mr-2" />
                Download Template
              </Button>
            </div>
          </div>
        )}

        {/* Mapping Step */}
        {step === 'mapping' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="font-medium">{file?.name}</p>
                <p className="text-sm text-muted-foreground">
                  {csvData.length} rows, {csvHeaders.length} columns
                </p>
              </div>
              <Button variant="ghost" size="sm" onClick={handleReset}>
                <X className="h-4 w-4 mr-2" />
                Start Over
              </Button>
            </div>

            <ScrollArea className="h-[300px]">
              <div className="space-y-3">
                {mappings.map((mapping) => (
                  <div
                    key={mapping.csvColumn}
                    className="flex items-center gap-4 p-3 rounded-lg border"
                  >
                    <div className="flex-1">
                      <Label className="text-sm font-medium">{mapping.csvColumn}</Label>
                      <p className="text-xs text-muted-foreground">
                        Sample: {csvData[0]?.[csvHeaders.indexOf(mapping.csvColumn)] || '-'}
                      </p>
                    </div>
                    <ArrowRight className="h-4 w-4 text-muted-foreground" />
                    <Select
                      value={mapping.dealField}
                      onValueChange={(value) => handleMappingChange(mapping.csvColumn, value)}
                    >
                      <SelectTrigger className="w-[200px]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {DEAL_FIELDS.map((field) => (
                          <SelectItem key={field.value} value={field.value}>
                            {field.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                ))}
              </div>
            </ScrollArea>

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={handleReset}>
                Cancel
              </Button>
              <Button onClick={handlePreview}>
                Preview Import
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </div>
          </div>
        )}

        {/* Preview Step */}
        {step === 'preview' && (
          <div className="space-y-4">
            {errors.length > 0 && (
              <div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                <div className="flex items-center gap-2 text-yellow-600 dark:text-yellow-400">
                  <AlertCircle className="h-4 w-4" />
                  <span className="font-medium">Warnings</span>
                </div>
                <ul className="text-sm mt-2 space-y-1">
                  {errors.map((error, i) => (
                    <li key={i}>{error}</li>
                  ))}
                </ul>
              </div>
            )}

            <div className="flex items-center justify-between">
              <Badge variant="secondary">{parsedDeals.length} deals ready to import</Badge>
              <Button variant="ghost" size="sm" onClick={() => setStep('mapping')}>
                Back to Mapping
              </Button>
            </div>

            <ScrollArea className="h-[300px]">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Address</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead>ARV</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {parsedDeals.slice(0, 50).map((deal, i) => (
                    <TableRow key={i}>
                      <TableCell className="font-medium">{deal.name}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {deal.property_address || '-'}
                      </TableCell>
                      <TableCell>
                        {deal.asking_price
                          ? `$${deal.asking_price.toLocaleString()}`
                          : '-'}
                      </TableCell>
                      <TableCell>
                        {deal.arv ? `$${deal.arv.toLocaleString()}` : '-'}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              {parsedDeals.length > 50 && (
                <p className="text-sm text-muted-foreground text-center mt-2">
                  Showing first 50 of {parsedDeals.length} deals
                </p>
              )}
            </ScrollArea>

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={handleReset}>
                Cancel
              </Button>
              <Button onClick={handleImport}>
                Import {parsedDeals.length} Deals
              </Button>
            </div>
          </div>
        )}

        {/* Importing Step */}
        {step === 'importing' && (
          <div className="text-center py-8">
            <div className="mb-4">
              <Progress value={importProgress} className="w-full" />
            </div>
            <p className="font-medium">Importing deals...</p>
            <p className="text-sm text-muted-foreground">
              {importProgress}% complete
            </p>
          </div>
        )}

        {/* Complete Step */}
        {step === 'complete' && (
          <div className="text-center py-8">
            <CheckCircle className="h-16 w-16 mx-auto text-green-500 mb-4" />
            <h3 className="text-xl font-semibold mb-2">Import Complete!</h3>
            <p className="text-muted-foreground mb-6">
              Successfully imported {successCount} deals
            </p>
            <Button onClick={handleReset}>Import More Deals</Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
