"use client";

import { useState } from "react";
import { Download, FileSpreadsheet, FileText, Loader2 } from "@/components/ui/icons";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";

interface ExportableData {
  [key: string]: string | number | boolean | null | undefined;
}

interface ExportButtonProps {
  data: ExportableData[];
  filename: string;
  title?: string;
}

/**
 * Export button component that allows exporting data to CSV or JSON
 */
export function ExportButton({ data, filename, title = "Export" }: ExportButtonProps) {
  const [exporting, setExporting] = useState(false);

  const exportToCSV = () => {
    if (!data || data.length === 0) {
      toast.error("No data to export");
      return;
    }

    setExporting(true);

    try {
      // Get headers from first object
      const headers = Object.keys(data[0]);
      
      // Create CSV content
      const csvContent = [
        // Header row
        headers.join(","),
        // Data rows
        ...data.map(row => 
          headers.map(header => {
            const value = row[header];
            // Handle null/undefined
            if (value === null || value === undefined) return "";
            // Handle strings with commas or quotes
            if (typeof value === "string") {
              if (value.includes(",") || value.includes('"') || value.includes("\n")) {
                return `"${value.replace(/"/g, '""')}"`;
              }
              return value;
            }
            return String(value);
          }).join(",")
        )
      ].join("\n");

      // Download file
      downloadFile(csvContent, `${filename}.csv`, "text/csv");

      toast.success(`${data.length} records exported to CSV`);
    } catch (error) {
      console.error("Export error:", error);
      toast.error("Failed to export data");
    } finally {
      setExporting(false);
    }
  };

  const exportToJSON = () => {
    if (!data || data.length === 0) {
      toast.error("No data to export");
      return;
    }

    setExporting(true);

    try {
      const jsonContent = JSON.stringify(data, null, 2);
      downloadFile(jsonContent, `${filename}.json`, "application/json");

      toast.success(`${data.length} records exported to JSON`);
    } catch (error) {
      console.error("Export error:", error);
      toast.error("Failed to export data");
    } finally {
      setExporting(false);
    }
  };

  const downloadFile = (content: string, filename: string, mimeType: string) => {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" disabled={exporting}>
          {exporting ? (
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <Download className="h-4 w-4 mr-2" />
          )}
          {title}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuLabel>Export Format</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={exportToCSV}>
          <FileSpreadsheet className="h-4 w-4 mr-2" />
          Export to CSV
        </DropdownMenuItem>
        <DropdownMenuItem onClick={exportToJSON}>
          <FileText className="h-4 w-4 mr-2" />
          Export to JSON
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

/**
 * Helper function to format deal data for export
 */
export function formatDealsForExport(deals: Array<{
  id: string;
  property_address?: string;
  status?: string;
  purchase_price?: number;
  arv?: number;
  repair_cost?: number;
  created_at?: string;
  [key: string]: unknown;
}>) {
  return deals.map(deal => ({
    ID: deal.id,
    Address: deal.property_address || "",
    Status: deal.status || "",
    "Purchase Price": deal.purchase_price || 0,
    ARV: deal.arv || 0,
    "Repair Cost": deal.repair_cost || 0,
    "Created Date": deal.created_at ? new Date(deal.created_at).toLocaleDateString() : ""
  }));
}

/**
 * Helper function to format contacts for export
 */
export function formatContactsForExport(contacts: Array<{
  id: string;
  name?: string;
  email?: string;
  phone?: string;
  type?: string;
  company?: string;
  [key: string]: unknown;
}>) {
  return contacts.map(contact => ({
    Name: contact.name || "",
    Email: contact.email || "",
    Phone: contact.phone || "",
    Type: contact.type || "",
    Company: contact.company || ""
  }));
}
