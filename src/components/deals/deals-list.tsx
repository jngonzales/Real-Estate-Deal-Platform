"use client";

import { useRef } from "react";
import type { DealStatus, DealWithProperty } from "@/lib/actions/deal-actions";
import { StatusBadge } from "@/components/ui/status-badge";
import { ChevronDown } from "@/components/ui/icons";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { formatDistanceToNow } from "date-fns";
import Link from "next/link";

export const stageLabels: Record<DealStatus, string> = {
  submitted: "Submitted",
  needs_info: "Needs info",
  underwriting: "Underwriting",
  offer_prepared: "Offer prepared",
  offer_sent: "Offer sent",
  in_contract: "In contract",
  funding: "Funding",
  closed: "Closed",
  rejected: "Rejected",
};

export const dealStages = Object.keys(stageLabels) as DealStatus[];

const propertyTypeLabels: Record<string, string> = {
  single_family: "Single family",
  multi_family: "Multi-family",
  condo: "Condo",
  townhouse: "Townhouse",
  land: "Land",
  commercial: "Commercial",
  other: "Other",
};

const amountFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});

export function describeDeal(deal: DealWithProperty) {
  const property = deal.property;
  const location = [property?.city, [property?.state, property?.zip].filter(Boolean).join(" ")]
    .filter(Boolean)
    .join(", ");

  return {
    address: property?.address || "Address unavailable",
    location: [location, property?.country !== "US" ? property?.country : null].filter(Boolean).join(", "),
    type: property && (propertyTypeLabels[property.property_type] || property.property_type),
    amount: deal.asking_price == null ? "Not recorded" : amountFormatter.format(deal.asking_price),
    submitted: formatDistanceToNow(new Date(deal.submitted_at), { addSuffix: true }),
    href: "/dashboard/deals/" + deal.id,
  };
}

export interface DealStageActions {
  movableIds: ReadonlySet<string>;
  pendingDealId: string | null;
  move: (deal: DealWithProperty, status: DealStatus, trigger?: HTMLButtonElement | null) => void;
}

export function DealStageMenu({ deal, actions }: { deal: DealWithProperty; actions: DealStageActions }) {
  const triggerRef = useRef<HTMLButtonElement>(null);

  if (!actions.movableIds.has(deal.id)) return null;

  const blocked = actions.pendingDealId !== null;
  const pending = actions.pendingDealId === deal.id;
  const label = pending ? "Changing stage…" : "Change stage";
  const address = deal.property?.address || "this deal";

  return (
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger
        ref={triggerRef}
        aria-label={label + " for " + address}
        aria-disabled={blocked || undefined}
        data-deal-stage-trigger={deal.id}
        onPointerDown={(event) => { if (blocked) event.preventDefault(); }}
        onKeyDown={(event) => {
          if (blocked && ["Enter", " ", "ArrowDown"].includes(event.key)) event.preventDefault();
        }}
        className="inline-flex min-h-11 max-w-full items-center gap-1.5 rounded-md px-1.5 text-start text-sm font-medium text-primary hover:bg-accent focus-visible:outline-2 focus-visible:outline-ring aria-disabled:cursor-wait aria-disabled:text-muted-foreground aria-disabled:hover:bg-transparent"
      >
        {label}
        <ChevronDown aria-hidden="true" className="size-3.5 shrink-0" />
      </DropdownMenuTrigger>
      <DropdownMenuContent
        aria-label={"Stage for " + address}
        align="start"
        className="w-44 data-[state=open]:animate-none motion-reduce:animate-none"
      >
        <DropdownMenuRadioGroup
          value={deal.status}
          onValueChange={(status) => actions.move(deal, status as DealStatus, triggerRef.current)}
        >
          {dealStages.map((status) => (
            <DropdownMenuRadioItem
              key={status}
              value={status}
              disabled={blocked}
              className="min-h-11 focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-ring"
            >
              {stageLabels[status]}
            </DropdownMenuRadioItem>
          ))}
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

interface DealsListProps {
  deals: DealWithProperty[];
  showAgent: boolean;
  actions: DealStageActions;
  compact?: boolean;
}

const addressLinkClass = "flex min-h-11 min-w-0 flex-col justify-center rounded-sm [overflow-wrap:anywhere] hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring";

export function DealsList({ deals, showAgent, actions, compact = false }: DealsListProps) {
  return (
    <>
      <ul className={"divide-y divide-border rounded-lg border border-border bg-card " + (compact ? "md:hidden" : "lg:hidden")}>
        {deals.map((deal) => {
          const { address, location, type, amount, submitted, href } = describeDeal(deal);

          return (
            <li key={deal.id} className="p-4 [overflow-wrap:anywhere]">
              <Link href={href} className={addressLinkClass}>
                <span className="font-semibold">{address}</span>
                {location && <span className="text-sm text-muted-foreground">{location}</span>}
              </Link>
              <dl className="mt-3 grid grid-cols-2 gap-x-3 gap-y-2 text-sm">
                <div className="min-w-0">
                  <dt className="text-xs text-muted-foreground">Stage</dt>
                  <dd className="mt-1"><StatusBadge status={deal.status} size="sm" /></dd>
                </div>
                <div className="min-w-0 text-end">
                  <dt className="text-xs text-muted-foreground">Asking price (USD)</dt>
                  <dd className="mt-1 font-semibold tabular-nums">{amount}</dd>
                </div>
                <div>
                  <dt className="text-xs text-muted-foreground">Submitted</dt>
                  <dd>{submitted}</dd>
                </div>
                {!compact && type && (
                  <div>
                    <dt className="text-xs text-muted-foreground">Property type</dt>
                    <dd>{type}</dd>
                  </div>
                )}
                {!compact && showAgent && deal.agent && (
                  <div className="col-span-2">
                    <dt className="text-xs text-muted-foreground">Agent</dt>
                    <dd>{deal.agent.full_name || deal.agent.email}</dd>
                  </div>
                )}
              </dl>
              <DealStageMenu deal={deal} actions={actions} />
            </li>
          );
        })}
      </ul>

      {!compact && (
        <div
          role="region"
          aria-label="Property deals table"
          tabIndex={0}
          className="hidden max-w-full overflow-x-auto rounded-lg border border-border bg-card focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring lg:block"
        >
          <table className="w-full min-w-[47rem] table-fixed text-sm">
            <caption className="sr-only">Property deals</caption>
            <thead className="border-b border-border text-start text-sm text-muted-foreground [&_th]:px-3 [&_th]:py-3 [&_th]:font-medium">
              <tr>
                <th scope="col" className="w-1/4 text-start">Property address</th>
                <th scope="col" className="w-[8.5rem] text-start">Stage</th>
                <th scope="col" className="w-[7.5rem] text-end">Asking price (USD)</th>
                <th scope="col" className="text-start">Property type</th>
                <th scope="col" className="text-start">Seller</th>
                {showAgent && <th scope="col" className="text-start">Agent</th>}
                <th scope="col" className="text-start">Submitted</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border [&_td]:px-3 [&_td]:py-3 [&_td]:align-top [&_td]:[overflow-wrap:anywhere]">
              {deals.map((deal) => {
                const { address, location, type, amount, submitted, href } = describeDeal(deal);

                return (
                  <tr key={deal.id} className="hover:bg-accent/40 focus-within:bg-accent/40">
                    <th scope="row" className="px-3 py-1.5 text-start align-top">
                      <Link href={href} className={addressLinkClass}>
                        <span className="font-semibold">{address}</span>
                        {location && <span className="text-xs font-normal text-muted-foreground">{location}</span>}
                      </Link>
                    </th>
                    <td className="space-y-1">
                      <StatusBadge status={deal.status} size="sm" />
                      <div><DealStageMenu deal={deal} actions={actions} /></div>
                    </td>
                    <td className="text-end font-semibold tabular-nums">{amount}</td>
                    <td className="text-muted-foreground">{type || "Not recorded"}</td>
                    <td className="text-muted-foreground">{deal.seller_name}</td>
                    {showAgent && (
                      <td>
                        <p>{deal.agent?.full_name || "Unlisted"}</p>
                        <p className="text-xs text-muted-foreground">{deal.agent?.email}</p>
                      </td>
                    )}
                    <td className="text-muted-foreground">{submitted}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
