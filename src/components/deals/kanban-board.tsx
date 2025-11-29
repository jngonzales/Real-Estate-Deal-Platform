"use client";

import { useState } from "react";
import { DealWithProperty, DealStatus, updateDealStatus } from "@/lib/actions/deal-actions";
import { formatDistanceToNow } from "date-fns";
import { Home, MapPin, DollarSign, User, GripVertical } from "lucide-react";
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
      className="group cursor-grab rounded-lg border border-slate-200 bg-white p-4 shadow-sm transition-shadow hover:shadow-md active:cursor-grabbing"
    >
      <div className="mb-3 flex items-start justify-between">
        <div className="flex items-center space-x-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100">
            <Home className="h-4 w-4 text-slate-600" />
          </div>
          <div className="flex-1">
            <Link
              href={`/dashboard/deals/${deal.id}`}
              className="font-medium text-slate-900 hover:text-slate-700"
            >
              {deal.property?.address ?? 'N/A'}
            </Link>
          </div>
        </div>
        <GripVertical className="h-4 w-4 text-slate-400 opacity-0 transition-opacity group-hover:opacity-100" />
      </div>

      <div className="space-y-2 text-sm">
        <div className="flex items-center text-slate-500">
          <MapPin className="mr-1.5 h-3.5 w-3.5" />
          {deal.property?.city ?? ''}, {deal.property?.state ?? ''}
        </div>
        <div className="flex items-center font-medium text-slate-900">
          <DollarSign className="mr-1.5 h-3.5 w-3.5 text-slate-400" />
          {formatCurrency(deal.asking_price)}
        </div>
        <div className="flex items-center text-slate-500">
          <User className="mr-1.5 h-3.5 w-3.5" />
          {deal.seller_name}
        </div>
        {showAgent && deal.agent && (
          <div className="flex items-center text-xs text-slate-400 border-t border-slate-100 pt-2 mt-2">
            <span className="font-medium">Agent:</span>
            <span className="ml-1">{deal.agent.full_name || deal.agent.email}</span>
          </div>
        )}
      </div>

      <div className="mt-3 flex items-center justify-between border-t border-slate-100 pt-3">
        <span className="text-xs text-slate-400">
          {formatDistanceToNow(new Date(deal.submitted_at), { addSuffix: true })}
        </span>
        <span className="rounded bg-slate-100 px-2 py-0.5 text-xs text-slate-600">
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
      className="flex min-w-[280px] flex-col rounded-lg bg-slate-100/50"
      onDragOver={onDragOver}
      onDrop={(e) => onDrop(e, column.id)}
    >
      <div className="flex items-center justify-between p-4">
        <div className="flex items-center space-x-2">
          <div className={`h-2.5 w-2.5 rounded-full ${column.color}`} />
          <h3 className="font-medium text-slate-900">{column.title}</h3>
        </div>
        <span className="rounded-full bg-slate-200 px-2 py-0.5 text-xs font-medium text-slate-600">
          {deals.length}
        </span>
      </div>
      <div className="flex flex-col gap-3 p-4 pt-0">
        {deals.map((deal) => (
          <KanbanCard key={deal.id} deal={deal} onDragStart={onDragStart} showAgent={showAgent} />
        ))}
        {deals.length === 0 && (
          <div className="rounded-lg border-2 border-dashed border-slate-200 p-6 text-center">
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
      // Could add toast notification here
    } else {
      router.refresh();
    }
  };

  const dealsByStatus = columns.reduce((acc, column) => {
    acc[column.id] = deals.filter((deal) => deal.status === column.id);
    return acc;
  }, {} as Record<DealStatus, DealWithProperty[]>);

  if (deals.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-slate-300 bg-white p-12 text-center">
        <Home className="mx-auto h-12 w-12 text-slate-400" />
        <h3 className="mt-4 text-lg font-medium text-slate-900">No deals yet</h3>
        <p className="mt-2 text-slate-500">
          Get started by submitting your first deal.
        </p>
        <Link
          href="/dashboard/submit"
          className="mt-4 inline-flex items-center rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800"
        >
          Submit a Deal
        </Link>
      </div>
    );
  }

  return (
    <div className="relative">
      {isUpdating && (
        <div className="absolute inset-0 z-10 flex items-center justify-center bg-white/50">
          <div className="rounded-lg bg-slate-900 px-4 py-2 text-sm text-white">
            Updating...
          </div>
        </div>
      )}
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
  );
}
