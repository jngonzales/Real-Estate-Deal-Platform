import { cn } from "@/lib/utils";

export type DealStatus = "submitted" | "needs_info" | "underwriting" | "offer_prepared" | "offer_sent" | "in_contract" | "funding" | "closed" | "rejected";

const statusConfig: Record<DealStatus, { label: string; className: string }> = {
  submitted: {
    label: "Submitted",
    className: "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-800",
  },
  needs_info: {
    label: "Needs Info",
    className: "bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-900/20 dark:text-orange-400 dark:border-orange-800",
  },
  underwriting: {
    label: "Underwriting",
    className: "bg-yellow-50 text-yellow-700 border-yellow-200 dark:bg-yellow-900/20 dark:text-yellow-400 dark:border-yellow-800",
  },
  offer_prepared: {
    label: "Offer Prepared",
    className: "bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-900/20 dark:text-purple-400 dark:border-purple-800",
  },
  offer_sent: {
    label: "Offer Sent",
    className: "bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-900/20 dark:text-indigo-400 dark:border-indigo-800",
  },
  in_contract: {
    label: "In Contract",
    className: "bg-cyan-50 text-cyan-700 border-cyan-200 dark:bg-cyan-900/20 dark:text-cyan-400 dark:border-cyan-800",
  },
  funding: {
    label: "Funding",
    className: "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/20 dark:text-emerald-400 dark:border-emerald-800",
  },
  closed: {
    label: "Closed",
    className: "bg-green-50 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800",
  },
  rejected: {
    label: "Rejected",
    className: "bg-red-50 text-red-700 border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800",
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
    className: "bg-muted text-muted-foreground border-border",
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
