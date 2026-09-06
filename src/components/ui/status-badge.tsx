import { cn } from "@/lib/utils";

export type DealStatus = "submitted" | "needs_info" | "underwriting" | "offer_prepared" | "offer_sent" | "in_contract" | "funding" | "closed" | "rejected";

const GRAY_PILL = "bg-muted text-muted-foreground border-border dark:bg-muted dark:text-muted-foreground dark:border-border";
const AMBER_PILL = "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900/20 dark:text-amber-400 dark:border-amber-800";
const EMERALD_PILL = "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/20 dark:text-emerald-400 dark:border-emerald-800";
const RED_PILL = "bg-red-50 text-red-700 border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800";

const statusConfig: Record<DealStatus, { label: string; className: string }> = {
  submitted: {
    label: "Submitted",
    className: GRAY_PILL,
  },
  needs_info: {
    label: "Needs info",
    className: AMBER_PILL,
  },
  underwriting: {
    label: "Underwriting",
    className: GRAY_PILL,
  },
  offer_prepared: {
    label: "Offer prepared",
    className: GRAY_PILL,
  },
  offer_sent: {
    label: "Offer sent",
    className: GRAY_PILL,
  },
  in_contract: {
    label: "In contract",
    className: GRAY_PILL,
  },
  funding: {
    label: "Funding",
    className: GRAY_PILL,
  },
  closed: {
    label: "Closed",
    className: EMERALD_PILL,
  },
  rejected: {
    label: "Rejected",
    className: RED_PILL,
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
        "inline-flex max-w-full items-center rounded-md border font-medium [overflow-wrap:anywhere]",
        sizeClasses[size],
        config.className,
        className
      )}
    >
      {config.label}
    </span>
  );
}
