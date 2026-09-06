import type { ReactNode } from "react";
import Link from "next/link";
import { WorkspaceHeading } from "@/components/layout/workspace-heading";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "@/components/ui/icons";
import { StatusBadge } from "@/components/ui/status-badge";

interface DealWorkspaceHeadingProps {
  address?: string | null;
  location?: string;
  section?: string;
  status?: string | null;
  backHref: string;
  backLabel: string;
  actions?: ReactNode;
}

export function DealWorkspaceHeading({
  address,
  location,
  section,
  status,
  backHref,
  backLabel,
  actions,
}: DealWorkspaceHeadingProps) {
  const description = [location, section].filter(Boolean).join(" · ");

  return (
    <div className="space-y-2">
      <Button variant="ghost" className="-ms-2 min-h-11 px-2" asChild>
        <Link href={backHref}>
          <ArrowLeft aria-hidden="true" />
          {backLabel}
        </Link>
      </Button>
      <WorkspaceHeading title={address || "Property address unavailable"} description={description || undefined} actions={actions} />
      {status && <StatusBadge status={status} />}
    </div>
  );
}

const currencyFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});

export function formatDealCurrency(amount: number | null | undefined) {
  return amount == null ? "Not recorded" : currencyFormatter.format(amount);
}
