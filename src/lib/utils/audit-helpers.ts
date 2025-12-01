// Audit log formatting helpers - these are pure functions, not server actions

export function formatValue(value: unknown): string {
  if (value === null || value === undefined) return "—";
  if (typeof value === "object") return JSON.stringify(value);
  return String(value);
}

// Helper to format changes for display
export function formatAuditChanges(
  oldValues: Record<string, unknown> | null,
  newValues: Record<string, unknown> | null
): { field: string; old: string; new: string }[] {
  const changes: { field: string; old: string; new: string }[] = [];
  
  if (!oldValues && newValues) {
    // Create action - show new values
    Object.entries(newValues).forEach(([key, value]) => {
      changes.push({
        field: key,
        old: "—",
        new: formatValue(value),
      });
    });
  } else if (oldValues && newValues) {
    // Update action - show changed fields
    const allKeys = new Set([...Object.keys(oldValues), ...Object.keys(newValues)]);
    allKeys.forEach(key => {
      const oldVal = oldValues[key];
      const newVal = newValues[key];
      if (JSON.stringify(oldVal) !== JSON.stringify(newVal)) {
        changes.push({
          field: key,
          old: formatValue(oldVal),
          new: formatValue(newVal),
        });
      }
    });
  } else if (oldValues && !newValues) {
    // Delete action - show old values
    Object.entries(oldValues).forEach(([key, value]) => {
      changes.push({
        field: key,
        old: formatValue(value),
        new: "—",
      });
    });
  }

  return changes;
}

// Action label formatting
export function formatAuditAction(action: string): string {
  const labels: Record<string, string> = {
    create: "Created",
    update: "Updated",
    delete: "Deleted",
    view: "Viewed",
    login: "Logged in",
    logout: "Logged out",
  };
  return labels[action] || action;
}

// Entity type label formatting
export function formatEntityType(entityType: string): string {
  const labels: Record<string, string> = {
    deal: "Deal",
    underwriting: "Underwriting",
    user: "User",
    comment: "Comment",
    attachment: "Attachment",
    settings: "Settings",
  };
  return labels[entityType] || entityType;
}
