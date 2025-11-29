import { cn } from "@/lib/utils";

export type DealStatus = "submitted" | "underwriting" | "approved" | "rejected" | "closed";

const statusConfig: Record<DealStatus, { label: string; className: string }> = {
  submitted: {
    label: "New",
    className: "bg-blue-100 text-blue-800 border-blue-200",
  },
  underwriting: {
    label: "Underwriting",
    className: "bg-yellow-100 text-yellow-800 border-yellow-200",
  },
  approved: {
    label: "Approved",
    className: "bg-green-100 text-green-800 border-green-200",
  },
  rejected: {
    label: "Rejected",
    className: "bg-red-100 text-red-800 border-red-200",
  },
  closed: {
    label: "Closed",
    className: "bg-emerald-100 text-emerald-800 border-emerald-200",
  },
};

interface StatusBadgeProps {
  status: DealStatus | string;
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function StatusBadge({ status, size = "md", className }: StatusBadgeProps) {
  const config = statusConfig[status as DealStatus] || {
    label: status.charAt(0).toUpperCase() + status.slice(1),
    className: "bg-slate-100 text-slate-800 border-slate-200",
  };

  const sizeClasses = {
    sm: "px-1.5 py-0.5 text-xs",
    md: "px-2 py-1 text-xs",
    lg: "px-3 py-1.5 text-sm",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border font-semibold",
        sizeClasses[size],
        config.className,
        className
      )}
    >
      {config.label}
    </span>
  );
}
