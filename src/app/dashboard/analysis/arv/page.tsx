"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  ArrowLeft,
  Home,
  DollarSign,
  SquareIcon,
  TrendingUp,
  MapPin,
  Calculator,
  Plus,
  Trash2,
  BarChart3,
} from "lucide-react";

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(amount);
}

interface Comparable {
  id: string;
  address: string;
  salePrice: number;
  sqft: number;
  beds: number;
  baths: number;
  condition: "inferior" | "similar" | "superior";
  adjustment: number;
}

const conditionAdjustments = {
  inferior: 10,
  similar: 0,
  superior: -10,
};

export default function ARVCalculatorPage() {
  const [method, setMethod] = useState<"comps" | "sqft" | "income">("comps");
  
  // Subject property
  const [subjectSqft, setSubjectSqft] = useState<number>(1800);
  const [subjectBeds, setSubjectBeds] = useState<number>(3);
  const [subjectBaths, setSubjectBaths] = useState<number>(2);
  
  // Comparables method
  const [comparables, setComparables] = useState<Comparable[]>([
    { id: "1", address: "123 Main St", salePrice: 275000, sqft: 1750, beds: 3, baths: 2, condition: "similar", adjustment: 0 },
    { id: "2", address: "456 Oak Ave", salePrice: 285000, sqft: 1900, beds: 3, baths: 2, condition: "superior", adjustment: -10 },
    { id: "3", address: "789 Pine Rd", salePrice: 260000, sqft: 1650, beds: 3, baths: 2, condition: "inferior", adjustment: 10 },
  ]);

  // Sqft method
  const [pricePerSqft, setPricePerSqft] = useState<number>(150);

  // Income method
  const [monthlyRent, setMonthlyRent] = useState<number>(2200);
  const [capRate, setCapRate] = useState<number>(8);
  const [expenses, setExpenses] = useState<number>(35); // percentage

  // Add comparable
  const addComparable = () => {
    const newComp: Comparable = {
      id: Date.now().toString(),
      address: "",
      salePrice: 0,
      sqft: 0,
      beds: 3,
      baths: 2,
      condition: "similar",
      adjustment: 0,
    };
    setComparables([...comparables, newComp]);
  };

  // Update comparable
  const updateComparable = (id: string, field: keyof Comparable, value: string | number) => {
    setComparables(comps => 
      comps.map(c => {
        if (c.id !== id) return c;
        const updated = { ...c, [field]: value };
        if (field === "condition") {
          updated.adjustment = conditionAdjustments[value as keyof typeof conditionAdjustments];
        }
        return updated;
      })
    );
  };

  // Remove comparable
  const removeComparable = (id: string) => {
    setComparables(comps => comps.filter(c => c.id !== id));
  };

  // Calculate ARV based on method
  const calculateARV = () => {
    if (method === "comps" && comparables.length > 0) {
      const adjustedPrices = comparables.map(c => {
        const adjustedPrice = c.salePrice * (1 + c.adjustment / 100);
        return adjustedPrice;
      });
      return adjustedPrices.reduce((a, b) => a + b, 0) / adjustedPrices.length;
    }
    
    if (method === "sqft") {
      return subjectSqft * pricePerSqft;
    }
    
    if (method === "income") {
      const annualRent = monthlyRent * 12;
      const netOperatingIncome = annualRent * (1 - expenses / 100);
      return netOperatingIncome / (capRate / 100);
    }
    
    return 0;
  };

  const arv = calculateARV();
  const avgPricePerSqft = arv / subjectSqft;

  // Confidence calculation (simplified)
  const getConfidence = () => {
    if (method === "comps") {
      if (comparables.length >= 4) return { level: "High", color: "text-green-600", percent: 90 };
      if (comparables.length >= 2) return { level: "Medium", color: "text-yellow-600", percent: 70 };
      return { level: "Low", color: "text-red-600", percent: 50 };
    }
    return { level: "Medium", color: "text-yellow-600", percent: 70 };
  };

  const confidence = getConfidence();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/dashboard/analysis">
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold">ARV Calculator</h1>
          <p className="text-muted-foreground">Calculate After Repair Value using multiple methods</p>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Left: Subject Property + Inputs */}
        <div className="lg:col-span-2 space-y-6">
          {/* Subject Property */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Home className="w-5 h-5" />
                Subject Property
              </CardTitle>
              <CardDescription>Enter your property details</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid sm:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="sqft">Square Feet</Label>
                  <div className="relative">
                    <SquareIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="sqft"
                      type="number"
                      value={subjectSqft}
                      onChange={(e) => setSubjectSqft(Number(e.target.value))}
                      className="pl-9"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="beds">Bedrooms</Label>
                  <Input
                    id="beds"
                    type="number"
                    value={subjectBeds}
                    onChange={(e) => setSubjectBeds(Number(e.target.value))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="baths">Bathrooms</Label>
                  <Input
                    id="baths"
                    type="number"
                    step="0.5"
                    value={subjectBaths}
                    onChange={(e) => setSubjectBaths(Number(e.target.value))}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Calculation Method Tabs */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calculator className="w-5 h-5" />
                Calculation Method
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Tabs value={method} onValueChange={(v) => setMethod(v as typeof method)}>
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="comps">Comparables</TabsTrigger>
                  <TabsTrigger value="sqft">Price/SqFt</TabsTrigger>
                  <TabsTrigger value="income">Income</TabsTrigger>
                </TabsList>

                {/* Comparables Tab */}
                <TabsContent value="comps" className="space-y-4 mt-4">
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-muted-foreground">
                      Add recently sold comparable properties (last 6 months)
                    </p>
                    <Button size="sm" onClick={addComparable}>
                      <Plus className="w-4 h-4 mr-2" /> Add Comp
                    </Button>
                  </div>

                  <div className="space-y-4">
                    {comparables.map((comp, idx) => (
                      <motion.div
                        key={comp.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="p-4 border rounded-lg space-y-4"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-medium">Comp #{idx + 1}</span>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeComparable(comp.id)}
                          >
                            <Trash2 className="w-4 h-4 text-destructive" />
                          </Button>
                        </div>
                        
                        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                          <div className="sm:col-span-2 space-y-2">
                            <Label>Address</Label>
                            <div className="relative">
                              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                              <Input
                                value={comp.address}
                                onChange={(e) => updateComparable(comp.id, "address", e.target.value)}
                                placeholder="123 Main St"
                                className="pl-9"
                              />
                            </div>
                          </div>
                          <div className="space-y-2">
                            <Label>Sale Price</Label>
                            <div className="relative">
                              <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                              <Input
                                type="number"
                                value={comp.salePrice || ""}
                                onChange={(e) => updateComparable(comp.id, "salePrice", Number(e.target.value))}
                                className="pl-9"
                              />
                            </div>
                          </div>
                          <div className="space-y-2">
                            <Label>Square Feet</Label>
                            <Input
                              type="number"
                              value={comp.sqft || ""}
                              onChange={(e) => updateComparable(comp.id, "sqft", Number(e.target.value))}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>Beds</Label>
                            <Input
                              type="number"
                              value={comp.beds}
                              onChange={(e) => updateComparable(comp.id, "beds", Number(e.target.value))}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>Baths</Label>
                            <Input
                              type="number"
                              step="0.5"
                              value={comp.baths}
                              onChange={(e) => updateComparable(comp.id, "baths", Number(e.target.value))}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>Condition vs Subject</Label>
                            <select
                              value={comp.condition}
                              onChange={(e) => updateComparable(comp.id, "condition", e.target.value)}
                              className="w-full h-10 px-3 border rounded-md bg-background"
                            >
                              <option value="inferior">Inferior (+10%)</option>
                              <option value="similar">Similar (0%)</option>
                              <option value="superior">Superior (-10%)</option>
                            </select>
                          </div>
                          <div className="space-y-2">
                            <Label>Adjusted Price</Label>
                            <div className="h-10 px-3 flex items-center border rounded-md bg-muted">
                              {formatCurrency(comp.salePrice * (1 + comp.adjustment / 100))}
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </TabsContent>

                {/* Price per SqFt Tab */}
                <TabsContent value="sqft" className="space-y-4 mt-4">
                  <p className="text-sm text-muted-foreground">
                    Use market average price per square foot for the area
                  </p>
                  <div className="max-w-xs space-y-2">
                    <Label>Price per Square Foot</Label>
                    <div className="relative">
                      <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        type="number"
                        value={pricePerSqft}
                        onChange={(e) => setPricePerSqft(Number(e.target.value))}
                        className="pl-9"
                      />
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {subjectSqft} sqft × ${pricePerSqft}/sqft = {formatCurrency(subjectSqft * pricePerSqft)}
                    </p>
                  </div>
                </TabsContent>

                {/* Income Approach Tab */}
                <TabsContent value="income" className="space-y-4 mt-4">
                  <p className="text-sm text-muted-foreground">
                    Calculate value based on rental income potential (best for rentals)
                  </p>
                  <div className="grid sm:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label>Monthly Rent</Label>
                      <div className="relative">
                        <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                          type="number"
                          value={monthlyRent}
                          onChange={(e) => setMonthlyRent(Number(e.target.value))}
                          className="pl-9"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>Cap Rate (%)</Label>
                      <Input
                        type="number"
                        step="0.5"
                        value={capRate}
                        onChange={(e) => setCapRate(Number(e.target.value))}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Operating Expenses (%)</Label>
                      <Input
                        type="number"
                        value={expenses}
                        onChange={(e) => setExpenses(Number(e.target.value))}
                      />
                    </div>
                  </div>
                  <div className="text-sm text-muted-foreground space-y-1">
                    <p>Annual Rent: {formatCurrency(monthlyRent * 12)}</p>
                    <p>NOI (after {expenses}% expenses): {formatCurrency(monthlyRent * 12 * (1 - expenses / 100))}</p>
                    <p>Value at {capRate}% cap: {formatCurrency(arv)}</p>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>

        {/* Right: Results */}
        <div className="space-y-6">
          {/* ARV Result Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="bg-linear-to-br from-blue-500 to-cyan-500 text-white">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5" />
                  Estimated ARV
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-4xl font-bold">{formatCurrency(arv)}</p>
                <p className="text-blue-100 mt-2">
                  ${avgPricePerSqft.toFixed(0)}/sqft
                </p>
              </CardContent>
            </Card>
          </motion.div>

          {/* Confidence Score */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5" />
                Confidence Level
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className={`font-semibold ${confidence.color}`}>
                    {confidence.level} Confidence
                  </span>
                  <span className="text-sm text-muted-foreground">
                    {confidence.percent}%
                  </span>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${confidence.percent}%` }}
                    transition={{ delay: 0.3, duration: 0.5 }}
                    className={`h-full ${
                      confidence.level === "High" ? "bg-green-500" :
                      confidence.level === "Medium" ? "bg-yellow-500" :
                      "bg-red-500"
                    }`}
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  {method === "comps" && comparables.length < 3 && 
                    "Add more comparables to increase confidence"
                  }
                  {method === "comps" && comparables.length >= 3 && 
                    "Good number of comparables for reliable estimate"
                  }
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Next Steps</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button className="w-full" asChild>
                <Link href="/dashboard/analysis/repairs">
                  Estimate Repairs →
                </Link>
              </Button>
              <Button variant="outline" className="w-full" asChild>
                <Link href="/dashboard/analysis/mao">
                  Calculate MAO →
                </Link>
              </Button>
              <Button variant="ghost" className="w-full" asChild>
                <Link href="/dashboard/submit">
                  Submit This Deal
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
