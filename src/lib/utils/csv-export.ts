/**
 * CSV/Excel Export Utilities
 * Export deals pipeline data to CSV format
 */

import type { DealWithProperty } from "@/lib/actions/deal-actions";
import { formatDealNumber } from "./deal-number";

export interface ExportColumn {
  key: string;
  label: string;
  formatter?: (value: unknown, deal: DealWithProperty) => string;
}

// Status labels for human-readable output
const statusLabels: Record<string, string> = {
  submitted: "Submitted",
  needs_info: "Needs Info",
  underwriting: "Underwriting",
  offer_prepared: "Offer Prepared",
  offer_sent: "Offer Sent",
  in_contract: "In Contract",
  funding: "Funding",
  closed: "Closed",
  rejected: "Rejected",
};

// Property type labels
const propertyTypeLabels: Record<string, string> = {
  single_family: "Single Family",
  multi_family: "Multi-Family",
  condo: "Condo",
  townhouse: "Townhouse",
  land: "Land",
  commercial: "Commercial",
  other: "Other",
};

// Default columns for export
export const defaultExportColumns: ExportColumn[] = [
  {
    key: "deal_number",
    label: "Deal Number",
    formatter: (_, deal) => {
      // Use deal_number if available, otherwise use index
      const dealNum = (deal as Record<string, unknown>).deal_number as number | undefined;
      return dealNum ? formatDealNumber(dealNum) : deal.id.slice(0, 8).toUpperCase();
    },
  },
  {
    key: "status",
    label: "Status",
    formatter: (value) => statusLabels[value as string] || String(value),
  },
  {
    key: "address",
    label: "Address",
    formatter: (_, deal) => deal.property?.address || "",
  },
  {
    key: "city",
    label: "City",
    formatter: (_, deal) => deal.property?.city || "",
  },
  {
    key: "state",
    label: "State",
    formatter: (_, deal) => deal.property?.state || "",
  },
  {
    key: "zip",
    label: "ZIP",
    formatter: (_, deal) => deal.property?.zip || "",
  },
  {
    key: "property_type",
    label: "Property Type",
    formatter: (_, deal) => propertyTypeLabels[deal.property?.property_type || ""] || deal.property?.property_type || "",
  },
  {
    key: "bedrooms",
    label: "Beds",
    formatter: (_, deal) => deal.property?.bedrooms?.toString() || "",
  },
  {
    key: "bathrooms",
    label: "Baths",
    formatter: (_, deal) => deal.property?.bathrooms?.toString() || "",
  },
  {
    key: "sqft",
    label: "Sqft",
    formatter: (_, deal) => deal.property?.sqft?.toLocaleString() || "",
  },
  {
    key: "year_built",
    label: "Year Built",
    formatter: (_, deal) => deal.property?.year_built?.toString() || "",
  },
  {
    key: "asking_price",
    label: "Asking Price",
    formatter: (value) => value ? `$${Number(value).toLocaleString()}` : "",
  },
  {
    key: "offer_price",
    label: "Offer Price",
    formatter: (value) => value ? `$${Number(value).toLocaleString()}` : "",
  },
  {
    key: "seller_name",
    label: "Seller Name",
  },
  {
    key: "seller_phone",
    label: "Seller Phone",
  },
  {
    key: "seller_email",
    label: "Seller Email",
  },
  {
    key: "seller_motivation",
    label: "Seller Motivation",
  },
  {
    key: "agent_name",
    label: "Agent",
    formatter: (_, deal) => deal.agent?.full_name || deal.agent?.email || "",
  },
  {
    key: "assignee_name",
    label: "Assigned To",
    formatter: (_, deal) => deal.assignee?.full_name || deal.assignee?.email || "",
  },
  {
    key: "submitted_at",
    label: "Submitted Date",
    formatter: (value) => value ? new Date(value as string).toLocaleDateString() : "",
  },
  {
    key: "updated_at",
    label: "Last Updated",
    formatter: (value) => value ? new Date(value as string).toLocaleDateString() : "",
  },
  {
    key: "notes",
    label: "Notes",
  },
];

/**
 * Escape CSV field value
 */
function escapeCSVField(value: string): string {
  // If the value contains comma, quote, or newline, wrap in quotes
  if (value.includes(",") || value.includes('"') || value.includes("\n") || value.includes("\r")) {
    // Escape quotes by doubling them
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

/**
 * Convert deals array to CSV string
 */
export function dealsToCSV(
  deals: DealWithProperty[],
  columns: ExportColumn[] = defaultExportColumns
): string {
  // Header row
  const header = columns.map((col) => escapeCSVField(col.label)).join(",");

  // Data rows
  const rows = deals.map((deal) => {
    return columns
      .map((col) => {
        let value: unknown;
        
        // Get the value - check if it's a direct property or nested
        if (col.formatter) {
          value = col.formatter((deal as Record<string, unknown>)[col.key], deal);
        } else {
          value = (deal as Record<string, unknown>)[col.key];
        }

        // Convert to string and escape
        const stringValue = value === null || value === undefined ? "" : String(value);
        return escapeCSVField(stringValue);
      })
      .join(",");
  });

  return [header, ...rows].join("\n");
}

/**
 * Trigger CSV download in browser
 */
export function downloadCSV(csvContent: string, filename: string): void {
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  
  if (navigator.msSaveBlob) {
    // IE 10+
    navigator.msSaveBlob(blob, filename);
  } else {
    // Other browsers
    const url = URL.createObjectURL(blob);
    link.href = url;
    link.download = filename;
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }
}

/**
 * Export deals to CSV and trigger download
 */
export function exportDealsToCSV(
  deals: DealWithProperty[],
  filename?: string,
  columns?: ExportColumn[]
): void {
  const csvContent = dealsToCSV(deals, columns);
  const defaultFilename = `dealflow-pipeline-${new Date().toISOString().split("T")[0]}.csv`;
  downloadCSV(csvContent, filename || defaultFilename);
}

/**
 * Export filtered deals by status
 */
export function exportDealsByStatus(
  deals: DealWithProperty[],
  status: string | string[],
  filename?: string
): void {
  const statusArray = Array.isArray(status) ? status : [status];
  const filteredDeals = deals.filter((deal) => statusArray.includes(deal.status));
  const defaultFilename = `dealflow-${statusArray.join("-")}-${new Date().toISOString().split("T")[0]}.csv`;
  exportDealsToCSV(filteredDeals, filename || defaultFilename);
}

// Add msSaveBlob type declaration
declare global {
  interface Navigator {
    msSaveBlob?: (blob: Blob, defaultName?: string) => boolean;
  }
}
