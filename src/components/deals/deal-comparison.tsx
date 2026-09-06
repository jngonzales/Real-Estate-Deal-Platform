"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { X, Download, TrendingUp, TrendingDown } from "@/components/ui/icons";
import { formatCurrency } from "@/lib/utils";

interface Deal {
  id: string;
  property: {
    address: string;
    city: string;
    state: string;
    property_type: string;
    bedrooms?: number;
    bathrooms?: number;
    square_feet?: number;
  } | null;
  asking_price: number;
  offer_price?: number | null;
  status: string;
  submitted_at: string;
}

interface DealComparisonProps {
  deals: Deal[];
  onClose?: () => void;
}

export function DealComparison({ deals, onClose }: DealComparisonProps) {
  const selectedDeals: Deal[] = deals.slice(0, 3);

  if (selectedDeals.length === 0) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <p className="text-muted-foreground">
            Select at least 2 deals to compare
          </p>
        </CardContent>
      </Card>
    );
  }

  type Metric = {
    key: string;
    label: string;
    format: (val: number | null | undefined) => string;
    higherIsBetter: boolean;
  };

  const metrics: Metric[] = [
    {
      key: "asking_price",
      label: "Asking Price",
      format: (val) => formatCurrency(val as number),
      higherIsBetter: false,
    },
    {
      key: "offer_price",
      label: "Offer Price",
      format: (val) => (val !== null && val !== undefined ? formatCurrency(val) : "N/A"),
      higherIsBetter: false,
    },
    {
      key: "bedrooms",
      label: "Bedrooms",
      format: (val) => val?.toString() || "N/A",
      higherIsBetter: true,
    },
    {
      key: "bathrooms",
      label: "Bathrooms",
      format: (val) => val?.toString() || "N/A",
      higherIsBetter: true,
    },
    {
      key: "square_feet",
      label: "Square Feet",
      format: (val) => (val !== null && val !== undefined ? val.toLocaleString() : "N/A"),
      higherIsBetter: true,
    },
  ];

  const getValue = (deal: Deal, key: string) => {
    if (key === "offer_price") return deal[key];
    if (key in deal) return deal[key as keyof Deal];
    if (deal.property && key in deal.property) {
      return deal.property[key as keyof typeof deal.property];
    }
    return null;
  };

  const findBestValue = (key: string, higherIsBetter: boolean) => {
    const values = selectedDeals
      .map((deal) => getValue(deal, key))
      .filter((val) => val !== null && val !== undefined);

    if (values.length === 0) return null;

    return higherIsBetter
      ? Math.max(...(values as number[]))
      : Math.min(...(values as number[]));
  };

  const exportToCSV = () => {
    const headers = ["Property", ...selectedDeals.map((d) => d.property?.address || d.id)];
    const rows = metrics.map((metric) => [
      metric.label,
      ...selectedDeals.map((deal) => {
        const val = getValue(deal, metric.key);
        return val !== null && val !== undefined ? val.toString() : "N/A";
      }),
    ]);

    const csv = [headers, ...rows].map((row) => row.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `deal-comparison-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Deal Comparison</CardTitle>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={exportToCSV}>
              <Download className="h-4 w-4 mr-2" />
              Export CSV
            </Button>
            {onClose && (
              <Button variant="ghost" size="icon" onClick={onClose}>
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b">
                <th className="p-3 text-left font-medium text-muted-foreground">Metric</th>
                {selectedDeals.map((deal) => (
                  <th key={deal.id} className="p-3 text-left font-medium min-w-[200px]">
                    <div className="space-y-1">
                      <div className="font-semibold text-foreground">
                        {deal.property?.address || "Unknown"}
                      </div>
                      <div className="text-xs font-normal text-muted-foreground">
                        {deal.property?.city}, {deal.property?.state}
                      </div>
                      <div className="text-xs font-normal">
                        <span
                          className={`inline-block px-2 py-0.5 rounded text-xs ${
                            deal.status === "closed"
                              ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300"
                              : "bg-muted text-muted-foreground dark:bg-muted dark:text-muted-foreground"
                          }`}
                        >
                          {deal.status}
                        </span>
                      </div>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {metrics.map((metric) => {
                const bestValue = findBestValue(metric.key, metric.higherIsBetter);

                return (
                  <tr key={metric.key} className="border-b hover:bg-muted/50">
                    <td className="p-3 font-medium">{metric.label}</td>
                    {selectedDeals.map((deal) => {
                      const value = getValue(deal, metric.key);
                      const isBest =
                        value !== null &&
                        value !== undefined &&
                        bestValue !== null &&
                        value === bestValue;

                      return (
                        <td key={deal.id} className="p-3">
                          <div className="flex items-center gap-2">
                            <span
                              className={`font-medium ${
                                isBest
                                  ? "text-green-600 dark:text-green-400"
                                  : "text-foreground"
                              }`}
                            >
                              {metric.format(typeof value === "number" ? value : null)}
                            </span>
                            {isBest && (
                              <span className="inline-flex items-center justify-center w-5 h-5 bg-green-100 dark:bg-green-900 rounded-full">
                                {metric.higherIsBetter ? (
                                  <TrendingUp className="w-3 h-3 text-green-600 dark:text-green-400" />
                                ) : (
                                  <TrendingDown className="w-3 h-3 text-green-600 dark:text-green-400" />
                                )}
                              </span>
                            )}
                          </div>
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Summary */}
        <div className="mt-6 p-4 bg-muted/50 rounded-lg">
          <h4 className="font-semibold mb-2 text-sm">Summary</h4>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-sm">
            <div>
              <p className="text-muted-foreground">Lowest Asking Price</p>
              <p className="font-semibold">
                {formatCurrency(
                  Math.min(...selectedDeals.map((d) => d.asking_price))
                )}
              </p>
            </div>
            <div>
              <p className="text-muted-foreground">Highest Asking Price</p>
              <p className="font-semibold">
                {formatCurrency(
                  Math.max(...selectedDeals.map((d) => d.asking_price))
                )}
              </p>
            </div>
            <div>
              <p className="text-muted-foreground">Average Price</p>
              <p className="font-semibold">
                {formatCurrency(
                  selectedDeals.reduce((sum, d) => sum + d.asking_price, 0) /
                    selectedDeals.length
                )}
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
