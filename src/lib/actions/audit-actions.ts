"use server";

import { createClient } from "@/utils/supabase/server";

export type AuditAction = 
  | "create" 
  | "update" 
  | "delete" 
  | "view" 
  | "login" 
  | "logout"
  | "bulk_status_update"
  | "bulk_assignment"
  | "bulk_delete"
  | "bulk_export"
  | "bulk_priority_update"
  | "funding_request"
  | "funding_approval"
  | "funding_rejection";

export type EntityType = "deal" | "underwriting" | "user" | "comment" | "attachment" | "settings" | "funding";

export interface AuditLogEntry {
  id: string;
  user_id: string | null;
  action: AuditAction;
  entity_type: EntityType;
  entity_id: string | null;
  old_values: Record<string, unknown> | null;
  new_values: Record<string, unknown> | null;
  ip_address: string | null;
  user_agent: string | null;
  metadata: Record<string, unknown>;
  created_at: string;
  user?: {
    full_name: string | null;
    email: string;
    role: string;
  };
}

// Create an audit log entry
export async function createAuditLog(data: {
  action: AuditAction;
  entityType: EntityType;
  entityId?: string;
  oldValues?: Record<string, unknown>;
  newValues?: Record<string, unknown>;
  metadata?: Record<string, unknown>;
}): Promise<{ success: boolean; error: string | null }> {
  try {
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();

    const { error } = await supabase.from("audit_logs").insert({
      user_id: user?.id || null,
      action: data.action,
      entity_type: data.entityType,
      entity_id: data.entityId || null,
      old_values: data.oldValues || null,
      new_values: data.newValues || null,
      metadata: data.metadata || {},
    });

    if (error) {
      // Don't throw - audit logging should not break the app
      console.error("Failed to create audit log:", error);
      return { success: false, error: error.message };
    }

    return { success: true, error: null };
  } catch (error) {
    console.error("Audit log error:", error);
    return { success: false, error: "Failed to create audit log" };
  }
}

// Get audit logs with filtering
export async function getAuditLogs(options?: {
  entityType?: EntityType;
  entityId?: string;
  userId?: string;
  action?: AuditAction;
  startDate?: string;
  endDate?: string;
  limit?: number;
  offset?: number;
}): Promise<{ logs: AuditLogEntry[]; total: number; error: string | null }> {
  const supabase = await createClient();

  const { data: { user }, error: userError } = await supabase.auth.getUser();

  if (userError || !user) {
    return { logs: [], total: 0, error: "Not authenticated" };
  }

  // Check if user is admin
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "admin") {
    return { logs: [], total: 0, error: "Unauthorized - Admin access required" };
  }

  let query = supabase
    .from("audit_logs")
    .select("*", { count: "exact" })
    .order("created_at", { ascending: false });

  // Apply filters
  if (options?.entityType) {
    query = query.eq("entity_type", options.entityType);
  }
  if (options?.entityId) {
    query = query.eq("entity_id", options.entityId);
  }
  if (options?.userId) {
    query = query.eq("user_id", options.userId);
  }
  if (options?.action) {
    query = query.eq("action", options.action);
  }
  if (options?.startDate) {
    query = query.gte("created_at", options.startDate);
  }
  if (options?.endDate) {
    query = query.lte("created_at", options.endDate);
  }

  // Pagination
  const limit = options?.limit || 50;
  const offset = options?.offset || 0;
  query = query.range(offset, offset + limit - 1);

  const { data: logs, count, error } = await query;

  if (error) {
    console.error("Error fetching audit logs:", error);
    return { logs: [], total: 0, error: error.message };
  }

  // Fetch user info for each log
  if (logs && logs.length > 0) {
    const userIds = [...new Set(logs.map(l => l.user_id).filter(Boolean))];
    
    if (userIds.length > 0) {
      const { data: users } = await supabase
        .from("profiles")
        .select("id, full_name, email, role")
        .in("id", userIds);

      const userMap = new Map(users?.map(u => [u.id, u]) || []);

      const logsWithUsers = logs.map(log => ({
        ...log,
        user: log.user_id ? userMap.get(log.user_id) || null : null,
      }));

      return { logs: logsWithUsers as AuditLogEntry[], total: count || 0, error: null };
    }
  }

  return { logs: logs as AuditLogEntry[], total: count || 0, error: null };
}

// Get audit logs for a specific entity
export async function getEntityAuditLogs(
  entityType: EntityType,
  entityId: string
): Promise<{ logs: AuditLogEntry[]; error: string | null }> {
  const result = await getAuditLogs({ entityType, entityId, limit: 100 });
  return { logs: result.logs, error: result.error };
}

// Note: Helper functions (formatAuditChanges, formatAuditAction, formatEntityType)
// have been moved to @/lib/utils/audit-helpers.ts to avoid "use server" restrictions
