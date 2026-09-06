"use client";

import { useState } from "react";
import { Search, MapPin, TrendingUp, Loader2, Info, CheckCircle2, AlertCircle } from "@/components/ui/icons";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { worksheetAction, worksheetCard, worksheetInput } from "@/app/calculators/_components/worksheet";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface PropertyData {
  address: string;
  street: string;
  city: string;
  state: string;
  zipCode: string;
  county: string;
  latitude: number;
  longitude: number;
  fairMarketRent?: number;
  medianRent?: number;
  medianHomeValue?: number;
  medianIncome?: number;
  population?: number;
  sources: string[];
}

interface PropertyAnalysis {
  arvEstimate: number | null;
  mao70Rule: number | null;
  potentialProfit: number | null;
  roi: number | null;
  rentToPrice: number | null;
  fairMarketRent?: number;
  medianRent?: number;
  medianHomeValue?: number;
  medianIncome?: number;
  recommendation: string;
}

interface LookupResult {
  success: boolean;
  property: PropertyData;
  analysis: PropertyAnalysis | null;
  dataSources: string[];
}

export function PropertyLookup() {
  const [address, setAddress] = useState("");
  const [purchasePrice, setPurchasePrice] = useState("");
  const [condition, setCondition] = useState<"poor" | "fair" | "good" | "excellent">("good");
  const [bedrooms, setBedrooms] = useState("3");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<LookupResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleLookup = async () => {
    if (!address.trim()) {
      setError("Please enter an address");
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch("/api/property/lookup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          address: address.trim(),
          purchasePrice: purchasePrice ? parseFloat(purchasePrice) : undefined,
          condition,
          bedrooms: parseInt(bedrooms)
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to lookup property");
      }

      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (value: number | null | undefined) => {
    if (value == null || !Number.isFinite(value)) return "Unavailable";
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 0
    }).format(value);
  };

  const formatNumber = (value: number | null | undefined) => {
    if (value == null || !Number.isFinite(value)) return "Unavailable";
    return new Intl.NumberFormat("en-US").format(value);
  };

  return (
    <div className="min-w-0 space-y-6">
      {/* Search Form */}
      <Card className={worksheetCard}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            Find a property
          </CardTitle>
          <CardDescription>
            Enter an address and any details you want to include in the estimate.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="md:col-span-2">
              <Label htmlFor="address">Property Address</Label>
              <div className="flex gap-2 mt-1">
                <Input
                  id="address"
                  placeholder="123 Main St, City, State ZIP"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleLookup()}
                  className={worksheetInput + " flex-1"}
                />
                <Button size="icon" aria-label="Look up property" className={worksheetAction + " size-11"} onClick={handleLookup} disabled={loading}>
                  {loading ? (
                    <Loader2 aria-hidden="true" className="size-4 motion-safe:animate-spin" />
                  ) : (
                    <Search aria-hidden="true" className="size-4" />
                  )}
                </Button>
              </div>
            </div>

            <div>
              <Label htmlFor="purchasePrice">Purchase Price (optional)</Label>
              <Input
                id="purchasePrice"
                type="number"
                inputMode="decimal"
                placeholder="250000"
                value={purchasePrice}
                onChange={(e) => setPurchasePrice(e.target.value)}
                className={worksheetInput + " mt-1"}
              />
            </div>

            <div>
              <Label htmlFor="condition">Property Condition</Label>
              <Select value={condition} onValueChange={(v) => setCondition(v as typeof condition)}>
                <SelectTrigger id="condition" className={worksheetInput + " mt-1 w-full data-[size=default]:h-11"}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="poor">Poor (needs major work)</SelectItem>
                  <SelectItem value="fair">Fair (cosmetic updates)</SelectItem>
                  <SelectItem value="good">Good (move-in ready)</SelectItem>
                  <SelectItem value="excellent">Excellent (updated)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="bedrooms">Bedrooms</Label>
              <Select value={bedrooms} onValueChange={setBedrooms}>
                <SelectTrigger id="bedrooms" className={worksheetInput + " mt-1 w-full data-[size=default]:h-11"}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">1 Bedroom</SelectItem>
                  <SelectItem value="2">2 Bedrooms</SelectItem>
                  <SelectItem value="3">3 Bedrooms</SelectItem>
                  <SelectItem value="4">4 Bedrooms</SelectItem>
                  <SelectItem value="5">5+ Bedrooms</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {loading && <p role="status" className="text-sm text-muted-foreground">Looking up property…</p>}
          {error && (
            <div role="alert" className="flex items-start gap-2 border-t border-border pt-3 text-destructive [overflow-wrap:anywhere]">
              <AlertCircle className="h-4 w-4" />
              <span className="text-sm">{error}</span>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Results */}
      {result && (
        <>
          {/* Property Info */}
          <Card className={worksheetCard}>
            <CardHeader>
              <CardTitle className="flex min-w-0 items-center gap-2 [overflow-wrap:anywhere]">
                <MapPin className="h-5 w-5 text-primary" />
                Property Location
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <p className="text-sm text-muted-foreground">Address</p>
                  <p className="font-medium">{result.property.street || result.property.address}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">City, State ZIP</p>
                  <p className="font-medium">
                    {result.property.city}, {result.property.state} {result.property.zipCode}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">County</p>
                  <p className="font-medium">{result.property.county || "N/A"}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Coordinates</p>
                  <p className="font-medium text-xs">
                    {result.property.latitude.toFixed(6)}, {result.property.longitude.toFixed(6)}
                  </p>
                </div>
              </div>

              <div className="mt-4 flex flex-wrap gap-2">
                <span className="text-xs text-muted-foreground">Data from:</span>
                {result.dataSources.map((source) => (
                  <Badge key={source} variant="secondary" className="text-xs">
                    {source}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>

          <dl aria-label="Market data" className="grid grid-cols-2 gap-x-4 gap-y-4 border-y border-border py-4 lg:grid-cols-4">
            {[
              { label: "Median home value", value: formatCurrency(result.property.medianHomeValue) },
              { label: "Fair market rent per month", value: formatCurrency(result.property.fairMarketRent) },
              { label: "Median income", value: formatCurrency(result.property.medianIncome) },
              { label: "County population", value: formatNumber(result.property.population) },
            ].map(({ label, value }) => (
              <div key={label} className="min-w-0">
                <dt className="text-sm text-muted-foreground">{label}</dt>
                <dd className="mt-1 text-xl font-semibold tabular-nums [overflow-wrap:anywhere]">{value}</dd>
              </div>
            ))}
          </dl>

          {/* Deal Analysis */}
          {result.analysis && (
            <Card className={worksheetCard}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-primary" />
                  Deal Analysis
                </CardTitle>
                <CardDescription>
                  Based on purchase price of {formatCurrency(parseFloat(purchasePrice))}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                  <div className="min-w-0 border-t border-border pt-3">
                    <p className="text-sm text-muted-foreground">Estimated ARV</p>
                    <p className="text-2xl font-semibold tabular-nums [overflow-wrap:anywhere] text-primary">
                      {formatCurrency(result.analysis.arvEstimate)}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Based on {condition} condition
                    </p>
                  </div>

                  <div className="min-w-0 border-t border-border pt-3">
                    <p className="text-sm text-muted-foreground">MAO (70% Rule)</p>
                    <p className="text-2xl font-semibold tabular-nums [overflow-wrap:anywhere] text-primary">
                      {formatCurrency(result.analysis.mao70Rule)}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Maximum Allowable Offer
                    </p>
                  </div>

                  <div className="min-w-0 border-t border-border pt-3">
                    <p className="text-sm text-muted-foreground">Potential Profit</p>
                    <p className={`text-2xl font-semibold tabular-nums [overflow-wrap:anywhere] ${result.analysis.potentialProfit && result.analysis.potentialProfit > 0 ? 'text-primary' : 'text-destructive'}`}>
                      {formatCurrency(result.analysis.potentialProfit)}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      After 15% repair estimate
                    </p>
                  </div>

                  <div className="min-w-0 border-t border-border pt-3">
                    <p className="text-sm text-muted-foreground">ROI</p>
                    <p className={`text-2xl font-semibold tabular-nums [overflow-wrap:anywhere] ${result.analysis.roi && result.analysis.roi > 15 ? 'text-primary' : 'text-amber-800 dark:text-amber-300'}`}>
                      {Number.isFinite(result.analysis.roi) ? result.analysis.roi + "%" : "Unavailable"}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Return on Investment
                    </p>
                  </div>

                  <div className="min-w-0 border-t border-border pt-3">
                    <p className="text-sm text-muted-foreground">Rent-to-Price Ratio</p>
                    <p className={`text-2xl font-semibold tabular-nums [overflow-wrap:anywhere] ${result.analysis.rentToPrice && result.analysis.rentToPrice >= 1 ? 'text-primary' : 'text-amber-800 dark:text-amber-300'}`}>
                      {Number.isFinite(result.analysis.rentToPrice) ? result.analysis.rentToPrice + "%" : "Unavailable"}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {result.analysis.rentToPrice && result.analysis.rentToPrice >= 1 ? "Passes 1% rule" : "Below 1% rule"}
                    </p>
                  </div>

                  <div className="min-w-0 border-t border-border pt-3">
                    <p className="text-sm text-muted-foreground">Monthly Rent Estimate</p>
                    <p className="text-2xl font-semibold tabular-nums [overflow-wrap:anywhere] text-primary">
                      {formatCurrency(result.analysis.fairMarketRent || result.analysis.medianRent)}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      HUD Fair Market Rent
                    </p>
                  </div>
                </div>

                <div className="mt-6 p-4 bg-primary/5 border border-primary/20 rounded-lg">
                  <div className="flex items-start gap-3">
                    {result.analysis.roi && result.analysis.roi >= 20 ? (
                      <CheckCircle2 className="h-5 w-5 text-primary mt-0.5" />
                    ) : (
                      <Info className="h-5 w-5 text-amber-800 dark:text-amber-300 mt-0.5" />
                    )}
                    <div>
                      <p className="font-medium">Recommendation</p>
                      <p className="text-sm text-muted-foreground mt-1">
                        {result.analysis.recommendation}
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Disclaimer */}
          <div className="p-4 bg-muted/50 rounded-lg text-center">
            <p className="text-xs text-muted-foreground">
              <Info className="h-3 w-3 inline mr-1" />
              Data is sourced from public APIs (HUD, Census, OpenStreetMap) and may not reflect current market conditions. 
              Always verify with local MLS data and professional appraisals before making investment decisions.
            </p>
          </div>
        </>
      )}
    </div>
  );
}
