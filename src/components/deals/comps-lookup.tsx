"use client";

import { useState } from "react";
import { Search, MapPin, Home, Calendar, AlertCircle, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface PropStreamComp {
  address: string;
  city: string;
  state: string;
  zip: string;
  salePrice: number;
  saleDate: string;
  distanceMiles: number;
  bedrooms: number;
  bathrooms: number;
  sqft: number;
  yearBuilt: number;
  pricePerSqft: number;
}

interface PropStreamARVResult {
  estimatedARV: number;
  confidenceScore: number;
  comps: PropStreamComp[];
  averagePricePerSqft: number;
  medianSalePrice: number;
  compCount: number;
}

interface CompsLookupProps {
  address: string;
  city: string;
  state: string;
  zip?: string;
  beds?: number;
  baths?: number;
  sqft?: number;
  onSelectARV?: (arv: number) => void;
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(amount);
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function CompsLookup({
  address,
  city,
  state,
  zip,
  beds,
  baths,
  sqft,
  onSelectARV,
}: CompsLookupProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<PropStreamARVResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isMock, setIsMock] = useState(false);

  const fetchComps = async () => {
    setIsLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch("/api/integrations/propstream", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ address, city, state, zip, beds, baths, sqft }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || "Failed to fetch comps");
      }

      setResult(data.data);
      setIsMock(data.isMock || false);

      if (data.isMock) {
        toast.info("PropStream not configured", {
          description: "Showing sample data for demonstration.",
        });
      } else {
        toast.success("Comps loaded successfully", {
          description: `Found ${data.data.compCount} comparable sales.`,
        });
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to fetch comps";
      setError(errorMessage);
      toast.error("Failed to fetch comps", { description: errorMessage });
    } finally {
      setIsLoading(false);
    }
  };

  const getConfidenceColor = (score: number) => {
    if (score >= 75) return "text-emerald-500";
    if (score >= 50) return "text-amber-500";
    return "text-red-500";
  };

  const getConfidenceLabel = (score: number) => {
    if (score >= 75) return "High Confidence";
    if (score >= 50) return "Medium Confidence";
    return "Low Confidence";
  };

  return (
    <div className="rounded-lg border border-border bg-card p-4 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Search className="h-5 w-5 text-blue-500" />
          <h3 className="font-semibold text-foreground">PropStream Comps</h3>
        </div>
        <button
          onClick={fetchComps}
          disabled={isLoading}
          className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
        >
          {isLoading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Searching...
            </>
          ) : (
            <>
              <Search className="h-4 w-4" />
              Fetch Comps
            </>
          )}
        </button>
      </div>

      <div className="text-sm text-muted-foreground">
        <MapPin className="inline h-4 w-4 mr-1" />
        {address}, {city}, {state} {zip}
      </div>

      {error && (
        <div className="flex items-center gap-2 text-red-500 text-sm">
          <AlertCircle className="h-4 w-4" />
          {error}
        </div>
      )}

      {result && (
        <div className="space-y-4">
          {/* ARV Summary */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="rounded-lg bg-blue-500/10 p-3">
              <p className="text-xs text-muted-foreground">Estimated ARV</p>
              <p className="text-lg font-bold text-blue-500">{formatCurrency(result.estimatedARV)}</p>
              {onSelectARV && (
                <button
                  onClick={() => onSelectARV(result.estimatedARV)}
                  className="mt-1 text-xs text-blue-600 hover:underline"
                >
                  Use this ARV →
                </button>
              )}
            </div>
            <div className="rounded-lg bg-muted/50 p-3">
              <p className="text-xs text-muted-foreground">Avg $/Sqft</p>
              <p className="text-lg font-bold text-foreground">${result.averagePricePerSqft}</p>
            </div>
            <div className="rounded-lg bg-muted/50 p-3">
              <p className="text-xs text-muted-foreground">Median Sale</p>
              <p className="text-lg font-bold text-foreground">{formatCurrency(result.medianSalePrice)}</p>
            </div>
            <div className="rounded-lg bg-muted/50 p-3">
              <p className="text-xs text-muted-foreground">Confidence</p>
              <p className={`text-lg font-bold ${getConfidenceColor(result.confidenceScore)}`}>
                {result.confidenceScore}%
              </p>
              <p className={`text-xs ${getConfidenceColor(result.confidenceScore)}`}>
                {getConfidenceLabel(result.confidenceScore)}
              </p>
            </div>
          </div>

          {isMock && (
            <div className="flex items-center gap-2 rounded-lg bg-amber-500/10 border border-amber-500/30 p-3 text-amber-600 dark:text-amber-400 text-sm">
              <AlertCircle className="h-4 w-4" />
              <span>This is sample data. Configure PropStream API for real comps.</span>
            </div>
          )}

          {/* Comps List */}
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-foreground">
              Comparable Sales ({result.compCount})
            </h4>
            <div className="space-y-2">
              {result.comps.map((comp, index) => (
                <div
                  key={index}
                  className="rounded-lg border border-border bg-muted/30 p-3 text-sm"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-medium text-foreground">{comp.address}</p>
                      <p className="text-muted-foreground">
                        {comp.city}, {comp.state} {comp.zip}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-emerald-500">{formatCurrency(comp.salePrice)}</p>
                      <p className="text-xs text-muted-foreground">${comp.pricePerSqft}/sqft</p>
                    </div>
                  </div>
                  <div className="mt-2 flex flex-wrap gap-3 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Home className="h-3 w-3" />
                      {comp.bedrooms} bed / {comp.bathrooms} bath
                    </span>
                    <span>{comp.sqft.toLocaleString()} sqft</span>
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {formatDate(comp.saleDate)}
                    </span>
                    <span className="flex items-center gap-1">
                      <MapPin className="h-3 w-3" />
                      {comp.distanceMiles.toFixed(2)} mi
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
