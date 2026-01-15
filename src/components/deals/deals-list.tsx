"use client";

import { DealWithProperty } from "@/lib/actions/deal-actions";
import { StatusBadge } from "@/components/ui/status-badge";
import { formatDistanceToNow } from "date-fns";
import { Home, MapPin, DollarSign, Calendar, User, ChevronRight } from "lucide-react";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";

const propertyTypeLabels: Record<string, string> = {
  single_family: "Single Family",
  multi_family: "Multi-Family",
  condo: "Condo",
  townhouse: "Townhouse",
  land: "Land",
  commercial: "Commercial",
  other: "Other",
};

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(amount);
}

interface DealsListProps {
  deals: DealWithProperty[];
  showAgent?: boolean;
}

export function DealsList({ deals, showAgent = false }: DealsListProps) {
  if (deals.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-border bg-card p-12 text-center">
        <Home className="mx-auto h-12 w-12 text-muted-foreground" />
        <h3 className="mt-4 text-lg font-medium text-foreground">No deals yet</h3>
        <p className="mt-2 text-muted-foreground">
          Get started by submitting your first deal.
        </p>
        <Link
          href="/dashboard/submit"
          className="mt-4 inline-flex items-center rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
        >
          Submit a Deal
        </Link>
      </div>
    );
  }

  return (
    <>
      {/* Mobile Card View */}
      <div className="space-y-3 md:hidden">
        {deals.map((deal) => (
          <Link key={deal.id} href={`/dashboard/deals/${deal.id}`}>
            <Card className="hover:bg-muted/50 transition-colors">
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <StatusBadge status={deal.status} />
                      <span className="text-xs text-muted-foreground">
                        {formatDistanceToNow(new Date(deal.submitted_at), { addSuffix: true })}
                      </span>
                    </div>
                    <h3 className="font-medium text-foreground truncate">
                      {deal.property?.address ?? 'N/A'}
                    </h3>
                    <div className="flex items-center text-sm text-muted-foreground mt-1">
                      <MapPin className="mr-1 h-3 w-3 shrink-0" />
                      <span className="truncate">
                        {deal.property?.city ?? ''}, {deal.property?.state ?? ''} {deal.property?.zip ?? ''}
                      </span>
                    </div>
                    <div className="flex items-center gap-4 mt-3 text-sm">
                      <div className="flex items-center text-foreground font-medium">
                        <DollarSign className="mr-1 h-4 w-4 text-green-500" />
                        {formatCurrency(deal.asking_price)}
                      </div>
                      <div className="text-muted-foreground">
                        {deal.property ? (propertyTypeLabels[deal.property.property_type] || deal.property.property_type) : ''}
                      </div>
                    </div>
                    {showAgent && deal.agent && (
                      <div className="flex items-center text-xs text-muted-foreground mt-2">
                        <User className="mr-1 h-3 w-3" />
                        {deal.agent.full_name || deal.agent.email}
                      </div>
                    )}
                  </div>
                  <ChevronRight className="h-5 w-5 text-muted-foreground shrink-0 mt-1" />
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      {/* Desktop Table View */}
      <div className="hidden md:block overflow-hidden rounded-lg border border-border bg-card">
        <table className="min-w-full divide-y divide-border">
          <thead className="bg-muted">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                Property
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                Type
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                Asking Price
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                Seller
              </th>
              {showAgent && (
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Agent
                </th>
              )}
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                Submitted
              </th>
              <th className="relative px-6 py-3">
                <span className="sr-only">View</span>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border bg-card">
            {deals.map((deal) => (
              <tr key={deal.id} className="hover:bg-muted/50">
                <td className="whitespace-nowrap px-6 py-4">
                  <div className="flex items-center">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-muted">
                      <Home className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <div className="ml-4">
                      <div className="font-medium text-foreground">
                        {deal.property?.address ?? 'N/A'}
                      </div>
                      <div className="flex items-center text-sm text-muted-foreground">
                        <MapPin className="mr-1 h-3 w-3" />
                        {deal.property?.city ?? ''}, {deal.property?.state ?? ''} {deal.property?.zip ?? ''}
                        {deal.property?.country && deal.property.country !== 'US' && ` (${deal.property.country})`}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="whitespace-nowrap px-6 py-4 text-sm text-muted-foreground">
                  {deal.property ? (propertyTypeLabels[deal.property.property_type] || deal.property.property_type) : 'N/A'}
                </td>
                <td className="whitespace-nowrap px-6 py-4">
                  <div className="flex items-center text-sm font-medium text-foreground">
                    <DollarSign className="mr-1 h-4 w-4 text-muted-foreground" />
                    {formatCurrency(deal.asking_price)}
                  </div>
                </td>
                <td className="whitespace-nowrap px-6 py-4">
                  <div className="flex items-center text-sm text-muted-foreground">
                    <User className="mr-1 h-4 w-4 text-muted-foreground" />
                    {deal.seller_name}
                  </div>
                </td>
                {showAgent && (
                  <td className="whitespace-nowrap px-6 py-4">
                    <div className="text-sm">
                      <div className="font-medium text-foreground">
                        {deal.agent?.full_name || "Unknown"}
                      </div>
                      <div className="text-muted-foreground text-xs">
                        {deal.agent?.email}
                      </div>
                    </div>
                  </td>
                )}
                <td className="whitespace-nowrap px-6 py-4">
                  <StatusBadge status={deal.status} />
                </td>
                <td className="whitespace-nowrap px-6 py-4 text-sm text-muted-foreground">
                  <div className="flex items-center">
                    <Calendar className="mr-1 h-4 w-4" />
                    {formatDistanceToNow(new Date(deal.submitted_at), { addSuffix: true })}
                  </div>
                </td>
                <td className="whitespace-nowrap px-6 py-4 text-right text-sm font-medium">
                  <Link
                    href={`/dashboard/deals/${deal.id}`}
                    className="inline-flex items-center text-muted-foreground hover:text-foreground"
                  >
                    View
                    <ChevronRight className="ml-1 h-4 w-4" />
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
