"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Home,
  Plus,
  Trash2,
  DollarSign,
  MapPin,
  TrendingUp,
  CheckCircle,
  AlertTriangle,
  Building,
} from "lucide-react";

export interface ComparableProperty {
  id: string;
  address: string;
  city: string;
  state: string;
  salePrice: number;
  sqft: number;
  bedrooms: number;
  bathrooms: number;
  soldDate: string;
  distanceMiles: number;
  condition: "excellent" | "good" | "average" | "fair" | "poor";
  propertyType: string;
}

interface CompsAnalysisProps {
  subjectProperty: {
    address?: string | null;
    sqft?: number | null;
    bedrooms?: number | null;
    bathrooms?: number | null;
    condition?: string;
    propertyType?: string | null;
  };
  onCompsChange?: (comps: ComparableProperty[]) => void;
  onArvCalculated?: (arv: number) => void;
}

const conditionAdjustments: Record<string, number> = {
  excellent: 10,
  good: 5,
  average: 0,
  fair: -5,
  poor: -10,
};

export function CompsAnalysis({ subjectProperty, onCompsChange, onArvCalculated }: CompsAnalysisProps) {
  const [comps, setComps] = useState<ComparableProperty[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newComp, setNewComp] = useState<Partial<ComparableProperty>>({
    condition: "average",
    propertyType: "single_family",
  });

  // Use stable current date for calculations (updates on mount only)
  const [currentDate] = useState(() => Date.now());

  // Calculate price per sqft for each comp
  const compsWithMetrics = comps.map(comp => ({
    ...comp,
    pricePerSqft: comp.sqft > 0 ? comp.salePrice / comp.sqft : 0,
    daysSinceSold: Math.floor((currentDate - new Date(comp.soldDate).getTime()) / (1000 * 60 * 60 * 24)),
  }));

  // Calculate adjusted values
  const adjustedComps = compsWithMetrics.map(comp => {
    let adjustedPrice = comp.salePrice;
    
    // Size adjustment (±$100/sqft difference)
    const subjectSqft = subjectProperty.sqft || comp.sqft;
    const sqftDiff = subjectSqft - comp.sqft;
    const sqftAdjustment = sqftDiff * 50; // $50 per sqft difference
    adjustedPrice += sqftAdjustment;
    
    // Bedroom adjustment ($5,000 per bedroom)
    const subjectBeds = subjectProperty.bedrooms || comp.bedrooms;
    const bedDiff = subjectBeds - comp.bedrooms;
    const bedAdjustment = bedDiff * 5000;
    adjustedPrice += bedAdjustment;
    
    // Bathroom adjustment ($3,000 per bathroom)
    const subjectBaths = subjectProperty.bathrooms || comp.bathrooms;
    const bathDiff = subjectBaths - comp.bathrooms;
    const bathAdjustment = bathDiff * 3000;
    adjustedPrice += bathAdjustment;
    
    // Condition adjustment
    const conditionAdj = conditionAdjustments[comp.condition] / 100;
    const conditionAdjustment = comp.salePrice * conditionAdj;
    adjustedPrice -= conditionAdjustment; // Subtract because we're adjusting comp TO subject
    
    // Distance weight (closer = more weight)
    const distanceWeight = Math.max(0.5, 1 - (comp.distanceMiles / 2) * 0.1);
    
    // Time weight (more recent = more weight)
    const timeWeight = Math.max(0.5, 1 - (comp.daysSinceSold / 180) * 0.3);
    
    const totalWeight = distanceWeight * timeWeight;
    
    return {
      ...comp,
      adjustedPrice: Math.round(adjustedPrice),
      sqftAdjustment: Math.round(sqftAdjustment),
      bedAdjustment: Math.round(bedAdjustment),
      bathAdjustment: Math.round(bathAdjustment),
      conditionAdjustment: Math.round(conditionAdjustment),
      totalAdjustment: Math.round(adjustedPrice - comp.salePrice),
      weight: totalWeight,
    };
  });

  // Calculate weighted average ARV
  const calculateArv = () => {
    if (adjustedComps.length === 0) return 0;
    
    const totalWeight = adjustedComps.reduce((sum, comp) => sum + comp.weight, 0);
    const weightedSum = adjustedComps.reduce((sum, comp) => sum + (comp.adjustedPrice * comp.weight), 0);
    
    return Math.round(weightedSum / totalWeight);
  };

  const arv = calculateArv();
  const avgPricePerSqft = compsWithMetrics.length > 0
    ? Math.round(compsWithMetrics.reduce((sum, c) => sum + c.pricePerSqft, 0) / compsWithMetrics.length)
    : 0;
  const confidence = comps.length >= 3 ? "High" : comps.length >= 2 ? "Medium" : "Low";

  const handleAddComp = () => {
    if (!newComp.address || !newComp.salePrice || !newComp.sqft) return;
    
    const comp: ComparableProperty = {
      id: Date.now().toString(),
      address: newComp.address || "",
      city: newComp.city || "",
      state: newComp.state || "",
      salePrice: newComp.salePrice || 0,
      sqft: newComp.sqft || 0,
      bedrooms: newComp.bedrooms || 3,
      bathrooms: newComp.bathrooms || 2,
      soldDate: newComp.soldDate || new Date().toISOString().split("T")[0],
      distanceMiles: newComp.distanceMiles || 0.5,
      condition: newComp.condition as ComparableProperty["condition"] || "average",
      propertyType: newComp.propertyType || "single_family",
    };
    
    const updatedComps = [...comps, comp];
    setComps(updatedComps);
    setNewComp({ condition: "average", propertyType: "single_family" });
    setShowAddForm(false);
    
    if (onCompsChange) onCompsChange(updatedComps);
  };

  const handleRemoveComp = (id: string) => {
    const updatedComps = comps.filter(c => c.id !== id);
    setComps(updatedComps);
    if (onCompsChange) onCompsChange(updatedComps);
  };

  const handleUseArv = () => {
    if (onArvCalculated && arv > 0) {
      onArvCalculated(arv);
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0,
    }).format(value);
  };

  return (
    <div className="space-y-6">
      {/* ARV Summary */}
      {comps.length > 0 && (
        <Card className="bg-primary/5 border-emerald-500/20">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <TrendingUp className="h-5 w-5 text-emerald-400" />
                  <span className="text-emerald-400 font-medium">Estimated ARV</span>
                </div>
                <div className="text-4xl font-bold text-white">{formatCurrency(arv)}</div>
                <div className="flex items-center gap-4 mt-2 text-sm">
                  <span className="text-muted-foreground">Avg $/sqft: {formatCurrency(avgPricePerSqft)}</span>
                  <span className={`flex items-center gap-1 ${confidence === "High" ? "text-emerald-400" : confidence === "Medium" ? "text-yellow-400" : "text-amber-400"}`}>
                    {confidence === "High" ? <CheckCircle className="h-4 w-4" /> : <AlertTriangle className="h-4 w-4" />}
                    {confidence} Confidence ({comps.length} comps)
                  </span>
                </div>
              </div>
              {onArvCalculated && (
                <Button onClick={handleUseArv} className="bg-emerald-600 hover:bg-emerald-700">
                  Use This ARV
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Comps List */}
      <Card className="bg-secondary/50 border-white/10">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-white flex items-center gap-2">
                <Building className="h-5 w-5 text-emerald-400" />
                Comparable Properties
              </CardTitle>
              <CardDescription>
                Add recently sold properties to estimate the After Repair Value
              </CardDescription>
            </div>
            <Button 
              onClick={() => setShowAddForm(!showAddForm)}
              variant={showAddForm ? "outline" : "default"}
              size="sm"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Comp
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Add Form */}
          {showAddForm && (
            <div className="p-4 rounded-lg bg-muted/40 border border-white/10 space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label className="text-foreground/90">Address</Label>
                  <Input
                    value={newComp.address || ""}
                    onChange={(e) => setNewComp(prev => ({ ...prev, address: e.target.value }))}
                    placeholder="123 Main St"
                    className="mt-1 bg-secondary/50 border-white/10 text-white"
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Label className="text-foreground/90">City</Label>
                    <Input
                      value={newComp.city || ""}
                      onChange={(e) => setNewComp(prev => ({ ...prev, city: e.target.value }))}
                      placeholder="City"
                      className="mt-1 bg-secondary/50 border-white/10 text-white"
                    />
                  </div>
                  <div>
                    <Label className="text-foreground/90">State</Label>
                    <Input
                      value={newComp.state || ""}
                      onChange={(e) => setNewComp(prev => ({ ...prev, state: e.target.value }))}
                      placeholder="TX"
                      className="mt-1 bg-secondary/50 border-white/10 text-white"
                    />
                  </div>
                </div>
              </div>
              <div className="grid md:grid-cols-4 gap-4">
                <div>
                  <Label className="text-foreground/90">Sale Price</Label>
                  <div className="relative mt-1">
                    <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      type="number"
                      value={newComp.salePrice || ""}
                      onChange={(e) => setNewComp(prev => ({ ...prev, salePrice: Number(e.target.value) }))}
                      placeholder="350000"
                      className="pl-9 bg-secondary/50 border-white/10 text-white"
                    />
                  </div>
                </div>
                <div>
                  <Label className="text-foreground/90">Sq Ft</Label>
                  <Input
                    type="number"
                    value={newComp.sqft || ""}
                    onChange={(e) => setNewComp(prev => ({ ...prev, sqft: Number(e.target.value) }))}
                    placeholder="1800"
                    className="mt-1 bg-secondary/50 border-white/10 text-white"
                  />
                </div>
                <div>
                  <Label className="text-foreground/90">Beds</Label>
                  <Input
                    type="number"
                    value={newComp.bedrooms || ""}
                    onChange={(e) => setNewComp(prev => ({ ...prev, bedrooms: Number(e.target.value) }))}
                    placeholder="3"
                    className="mt-1 bg-secondary/50 border-white/10 text-white"
                  />
                </div>
                <div>
                  <Label className="text-foreground/90">Baths</Label>
                  <Input
                    type="number"
                    value={newComp.bathrooms || ""}
                    onChange={(e) => setNewComp(prev => ({ ...prev, bathrooms: Number(e.target.value) }))}
                    placeholder="2"
                    className="mt-1 bg-secondary/50 border-white/10 text-white"
                  />
                </div>
              </div>
              <div className="grid md:grid-cols-4 gap-4">
                <div>
                  <Label className="text-foreground/90">Sold Date</Label>
                  <Input
                    type="date"
                    value={newComp.soldDate || ""}
                    onChange={(e) => setNewComp(prev => ({ ...prev, soldDate: e.target.value }))}
                    className="mt-1 bg-secondary/50 border-white/10 text-white"
                  />
                </div>
                <div>
                  <Label className="text-foreground/90">Distance (miles)</Label>
                  <Input
                    type="number"
                    step="0.1"
                    value={newComp.distanceMiles || ""}
                    onChange={(e) => setNewComp(prev => ({ ...prev, distanceMiles: Number(e.target.value) }))}
                    placeholder="0.5"
                    className="mt-1 bg-secondary/50 border-white/10 text-white"
                  />
                </div>
                <div>
                  <Label className="text-foreground/90">Condition</Label>
                  <Select
                    value={newComp.condition || "average"}
                    onValueChange={(v) => setNewComp(prev => ({ ...prev, condition: v as ComparableProperty["condition"] }))}
                  >
                    <SelectTrigger className="mt-1 bg-secondary/50 border-white/10 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="excellent">Excellent</SelectItem>
                      <SelectItem value="good">Good</SelectItem>
                      <SelectItem value="average">Average</SelectItem>
                      <SelectItem value="fair">Fair</SelectItem>
                      <SelectItem value="poor">Poor</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-end">
                  <Button onClick={handleAddComp} className="w-full">
                    <Plus className="h-4 w-4 mr-2" />
                    Add
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Comps Table */}
          {comps.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/10">
                    <th className="text-left p-3 text-muted-foreground">Property</th>
                    <th className="text-right p-3 text-muted-foreground">Sale Price</th>
                    <th className="text-right p-3 text-muted-foreground">$/sqft</th>
                    <th className="text-right p-3 text-muted-foreground">Beds/Baths</th>
                    <th className="text-right p-3 text-muted-foreground">Adjustment</th>
                    <th className="text-right p-3 text-muted-foreground">Adj. Price</th>
                    <th className="text-center p-3 text-muted-foreground">Weight</th>
                    <th className="p-3"></th>
                  </tr>
                </thead>
                <tbody>
                  {adjustedComps.map((comp) => (
                    <tr key={comp.id} className="border-b border-white/5">
                      <td className="p-3">
                        <div className="flex items-center gap-2">
                          <Home className="h-4 w-4 text-emerald-400 shrink-0" />
                          <div>
                            <div className="text-white font-medium">{comp.address}</div>
                            <div className="text-muted-foreground text-xs flex items-center gap-2">
                              <MapPin className="h-3 w-3" />
                              {comp.city}, {comp.state} • {comp.distanceMiles}mi
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="p-3 text-right text-white">{formatCurrency(comp.salePrice)}</td>
                      <td className="p-3 text-right text-muted-foreground">{formatCurrency(comp.pricePerSqft)}</td>
                      <td className="p-3 text-right text-muted-foreground">{comp.bedrooms}bd/{comp.bathrooms}ba</td>
                      <td className={`p-3 text-right ${comp.totalAdjustment >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                        {comp.totalAdjustment >= 0 ? '+' : ''}{formatCurrency(comp.totalAdjustment)}
                      </td>
                      <td className="p-3 text-right text-white font-medium">{formatCurrency(comp.adjustedPrice)}</td>
                      <td className="p-3 text-center">
                        <span className={`px-2 py-0.5 rounded text-xs ${comp.weight >= 0.8 ? 'bg-emerald-500/20 text-emerald-400' : comp.weight >= 0.6 ? 'bg-yellow-500/20 text-yellow-400' : 'bg-amber-500/20 text-amber-400'}`}>
                          {(comp.weight * 100).toFixed(0)}%
                        </span>
                      </td>
                      <td className="p-3">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemoveComp(comp.id)}
                          className="text-muted-foreground hover:text-red-400"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-12">
              <Building className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
              <h3 className="text-white font-medium mb-1">No Comparable Properties</h3>
              <p className="text-muted-foreground text-sm mb-4">
                Add recently sold properties to calculate an accurate ARV
              </p>
              <Button onClick={() => setShowAddForm(true)} variant="outline">
                <Plus className="h-4 w-4 mr-2" />
                Add First Comp
              </Button>
            </div>
          )}

          {/* Adjustment Legend */}
          {comps.length > 0 && (
            <div className="mt-4 p-4 rounded-lg bg-muted/40 border border-white/10">
              <h4 className="text-white font-medium text-sm mb-3">Adjustment Methodology</h4>
              <div className="grid md:grid-cols-2 gap-4 text-xs text-muted-foreground">
                <div>
                  <p><strong className="text-foreground/90">Size:</strong> $50 per sqft difference</p>
                  <p><strong className="text-foreground/90">Bedrooms:</strong> $5,000 per bedroom</p>
                  <p><strong className="text-foreground/90">Bathrooms:</strong> $3,000 per bathroom</p>
                </div>
                <div>
                  <p><strong className="text-foreground/90">Condition:</strong> -10% to +10% based on rating</p>
                  <p><strong className="text-foreground/90">Distance Weight:</strong> Closer comps weighted higher</p>
                  <p><strong className="text-foreground/90">Time Weight:</strong> Recent sales weighted higher</p>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
