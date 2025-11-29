"use client";

import { useState, useMemo } from "react";
import { DealWithProperty, DealStatus } from "@/lib/actions/deal-actions";
import { DealsList } from "./deals-list";
import { KanbanBoard } from "./kanban-board";
import { List, LayoutGrid, Plus, Search, Filter, X, SortAsc, SortDesc } from "lucide-react";
import Link from "next/link";

type ViewMode = "list" | "kanban";
type SortField = "submitted_at" | "asking_price" | "address";
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

interface DealsPageClientProps {
  deals: DealWithProperty[];
  isAdmin?: boolean;
}

export function DealsPageClient({ deals, isAdmin = false }: DealsPageClientProps) {
  const [viewMode, setViewMode] = useState<ViewMode>("list");
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<DealStatus | "all">("all");
  const [sortField, setSortField] = useState<SortField>("submitted_at");
  const [sortOrder, setSortOrder] = useState<SortOrder>("desc");
  const [showFilters, setShowFilters] = useState(false);

  // Filter and sort deals
  const filteredDeals = useMemo(() => {
    let result = [...deals];

    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(deal => 
        deal.property?.address?.toLowerCase().includes(query) ||
        deal.property?.city?.toLowerCase().includes(query) ||
        deal.seller_name?.toLowerCase().includes(query) ||
        deal.agent?.full_name?.toLowerCase().includes(query) ||
        deal.agent?.email?.toLowerCase().includes(query)
      );
    }

    // Status filter
    if (statusFilter !== "all") {
      result = result.filter(deal => deal.status === statusFilter);
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
      }
      return sortOrder === "asc" ? comparison : -comparison;
    });

    return result;
  }, [deals, searchQuery, statusFilter, sortField, sortOrder]);

  const clearFilters = () => {
    setSearchQuery("");
    setStatusFilter("all");
    setSortField("submitted_at");
    setSortOrder("desc");
  };

  const hasActiveFilters = searchQuery || statusFilter !== "all" || sortField !== "submitted_at" || sortOrder !== "desc";

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
            {hasActiveFilters && (
              <span className="w-2 h-2 rounded-full bg-blue-500" />
            )}
          </button>
        </div>

        {/* Filter Panel */}
        {showFilters && (
          <div className="p-4 rounded-lg border border-border bg-card space-y-4">
            <div className="flex flex-wrap gap-4">
              {/* Status Filter */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Status</label>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value as DealStatus | "all")}
                  className="px-3 py-2 rounded-md border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">All Statuses</option>
                  {allStatuses.map(status => (
                    <option key={status} value={status}>{statusLabels[status]}</option>
                  ))}
                </select>
              </div>

              {/* Sort Field */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Sort By</label>
                <div className="flex items-center gap-2">
                  <select
                    value={sortField}
                    onChange={(e) => setSortField(e.target.value as SortField)}
                    className="px-3 py-2 rounded-md border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="submitted_at">Date Submitted</option>
                    <option value="asking_price">Asking Price</option>
                    <option value="address">Address</option>
                  </select>
                  <button
                    onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
                    className="p-2 rounded-md border border-border bg-background text-foreground hover:bg-muted"
                    title={sortOrder === "asc" ? "Ascending" : "Descending"}
                  >
                    {sortOrder === "asc" ? <SortAsc className="h-4 w-4" /> : <SortDesc className="h-4 w-4" />}
                  </button>
                </div>
              </div>
            </div>

            {/* Clear Filters */}
            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400"
              >
                Clear all filters
              </button>
            )}
          </div>
        )}

        {/* Results count */}
        {(searchQuery || statusFilter !== "all") && (
          <p className="text-sm text-muted-foreground">
            Showing {filteredDeals.length} of {deals.length} deals
          </p>
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
