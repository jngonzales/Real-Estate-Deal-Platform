"use client";

import { useState } from "react";
import { Search, MapPin, Home, DollarSign, TrendingUp, Users, Loader2, Info, CheckCircle2, AlertCircle } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
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
    if (value === null || value === undefined) return "N/A";
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 0
    }).format(value);
  };

  const formatNumber = (value: number | null | undefined) => {
    if (value === null || value === undefined) return "N/A";
    return new Intl.NumberFormat("en-US").format(value);
  };

  return (
    <div className="space-y-6">
      {/* Search Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5 text-primary" />
            Property Lookup
          </CardTitle>
          <CardDescription>
            Enter an address to get property data, market values, and rental estimates - powered by free public data sources
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
                  className="flex-1"
                />
                <Button onClick={handleLookup} disabled={loading}>
                  {loading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Search className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>

            <div>
              <Label htmlFor="purchasePrice">Purchase Price (optional)</Label>
              <Input
                id="purchasePrice"
                type="number"
                placeholder="250000"
                value={purchasePrice}
                onChange={(e) => setPurchasePrice(e.target.value)}
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="condition">Property Condition</Label>
              <Select value={condition} onValueChange={(v) => setCondition(v as typeof condition)}>
                <SelectTrigger className="mt-1">
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
                <SelectTrigger className="mt-1">
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

          {error && (
            <div className="flex items-center gap-2 text-destructive p-3 bg-destructive/10 rounded-lg">
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
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
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

          {/* Market Data */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                    <Home className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Median Home Value</p>
                    <p className="text-xl font-bold">
                      {formatCurrency(result.property.medianHomeValue)}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                    <DollarSign className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Fair Market Rent</p>
                    <p className="text-xl font-bold">
                      {formatCurrency(result.property.fairMarketRent)}/mo
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                    <TrendingUp className="h-5 w-5 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Median Income</p>
                    <p className="text-xl font-bold">
                      {formatCurrency(result.property.medianIncome)}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-orange-100 dark:bg-orange-900/30 rounded-lg">
                    <Users className="h-5 w-5 text-orange-600" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">County Population</p>
                    <p className="text-xl font-bold">
                      {formatNumber(result.property.population)}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Deal Analysis */}
          {result.analysis && (
            <Card>
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
                  <div className="p-4 bg-muted/50 rounded-lg">
                    <p className="text-sm text-muted-foreground">Estimated ARV</p>
                    <p className="text-2xl font-bold text-green-600">
                      {formatCurrency(result.analysis.arvEstimate)}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Based on {condition} condition
                    </p>
                  </div>

                  <div className="p-4 bg-muted/50 rounded-lg">
                    <p className="text-sm text-muted-foreground">MAO (70% Rule)</p>
                    <p className="text-2xl font-bold text-blue-600">
                      {formatCurrency(result.analysis.mao70Rule)}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Maximum Allowable Offer
                    </p>
                  </div>

                  <div className="p-4 bg-muted/50 rounded-lg">
                    <p className="text-sm text-muted-foreground">Potential Profit</p>
                    <p className={`text-2xl font-bold ${result.analysis.potentialProfit && result.analysis.potentialProfit > 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {formatCurrency(result.analysis.potentialProfit)}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      After 15% repair estimate
                    </p>
                  </div>

                  <div className="p-4 bg-muted/50 rounded-lg">
                    <p className="text-sm text-muted-foreground">ROI</p>
                    <p className={`text-2xl font-bold ${result.analysis.roi && result.analysis.roi > 15 ? 'text-green-600' : 'text-yellow-600'}`}>
                      {result.analysis.roi !== null ? `${result.analysis.roi}%` : "N/A"}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Return on Investment
                    </p>
                  </div>

                  <div className="p-4 bg-muted/50 rounded-lg">
                    <p className="text-sm text-muted-foreground">Rent-to-Price Ratio</p>
                    <p className={`text-2xl font-bold ${result.analysis.rentToPrice && result.analysis.rentToPrice >= 1 ? 'text-green-600' : 'text-yellow-600'}`}>
                      {result.analysis.rentToPrice !== null ? `${result.analysis.rentToPrice}%` : "N/A"}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {result.analysis.rentToPrice && result.analysis.rentToPrice >= 1 ? "Passes 1% rule" : "Below 1% rule"}
                    </p>
                  </div>

                  <div className="p-4 bg-muted/50 rounded-lg">
                    <p className="text-sm text-muted-foreground">Monthly Rent Estimate</p>
                    <p className="text-2xl font-bold text-purple-600">
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
                      <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5" />
                    ) : (
                      <Info className="h-5 w-5 text-yellow-500 mt-0.5" />
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
