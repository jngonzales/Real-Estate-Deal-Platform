'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  FileText,
  Plus,
  Edit,
  Trash2,
  Copy,
  Home,
  Building2,
  Warehouse,
  TreeDeciduous,
} from '@/components/ui/icons';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface DealTemplate {
  id: string;
  name: string;
  description?: string;
  propertyType: string;
  defaultValues: {
    status?: string;
    askingPrice?: number;
    repairCost?: number;
    holdingPeriod?: number;
    profitMargin?: number;
    closingCosts?: number;
    notes?: string;
  };
  checklist?: string[];
  createdAt: string;
  isBuiltIn?: boolean;
}

interface DealTemplatesProps {
  templates: DealTemplate[];
  onAddTemplate?: (template: Omit<DealTemplate, 'id' | 'createdAt'>) => void;
  onUpdateTemplate?: (id: string, updates: Partial<DealTemplate>) => void;
  onDeleteTemplate?: (id: string) => void;
  onUseTemplate?: (template: DealTemplate) => void;
  className?: string;
}

const PROPERTY_TYPES = [
  { value: 'single_family', label: 'Single Family', icon: Home },
  { value: 'multi_family', label: 'Multi Family', icon: Building2 },
  { value: 'commercial', label: 'Commercial', icon: Warehouse },
  { value: 'land', label: 'Land', icon: TreeDeciduous },
];

// Built-in templates
const BUILT_IN_TEMPLATES: DealTemplate[] = [
  {
    id: 'built-in-flip',
    name: 'Fix & Flip',
    description: 'Standard fix and flip residential property',
    propertyType: 'single_family',
    defaultValues: {
      status: 'new',
      repairCost: 30000,
      holdingPeriod: 6,
      profitMargin: 15,
      closingCosts: 3,
    },
    checklist: [
      'Property inspection scheduled',
      'Contractor estimates received',
      'Title search completed',
      'ARV analysis done',
      'Financing secured',
    ],
    createdAt: new Date().toISOString(),
    isBuiltIn: true,
  },
  {
    id: 'built-in-wholesale',
    name: 'Wholesale Deal',
    description: 'Quick assignment for wholesaling',
    propertyType: 'single_family',
    defaultValues: {
      status: 'lead',
      holdingPeriod: 1,
      profitMargin: 10,
      closingCosts: 2,
    },
    checklist: [
      'Seller motivated',
      'Property under contract',
      'Buyer list contacted',
      'Assignment fee negotiated',
    ],
    createdAt: new Date().toISOString(),
    isBuiltIn: true,
  },
  {
    id: 'built-in-rental',
    name: 'Buy & Hold Rental',
    description: 'Long-term rental investment property',
    propertyType: 'single_family',
    defaultValues: {
      status: 'analyzing',
      repairCost: 15000,
      holdingPeriod: 60,
      profitMargin: 8,
      closingCosts: 4,
    },
    checklist: [
      'Cash flow analysis completed',
      'Tenant screening criteria set',
      'Property management reviewed',
      'Insurance quotes received',
      'Reserve fund calculated',
    ],
    createdAt: new Date().toISOString(),
    isBuiltIn: true,
  },
  {
    id: 'built-in-commercial',
    name: 'Commercial Property',
    description: 'Commercial real estate investment',
    propertyType: 'commercial',
    defaultValues: {
      status: 'analyzing',
      holdingPeriod: 24,
      profitMargin: 12,
      closingCosts: 5,
    },
    checklist: [
      'Tenant leases reviewed',
      'CAP rate calculated',
      'Environmental assessment',
      'Zoning verification',
      'Commercial financing arranged',
    ],
    createdAt: new Date().toISOString(),
    isBuiltIn: true,
  },
];

export function DealTemplates({
  templates,
  onAddTemplate,
  onUpdateTemplate,
  onDeleteTemplate,
  onUseTemplate,
  className,
}: DealTemplatesProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [newTemplate, setNewTemplate] = useState<Omit<DealTemplate, 'id' | 'createdAt'>>({
    name: '',
    description: '',
    propertyType: 'single_family',
    defaultValues: {},
    checklist: [],
  });

  const allTemplates = [...BUILT_IN_TEMPLATES, ...templates];

  const handleAddTemplate = () => {
    if (!newTemplate.name.trim()) {
      toast.error('Please enter a template name');
      return;
    }

    onAddTemplate?.(newTemplate);
    toast.success('Template created');
    setIsOpen(false);
    setNewTemplate({
      name: '',
      description: '',
      propertyType: 'single_family',
      defaultValues: {},
      checklist: [],
    });
  };

  const handleDelete = (id: string) => {
    onDeleteTemplate?.(id);
    toast.success('Template deleted');
  };

  const handleUseTemplate = (template: DealTemplate) => {
    onUseTemplate?.(template);
    toast.success(`Applied "${template.name}" template`);
  };

  const getPropertyTypeConfig = (type: string) => {
    return PROPERTY_TYPES.find(pt => pt.value === type) || PROPERTY_TYPES[0];
  };

  return (
    <Card className={className}>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Deal Templates
          </CardTitle>
          <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
              <Button variant="ghost" size="sm">
                <Plus className="h-4 w-4" />
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-lg">
              <DialogHeader>
                <DialogTitle>Create Template</DialogTitle>
                <DialogDescription>
                  Create a reusable template for quickly adding similar deals.
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Template Name *</Label>
                  <Input
                    id="name"
                    value={newTemplate.name}
                    onChange={e => setNewTemplate(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="e.g., Standard Flip"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={newTemplate.description}
                    onChange={e => setNewTemplate(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Brief description of when to use this template"
                    rows={2}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Property Type</Label>
                  <Select
                    value={newTemplate.propertyType}
                    onValueChange={value => setNewTemplate(prev => ({ ...prev, propertyType: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {PROPERTY_TYPES.map(type => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Default Values</Label>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label className="text-xs text-muted-foreground">Repair Cost</Label>
                      <Input
                        type="number"
                        placeholder="$0"
                        value={newTemplate.defaultValues.repairCost || ''}
                        onChange={e => setNewTemplate(prev => ({
                          ...prev,
                          defaultValues: {
                            ...prev.defaultValues,
                            repairCost: parseInt(e.target.value) || undefined,
                          },
                        }))}
                      />
                    </div>
                    <div>
                      <Label className="text-xs text-muted-foreground">Holding Period (months)</Label>
                      <Input
                        type="number"
                        placeholder="0"
                        value={newTemplate.defaultValues.holdingPeriod || ''}
                        onChange={e => setNewTemplate(prev => ({
                          ...prev,
                          defaultValues: {
                            ...prev.defaultValues,
                            holdingPeriod: parseInt(e.target.value) || undefined,
                          },
                        }))}
                      />
                    </div>
                    <div>
                      <Label className="text-xs text-muted-foreground">Profit Margin %</Label>
                      <Input
                        type="number"
                        placeholder="0%"
                        value={newTemplate.defaultValues.profitMargin || ''}
                        onChange={e => setNewTemplate(prev => ({
                          ...prev,
                          defaultValues: {
                            ...prev.defaultValues,
                            profitMargin: parseInt(e.target.value) || undefined,
                          },
                        }))}
                      />
                    </div>
                    <div>
                      <Label className="text-xs text-muted-foreground">Closing Costs %</Label>
                      <Input
                        type="number"
                        placeholder="0%"
                        value={newTemplate.defaultValues.closingCosts || ''}
                        onChange={e => setNewTemplate(prev => ({
                          ...prev,
                          defaultValues: {
                            ...prev.defaultValues,
                            closingCosts: parseInt(e.target.value) || undefined,
                          },
                        }))}
                      />
                    </div>
                  </div>
                </div>

                <Button onClick={handleAddTemplate} className="w-full">
                  Create Template
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        {allTemplates.length === 0 ? (
          <div className="text-center py-8">
            <FileText className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
            <p className="text-sm text-muted-foreground">No templates yet</p>
          </div>
        ) : (
          <div className="space-y-3">
            {allTemplates.map(template => {
              const typeConfig = getPropertyTypeConfig(template.propertyType);
              const TypeIcon = typeConfig.icon;
              
              return (
                <div
                  key={template.id}
                  className="flex items-start gap-3 p-3 rounded-md border hover:bg-muted group"
                >
                  <div className="p-2 bg-primary/10 rounded-md">
                    <TypeIcon className="h-4 w-4 text-primary" />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-medium">{template.name}</p>
                      {template.isBuiltIn && (
                        <Badge variant="secondary" className="text-xs">Built-in</Badge>
                      )}
                    </div>
                    {template.description && (
                      <p className="text-xs text-muted-foreground mt-1">
                        {template.description}
                      </p>
                    )}
                    <div className="flex flex-wrap gap-1 mt-2">
                      <Badge variant="outline" className="text-xs">
                        {typeConfig.label}
                      </Badge>
                      {template.defaultValues.profitMargin && (
                        <Badge variant="outline" className="text-xs">
                          {template.defaultValues.profitMargin}% margin
                        </Badge>
                      )}
                      {template.checklist && template.checklist.length > 0 && (
                        <Badge variant="outline" className="text-xs">
                          {template.checklist.length} checklist items
                        </Badge>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button
                      variant="default"
                      size="sm"
                      onClick={() => handleUseTemplate(template)}
                    >
                      <Copy className="h-3 w-3 mr-1" />
                      Use
                    </Button>
                    {!template.isBuiltIn && (
                      <>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onUpdateTemplate?.(template.id, {})}
                        >
                          <Edit className="h-3 w-3" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(template.id)}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// Template selector for deal creation forms
export function TemplateSelector({
  onSelect,
}: {
  onSelect: (template: DealTemplate) => void;
}) {
  return (
    <div className="space-y-2">
      <Label>Start from template</Label>
      <div className="grid grid-cols-2 gap-2">
        {BUILT_IN_TEMPLATES.map(template => {
          const typeConfig = PROPERTY_TYPES.find(pt => pt.value === template.propertyType);
          const TypeIcon = typeConfig?.icon || Home;
          
          return (
            <Button
              key={template.id}
              variant="outline"
              className={cn('justify-start h-auto py-3 px-4')}
              onClick={() => onSelect(template)}
            >
              <TypeIcon className="h-4 w-4 mr-2 shrink-0" />
              <div className="text-left">
                <p className="text-sm font-medium">{template.name}</p>
                <p className="text-xs text-muted-foreground">{template.description}</p>
              </div>
            </Button>
          );
        })}
      </div>
    </div>
  );
}
