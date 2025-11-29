"use client";

import { DealWithProperty } from "@/lib/actions/deal-actions";
import { StatusBadge } from "@/components/ui/status-badge";
import { formatDistanceToNow } from "date-fns";
import { Home, MapPin, DollarSign, Calendar, User, ChevronRight } from "lucide-react";
import Link from "next/link";

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
}

export function DealsList({ deals }: DealsListProps) {
  if (deals.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 p-12 text-center">
        <Home className="mx-auto h-12 w-12 text-slate-400" />
        <h3 className="mt-4 text-lg font-medium text-slate-900 dark:text-white">No deals yet</h3>
        <p className="mt-2 text-slate-500 dark:text-slate-400">
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
    <div className="overflow-hidden rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800">
      <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-700">
        <thead className="bg-slate-50 dark:bg-slate-900">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Property
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Type
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Asking Price
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Seller
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Status
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Submitted
            </th>
            <th className="relative px-6 py-3">
              <span className="sr-only">View</span>
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-200 dark:divide-slate-700 bg-white dark:bg-slate-800">
          {deals.map((deal) => (
            <tr key={deal.id} className="hover:bg-slate-50 dark:hover:bg-slate-700">
              <td className="whitespace-nowrap px-6 py-4">
                <div className="flex items-center">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-slate-100 dark:bg-slate-700">
                    <Home className="h-5 w-5 text-slate-600 dark:text-slate-300" />
                  </div>
                  <div className="ml-4">
                    <div className="font-medium text-slate-900 dark:text-white">
                      {deal.property?.address ?? 'N/A'}
                    </div>
                    <div className="flex items-center text-sm text-slate-500 dark:text-slate-400">
                      <MapPin className="mr-1 h-3 w-3" />
                      {deal.property?.city ?? ''}, {deal.property?.state ?? ''} {deal.property?.zip ?? ''}
                    </div>
                  </div>
                </div>
              </td>
              <td className="whitespace-nowrap px-6 py-4 text-sm text-slate-600 dark:text-slate-300">
                {deal.property ? (propertyTypeLabels[deal.property.property_type] || deal.property.property_type) : 'N/A'}
              </td>
              <td className="whitespace-nowrap px-6 py-4">
                <div className="flex items-center text-sm font-medium text-slate-900 dark:text-white">
                  <DollarSign className="mr-1 h-4 w-4 text-slate-400" />
                  {formatCurrency(deal.asking_price)}
                </div>
              </td>
              <td className="whitespace-nowrap px-6 py-4">
                <div className="flex items-center text-sm text-slate-600 dark:text-slate-300">
                  <User className="mr-1 h-4 w-4 text-slate-400" />
                  {deal.seller_name}
                </div>
              </td>
              <td className="whitespace-nowrap px-6 py-4">
                <StatusBadge status={deal.status} />
              </td>
              <td className="whitespace-nowrap px-6 py-4 text-sm text-slate-500 dark:text-slate-400">
                <div className="flex items-center">
                  <Calendar className="mr-1 h-4 w-4" />
                  {formatDistanceToNow(new Date(deal.submitted_at), { addSuffix: true })}
                </div>
              </td>
              <td className="whitespace-nowrap px-6 py-4 text-right text-sm font-medium">
                <Link
                  href={`/dashboard/deals/${deal.id}`}
                  className="inline-flex items-center text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white"
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
  );
}
