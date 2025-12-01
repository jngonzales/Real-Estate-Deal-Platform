"use client";

import { useState } from "react";
import { toast } from "sonner";
import { DealWithProperty, DealStatus, updateDealStatus } from "@/lib/actions/deal-actions";
import { formatDistanceToNow } from "date-fns";
import { Home, MapPin, DollarSign, User, GripVertical, LayoutGrid, List } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

const columns: { id: DealStatus; title: string; color: string }[] = [
  { id: "submitted", title: "Submitted", color: "bg-blue-500" },
  { id: "needs_info", title: "Needs Info", color: "bg-orange-500" },
  { id: "underwriting", title: "Underwriting", color: "bg-yellow-500" },
  { id: "offer_prepared", title: "Offer Prepared", color: "bg-purple-500" },
  { id: "offer_sent", title: "Offer Sent", color: "bg-indigo-500" },
  { id: "in_contract", title: "In Contract", color: "bg-cyan-500" },
  { id: "funding", title: "Funding", color: "bg-emerald-500" },
  { id: "closed", title: "Closed", color: "bg-green-600" },
  { id: "rejected", title: "Rejected", color: "bg-red-500" },
];

const propertyTypeLabels: Record<string, string> = {
  single_family: "Single Family",
  multi_family: "Multi-Family",
  condo: "Condo",
  townhouse: "Townhouse",
  land: "Land",
  commercial: "Commercial",
  other: "Other",
};

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(amount);
}

interface KanbanCardProps {
  deal: DealWithProperty;
  onDragStart: (e: React.DragEvent, dealId: string) => void;
  showAgent?: boolean;
}

function KanbanCard({ deal, onDragStart, showAgent = false }: KanbanCardProps) {
  return (
    <div
      draggable
      onDragStart={(e) => onDragStart(e, deal.id)}
      className="group cursor-grab rounded-lg border border-slate-200 bg-white p-4 shadow-sm transition-shadow hover:shadow-md active:cursor-grabbing dark:border-slate-700 dark:bg-slate-800"
    >
      <div className="mb-3 flex items-start justify-between">
        <div className="flex items-center space-x-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100 dark:bg-slate-700">
            <Home className="h-4 w-4 text-slate-600 dark:text-slate-400" />
          </div>
          <div className="flex-1">
            <Link
              href={`/dashboard/deals/${deal.id}`}
              className="font-medium text-slate-900 hover:text-slate-700 dark:text-white dark:hover:text-slate-300"
            >
              {deal.property?.address ?? 'N/A'}
            </Link>
          </div>
        </div>
        <GripVertical className="h-4 w-4 text-slate-400 opacity-0 transition-opacity group-hover:opacity-100" />
      </div>

      <div className="space-y-2 text-sm">
        <div className="flex items-center text-slate-500 dark:text-slate-400">
          <MapPin className="mr-1.5 h-3.5 w-3.5" />
          {deal.property?.city ?? ''}, {deal.property?.state ?? ''}
        </div>
        <div className="flex items-center font-medium text-slate-900 dark:text-white">
          <DollarSign className="mr-1.5 h-3.5 w-3.5 text-slate-400" />
          {formatCurrency(deal.asking_price)}
        </div>
        <div className="flex items-center text-slate-500 dark:text-slate-400">
          <User className="mr-1.5 h-3.5 w-3.5" />
          {deal.seller_name}
        </div>
        {showAgent && deal.agent && (
          <div className="flex items-center text-xs text-slate-400 border-t border-slate-100 pt-2 mt-2 dark:border-slate-700">
            <span className="font-medium">Agent:</span>
            <span className="ml-1">{deal.agent.full_name || deal.agent.email}</span>
          </div>
        )}
      </div>

      <div className="mt-3 flex items-center justify-between border-t border-slate-100 pt-3 dark:border-slate-700">
        <span className="text-xs text-slate-400">
          {formatDistanceToNow(new Date(deal.submitted_at), { addSuffix: true })}
        </span>
        <span className="rounded bg-slate-100 px-2 py-0.5 text-xs text-slate-600 dark:bg-slate-700 dark:text-slate-300">
          {deal.property ? (propertyTypeLabels[deal.property.property_type] || deal.property.property_type) : 'N/A'}
        </span>
      </div>
    </div>
  );
}

interface KanbanColumnProps {
  column: { id: DealStatus; title: string; color: string };
  deals: DealWithProperty[];
  onDragStart: (e: React.DragEvent, dealId: string) => void;
  onDragOver: (e: React.DragEvent) => void;
  onDrop: (e: React.DragEvent, status: DealStatus) => void;
  showAgent?: boolean;
}

function KanbanColumn({ column, deals, onDragStart, onDragOver, onDrop, showAgent = false }: KanbanColumnProps) {
  return (
    <div
      className="flex min-w-[280px] flex-col rounded-lg bg-slate-100/50 dark:bg-slate-800/50"
      onDragOver={onDragOver}
      onDrop={(e) => onDrop(e, column.id)}
    >
      <div className="flex items-center justify-between p-4">
        <div className="flex items-center space-x-2">
          <div className={`h-2.5 w-2.5 rounded-full ${column.color}`} />
          <h3 className="font-medium text-slate-900 dark:text-white">{column.title}</h3>
        </div>
        <span className="rounded-full bg-slate-200 px-2 py-0.5 text-xs font-medium text-slate-600 dark:bg-slate-700 dark:text-slate-300">
          {deals.length}
        </span>
      </div>
      <div className="flex flex-col gap-3 p-4 pt-0">
        {deals.map((deal) => (
          <KanbanCard key={deal.id} deal={deal} onDragStart={onDragStart} showAgent={showAgent} />
        ))}
        {deals.length === 0 && (
          <div className="rounded-lg border-2 border-dashed border-slate-200 p-6 text-center dark:border-slate-700">
            <p className="text-sm text-slate-400">No deals</p>
          </div>
        )}
      </div>
    </div>
  );
}

interface KanbanBoardProps {
  deals: DealWithProperty[];
  showAgent?: boolean;
}

export function KanbanBoard({ deals, showAgent = false }: KanbanBoardProps) {
  const router = useRouter();
  const [draggedDealId, setDraggedDealId] = useState<string | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [viewMode, setViewMode] = useState<"kanban" | "list">("kanban");
  const [selectedStatus, setSelectedStatus] = useState<DealStatus | "all">("all");

  const handleDragStart = (e: React.DragEvent, dealId: string) => {
    setDraggedDealId(dealId);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  };

  const handleDrop = async (e: React.DragEvent, newStatus: DealStatus) => {
    e.preventDefault();
    
    if (!draggedDealId || isUpdating) return;

    const deal = deals.find((d) => d.id === draggedDealId);
    if (!deal || deal.status === newStatus) {
      setDraggedDealId(null);
      return;
    }

    setIsUpdating(true);
    const result = await updateDealStatus(draggedDealId, newStatus);
    setIsUpdating(false);
    setDraggedDealId(null);

    if (result.error) {
      console.error("Failed to update deal status:", result.error);
      toast.error("Failed to update status", {
        description: result.error,
      });
    } else {
      const statusTitle = columns.find(c => c.id === newStatus)?.title || newStatus;
      toast.success(`Deal moved to ${statusTitle}`, {
        description: `${deal.property?.address || 'Deal'} status updated.`,
      });
      router.refresh();
    }
  };

  const handleStatusChange = async (dealId: string, newStatus: DealStatus) => {
    const deal = deals.find((d) => d.id === dealId);
    if (!deal || deal.status === newStatus || isUpdating) return;

    setIsUpdating(true);
    const result = await updateDealStatus(dealId, newStatus);
    setIsUpdating(false);

    if (result.error) {
      toast.error("Failed to update status", { description: result.error });
    } else {
      const statusTitle = columns.find(c => c.id === newStatus)?.title || newStatus;
      toast.success(`Deal moved to ${statusTitle}`);
      router.refresh();
    }
  };

  const dealsByStatus = columns.reduce((acc, column) => {
    acc[column.id] = deals.filter((deal) => deal.status === column.id);
    return acc;
  }, {} as Record<DealStatus, DealWithProperty[]>);

  const filteredDeals = selectedStatus === "all" 
    ? deals 
    : deals.filter(d => d.status === selectedStatus);

  if (deals.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-slate-300 bg-white p-12 text-center dark:border-slate-700 dark:bg-slate-800">
        <Home className="mx-auto h-12 w-12 text-slate-400" />
        <h3 className="mt-4 text-lg font-medium text-slate-900 dark:text-white">No deals yet</h3>
        <p className="mt-2 text-slate-500 dark:text-slate-400">
          Get started by submitting your first deal.
        </p>
        <Link
          href="/dashboard/submit"
          className="mt-4 inline-flex items-center rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800 dark:bg-slate-700 dark:hover:bg-slate-600"
        >
          Submit a Deal
        </Link>
      </div>
    );
  }

  return (
    <div className="relative">
      {/* View Toggle - Mobile Only */}
      <div className="mb-4 flex items-center justify-between md:hidden">
        <div className="flex rounded-lg border border-slate-200 bg-white p-1 dark:border-slate-700 dark:bg-slate-800">
          <button
            onClick={() => setViewMode("kanban")}
            className={`flex items-center gap-1.5 rounded px-3 py-1.5 text-sm font-medium transition-colors ${
              viewMode === "kanban" 
                ? "bg-slate-900 text-white dark:bg-slate-600" 
                : "text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-700"
            }`}
          >
            <LayoutGrid className="h-4 w-4" />
            Board
          </button>
          <button
            onClick={() => setViewMode("list")}
            className={`flex items-center gap-1.5 rounded px-3 py-1.5 text-sm font-medium transition-colors ${
              viewMode === "list" 
                ? "bg-slate-900 text-white dark:bg-slate-600" 
                : "text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-700"
            }`}
          >
            <List className="h-4 w-4" />
            List
          </button>
        </div>
        
        {viewMode === "list" && (
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value as DealStatus | "all")}
            className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800 dark:text-white"
          >
            <option value="all">All Status ({deals.length})</option>
            {columns.map(col => (
              <option key={col.id} value={col.id}>
                {col.title} ({dealsByStatus[col.id].length})
              </option>
            ))}
          </select>
        )}
      </div>

      {isUpdating && (
        <div className="absolute inset-0 z-10 flex items-center justify-center bg-white/50 dark:bg-slate-900/50">
          <div className="rounded-lg bg-slate-900 px-4 py-2 text-sm text-white dark:bg-slate-700">
            Updating...
          </div>
        </div>
      )}

      {/* Kanban View - Desktop always, Mobile when selected */}
      <div className={`${viewMode === "list" ? "hidden md:block" : ""}`}>
        <div className="flex gap-4 overflow-x-auto pb-4">
          {columns.map((column) => (
            <KanbanColumn
              key={column.id}
              column={column}
              deals={dealsByStatus[column.id]}
              onDragStart={handleDragStart}
              onDragOver={handleDragOver}
              onDrop={handleDrop}
              showAgent={showAgent}
            />
          ))}
        </div>
      </div>

      {/* List View - Mobile only when selected */}
      <div className={`space-y-3 md:hidden ${viewMode === "kanban" ? "hidden" : ""}`}>
        {filteredDeals.map((deal) => {
          const column = columns.find(c => c.id === deal.status);
          return (
            <div
              key={deal.id}
              className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-800"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <Link
                    href={`/dashboard/deals/${deal.id}`}
                    className="font-medium text-slate-900 hover:text-slate-700 line-clamp-1 dark:text-white dark:hover:text-slate-300"
                  >
                    {deal.property?.address ?? 'N/A'}
                  </Link>
                  <p className="mt-0.5 text-sm text-slate-500 dark:text-slate-400">
                    {deal.property?.city}, {deal.property?.state}
                  </p>
                </div>
                <div className={`shrink-0 h-2.5 w-2.5 rounded-full ${column?.color || 'bg-slate-400'}`} />
              </div>
              
              <div className="mt-3 flex items-center justify-between">
                <span className="font-semibold text-slate-900 dark:text-white">
                  {formatCurrency(deal.asking_price)}
                </span>
                <span className="text-xs text-slate-500 dark:text-slate-400">
                  {formatDistanceToNow(new Date(deal.submitted_at), { addSuffix: true })}
                </span>
              </div>

              <div className="mt-3 flex items-center gap-2">
                <select
                  value={deal.status}
                  onChange={(e) => handleStatusChange(deal.id, e.target.value as DealStatus)}
                  disabled={isUpdating}
                  className="flex-1 rounded border border-slate-200 bg-white px-2 py-1.5 text-sm disabled:opacity-50 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                >
                  {columns.map(col => (
                    <option key={col.id} value={col.id}>{col.title}</option>
                  ))}
                </select>
                <Link
                  href={`/dashboard/deals/${deal.id}`}
                  className="rounded bg-slate-900 px-3 py-1.5 text-sm font-medium text-white hover:bg-slate-800 dark:bg-slate-700 dark:hover:bg-slate-600"
                >
                  View
                </Link>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
