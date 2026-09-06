"use client";

import { useState, useMemo, useCallback, useLayoutEffect, useRef } from "react";
import { updateDealStatus, type DealWithProperty, type DealStatus } from "@/lib/actions/deal-actions";
import { DealsList, dealStages, stageLabels, type DealStageActions } from "./deals-list";
import { KanbanBoard } from "./kanban-board";
import { List, LayoutGrid, Plus, Search, Filter, X, SortAsc, SortDesc, Calendar, DollarSign, Home, Save, Trash2, Download } from "@/components/ui/icons";
import { toast } from "sonner";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { WorkspaceHeading } from "@/components/layout/workspace-heading";

const focusClass = "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring";
const inputClass = "min-h-11 w-full min-w-0 rounded-md border border-input bg-background px-3 text-base text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring md:text-sm";

type ViewMode = "list" | "kanban";
type SortField = "submitted_at" | "asking_price" | "address" | "city" | "property_type";
type SortOrder = "asc" | "desc";

const propertyTypes = [
  "Single Family",
  "Multi-Family",
  "Condo",
  "Townhouse",
  "Commercial",
  "Land",
  "Other",
];

function propertyTypeKey(value: string) {
  return value.toLowerCase().replace(/[\s-]+/g, "_");
}

interface SavedFilter {
  id: string;
  name: string;
  filters: FilterState;
}

interface FilterState {
  searchQuery: string;
  statusFilters: DealStatus[];
  propertyTypes: string[];
  priceMin: string;
  priceMax: string;
  dateFrom: string;
  dateTo: string;
  sortField: SortField;
  sortOrder: SortOrder;
}

interface DealsPageClientProps {
  deals: DealWithProperty[];
  isAdmin?: boolean;
  movableDealIds: string[];
}

interface StageFocus {
  id: string;
  status: DealStatus;
  trigger: HTMLButtonElement;
}

export function DealsPageClient({ deals, isAdmin = false, movableDealIds }: DealsPageClientProps) {
  const [viewMode, setViewMode] = useState<ViewMode>("list");
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilters, setStatusFilters] = useState<DealStatus[]>([]);
  const [propertyTypeFilters, setPropertyTypeFilters] = useState<string[]>([]);
  const [priceMin, setPriceMin] = useState("");
  const [priceMax, setPriceMax] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [sortField, setSortField] = useState<SortField>("submitted_at");
  const [sortOrder, setSortOrder] = useState<SortOrder>("desc");
  const [showFilters, setShowFilters] = useState(false);
  const [savedFilters, setSavedFilters] = useState<SavedFilter[]>(() => {
    if (typeof window === "undefined") return [];
    try {
      const saved = localStorage.getItem("deal-filters");
      const parsed = saved ? JSON.parse(saved) : [];
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  });
  const [filterName, setFilterName] = useState("");
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [pendingDealId, setPendingDealId] = useState<string | null>(null);
  const [stageFeedback, setStageFeedback] = useState<{ message: string; error?: boolean } | null>(null);
  const moveInFlight = useRef(false);
  const stageFocus = useRef<StageFocus | null>(null);
  const resultsRef = useRef<HTMLDivElement>(null);
  const filterNameRef = useRef<HTMLInputElement>(null);
  const saveFilterRef = useRef<HTMLButtonElement>(null);
  const dealsSearchRef = useRef<HTMLInputElement>(null);
  const movableIds = useMemo(() => new Set(movableDealIds), [movableDealIds]);

  useLayoutEffect(() => {
    const move = stageFocus.current;
    if (!move || pendingDealId) return;
    const refreshedDeal = deals.find((deal) => deal.id === move.id);
    if (refreshedDeal && refreshedDeal.status !== move.status) return;

    const frame = requestAnimationFrame(() => {
      if (stageFocus.current !== move) return;
      stageFocus.current = null;
      const { activeElement, body } = document;
      if (activeElement !== body && activeElement !== move.trigger) return;

      const results = resultsRef.current;
      const triggers = results?.querySelectorAll<HTMLButtonElement>("[data-deal-stage-trigger]");
      const trigger = Array.from(triggers ?? []).find((candidate) =>
        candidate.dataset.dealStageTrigger === move.id && candidate.getClientRects().length > 0
      );
      if (trigger !== activeElement) (trigger ?? results)?.focus();
    });

    return () => cancelAnimationFrame(frame);
  }, [deals, pendingDealId]);

  useLayoutEffect(() => {
    if (showSaveDialog) filterNameRef.current?.focus();
  }, [showSaveDialog]);

  const moveDeal: DealStageActions["move"] = async (deal, status, trigger) => {
    if (moveInFlight.current || status === deal.status || !movableIds.has(deal.id)) return;

    moveInFlight.current = true;
    stageFocus.current = null;
    setPendingDealId(deal.id);
    const address = deal.property?.address || "Deal";
    const destination = stageLabels[status];
    const failure = "Couldn’t change the stage for " + (deal.property?.address || "this deal") + ".";
    setStageFeedback({ message: "Moving " + address + " to " + destination + "…" });

    try {
      const result = await updateDealStatus(deal.id, status);
      if (!result.success) {
        setStageFeedback({ message: result.error ? failure + " " + result.error : failure, error: true });
        return;
      }

      if (trigger) stageFocus.current = { id: deal.id, status, trigger };
      setStageFeedback({ message: address + " moved to " + destination + "." });
    } catch {
      setStageFeedback({ message: failure + " Try again.", error: true });
    } finally {
      moveInFlight.current = false;
      setPendingDealId(null);
    }
  };

  const stageActions = { movableIds, pendingDealId, move: moveDeal };

  // Legacy single status filter support (for stat card clicks)
  const statusFilter: DealStatus | "all" = statusFilters.length === 1 ? statusFilters[0] : "all";
  const setStatusFilter = (status: DealStatus | "all") => {
    if (status === "all") {
      setStatusFilters([]);
    } else {
      setStatusFilters([status]);
    }
  };

  // Filter and sort deals
  const filteredDeals = useMemo(() => {
    let result = [...deals];

    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(deal => 
        deal.property?.address?.toLowerCase().includes(query) ||
        deal.property?.city?.toLowerCase().includes(query) ||
        deal.property?.state?.toLowerCase().includes(query) ||
        deal.property?.zip?.toLowerCase().includes(query) ||
        deal.seller_name?.toLowerCase().includes(query) ||
        deal.agent?.full_name?.toLowerCase().includes(query) ||
        deal.agent?.email?.toLowerCase().includes(query)
      );
    }

    // Multi-status filter
    if (statusFilters.length > 0) {
      result = result.filter(deal => statusFilters.includes(deal.status as DealStatus));
    }

    // Property type filter
    if (propertyTypeFilters.length > 0) {
      const selectedTypes = new Set(propertyTypeFilters.map(propertyTypeKey));
      result = result.filter((deal) =>
        deal.property?.property_type && selectedTypes.has(propertyTypeKey(deal.property.property_type))
      );
    }

    // Price range filter
    if (priceMin) {
      const min = parseFloat(priceMin);
      result = result.filter(deal => (deal.asking_price || 0) >= min);
    }
    if (priceMax) {
      const max = parseFloat(priceMax);
      result = result.filter(deal => (deal.asking_price || 0) <= max);
    }

    // Date range filter
    if (dateFrom) {
      const fromDate = new Date(dateFrom);
      result = result.filter(deal => new Date(deal.submitted_at) >= fromDate);
    }
    if (dateTo) {
      const toDate = new Date(dateTo);
      toDate.setHours(23, 59, 59, 999); // End of day
      result = result.filter(deal => new Date(deal.submitted_at) <= toDate);
    }

    // Sort
    result.sort((a, b) => {
      let comparison = 0;
      switch (sortField) {
        case "submitted_at":
          comparison = new Date(a.submitted_at).getTime() - new Date(b.submitted_at).getTime();
          break;
        case "asking_price":
          comparison = (a.asking_price || 0) - (b.asking_price || 0);
          break;
        case "address":
          comparison = (a.property?.address || "").localeCompare(b.property?.address || "");
          break;
        case "city":
          comparison = (a.property?.city || "").localeCompare(b.property?.city || "");
          break;
        case "property_type":
          comparison = (a.property?.property_type || "").localeCompare(b.property?.property_type || "");
          break;
      }
      return sortOrder === "asc" ? comparison : -comparison;
    });

    return result;
  }, [deals, searchQuery, statusFilters, propertyTypeFilters, priceMin, priceMax, dateFrom, dateTo, sortField, sortOrder]);

  const clearFilters = () => {
    setSearchQuery("");
    setStatusFilters([]);
    setPropertyTypeFilters([]);
    setPriceMin("");
    setPriceMax("");
    setDateFrom("");
    setDateTo("");
    setSortField("submitted_at");
    setSortOrder("desc");
    dealsSearchRef.current?.focus();
  };

  const hasActiveFilters = searchQuery || statusFilters.length > 0 || propertyTypeFilters.length > 0 || priceMin || priceMax || dateFrom || dateTo || sortField !== "submitted_at" || sortOrder !== "desc";

  const activeFilterCount = [
    searchQuery ? 1 : 0,
    statusFilters.length,
    propertyTypeFilters.length,
    priceMin || priceMax ? 1 : 0,
    dateFrom || dateTo ? 1 : 0,
  ].reduce((a, b) => a + b, 0);

  // Save current filter
  const saveFilter = useCallback(() => {
    if (!filterName.trim()) return;
    
    const newFilter: SavedFilter = {
      id: Date.now().toString(),
      name: filterName.trim(),
      filters: {
        searchQuery,
        statusFilters,
        propertyTypes: propertyTypeFilters,
        priceMin,
        priceMax,
        dateFrom,
        dateTo,
        sortField,
        sortOrder,
      },
    };
    
    const updated = [...savedFilters, newFilter];
    setSavedFilters(updated);
    localStorage.setItem("deal-filters", JSON.stringify(updated));
    setFilterName("");
    setShowSaveDialog(false);
    saveFilterRef.current?.focus();
  }, [filterName, searchQuery, statusFilters, propertyTypeFilters, priceMin, priceMax, dateFrom, dateTo, sortField, sortOrder, savedFilters]);

  // Apply saved filter
  const applyFilter = (filter: SavedFilter) => {
    setSearchQuery(filter.filters.searchQuery);
    setStatusFilters(filter.filters.statusFilters);
    setPropertyTypeFilters(filter.filters.propertyTypes);
    setPriceMin(filter.filters.priceMin);
    setPriceMax(filter.filters.priceMax);
    setDateFrom(filter.filters.dateFrom);
    setDateTo(filter.filters.dateTo);
    setSortField(filter.filters.sortField);
    setSortOrder(filter.filters.sortOrder);
  };

  // Delete saved filter
  const deleteFilter = (id: string) => {
    const updated = savedFilters.filter(f => f.id !== id);
    setSavedFilters(updated);
    localStorage.setItem("deal-filters", JSON.stringify(updated));
  };

  // Export deals to CSV
  const handleExport = async () => {
    setIsExporting(true);
    try {
      // Build query params based on current filters
      const params = new URLSearchParams();
      if (statusFilters.length > 0) {
        params.append("status", statusFilters.join(","));
      }
      if (dateFrom) {
        params.append("startDate", dateFrom);
      }
      if (dateTo) {
        params.append("endDate", dateTo);
      }

      const response = await fetch(`/api/deals/export?${params.toString()}`);
      
      if (!response.ok) {
        throw new Error("Export failed");
      }

      // Get filename from header or use default
      const contentDisposition = response.headers.get("content-disposition");
      const filenameMatch = contentDisposition?.match(/filename="(.+)"/);
      const filename = filenameMatch ? filenameMatch[1] : `lotmerit-export-${new Date().toISOString().split("T")[0]}.csv`;

      // Download the file
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast.success("Deals exported to CSV");
    } catch (error) {
      console.error("Export error:", error);
      toast.error("Failed to export deals");
    } finally {
      setIsExporting(false);
    }
  };

  // Toggle status in multi-select
  const toggleStatus = (status: DealStatus) => {
    setStatusFilters(prev => 
      prev.includes(status) 
        ? prev.filter(s => s !== status)
        : [...prev, status]
    );
  };

  // Toggle property type in multi-select
  const togglePropertyType = (type: string) => {
    setPropertyTypeFilters(prev => 
      prev.includes(type) 
        ? prev.filter(t => t !== type)
        : [...prev, type]
    );
  };

  return (
    <div className="mx-auto min-w-0 max-w-7xl space-y-5">
      <WorkspaceHeading
        title={isAdmin ? "All deals" : "My deals"}
        actions={
          <>
          {/* View Toggle */}
          <div role="group" aria-label="Deal view" className="flex items-center rounded-lg border border-border bg-card p-0.5">
            <button
              aria-pressed={viewMode === "list"}
              onClick={() => setViewMode("list")}
              className={`inline-flex min-h-11 items-center rounded-md px-3 text-sm font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring active:scale-[0.97] motion-reduce:active:scale-none ${
                viewMode === "list"
                  ? "bg-primary text-primary-foreground dark:text-background"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <List aria-hidden="true" className="me-1.5 size-4" />
              List
            </button>
            <button
              aria-pressed={viewMode === "kanban"}
              onClick={() => setViewMode("kanban")}
              className={`inline-flex min-h-11 items-center rounded-md px-3 text-sm font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring active:scale-[0.97] motion-reduce:active:scale-none ${
                viewMode === "kanban"
                  ? "bg-primary text-primary-foreground dark:text-background"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <LayoutGrid aria-hidden="true" className="me-1.5 size-4" />
              Board
            </button>
          </div>
          {/* Export Button */}
          <button
            onClick={handleExport}
            disabled={isExporting || filteredDeals.length === 0}
            className={"inline-flex min-h-11 items-center rounded-lg border border-border bg-card px-3 text-sm font-medium hover:bg-muted disabled:cursor-not-allowed disabled:opacity-50 " + focusClass}
          >
            <Download aria-hidden="true" className="me-1.5 size-4" />
            {isExporting ? "Exporting…" : "Export CSV"}
          </button>
          {/* Add Deal Button */}
          <Link
            href="/dashboard/submit"
            className={"inline-flex min-h-11 items-center rounded-lg bg-primary px-3 text-sm font-medium text-primary-foreground hover:bg-primary/90 active:scale-[0.97] dark:text-background motion-reduce:active:scale-none " + focusClass}
          >
            <Plus aria-hidden="true" className="me-1.5 size-4" />
            New deal
          </Link>
          </>
        }
      />

      {/* Search and Filters */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Search */}
          <div className="relative min-w-0 flex-1">
            <Search aria-hidden="true" className="pointer-events-none absolute start-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <input
              ref={dealsSearchRef}
              type="search"
              aria-label="Search deals"
              placeholder="Search address, city, seller or agent…"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="min-h-11 w-full min-w-0 rounded-lg border border-input bg-card ps-10 pe-11 text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring [&::-webkit-search-cancel-button]:appearance-none"
            />
            {searchQuery && (
              <button
                aria-label="Clear search"
                onClick={() => {
                  setSearchQuery("");
                  dealsSearchRef.current?.focus();
                }}
                className={"absolute inset-y-0 end-0 grid size-11 place-items-center rounded-md text-muted-foreground hover:text-foreground " + focusClass}
              >
                <X aria-hidden="true" className="size-4" />
              </button>
            )}
          </div>

          {/* Filter Toggle */}
          <button
            aria-expanded={showFilters}
            aria-controls={showFilters ? "deal-filters-panel" : undefined}
            onClick={() => setShowFilters(!showFilters)}
            className={`inline-flex min-h-11 items-center gap-2 rounded-lg border px-4 text-sm font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring ${
              showFilters || hasActiveFilters
                ? "border-primary bg-accent text-accent-foreground"
                : "border-border bg-card text-muted-foreground hover:text-foreground"
            }`}
          >
            <Filter className="h-4 w-4" />
            Filters
            {activeFilterCount > 0 && (
              <span className="flex items-center justify-center w-5 h-5 text-xs rounded-full bg-primary text-primary-foreground dark:text-background">
                {activeFilterCount}
              </span>
            )}
          </button>
        </div>

        {/* Filter Panel */}
        {showFilters && (
          <div id="deal-filters-panel" className="space-y-4 rounded-lg border border-border bg-card p-4">
            {/* Saved Filters */}
            {savedFilters.length > 0 && (
              <div className="pb-4 border-b border-border">
                <p className="mb-2 text-sm font-medium">Saved filters</p>
                <div className="flex flex-wrap gap-2">
                  {savedFilters.map(filter => (
                    <div key={filter.id} className="flex max-w-full min-w-0 items-center gap-1 rounded-md bg-muted pl-2 text-sm">
                      <button
                        onClick={() => applyFilter(filter)}
                        className={"min-h-11 min-w-0 rounded-sm text-left [overflow-wrap:anywhere] hover:text-primary " + focusClass}
                      >
                        {filter.name}
                      </button>
                      <button
                        aria-label={"Delete saved filter " + filter.name}
                        onClick={() => deleteFilter(filter.id)}
                        className={"grid size-11 shrink-0 place-items-center rounded-sm text-muted-foreground hover:text-destructive " + focusClass}
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="grid gap-4 sm:grid-cols-2 2xl:grid-cols-4">
              {/* Status Filter - Multi-select */}
              <div className="space-y-2">
                <p id="deal-filter-stage" className="flex items-center gap-2 text-sm font-medium">
                  <Filter className="h-4 w-4 text-muted-foreground" />
                  Stage
                </p>
                <div role="group" aria-labelledby="deal-filter-stage" className="flex max-h-40 flex-wrap gap-1.5 overflow-y-auto rounded-md border border-border bg-background p-2">
                  {dealStages.map(status => (
                    <button
                      key={status}
                      aria-pressed={statusFilters.includes(status)}
                      onClick={() => toggleStatus(status)}
                      className={`min-h-11 rounded-md px-2 text-xs transition-colors focus-visible:outline-2 focus-visible:outline-ring ${
                        statusFilters.includes(status)
                          ? "bg-primary text-primary-foreground dark:text-background"
                          : "bg-muted text-muted-foreground hover:bg-muted/80"
                      }`}
                    >
                      {stageLabels[status]}
                    </button>
                  ))}
                </div>
              </div>

              {/* Property Type Filter - Multi-select */}
              <div className="space-y-2">
                <p id="deal-filter-type" className="flex items-center gap-2 text-sm font-medium">
                  <Home className="h-4 w-4 text-muted-foreground" />
                  Property type
                </p>
                <div role="group" aria-labelledby="deal-filter-type" className="flex max-h-40 flex-wrap gap-1.5 overflow-y-auto rounded-md border border-border bg-background p-2">
                  {propertyTypes.map(type => (
                    <button
                      key={type}
                      aria-pressed={propertyTypeFilters.includes(type)}
                      onClick={() => togglePropertyType(type)}
                      className={`min-h-11 rounded-md px-2 text-xs transition-colors focus-visible:outline-2 focus-visible:outline-ring ${
                        propertyTypeFilters.includes(type)
                          ? "bg-primary text-primary-foreground dark:text-background"
                          : "bg-muted text-muted-foreground hover:bg-muted/80"
                      }`}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              </div>

              {/* Price Range */}
              <div className="space-y-2">
                <p id="deal-filter-price" className="flex items-center gap-2 text-sm font-medium">
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                  Price range (USD)
                </p>
                <div role="group" aria-labelledby="deal-filter-price" className="grid grid-cols-2 gap-2">
                  <input
                    type="number"
                    aria-label="Minimum price"
                    placeholder="Min"
                    value={priceMin}
                    onChange={(e) => setPriceMin(e.target.value)}
                    className={inputClass}
                  />
                  <input
                    type="number"
                    aria-label="Maximum price"
                    placeholder="Max"
                    value={priceMax}
                    onChange={(e) => setPriceMax(e.target.value)}
                    className={inputClass}
                  />
                </div>
              </div>

              {/* Date Range */}
              <div className="space-y-2">
                <p id="deal-filter-date" className="flex items-center gap-2 text-sm font-medium">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  Date range
                </p>
                <div role="group" aria-labelledby="deal-filter-date" className="grid gap-2">
                  <input
                    type="date"
                    aria-label="Submitted on or after"
                    value={dateFrom}
                    onChange={(e) => setDateFrom(e.target.value)}
                    className={inputClass}
                  />
                  <input
                    type="date"
                    aria-label="Submitted on or before"
                    value={dateTo}
                    onChange={(e) => setDateTo(e.target.value)}
                    className={inputClass}
                  />
                </div>
              </div>
            </div>

            {/* Sort Options */}
            <div className="pt-4 border-t border-border">
              <div className="flex flex-wrap items-center gap-4">
                <div className="flex flex-wrap items-center gap-2">
                  <label htmlFor="deal-sort-by" className="text-sm font-medium">Sort by</label>
                  <select id="deal-sort-by"
                    value={sortField}
                    onChange={(e) => setSortField(e.target.value as SortField)}
                    className={inputClass + " w-auto"}
                  >
                    <option value="submitted_at">Date submitted</option>
                    <option value="asking_price">Asking price</option>
                    <option value="address">Address</option>
                    <option value="city">City</option>
                    <option value="property_type">Property type</option>
                  </select>
                  <button
                    onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
                    className={"grid size-11 place-items-center rounded-md border border-border bg-background hover:bg-muted " + focusClass}
                    aria-label={sortOrder === "asc" ? "Sort descending" : "Sort ascending"}
                    title={sortOrder === "asc" ? "Ascending" : "Descending"}
                  >
                    {sortOrder === "asc" ? <SortAsc className="h-4 w-4" /> : <SortDesc className="h-4 w-4" />}
                  </button>
                </div>

                <div className="flex-1" />

                {/* Filter Actions */}
                <div className="flex flex-wrap items-center gap-2">
                  {hasActiveFilters && (
                    <>
                      <button
                        ref={saveFilterRef}
                        aria-expanded={showSaveDialog}
                        aria-controls={showSaveDialog ? "deal-filter-save" : undefined}
                        onClick={() => setShowSaveDialog(true)}
                        className={"inline-flex min-h-11 items-center gap-1.5 rounded-md px-3 text-sm text-primary hover:underline " + focusClass}
                      >
                        <Save className="h-4 w-4" />
                        Save filter
                      </button>
                      <button
                        onClick={clearFilters}
                        className={"inline-flex min-h-11 items-center gap-1.5 rounded-md px-3 text-sm text-destructive hover:underline " + focusClass}
                      >
                        <Trash2 className="h-4 w-4" />
                        Clear filters
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Save Filter Dialog */}
            {showSaveDialog && (
              <div id="deal-filter-save" className="space-y-2 border-t border-border pt-4">
                <label htmlFor="deal-filter-name" className="text-sm font-medium">Filter name</label>
                <div className="flex flex-wrap items-center gap-2">
                  <input
                    id="deal-filter-name"
                    ref={filterNameRef}
                    type="text"
                    value={filterName}
                    onChange={(e) => setFilterName(e.target.value)}
                    className={inputClass + " flex-1 basis-36"}
                    onKeyDown={(e) => e.key === "Enter" && saveFilter()}
                  />
                  <button
                    onClick={saveFilter}
                    disabled={!filterName.trim()}
                    className={"min-h-11 rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50 dark:text-background " + focusClass}
                  >
                    Save
                  </button>
                  <button
                    onClick={() => {
                      setShowSaveDialog(false);
                      setFilterName("");
                      saveFilterRef.current?.focus();
                    }}
                    className={"min-h-11 rounded-md border border-border px-4 text-sm font-medium hover:bg-muted " + focusClass}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Results count */}
        {hasActiveFilters && (
          <div className="flex items-center justify-between">
            <p role="status" className="text-sm text-muted-foreground [overflow-wrap:anywhere]">
              Showing {filteredDeals.length} of {deals.length} deals
              {statusFilters.length > 0 && (
                <span className="ml-2">
                  • Stage: {statusFilters.map(s => stageLabels[s]).join(", ")}
                </span>
              )}
              {propertyTypeFilters.length > 0 && (
                <span className="ml-2">
                  • Type: {propertyTypeFilters.join(", ")}
                </span>
              )}
              {(priceMin || priceMax) && (
                <span className="ml-2">
                  • Price (USD): {priceMin ? `$${Number(priceMin).toLocaleString()}` : "$0"} to {priceMax ? `$${Number(priceMax).toLocaleString()}` : "no maximum"}
                </span>
              )}
            </p>
          </div>
        )}
      </div>

      {deals.length > 0 && (
        <div role="group" aria-label="Filter by deal stage" className="grid grid-cols-3 gap-px rounded-lg border border-border bg-border sm:grid-cols-5 xl:grid-cols-10">
          {(["all", ...dealStages] as const).map((status) => {
            const selected = status === "all" ? statusFilters.length === 0 : statusFilter === status;
            return (
              <button
                key={status}
                type="button"
                aria-pressed={selected}
                onClick={() => setStatusFilter(status === statusFilter ? "all" : status)}
                className="min-h-16 min-w-0 border-b-2 border-transparent bg-card px-2 py-1.5 text-left first:rounded-tl-lg last:rounded-br-lg hover:bg-accent focus-visible:z-10 focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-ring aria-pressed:border-primary aria-pressed:bg-accent/60"
              >
                <span className="block text-lg font-semibold tabular-nums">
                  {status === "all" ? deals.length : deals.filter((deal) => deal.status === status).length}
                </span>
                <span className="block text-xs text-muted-foreground [overflow-wrap:anywhere]">
                  {status === "all" ? "All stages" : stageLabels[status]}
                </span>
              </button>
            );
          })}
        </div>
      )}

      <div
        ref={resultsRef}
        role="region"
        aria-label="Deal results"
        tabIndex={-1}
        className="min-w-0 rounded-lg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
      >
        <p role="status" className={stageFeedback && !stageFeedback.error ? "mb-3 [overflow-wrap:anywhere] text-sm text-muted-foreground" : "sr-only"}>
          {!stageFeedback?.error && stageFeedback?.message}
        </p>
        <p role="alert" className={stageFeedback?.error ? "mb-3 [overflow-wrap:anywhere] text-sm text-destructive" : "sr-only"}>
          {stageFeedback?.error && stageFeedback.message}
        </p>
        {filteredDeals.length === 0 ? (
          <section className="rounded-lg border border-border bg-card p-6 sm:p-8">
            <h2 className="text-lg font-semibold">{deals.length > 0 ? "No matching deals" : "No deals yet"}</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              {deals.length > 0 ? "Change your filters to see more properties." : "Submit a property to start tracking it."}
            </p>
            {deals.length > 0 ? (
              <Button variant="outline" className="mt-4 min-h-11" onClick={clearFilters}>Clear filters</Button>
            ) : (
              <Button asChild className="mt-4 min-h-11"><Link href="/dashboard/submit">Submit a deal</Link></Button>
            )}
          </section>
        ) : (
          <h2 className="sr-only">Results</h2>
        )}
        {viewMode === "list" && filteredDeals.length > 0 && (
          <DealsList deals={filteredDeals} showAgent={isAdmin} actions={stageActions} />
        )}
        {viewMode === "kanban" && (
          <div hidden={filteredDeals.length === 0}>
            <KanbanBoard deals={filteredDeals} showAgent={isAdmin} actions={stageActions} />
          </div>
        )}
      </div>
    </div>
  );
}
