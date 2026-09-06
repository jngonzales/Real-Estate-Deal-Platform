"use client";

import { useRef, useState, type DragEvent } from "react";
import type { DealStatus, DealWithProperty } from "@/lib/actions/deal-actions";
import { GripVertical, LayoutGrid, List } from "@/components/ui/icons";
import Link from "next/link";
import { StatusBadge } from "@/components/ui/status-badge";
import {
  DealStageMenu,
  DealsList,
  dealStages,
  describeDeal,
  stageLabels,
  type DealStageActions,
} from "./deals-list";

interface KanbanBoardProps {
  deals: DealWithProperty[];
  showAgent: boolean;
  actions: DealStageActions;
}

function KanbanCard({
  deal,
  showAgent,
  actions,
  onDragStart,
  onDragEnd,
}: {
  deal: DealWithProperty;
  showAgent: boolean;
  actions: DealStageActions;
  onDragStart: (event: DragEvent, deal: DealWithProperty) => void;
  onDragEnd: () => void;
}) {
  const { address, location, type, amount, submitted, href } = describeDeal(deal);
  const draggable = actions.movableIds.has(deal.id) && actions.pendingDealId === null;

  return (
    <li
      draggable={draggable}
      onDragStart={(event) => onDragStart(event, deal)}
      onDragEnd={onDragEnd}
      className="rounded-lg border border-border bg-card px-3 py-2 [overflow-wrap:anywhere]"
    >
      <div className="flex items-start justify-between gap-2">
        <Link
          href={href}
          draggable={false}
          className="flex min-h-11 min-w-0 items-center rounded-sm font-semibold hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
        >
          {address}
        </Link>
        {draggable && (
          <GripVertical aria-hidden="true" className="mt-3 size-4 shrink-0 cursor-grab text-muted-foreground active:cursor-grabbing" />
        )}
      </div>

      {location && <p className="text-xs text-muted-foreground">{location}</p>}

      <div className="mt-2">
        <StatusBadge status={deal.status} size="sm" />
      </div>

      <dl className="mt-2 space-y-1 text-sm">
        <div className="flex flex-wrap items-baseline justify-between gap-x-2 gap-y-1">
          <dt className="text-xs text-muted-foreground">Asking price (USD)</dt>
          <dd className="ms-auto text-end font-semibold tabular-nums">{amount}</dd>
        </div>
        {deal.seller_name && (
          <div className="text-xs text-muted-foreground">
            <dt className="inline font-medium">Seller </dt>
            <dd className="inline">{deal.seller_name}</dd>
          </div>
        )}
        {showAgent && deal.agent && (
          <div className="text-xs text-muted-foreground">
            <dt className="inline font-medium">Agent </dt>
            <dd className="inline">{deal.agent.full_name || deal.agent.email}</dd>
          </div>
        )}
      </dl>

      <div className="mt-2 flex flex-wrap justify-between gap-2 border-t border-border pt-2 text-xs text-muted-foreground">
        <span>{submitted}</span>
        {type && <span>{type}</span>}
      </div>
      <DealStageMenu deal={deal} actions={actions} />
    </li>
  );
}

export function KanbanBoard({ deals, showAgent, actions }: KanbanBoardProps) {
  const draggedDeal = useRef<DealWithProperty | null>(null);
  const stageFilterRef = useRef<HTMLSelectElement>(null);
  const [viewMode, setViewMode] = useState<"kanban" | "list">("kanban");
  const [selectedStatus, setSelectedStatus] = useState<DealStatus | "all">("all");

  const handleDragStart = (event: DragEvent, deal: DealWithProperty) => {
    if (actions.pendingDealId || !actions.movableIds.has(deal.id)) {
      event.preventDefault();
      return;
    }

    draggedDeal.current = deal;
    event.dataTransfer.effectAllowed = "move";
    event.dataTransfer.setData("text/plain", deal.id);
  };

  const handleDrop = (event: DragEvent, status: DealStatus) => {
    if (!draggedDeal.current) return;

    event.preventDefault();
    const deal = draggedDeal.current;
    draggedDeal.current = null;
    actions.move(deal, status);
  };

  const dealsByStage = new Map<DealStatus, DealWithProperty[]>();

  for (const deal of deals) {
    const group = dealsByStage.get(deal.status);
    if (group) group.push(deal);
    else dealsByStage.set(deal.status, [deal]);
  }

  const otherDeals = deals.filter((deal) => !Object.hasOwn(stageLabels, deal.status));
  const columns = dealStages.map((status) => ({
    status,
    title: stageLabels[status],
    deals: dealsByStage.get(status) ?? [],
  }));
  const visibleColumns = otherDeals.length > 0
    ? [...columns, { status: null, title: "Other stages", deals: otherDeals }]
    : columns;
  const mobileDeals = selectedStatus === "all" ? deals : dealsByStage.get(selectedStatus) ?? [];

  return (
    <div className="min-w-0">
      <div className="mb-3 flex flex-wrap items-center gap-2 md:hidden">
        <div role="group" aria-label="Mobile board layout" className="flex rounded-lg border border-border bg-card p-0.5">
          <button
            type="button"
            aria-pressed={viewMode === "kanban"}
            onClick={() => setViewMode("kanban")}
            className="flex min-h-11 items-center gap-1.5 rounded-md px-3 text-sm font-medium text-muted-foreground hover:bg-accent aria-pressed:bg-primary aria-pressed:text-primary-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
          >
            <LayoutGrid aria-hidden="true" className="size-4" />
            Columns
          </button>
          <button
            type="button"
            aria-pressed={viewMode === "list"}
            onClick={() => setViewMode("list")}
            className="flex min-h-11 items-center gap-1.5 rounded-md px-3 text-sm font-medium text-muted-foreground hover:bg-accent aria-pressed:bg-primary aria-pressed:text-primary-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
          >
            <List aria-hidden="true" className="size-4" />
            Stage list
          </button>
        </div>
        {viewMode === "list" && (
          <label className="flex min-w-0 flex-wrap items-center gap-2 text-sm font-medium">
            Stage
            <select
              ref={stageFilterRef}
              value={selectedStatus}
              onChange={(event) => setSelectedStatus(event.target.value as DealStatus | "all")}
              className="min-h-11 min-w-0 max-w-full rounded-lg border border-input bg-card px-2 text-base focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring md:text-sm"
            >
              <option value="all">All stages ({deals.length})</option>
              {columns.map((column) => (
                <option key={column.status} value={column.status}>
                  {column.title} ({column.deals.length})
                </option>
              ))}
            </select>
          </label>
        )}
      </div>

      <div className={viewMode === "list" ? "hidden md:block" : ""}>
        <div
          role="region"
          aria-label="Deal stages"
          tabIndex={0}
          className="flex max-w-full items-start gap-3 overflow-x-auto rounded-lg pb-3 focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-ring"
        >
          {visibleColumns.map((column) => (
            <section
              key={column.status ?? "other"}
              className="flex w-56 shrink-0 flex-col rounded-lg border border-border bg-muted/40 sm:w-60"
              onDragOver={(event) => {
                if (column.status && draggedDeal.current && !actions.pendingDealId) {
                  event.preventDefault();
                  event.dataTransfer.dropEffect = "move";
                }
              }}
              onDrop={(event) => { if (column.status) handleDrop(event, column.status); }}
            >
              <header className="flex items-center justify-between gap-2 border-b border-border px-3 py-2.5">
                <h3 className="text-sm font-semibold">{column.title}</h3>
                <span className="text-sm tabular-nums text-muted-foreground" aria-label={column.deals.length + " deals"}>
                  {column.deals.length}
                </span>
              </header>

              {column.deals.length > 0 ? (
                <ul className="flex flex-col gap-2 p-2">
                  {column.deals.map((deal) => (
                    <KanbanCard
                      key={deal.id}
                      deal={deal}
                      showAgent={showAgent}
                      actions={actions}
                      onDragStart={handleDragStart}
                      onDragEnd={() => { draggedDeal.current = null; }}
                    />
                  ))}
                </ul>
              ) : (
                <p className="px-3 py-4 text-sm text-muted-foreground">No deals</p>
              )}
            </section>
          ))}
        </div>
      </div>

      {viewMode === "list" && (
        <div className="md:hidden">
          {mobileDeals.length > 0 ? (
            <DealsList deals={mobileDeals} showAgent={showAgent} actions={actions} compact />
          ) : (
            <div className="rounded-lg border border-border bg-card p-4">
              <p className="text-sm text-muted-foreground">No deals in this stage.</p>
              <button
                type="button"
                onClick={() => {
                  setSelectedStatus("all");
                  stageFilterRef.current?.focus();
                }}
                className="mt-2 min-h-11 rounded-md px-2 text-sm font-medium text-primary hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
              >
                Show all stages
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
