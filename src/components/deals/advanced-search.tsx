"use client";

import { useState, useCallback, useMemo } from "react";
import { 
  Search, 
  Filter, 
  X, 
  ChevronDown, 
  ChevronUp,
  SlidersHorizontal,
  RotateCcw
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Collapsible,
  CollapsibleContent,
} from "@/components/ui/collapsible";
import { Slider } from "@/components/ui/slider";
import { cn } from "@/lib/utils";

export interface DealFilters {
  search: string;
  status: string[];
  propertyType: string[];
  priceRange: [number, number];
  arvRange: [number, number];
  aiScoreRange: [number, number];
  dateRange: {
    from: Date | null;
    to: Date | null;
  };
  hasAssignedUser: boolean | null;
  sortBy: string;
  sortOrder: "asc" | "desc";
}

interface AdvancedSearchProps {
  onFiltersChange: (filters: DealFilters) => void;
  initialFilters?: Partial<DealFilters>;
  dealStats?: {
    minPrice: number;
    maxPrice: number;
    minArv: number;
    maxArv: number;
  };
}

const DEFAULT_FILTERS: DealFilters = {
  search: "",
  status: [],
  propertyType: [],
  priceRange: [0, 10000000],
  arvRange: [0, 15000000],
  aiScoreRange: [0, 100],
  dateRange: { from: null, to: null },
  hasAssignedUser: null,
  sortBy: "created_at",
  sortOrder: "desc"
};

const STATUS_OPTIONS = [
  { value: "lead", label: "Lead", color: "bg-gray-500" },
  { value: "qualified", label: "Qualified", color: "bg-primary" },
  { value: "analyzing", label: "Analyzing", color: "bg-gray-500" },
  { value: "under_contract", label: "Under Contract", color: "bg-amber-500" },
  { value: "due_diligence", label: "Due Diligence", color: "bg-gray-500" },
  { value: "closed", label: "Closed", color: "bg-emerald-500" },
  { value: "dead", label: "Dead", color: "bg-red-500" }
];

const PROPERTY_TYPE_OPTIONS = [
  { value: "single_family", label: "Single Family" },
  { value: "multi_family", label: "Multi Family" },
  { value: "condo", label: "Condo/Townhouse" },
  { value: "commercial", label: "Commercial" },
  { value: "land", label: "Land" },
  { value: "industrial", label: "Industrial" },
  { value: "mixed_use", label: "Mixed Use" }
];

const SORT_OPTIONS = [
  { value: "created_at", label: "Date Created" },
  { value: "updated_at", label: "Last Updated" },
  { value: "asking_price", label: "Asking Price" },
  { value: "estimated_arv", label: "ARV" },
  { value: "ai_score", label: "AI Score" },
  { value: "title", label: "Title" }
];

export function AdvancedSearch({ 
  onFiltersChange, 
  initialFilters,
  dealStats 
}: AdvancedSearchProps) {
  const [filters, setFilters] = useState<DealFilters>({
    ...DEFAULT_FILTERS,
    ...initialFilters
  });
  const [isExpanded, setIsExpanded] = useState(false);

  // Calculate active filters count
  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (filters.search) count++;
    if (filters.status.length > 0) count++;
    if (filters.propertyType.length > 0) count++;
    if (filters.priceRange[0] > 0 || filters.priceRange[1] < 10000000) count++;
    if (filters.arvRange[0] > 0 || filters.arvRange[1] < 15000000) count++;
    if (filters.aiScoreRange[0] > 0 || filters.aiScoreRange[1] < 100) count++;
    if (filters.dateRange.from || filters.dateRange.to) count++;
    if (filters.hasAssignedUser !== null) count++;
    return count;
  }, [filters]);

  // Debounced filter change
  const updateFilters = useCallback((newFilters: Partial<DealFilters>) => {
    const updated = { ...filters, ...newFilters };
    setFilters(updated);
    onFiltersChange(updated);
  }, [filters, onFiltersChange]);

  const resetFilters = () => {
    setFilters(DEFAULT_FILTERS);
    onFiltersChange(DEFAULT_FILTERS);
  };

  const toggleStatus = (status: string) => {
    const newStatuses = filters.status.includes(status)
      ? filters.status.filter(s => s !== status)
      : [...filters.status, status];
    updateFilters({ status: newStatuses });
  };

  const togglePropertyType = (type: string) => {
    const newTypes = filters.propertyType.includes(type)
      ? filters.propertyType.filter(t => t !== type)
      : [...filters.propertyType, type];
    updateFilters({ propertyType: newTypes });
  };

  const formatPrice = (value: number) => {
    if (value >= 1000000) return `$${(value / 1000000).toFixed(1)}M`;
    if (value >= 1000) return `$${(value / 1000).toFixed(0)}K`;
    return `$${value}`;
  };

  return (
    <Card className="w-full">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <SlidersHorizontal className="h-5 w-5 text-primary" />
            <CardTitle className="text-lg">Search & Filter</CardTitle>
            {activeFilterCount > 0 && (
              <Badge variant="secondary" className="ml-2">
                {activeFilterCount} active
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-2">
            {activeFilterCount > 0 && (
              <Button variant="ghost" size="sm" onClick={resetFilters}>
                <RotateCcw className="h-4 w-4 mr-1" />
                Reset
              </Button>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsExpanded(!isExpanded)}
            >
              <Filter className="h-4 w-4 mr-1" />
              {isExpanded ? "Less" : "More"} Filters
              {isExpanded ? (
                <ChevronUp className="h-4 w-4 ml-1" />
              ) : (
                <ChevronDown className="h-4 w-4 ml-1" />
              )}
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Main Search Bar */}
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search deals by title, address, notes..."
              value={filters.search}
              onChange={(e) => updateFilters({ search: e.target.value })}
              className="pl-10"
            />
            {filters.search && (
              <Button
                variant="ghost"
                size="icon"
                className="absolute right-1 top-1/2 -translate-y-1/2 h-6 w-6"
                onClick={() => updateFilters({ search: "" })}
              >
                <X className="h-3 w-3" />
              </Button>
            )}
          </div>
          <Select
            value={filters.sortBy}
            onValueChange={(value) => updateFilters({ sortBy: value })}
          >
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              {SORT_OPTIONS.map(option => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button
            variant="outline"
            size="icon"
            onClick={() => updateFilters({ 
              sortOrder: filters.sortOrder === "asc" ? "desc" : "asc" 
            })}
          >
            <ChevronUp className={cn(
              "h-4 w-4 transition-transform",
              filters.sortOrder === "desc" && "rotate-180"
            )} />
          </Button>
        </div>

        {/* Quick Status Filters */}
        <div className="flex flex-wrap gap-2">
          {STATUS_OPTIONS.map(status => (
            <Button
              key={status.value}
              variant={filters.status.includes(status.value) ? "default" : "outline"}
              size="sm"
              className="h-7"
              onClick={() => toggleStatus(status.value)}
            >
              <div className={cn("w-2 h-2 rounded-full mr-1.5", status.color)} />
              {status.label}
              {filters.status.includes(status.value) && (
                <X className="h-3 w-3 ml-1" />
              )}
            </Button>
          ))}
        </div>

        {/* Expanded Filters */}
        <Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
          <CollapsibleContent className="space-y-4 pt-4 border-t">
            {/* Property Type */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">Property Type</Label>
              <div className="flex flex-wrap gap-2">
                {PROPERTY_TYPE_OPTIONS.map(type => (
                  <Button
                    key={type.value}
                    variant={filters.propertyType.includes(type.value) ? "default" : "outline"}
                    size="sm"
                    className="h-7"
                    onClick={() => togglePropertyType(type.value)}
                  >
                    {type.label}
                    {filters.propertyType.includes(type.value) && (
                      <X className="h-3 w-3 ml-1" />
                    )}
                  </Button>
                ))}
              </div>
            </div>

            {/* Price Range */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="text-sm font-medium">Asking Price</Label>
                <span className="text-sm text-muted-foreground">
                  {formatPrice(filters.priceRange[0])} - {formatPrice(filters.priceRange[1])}
                </span>
              </div>
              <Slider
                min={0}
                max={dealStats?.maxPrice || 10000000}
                step={10000}
                value={filters.priceRange}
                onValueChange={(value) => updateFilters({ 
                  priceRange: value as [number, number] 
                })}
                className="w-full"
              />
            </div>

            {/* ARV Range */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="text-sm font-medium">Estimated ARV</Label>
                <span className="text-sm text-muted-foreground">
                  {formatPrice(filters.arvRange[0])} - {formatPrice(filters.arvRange[1])}
                </span>
              </div>
              <Slider
                min={0}
                max={dealStats?.maxArv || 15000000}
                step={10000}
                value={filters.arvRange}
                onValueChange={(value) => updateFilters({ 
                  arvRange: value as [number, number] 
                })}
                className="w-full"
              />
            </div>

            {/* AI Score Range */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="text-sm font-medium">AI Score</Label>
                <span className="text-sm text-muted-foreground">
                  {filters.aiScoreRange[0]} - {filters.aiScoreRange[1]}
                </span>
              </div>
              <Slider
                min={0}
                max={100}
                step={5}
                value={filters.aiScoreRange}
                onValueChange={(value) => updateFilters({ 
                  aiScoreRange: value as [number, number] 
                })}
                className="w-full"
              />
            </div>

            {/* Assignment Filter */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">Assignment Status</Label>
              <div className="flex gap-2">
                <Button
                  variant={filters.hasAssignedUser === true ? "default" : "outline"}
                  size="sm"
                  onClick={() => updateFilters({ 
                    hasAssignedUser: filters.hasAssignedUser === true ? null : true 
                  })}
                >
                  Assigned
                </Button>
                <Button
                  variant={filters.hasAssignedUser === false ? "default" : "outline"}
                  size="sm"
                  onClick={() => updateFilters({ 
                    hasAssignedUser: filters.hasAssignedUser === false ? null : false 
                  })}
                >
                  Unassigned
                </Button>
              </div>
            </div>

            {/* Date Range */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-sm font-medium">Created From</Label>
                <Input
                  type="date"
                  value={filters.dateRange.from?.toISOString().split('T')[0] || ""}
                  onChange={(e) => updateFilters({
                    dateRange: {
                      ...filters.dateRange,
                      from: e.target.value ? new Date(e.target.value) : null
                    }
                  })}
                />
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-medium">Created To</Label>
                <Input
                  type="date"
                  value={filters.dateRange.to?.toISOString().split('T')[0] || ""}
                  onChange={(e) => updateFilters({
                    dateRange: {
                      ...filters.dateRange,
                      to: e.target.value ? new Date(e.target.value) : null
                    }
                  })}
                />
              </div>
            </div>
          </CollapsibleContent>
        </Collapsible>

        {/* Active Filters Summary */}
        {activeFilterCount > 0 && (
          <div className="flex flex-wrap gap-2 pt-2 border-t">
            <span className="text-sm text-muted-foreground">Active filters:</span>
            {filters.search && (
              <Badge variant="secondary" className="gap-1">
                Search: {filters.search.slice(0, 20)}...
                <X 
                  className="h-3 w-3 cursor-pointer" 
                  onClick={() => updateFilters({ search: "" })}
                />
              </Badge>
            )}
            {filters.status.map(s => (
              <Badge key={s} variant="secondary" className="gap-1">
                Status: {s}
                <X 
                  className="h-3 w-3 cursor-pointer" 
                  onClick={() => toggleStatus(s)}
                />
              </Badge>
            ))}
            {filters.propertyType.map(t => (
              <Badge key={t} variant="secondary" className="gap-1">
                Type: {t}
                <X 
                  className="h-3 w-3 cursor-pointer" 
                  onClick={() => togglePropertyType(t)}
                />
              </Badge>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
