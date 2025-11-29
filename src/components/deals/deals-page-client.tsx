"use client";

import { useState } from "react";
import { DealWithProperty } from "@/lib/actions/deal-actions";
import { DealsList } from "./deals-list";
import { KanbanBoard } from "./kanban-board";
import { List, LayoutGrid, Plus } from "lucide-react";
import Link from "next/link";

type ViewMode = "list" | "kanban";

interface DealsPageClientProps {
  deals: DealWithProperty[];
}

export function DealsPageClient({ deals }: DealsPageClientProps) {
  const [viewMode, setViewMode] = useState<ViewMode>("list");

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">My Deals</h2>
          <p className="text-slate-600 dark:text-slate-400">
            View and manage all your submitted deals.
          </p>
        </div>
        <div className="flex items-center gap-3">
          {/* View Toggle */}
          <div className="flex items-center rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-1">
            <button
              onClick={() => setViewMode("list")}
              className={`flex items-center rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
                viewMode === "list"
                  ? "bg-blue-600 text-white"
                  : "text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white"
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
                  : "text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white"
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

      {/* Stats */}
      {deals.length > 0 && (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-5">
          <StatCard
            label="Total"
            count={deals.length}
            color="bg-slate-100 text-slate-800"
          />
          <StatCard
            label="Submitted"
            count={deals.filter((d) => d.status === "submitted").length}
            color="bg-blue-100 text-blue-800"
          />
          <StatCard
            label="Underwriting"
            count={deals.filter((d) => d.status === "underwriting").length}
            color="bg-yellow-100 text-yellow-800"
          />
          <StatCard
            label="Approved"
            count={deals.filter((d) => d.status === "approved").length}
            color="bg-green-100 text-green-800"
          />
          <StatCard
            label="Closed"
            count={deals.filter((d) => d.status === "closed").length}
            color="bg-slate-100 text-slate-800"
          />
        </div>
      )}

      {/* Content */}
      {viewMode === "list" ? (
        <DealsList deals={deals} />
      ) : (
        <KanbanBoard deals={deals} />
      )}
    </div>
  );
}

function StatCard({
  label,
  count,
  color,
}: {
  label: string;
  count: number;
  color: string;
}) {
  return (
    <div className="rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-4">
      <p className="text-sm text-slate-500 dark:text-slate-400">{label}</p>
      <p className="mt-1 text-2xl font-semibold text-slate-900 dark:text-white">{count}</p>
      <div className={`mt-2 inline-block rounded px-2 py-0.5 text-xs font-medium ${color}`}>
        {label}
      </div>
    </div>
  );
}
