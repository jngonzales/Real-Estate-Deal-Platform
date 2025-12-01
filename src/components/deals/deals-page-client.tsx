"use client";

import { useState, useMemo, useCallback } from "react";
import { DealWithProperty, DealStatus } from "@/lib/actions/deal-actions";
import { DealsList } from "./deals-list";
import { KanbanBoard } from "./kanban-board";
import { List, LayoutGrid, Plus, Search, Filter, X, SortAsc, SortDesc, Calendar, DollarSign, Home, Save, Trash2, Download } from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";

type ViewMode = "list" | "kanban";
type SortField = "submitted_at" | "asking_price" | "address" | "city" | "property_type";
type SortOrder = "asc" | "desc";

const allStatuses: DealStatus[] = [
  "submitted", "needs_info", "underwriting", "offer_prepared", 
  "offer_sent", "in_contract", "funding", "closed", "rejected"
];

const statusLabels: Record<DealStatus, string> = {
  submitted: "Submitted",
  needs_info: "Needs Info",
  underwriting: "Underwriting",
  offer_prepared: "Offer Prepared",
  offer_sent: "Offer Sent",
  in_contract: "In Contract",
  funding: "Funding",
  closed: "Closed",
  rejected: "Rejected",
};

const propertyTypes = [
  "Single Family",
  "Multi-Family",
  "Condo",
  "Townhouse",
  "Commercial",
  "Land",
  "Other",
];

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
}

export function DealsPageClient({ deals, isAdmin = false }: DealsPageClientProps) {
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
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("deal-filters");
      return saved ? JSON.parse(saved) : [];
    }
    return [];
  });
  const [filterName, setFilterName] = useState("");
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

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
      result = result.filter(deal => 
        deal.property?.property_type && propertyTypeFilters.includes(deal.property.property_type)
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
      const filename = filenameMatch ? filenameMatch[1] : `dealflow-export-${new Date().toISOString().split("T")[0]}.csv`;

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

      toast.success(`Exported ${filteredDeals.length} deals to CSV`);
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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">
            {isAdmin ? "All Deals" : "My Deals"}
          </h2>
          <p className="text-muted-foreground">
            {isAdmin 
              ? "View and manage all deals across the platform."
              : "View and manage all your submitted deals."}
          </p>
        </div>
        <div className="flex items-center gap-3">
          {/* View Toggle */}
          <div className="flex items-center rounded-lg border border-border bg-card p-1">
            <button
              onClick={() => setViewMode("list")}
              className={`flex items-center rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
                viewMode === "list"
                  ? "bg-blue-600 text-white"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <List className="mr-1.5 h-4 w-4" />
              List
            </button>
            <button
              onClick={() => setViewMode("kanban")}
              className={`flex items-center rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
                viewMode === "kanban"
                  ? "bg-blue-600 text-white"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <LayoutGrid className="mr-1.5 h-4 w-4" />
              Kanban
            </button>
          </div>
          {/* Export Button */}
          <button
            onClick={handleExport}
            disabled={isExporting || filteredDeals.length === 0}
            className="inline-flex items-center rounded-lg border border-border bg-card px-4 py-2 text-sm font-medium text-foreground hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Download className="mr-1.5 h-4 w-4" />
            {isExporting ? "Exporting..." : "Export CSV"}
          </button>
          {/* Add Deal Button */}
          <Link
            href="/dashboard/submit"
            className="inline-flex items-center rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
          >
            <Plus className="mr-1.5 h-4 w-4" />
            New Deal
          </Link>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search by address, city, seller, or agent..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-lg border border-border bg-card text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          {/* Filter Toggle */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg border transition-colors ${
              showFilters || hasActiveFilters
                ? "border-blue-500 bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"
                : "border-border bg-card text-muted-foreground hover:text-foreground"
            }`}
          >
            <Filter className="h-4 w-4" />
            Filters
            {activeFilterCount > 0 && (
              <span className="flex items-center justify-center w-5 h-5 text-xs rounded-full bg-blue-500 text-white">
                {activeFilterCount}
              </span>
            )}
          </button>
        </div>

        {/* Filter Panel */}
        {showFilters && (
          <div className="p-4 rounded-lg border border-border bg-card space-y-4">
            {/* Saved Filters */}
            {savedFilters.length > 0 && (
              <div className="pb-4 border-b border-border">
                <label className="text-sm font-medium text-foreground mb-2 block">Saved Filters</label>
                <div className="flex flex-wrap gap-2">
                  {savedFilters.map(filter => (
                    <div key={filter.id} className="flex items-center gap-1 px-3 py-1.5 rounded-md bg-muted text-sm">
                      <button
                        onClick={() => applyFilter(filter)}
                        className="text-foreground hover:text-blue-600"
                      >
                        {filter.name}
                      </button>
                      <button
                        onClick={() => deleteFilter(filter.id)}
                        className="text-muted-foreground hover:text-red-500 ml-1"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Status Filter - Multi-select */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground flex items-center gap-2">
                  <Filter className="h-4 w-4 text-muted-foreground" />
                  Status
                </label>
                <div className="flex flex-wrap gap-1.5 max-h-32 overflow-y-auto p-2 rounded-md border border-border bg-background">
                  {allStatuses.map(status => (
                    <button
                      key={status}
                      onClick={() => toggleStatus(status)}
                      className={`px-2 py-1 text-xs rounded-md transition-colors ${
                        statusFilters.includes(status)
                          ? "bg-blue-500 text-white"
                          : "bg-muted text-muted-foreground hover:bg-muted/80"
                      }`}
                    >
                      {statusLabels[status]}
                    </button>
                  ))}
                </div>
              </div>

              {/* Property Type Filter - Multi-select */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground flex items-center gap-2">
                  <Home className="h-4 w-4 text-muted-foreground" />
                  Property Type
                </label>
                <div className="flex flex-wrap gap-1.5 max-h-32 overflow-y-auto p-2 rounded-md border border-border bg-background">
                  {propertyTypes.map(type => (
                    <button
                      key={type}
                      onClick={() => togglePropertyType(type)}
                      className={`px-2 py-1 text-xs rounded-md transition-colors ${
                        propertyTypeFilters.includes(type)
                          ? "bg-blue-500 text-white"
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
                <label className="text-sm font-medium text-foreground flex items-center gap-2">
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                  Price Range
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    placeholder="Min"
                    value={priceMin}
                    onChange={(e) => setPriceMin(e.target.value)}
                    className="w-full px-3 py-2 text-sm rounded-md border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <span className="text-muted-foreground">-</span>
                  <input
                    type="number"
                    placeholder="Max"
                    value={priceMax}
                    onChange={(e) => setPriceMax(e.target.value)}
                    className="w-full px-3 py-2 text-sm rounded-md border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* Date Range */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  Date Range
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="date"
                    value={dateFrom}
                    onChange={(e) => setDateFrom(e.target.value)}
                    className="w-full px-3 py-2 text-sm rounded-md border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <span className="text-muted-foreground">-</span>
                  <input
                    type="date"
                    value={dateTo}
                    onChange={(e) => setDateTo(e.target.value)}
                    className="w-full px-3 py-2 text-sm rounded-md border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>

            {/* Sort Options */}
            <div className="pt-4 border-t border-border">
              <div className="flex flex-wrap items-center gap-4">
                <div className="flex items-center gap-2">
                  <label className="text-sm font-medium text-foreground">Sort By</label>
                  <select
                    value={sortField}
                    onChange={(e) => setSortField(e.target.value as SortField)}
                    className="px-3 py-2 text-sm rounded-md border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="submitted_at">Date Submitted</option>
                    <option value="asking_price">Asking Price</option>
                    <option value="address">Address</option>
                    <option value="city">City</option>
                    <option value="property_type">Property Type</option>
                  </select>
                  <button
                    onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
                    className="p-2 rounded-md border border-border bg-background text-foreground hover:bg-muted"
                    title={sortOrder === "asc" ? "Ascending" : "Descending"}
                  >
                    {sortOrder === "asc" ? <SortAsc className="h-4 w-4" /> : <SortDesc className="h-4 w-4" />}
                  </button>
                </div>

                <div className="flex-1" />

                {/* Filter Actions */}
                <div className="flex items-center gap-2">
                  {hasActiveFilters && (
                    <>
                      <button
                        onClick={() => setShowSaveDialog(true)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400"
                      >
                        <Save className="h-4 w-4" />
                        Save Filter
                      </button>
                      <button
                        onClick={clearFilters}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm text-red-600 hover:text-red-700 dark:text-red-400"
                      >
                        <Trash2 className="h-4 w-4" />
                        Clear All
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Save Filter Dialog */}
            {showSaveDialog && (
              <div className="pt-4 border-t border-border">
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    placeholder="Enter filter name..."
                    value={filterName}
                    onChange={(e) => setFilterName(e.target.value)}
                    className="flex-1 px-3 py-2 text-sm rounded-md border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-blue-500"
                    onKeyDown={(e) => e.key === "Enter" && saveFilter()}
                  />
                  <button
                    onClick={saveFilter}
                    disabled={!filterName.trim()}
                    className="px-4 py-2 text-sm font-medium rounded-md bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Save
                  </button>
                  <button
                    onClick={() => { setShowSaveDialog(false); setFilterName(""); }}
                    className="px-4 py-2 text-sm font-medium rounded-md border border-border text-foreground hover:bg-muted"
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
            <p className="text-sm text-muted-foreground">
              Showing {filteredDeals.length} of {deals.length} deals
              {statusFilters.length > 0 && (
                <span className="ml-2">
                  • Status: {statusFilters.map(s => statusLabels[s]).join(", ")}
                </span>
              )}
              {propertyTypeFilters.length > 0 && (
                <span className="ml-2">
                  • Type: {propertyTypeFilters.join(", ")}
                </span>
              )}
              {(priceMin || priceMax) && (
                <span className="ml-2">
                  • Price: {priceMin ? `$${Number(priceMin).toLocaleString()}` : "$0"} - {priceMax ? `$${Number(priceMax).toLocaleString()}` : "∞"}
                </span>
              )}
            </p>
          </div>
        )}
      </div>

      {/* Stats */}
      {deals.length > 0 && (
        <div className="grid grid-cols-3 gap-3 sm:grid-cols-5 lg:grid-cols-10">
          <StatCard
            label="Total"
            count={deals.length}
            color="bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-200"
            active={statusFilter === "all"}
            onClick={() => setStatusFilter("all")}
          />
          <StatCard
            label="Submitted"
            count={deals.filter((d) => d.status === "submitted").length}
            color="bg-blue-100 text-blue-800"
            active={statusFilter === "submitted"}
            onClick={() => setStatusFilter(statusFilter === "submitted" ? "all" : "submitted")}
          />
          <StatCard
            label="Needs Info"
            count={deals.filter((d) => d.status === "needs_info").length}
            color="bg-orange-100 text-orange-800"
            active={statusFilter === "needs_info"}
            onClick={() => setStatusFilter(statusFilter === "needs_info" ? "all" : "needs_info")}
          />
          <StatCard
            label="Underwriting"
            count={deals.filter((d) => d.status === "underwriting").length}
            color="bg-yellow-100 text-yellow-800"
            active={statusFilter === "underwriting"}
            onClick={() => setStatusFilter(statusFilter === "underwriting" ? "all" : "underwriting")}
          />
          <StatCard
            label="Offer Prep"
            count={deals.filter((d) => d.status === "offer_prepared").length}
            color="bg-purple-100 text-purple-800"
            active={statusFilter === "offer_prepared"}
            onClick={() => setStatusFilter(statusFilter === "offer_prepared" ? "all" : "offer_prepared")}
          />
          <StatCard
            label="Offer Sent"
            count={deals.filter((d) => d.status === "offer_sent").length}
            color="bg-indigo-100 text-indigo-800"
            active={statusFilter === "offer_sent"}
            onClick={() => setStatusFilter(statusFilter === "offer_sent" ? "all" : "offer_sent")}
          />
          <StatCard
            label="Contract"
            count={deals.filter((d) => d.status === "in_contract").length}
            color="bg-cyan-100 text-cyan-800"
            active={statusFilter === "in_contract"}
            onClick={() => setStatusFilter(statusFilter === "in_contract" ? "all" : "in_contract")}
          />
          <StatCard
            label="Funding"
            count={deals.filter((d) => d.status === "funding").length}
            color="bg-emerald-100 text-emerald-800"
            active={statusFilter === "funding"}
            onClick={() => setStatusFilter(statusFilter === "funding" ? "all" : "funding")}
          />
          <StatCard
            label="Closed"
            count={deals.filter((d) => d.status === "closed").length}
            color="bg-green-100 text-green-800"
            active={statusFilter === "closed"}
            onClick={() => setStatusFilter(statusFilter === "closed" ? "all" : "closed")}
          />
          <StatCard
            label="Rejected"
            count={deals.filter((d) => d.status === "rejected").length}
            color="bg-red-100 text-red-800"
            active={statusFilter === "rejected"}
            onClick={() => setStatusFilter(statusFilter === "rejected" ? "all" : "rejected")}
          />
        </div>
      )}

      {/* Content */}
      {viewMode === "list" ? (
        <DealsList deals={filteredDeals} showAgent={isAdmin} />
      ) : (
        <KanbanBoard deals={filteredDeals} showAgent={isAdmin} />
      )}
    </div>
  );
}

function StatCard({
  label,
  count,
  active,
  onClick,
}: {
  label: string;
  count: number;
  color?: string;
  active?: boolean;
  onClick?: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`rounded-lg border p-2 text-left transition-all hover:shadow-md ${
        active ? "border-blue-500 ring-2 ring-blue-500/20" : "border-border"
      } bg-card`}
    >
      <p className="text-xs text-muted-foreground truncate">{label}</p>
      <p className="text-lg font-semibold text-foreground">{count}</p>
    </button>
  );
}
