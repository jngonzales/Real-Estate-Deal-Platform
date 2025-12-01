"use client";

import { useState } from "react";
import { format } from "date-fns";
import {
  Search,
  Filter,
  ChevronDown,
  ChevronRight,
  User,
  FileText,
  Settings,
  MessageSquare,
  Image,
  Calculator,
  LogIn,
  LogOut,
  Plus,
  Edit,
  Trash2,
  Eye,
  Clock,
  AlertCircle,
} from "lucide-react";
import {
  type AuditLogEntry,
  type AuditAction,
  type EntityType,
  getAuditLogs,
} from "@/lib/actions/audit-actions";
import {
  formatAuditAction,
  formatEntityType,
  formatAuditChanges,
} from "@/lib/utils/audit-helpers";

interface AuditLogsClientProps {
  initialLogs: AuditLogEntry[];
  totalCount: number;
  error: string | null;
}

const actionIcons: Record<string, typeof Plus> = {
  create: Plus,
  update: Edit,
  delete: Trash2,
  view: Eye,
  login: LogIn,
  logout: LogOut,
};

const entityIcons: Record<string, typeof FileText> = {
  deal: FileText,
  underwriting: Calculator,
  user: User,
  comment: MessageSquare,
  attachment: Image,
  settings: Settings,
};

const actionColors: Record<string, string> = {
  create: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
  update: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  delete: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
  view: "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400",
  login: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400",
  logout: "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400",
};

export function AuditLogsClient({ initialLogs, totalCount, error }: AuditLogsClientProps) {
  const [logs, setLogs] = useState<AuditLogEntry[]>(initialLogs);
  const [total, setTotal] = useState(totalCount);
  const [isLoading, setIsLoading] = useState(false);
  const [expandedLog, setExpandedLog] = useState<string | null>(null);
  
  // Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [actionFilter, setActionFilter] = useState<AuditAction | "">("");
  const [entityFilter, setEntityFilter] = useState<EntityType | "">("");
  const [showFilters, setShowFilters] = useState(false);
  
  // Pagination
  const [page, setPage] = useState(0);
  const pageSize = 50;

  const handleSearch = async () => {
    setIsLoading(true);
    const result = await getAuditLogs({
      action: actionFilter || undefined,
      entityType: entityFilter || undefined,
      limit: pageSize,
      offset: page * pageSize,
    });
    setLogs(result.logs);
    setTotal(result.total);
    setIsLoading(false);
  };

  const handleLoadMore = async () => {
    setIsLoading(true);
    const newPage = page + 1;
    const result = await getAuditLogs({
      action: actionFilter || undefined,
      entityType: entityFilter || undefined,
      limit: pageSize,
      offset: newPage * pageSize,
    });
    setLogs([...logs, ...result.logs]);
    setPage(newPage);
    setIsLoading(false);
  };

  const toggleExpand = (logId: string) => {
    setExpandedLog(expandedLog === logId ? null : logId);
  };

  if (error) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-6 dark:border-red-800 dark:bg-red-900/20">
        <div className="flex items-center gap-2 text-red-700 dark:text-red-400">
          <AlertCircle className="h-5 w-5" />
          <p>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Search and Filters */}
      <div className="rounded-lg border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-900">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          {/* Search */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search logs..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-lg border border-slate-200 bg-white py-2 pl-10 pr-4 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
            />
          </div>

          {/* Filter Toggle */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2 rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
          >
            <Filter className="h-4 w-4" />
            Filters
            <ChevronDown className={`h-4 w-4 transition-transform ${showFilters ? "rotate-180" : ""}`} />
          </button>
        </div>

        {/* Filter Options */}
        {showFilters && (
          <div className="mt-4 flex flex-wrap gap-4 border-t border-slate-200 pt-4 dark:border-slate-700">
            <div>
              <label className="mb-1 block text-xs font-medium text-slate-500 dark:text-slate-400">
                Action
              </label>
              <select
                value={actionFilter}
                onChange={(e) => {
                  setActionFilter(e.target.value as AuditAction | "");
                  setPage(0);
                }}
                className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              >
                <option value="">All Actions</option>
                <option value="create">Created</option>
                <option value="update">Updated</option>
                <option value="delete">Deleted</option>
                <option value="view">Viewed</option>
                <option value="login">Login</option>
                <option value="logout">Logout</option>
              </select>
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-slate-500 dark:text-slate-400">
                Entity Type
              </label>
              <select
                value={entityFilter}
                onChange={(e) => {
                  setEntityFilter(e.target.value as EntityType | "");
                  setPage(0);
                }}
                className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              >
                <option value="">All Types</option>
                <option value="deal">Deals</option>
                <option value="underwriting">Underwriting</option>
                <option value="user">Users</option>
                <option value="comment">Comments</option>
                <option value="attachment">Attachments</option>
                <option value="settings">Settings</option>
              </select>
            </div>
            <div className="flex items-end">
              <button
                onClick={handleSearch}
                disabled={isLoading}
                className="rounded-lg bg-blue-600 px-4 py-1.5 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
              >
                Apply Filters
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Stats */}
      <div className="flex items-center justify-between text-sm text-slate-500 dark:text-slate-400">
        <span>Showing {logs.length} of {total} entries</span>
        <span className="flex items-center gap-1">
          <Clock className="h-4 w-4" />
          Last updated: {format(new Date(), "MMM d, h:mm a")}
        </span>
      </div>

      {/* Logs List */}
      <div className="space-y-2">
        {logs.length === 0 ? (
          <div className="rounded-lg border border-slate-200 bg-white p-8 text-center dark:border-slate-700 dark:bg-slate-900">
            <FileText className="mx-auto h-12 w-12 text-slate-300 dark:text-slate-600" />
            <p className="mt-2 text-slate-500 dark:text-slate-400">No audit logs found</p>
          </div>
        ) : (
          logs.map((log) => {
            const ActionIcon = actionIcons[log.action] || Edit;
            const EntityIcon = entityIcons[log.entity_type] || FileText;
            const isExpanded = expandedLog === log.id;
            const changes = formatAuditChanges(log.old_values, log.new_values);

            return (
              <div
                key={log.id}
                className="rounded-lg border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-900"
              >
                {/* Log Header */}
                <button
                  onClick={() => toggleExpand(log.id)}
                  className="flex w-full items-center gap-4 p-4 text-left hover:bg-slate-50 dark:hover:bg-slate-800"
                >
                  {/* Expand Icon */}
                  <div className="text-slate-400">
                    {isExpanded ? (
                      <ChevronDown className="h-4 w-4" />
                    ) : (
                      <ChevronRight className="h-4 w-4" />
                    )}
                  </div>

                  {/* Action Badge */}
                  <div className={`flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${actionColors[log.action]}`}>
                    <ActionIcon className="h-3 w-3" />
                    {formatAuditAction(log.action)}
                  </div>

                  {/* Entity Type */}
                  <div className="flex items-center gap-1.5 text-sm text-slate-600 dark:text-slate-300">
                    <EntityIcon className="h-4 w-4" />
                    {formatEntityType(log.entity_type)}
                  </div>

                  {/* User */}
                  <div className="flex-1 text-sm">
                    <span className="font-medium text-slate-900 dark:text-white">
                      {log.user?.full_name || log.user?.email || "System"}
                    </span>
                    {log.user?.role && (
                      <span className="ml-2 text-xs text-slate-500 dark:text-slate-400">
                        ({log.user.role})
                      </span>
                    )}
                  </div>

                  {/* Timestamp */}
                  <div className="text-right text-xs text-slate-500 dark:text-slate-400">
                    {format(new Date(log.created_at), "MMM d, yyyy")}
                    <br />
                    {format(new Date(log.created_at), "h:mm:ss a")}
                  </div>
                </button>

                {/* Expanded Details */}
                {isExpanded && (
                  <div className="border-t border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-800/50">
                    <div className="grid gap-4 sm:grid-cols-2">
                      {/* Entity ID */}
                      {log.entity_id && (
                        <div>
                          <label className="text-xs font-medium text-slate-500 dark:text-slate-400">
                            Entity ID
                          </label>
                          <p className="mt-1 font-mono text-sm text-slate-900 dark:text-white">
                            {log.entity_id}
                          </p>
                        </div>
                      )}

                      {/* Log ID */}
                      <div>
                        <label className="text-xs font-medium text-slate-500 dark:text-slate-400">
                          Log ID
                        </label>
                        <p className="mt-1 font-mono text-sm text-slate-900 dark:text-white">
                          {log.id}
                        </p>
                      </div>
                    </div>

                    {/* Changes */}
                    {changes.length > 0 && (
                      <div className="mt-4">
                        <label className="text-xs font-medium text-slate-500 dark:text-slate-400">
                          Changes
                        </label>
                        <div className="mt-2 overflow-x-auto rounded-lg border border-slate-200 dark:border-slate-700">
                          <table className="min-w-full text-sm">
                            <thead className="bg-slate-100 dark:bg-slate-800">
                              <tr>
                                <th className="px-3 py-2 text-left font-medium text-slate-600 dark:text-slate-300">
                                  Field
                                </th>
                                <th className="px-3 py-2 text-left font-medium text-slate-600 dark:text-slate-300">
                                  Old Value
                                </th>
                                <th className="px-3 py-2 text-left font-medium text-slate-600 dark:text-slate-300">
                                  New Value
                                </th>
                              </tr>
                            </thead>
                            <tbody className="bg-white dark:bg-slate-900">
                              {changes.slice(0, 10).map((change, idx) => (
                                <tr key={idx} className="border-t border-slate-200 dark:border-slate-700">
                                  <td className="px-3 py-2 font-medium text-slate-700 dark:text-slate-300">
                                    {change.field}
                                  </td>
                                  <td className="px-3 py-2 text-slate-500 dark:text-slate-400">
                                    {change.old.slice(0, 50)}{change.old.length > 50 ? "..." : ""}
                                  </td>
                                  <td className="px-3 py-2 text-slate-900 dark:text-white">
                                    {change.new.slice(0, 50)}{change.new.length > 50 ? "..." : ""}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                          {changes.length > 10 && (
                            <p className="p-2 text-center text-xs text-slate-500">
                              + {changes.length - 10} more fields
                            </p>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Metadata */}
                    {Object.keys(log.metadata || {}).length > 0 && (
                      <div className="mt-4">
                        <label className="text-xs font-medium text-slate-500 dark:text-slate-400">
                          Metadata
                        </label>
                        <pre className="mt-1 overflow-x-auto rounded bg-slate-900 p-3 text-xs text-slate-300">
                          {JSON.stringify(log.metadata, null, 2)}
                        </pre>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Load More */}
      {logs.length < total && (
        <div className="text-center">
          <button
            onClick={handleLoadMore}
            disabled={isLoading}
            className="rounded-lg border border-slate-200 px-6 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
          >
            {isLoading ? "Loading..." : `Load More (${total - logs.length} remaining)`}
          </button>
        </div>
      )}
    </div>
  );
}
