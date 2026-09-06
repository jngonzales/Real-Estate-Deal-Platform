"use client";

import { useRef, useState } from "react";
import { ChevronDown, ChevronRight } from "@/components/ui/icons";
import { Button } from "@/components/ui/button";
import { type AuditLogEntry, type AuditAction, type EntityType, getAuditLogs } from "@/lib/actions/audit-actions";
import { formatAuditAction, formatEntityType, formatAuditChanges } from "@/lib/utils/audit-helpers";

interface AuditLogsClientProps {
  initialLogs: AuditLogEntry[];
  totalCount: number;
  error: string | null;
}

type Filters = { action: AuditAction | ""; entityType: EntityType | "" };

const initialFilters: Filters = { action: "", entityType: "" };
const pageSize = 50;
const dateFormat = new Intl.DateTimeFormat("en-US", { dateStyle: "medium", timeStyle: "medium", timeZone: "UTC" });
const inputClass = "min-h-11 w-full rounded-md border border-input bg-card px-3 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring sm:text-sm";

export function AuditLogsClient({ initialLogs, totalCount, error }: AuditLogsClientProps) {
  const [logs, setLogs] = useState(initialLogs);
  const [total, setTotal] = useState(totalCount);
  const [isLoading, setIsLoading] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [expandedLog, setExpandedLog] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filters, setFilters] = useState(initialFilters);
  const [applied, setApplied] = useState(initialFilters);
  const [showFilters, setShowFilters] = useState(false);
  const [page, setPage] = useState(0);
  const entriesRef = useRef<HTMLParagraphElement>(null);

  const loadLogs = async (nextFilters: Filters, nextPage: number) => {
    if (isLoading) return;
    setIsLoading(true);
    setLoadError(null);

    try {
      const result = await getAuditLogs({
        action: nextFilters.action || undefined,
        entityType: nextFilters.entityType || undefined,
        limit: pageSize,
        offset: nextPage * pageSize,
      });
      if (result.error) {
        setLoadError(result.error);
        return;
      }
      setLogs((current) => nextPage === 0 ? result.logs : [...current, ...result.logs]);
      setTotal(result.total);
      setApplied(nextFilters);
      setPage(nextPage);
      if (nextPage > 0 && logs.length + result.logs.length >= result.total) entriesRef.current?.focus();
    } catch {
      setLoadError("Couldn’t load audit logs. Try again.");
    } finally {
      setIsLoading(false);
    }
  };

  if (error) {
    return <p role="alert" className="rounded-lg border border-border bg-card p-4 text-sm text-destructive">{error}</p>;
  }

  const query = searchQuery.trim().toLowerCase();
  const visibleLogs = query
    ? logs.filter((log) => [log.user?.full_name, log.user?.email, log.user?.role, formatAuditAction(log.action), formatEntityType(log.entity_type), log.entity_id, log.id]
        .some((value) => value?.toLowerCase().includes(query)))
    : logs;

  return (
    <div className="min-w-0 space-y-4">
      <section aria-label="Audit log filters" className="rounded-lg border border-border bg-card p-4">
        <div className="flex flex-wrap items-end gap-3">
          <div className="min-w-0 flex-1 basis-44 space-y-1">
            <label htmlFor="audit-search" className="text-sm font-medium">Search loaded entries</label>
            <input id="audit-search" type="search" value={searchQuery} onChange={(event) => setSearchQuery(event.target.value)} className={inputClass} />
          </div>
          <Button
            variant="outline"
            className="min-h-11"
            aria-expanded={showFilters}
            aria-controls={showFilters ? "audit-filters" : undefined}
            onClick={() => setShowFilters((open) => !open)}
          >
            Filters
            <ChevronDown aria-hidden="true" className={showFilters ? "size-4 rotate-180" : "size-4"} />
          </Button>
        </div>

        {showFilters && (
          <form
            id="audit-filters"
            onSubmit={(event) => { event.preventDefault(); void loadLogs(filters, 0); }}
            className="mt-4 flex flex-wrap items-end gap-3 border-t border-border pt-4"
          >
            <div className="min-w-0 flex-1 basis-36 space-y-1">
              <label htmlFor="audit-action" className="text-sm font-medium">Action</label>
              <select id="audit-action" value={filters.action} onChange={(event) => setFilters({ ...filters, action: event.target.value as Filters["action"] })} className={inputClass}>
                <option value="">All actions</option>
                <option value="create">Created</option>
                <option value="update">Updated</option>
                <option value="delete">Deleted</option>
                <option value="view">Viewed</option>
                <option value="login">Login</option>
                <option value="logout">Logout</option>
              </select>
            </div>
            <div className="min-w-0 flex-1 basis-36 space-y-1">
              <label htmlFor="audit-entity" className="text-sm font-medium">Entity type</label>
              <select id="audit-entity" value={filters.entityType} onChange={(event) => setFilters({ ...filters, entityType: event.target.value as Filters["entityType"] })} className={inputClass}>
                <option value="">All types</option>
                <option value="deal">Deals</option>
                <option value="underwriting">Underwriting</option>
                <option value="user">Users</option>
                <option value="comment">Comments</option>
                <option value="attachment">Attachments</option>
                <option value="settings">Settings</option>
              </select>
            </div>
            <Button type="submit" className="min-h-11" disabled={isLoading}>Apply filters</Button>
          </form>
        )}
      </section>

      <p ref={entriesRef} role="status" tabIndex={-1} className="rounded-sm text-sm text-muted-foreground tabular-nums focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring">
        {isLoading ? "Loading entries…" : query
          ? visibleLogs.length + " matching entries in " + logs.length + " loaded"
          : logs.length + " of " + total + " entries loaded"}
      </p>
      <p role="alert" className={loadError ? "text-sm text-destructive" : "sr-only"}>{loadError}</p>

      {visibleLogs.length === 0 ? (
        <p className="rounded-lg border border-border bg-card p-4 text-sm text-muted-foreground">
          {query || applied.action || applied.entityType ? "No audit entries match." : "No audit entries yet."}
        </p>
      ) : (
        <ul aria-label="Audit entries" className="divide-y divide-border rounded-lg border border-border bg-card">
          {visibleLogs.map((log) => {
            const isExpanded = expandedLog === log.id;
            const changes = isExpanded ? formatAuditChanges(log.old_values, log.new_values) : [];
            const detailsId = "audit-details-" + log.id;

            return (
              <li key={log.id}>
                <button
                  type="button"
                  aria-expanded={isExpanded}
                  aria-controls={isExpanded ? detailsId : undefined}
                  onClick={() => setExpandedLog(isExpanded ? null : log.id)}
                  className="grid w-full min-w-0 grid-cols-[minmax(0,1fr)_auto] items-start gap-x-3 gap-y-2 rounded-sm p-4 text-start text-sm hover:bg-accent/50 focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-ring xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_auto_auto] [overflow-wrap:anywhere]"
                >
                  <span className="min-w-0 font-semibold">
                    {formatAuditAction(log.action)}
                    <span className="ms-2 font-normal text-muted-foreground">{formatEntityType(log.entity_type)}</span>
                  </span>
                  <span className="col-start-1 row-start-2 min-w-0 text-muted-foreground xl:col-start-auto xl:row-start-auto">
                    {log.user?.full_name || log.user?.email || "System"}
                    {log.user?.role && <span className="ms-1">({log.user.role})</span>}
                  </span>
                  <time dateTime={log.created_at} className="col-start-1 row-start-3 text-xs text-muted-foreground tabular-nums xl:col-start-auto xl:row-start-auto">
                    {dateFormat.format(new Date(log.created_at))} UTC
                  </time>
                  {isExpanded
                    ? <ChevronDown aria-hidden="true" className="col-start-2 row-start-1 size-4 text-muted-foreground xl:col-start-auto xl:row-start-auto" />
                    : <ChevronRight aria-hidden="true" className="col-start-2 row-start-1 size-4 text-muted-foreground xl:col-start-auto xl:row-start-auto" />}
                </button>

                {isExpanded && (
                  <div id={detailsId} className="space-y-4 border-t border-border bg-muted/40 p-4 [overflow-wrap:anywhere]">
                    <dl className="grid gap-3 sm:grid-cols-2">
                      {log.entity_id && (
                        <div className="min-w-0">
                          <dt className="text-xs text-muted-foreground">Entity ID</dt>
                          <dd className="mt-1 font-mono text-sm">{log.entity_id}</dd>
                        </div>
                      )}
                      <div className="min-w-0">
                        <dt className="text-xs text-muted-foreground">Log ID</dt>
                        <dd className="mt-1 font-mono text-sm">{log.id}</dd>
                      </div>
                    </dl>

                    {changes.length > 0 && (
                      <div className="rounded-lg border border-border bg-card">
                        <table className="w-full table-fixed text-start text-sm">
                          <caption className="px-3 pt-3 text-start font-semibold">Changes</caption>
                          <thead className="border-b border-border text-xs text-muted-foreground [&_th]:px-3 [&_th]:py-2 [&_th]:text-start">
                            <tr>
                              <th scope="col">Field</th>
                              <th scope="col">Old value</th>
                              <th scope="col">New value</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-border [&_td]:p-3 [&_td]:align-top">
                            {changes.slice(0, 10).map((change, index) => (
                              <tr key={index}>
                                <td className="font-medium">{change.field}</td>
                                <td className="text-muted-foreground">{change.old.slice(0, 50)}{change.old.length > 50 ? "…" : ""}</td>
                                <td>{change.new.slice(0, 50)}{change.new.length > 50 ? "…" : ""}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                        {changes.length > 10 && <p className="border-t border-border p-3 text-xs text-muted-foreground">{changes.length - 10} more fields</p>}
                      </div>
                    )}

                    {Object.keys(log.metadata || {}).length > 0 && (
                      <div>
                        <p className="text-xs font-medium text-muted-foreground">Metadata</p>
                        <pre className="mt-1 whitespace-pre-wrap rounded bg-card p-3 text-xs [overflow-wrap:anywhere]">{JSON.stringify(log.metadata, null, 2)}</pre>
                      </div>
                    )}
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      )}

      {logs.length < total && (
        <Button variant="outline" className="min-h-11" onClick={() => loadLogs(applied, page + 1)} disabled={isLoading}>
          {isLoading ? "Loading…" : "Load more (" + (total - logs.length) + " remaining)"}
        </Button>
      )}
    </div>
  );
}
