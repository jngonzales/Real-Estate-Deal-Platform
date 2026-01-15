"use client";

import { useState, useMemo } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { CurrencyInput, NumberInput } from "@/components/ui/currency-input";
import { Checkbox } from "@/components/ui/checkbox";
import { Slider } from "@/components/ui/slider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
  propertyDetailsSchema,
  sellerInfoSchema,
  repairScopeSchema,
  financingSchema,
  propertyTypes,
  usStates,
  countries,
  canadianProvinces,
  repairCategories,
  loanTypes,
  type PropertyDetailsForm,
  type SellerInfoForm,
  type RepairScopeForm,
  type FinancingForm,
  type DealSubmissionForm,
} from "@/lib/schemas/deal-submission";
import { submitDeal, uploadPhoto } from "@/lib/actions/deal-actions";
import {
  ChevronLeft,
  ChevronRight,
  Upload,
  X,
  Check,
  Loader2,
  Building2,
  User,
  Camera,
  MapPin,
  Wrench,
  DollarSign,
  ClipboardCheck,
  Calculator,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
} from "lucide-react";

const steps = [
  { id: 1, name: "Property", icon: Building2 },
  { id: 2, name: "Repairs", icon: Wrench },
  { id: 3, name: "Financing", icon: DollarSign },
  { id: 4, name: "Seller", icon: User },
  { id: 5, name: "Photos", icon: Camera },
  { id: 6, name: "Review", icon: ClipboardCheck },
];

export function DealSubmissionForm() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<Partial<DealSubmissionForm>>({});
  const [photos, setPhotos] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lookingUpAddress, setLookingUpAddress] = useState(false);
  
  // Repair items state
  const [selectedRepairs, setSelectedRepairs] = useState<Record<string, { enabled: boolean; cost: number }>>({});

  // Step 1 form
  const step1Form = useForm<PropertyDetailsForm>({
    resolver: zodResolver(propertyDetailsSchema) as any,
    defaultValues: {
      address: formData.address || "",
      city: formData.city || "",
      state: formData.state || "",
      zip: formData.zip || "",
      country: formData.country || "US",
      county: formData.county || "",
      propertyType: formData.propertyType || "single_family",
      bedrooms: formData.bedrooms ?? undefined,
      bathrooms: formData.bathrooms ?? undefined,
      sqft: formData.sqft ?? undefined,
      yearBuilt: formData.yearBuilt ?? undefined,
    },
  });

  const selectedCountry = step1Form.watch("country");

  // Step 2: Repair Scope form
  const step2Form = useForm<RepairScopeForm>({
    resolver: zodResolver(repairScopeSchema) as any,
    defaultValues: {
      estimatedARV: formData.estimatedARV || 0,
      totalRepairCost: formData.totalRepairCost || 0,
      repairNotes: formData.repairNotes || "",
    },
  });

  // Step 3: Financing form
  const step3Form = useForm<FinancingForm>({
    resolver: zodResolver(financingSchema) as any,
    defaultValues: {
      loanType: formData.loanType || "hard_money",
      loanAmount: formData.loanAmount || 0,
      interestRate: formData.interestRate || 12,
      loanTerm: formData.loanTerm || 12,
      downPayment: formData.downPayment || 0,
      downPaymentPercent: formData.downPaymentPercent || 20,
      closingCosts: formData.closingCosts || 0,
      holdingCostsMonthly: formData.holdingCostsMonthly || 0,
      estimatedHoldTime: formData.estimatedHoldTime || 6,
    },
  });

  // Step 4: Seller info form
  const step4Form = useForm<SellerInfoForm>({
    resolver: zodResolver(sellerInfoSchema) as any,
    defaultValues: {
      sellerName: formData.sellerName || "",
      sellerPhone: formData.sellerPhone || "",
      sellerEmail: formData.sellerEmail || "",
      sellerMotivation: formData.sellerMotivation || "",
      askingPrice: formData.askingPrice || 0,
      notes: formData.notes || "",
    },
  });

  // Calculate total repair cost from selected items
  const totalRepairCost = useMemo(() => {
    return Object.entries(selectedRepairs).reduce((sum, [, item]) => {
      return item.enabled ? sum + item.cost : sum;
    }, 0);
  }, [selectedRepairs]);

  // Calculate investment metrics for review step
  const investmentMetrics = useMemo(() => {
    const askingPrice = formData.askingPrice || 0;
    const arv = formData.estimatedARV || 0;
    const repairs = formData.totalRepairCost || totalRepairCost || 0;
    const closingCosts = formData.closingCosts || (askingPrice * 0.03);
    const holdTime = formData.estimatedHoldTime || 6;
    const holdingCostsMonthly = formData.holdingCostsMonthly || 500;
    const totalHoldingCosts = holdingCostsMonthly * holdTime;
    const sellingCosts = arv * 0.08; // 8% selling costs

    const totalInvestment = askingPrice + repairs + closingCosts + totalHoldingCosts;
    const profit = arv - totalInvestment - sellingCosts;
    const roi = totalInvestment > 0 ? (profit / totalInvestment) * 100 : 0;
    const mao70 = arv > 0 ? (arv * 0.70) - repairs : 0;
    const dealScore = roi >= 25 ? "Great" : roi >= 15 ? "Good" : roi >= 5 ? "Marginal" : "Pass";
    const dealColor = roi >= 25 ? "text-emerald-500" : roi >= 15 ? "text-blue-500" : roi >= 5 ? "text-yellow-500" : "text-red-500";

    return {
      askingPrice,
      arv,
      repairs,
      closingCosts,
      totalHoldingCosts,
      sellingCosts,
      totalInvestment,
      profit,
      roi,
      mao70,
      dealScore,
      dealColor,
    };
  }, [formData, totalRepairCost]);

  const handleStep1Submit = (data: PropertyDetailsForm) => {
    setFormData((prev) => ({ ...prev, ...data }));
    setCurrentStep(2);
  };

  // Address lookup using Google Maps API
  const handleAddressLookup = async () => {
    const address = step1Form.getValues("address");
    const city = step1Form.getValues("city");
    const state = step1Form.getValues("state");

    if (!address) {
      toast.error("Please enter a street address first");
      return;
    }

    setLookingUpAddress(true);
    try {
      const response = await fetch("/api/integrations/validate-address", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ address, city, state }),
      });

      const result = await response.json();

      if (result.success && result.data) {
        const data = result.data;
        
        // Auto-fill the form fields
        if (data.city) step1Form.setValue("city", data.city);
        if (data.stateCode || data.state) step1Form.setValue("state", data.stateCode || data.state);
        if (data.postalCode) step1Form.setValue("zip", data.postalCode);
        if (data.county) step1Form.setValue("county", data.county);
        if (data.formattedAddress) step1Form.setValue("address", data.formattedAddress.split(",")[0] || address);

        toast.success(result.isMock ? "Address validated (mock data)" : "Address validated!", {
          description: data.formattedAddress || `${city}, ${state}`,
        });
      } else {
        toast.error("Could not validate address", {
          description: result.error || "Please check the address and try again",
        });
      }
    } catch {
      toast.error("Failed to lookup address");
    } finally {
      setLookingUpAddress(false);
    }
  };

  const handleStep2Submit = (data: RepairScopeForm) => {
    const repairItems = Object.entries(selectedRepairs)
      .filter(([, item]) => item.enabled)
      .map(([category, item]) => ({
        category,
        description: repairCategories.find(c => c.id === category)?.label || category,
        cost: item.cost,
      }));

    setFormData((prev) => ({ 
      ...prev, 
      ...data,
      repairItems,
      totalRepairCost,
    }));
    setCurrentStep(3);
  };

  const handleStep3Submit = (data: FinancingForm) => {
    setFormData((prev) => ({ ...prev, ...data }));
    setCurrentStep(4);
  };

  const handleStep4Submit = (data: SellerInfoForm) => {
    setFormData((prev) => ({ ...prev, ...data }));
    setCurrentStep(5);
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    setError(null);

    for (const file of Array.from(files)) {
      const formDataUpload = new FormData();
      formDataUpload.append("file", file);

      const result = await uploadPhoto(formDataUpload);
      if (result.error) {
        setError(result.error);
      } else if (result.url) {
        setPhotos((prev) => [...prev, result.url!]);
      }
    }

    setUploading(false);
    e.target.value = "";
  };

  const removePhoto = (index: number) => {
    setPhotos((prev) => prev.filter((_, i) => i !== index));
  };

  const handlePhotosNext = () => {
    setFormData((prev) => ({ ...prev, photos }));
    setCurrentStep(6);
  };

  const handleFinalSubmit = async () => {
    setSubmitting(true);
    setError(null);

    const fullData: DealSubmissionForm = {
      ...(formData as DealSubmissionForm),
      photos,
    };

    const result = await submitDeal(fullData);

    if (result.error) {
      setError(result.error);
      toast.error("Failed to submit deal", {
        description: result.error,
      });
      setSubmitting(false);
    } else {
      toast.success("Deal submitted successfully!", {
        description: "Your deal has been added to the pipeline.",
      });
      router.push("/dashboard/deals");
    }
  };

  const progress = (currentStep / steps.length) * 100;

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0,
    }).format(value);
  };

  return (
    <div className="space-y-6">
      {/* Progress */}
      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          {steps.map((step) => (
            <div
              key={step.id}
              className={`flex items-center gap-2 ${
                currentStep >= step.id ? "text-primary dark:text-primary" : "text-slate-400 dark:text-slate-500"
              }`}
            >
              <step.icon className="h-4 w-4" />
              <span className="hidden sm:inline">{step.name}</span>
            </div>
          ))}
        </div>
        <Progress value={progress} className="h-2" />
      </div>

      {/* Error message */}
      {error && (
        <div className="rounded-md bg-red-50 dark:bg-red-950/50 p-4 text-sm text-red-600 dark:text-red-400">
          {error}
        </div>
      )}

      {/* Step 1: Property Details */}
      {currentStep === 1 && (
        <Card className="dark:bg-slate-900/50 dark:border-slate-800">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              Property Details
            </CardTitle>
            <CardDescription>Enter the basic property information</CardDescription>
          </CardHeader>
          <CardContent>
            <form
              onSubmit={step1Form.handleSubmit(handleStep1Submit)}
              className="space-y-4"
            >
              <div className="grid gap-4 md:grid-cols-2">
                <div className="md:col-span-2">
                  <Label htmlFor="address">Street Address *</Label>
                  <div className="flex gap-2">
                    <Input
                      id="address"
                      {...step1Form.register("address")}
                      placeholder="123 Main Street"
                      className="flex-1 dark:bg-slate-800 dark:border-slate-700"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleAddressLookup}
                      disabled={lookingUpAddress}
                      className="shrink-0"
                    >
                      {lookingUpAddress ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <MapPin className="h-4 w-4" />
                      )}
                      <span className="ml-2 hidden sm:inline">Lookup</span>
                    </Button>
                  </div>
                  {step1Form.formState.errors.address && (
                    <p className="mt-1 text-sm text-red-500">
                      {step1Form.formState.errors.address.message}
                    </p>
                  )}
                </div>

                <div>
                  <Label htmlFor="city">City *</Label>
                  <Input
                    id="city"
                    {...step1Form.register("city")}
                    placeholder="Austin"
                    className="dark:bg-slate-800 dark:border-slate-700"
                  />
                  {step1Form.formState.errors.city && (
                    <p className="mt-1 text-sm text-red-500">
                      {step1Form.formState.errors.city.message}
                    </p>
                  )}
                </div>

                <div>
                  <Label htmlFor="country">Country *</Label>
                  <Select
                    onValueChange={(value) => {
                      step1Form.setValue("country", value);
                      step1Form.setValue("state", "");
                    }}
                    defaultValue={step1Form.getValues("country") || "US"}
                  >
                    <SelectTrigger className="dark:bg-slate-800 dark:border-slate-700">
                      <SelectValue placeholder="Select country" />
                    </SelectTrigger>
                    <SelectContent>
                      {countries.map((country) => (
                        <SelectItem key={country.value} value={country.value}>
                          {country.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="state">
                    {selectedCountry === "US" ? "State" : selectedCountry === "CA" ? "Province" : "State/Region"} *
                  </Label>
                  {selectedCountry === "US" ? (
                    <Select
                      onValueChange={(value) => step1Form.setValue("state", value)}
                      defaultValue={step1Form.getValues("state")}
                    >
                      <SelectTrigger className="dark:bg-slate-800 dark:border-slate-700">
                        <SelectValue placeholder="Select state" />
                      </SelectTrigger>
                      <SelectContent>
                        {usStates.map((state) => (
                          <SelectItem key={state.value} value={state.value}>
                            {state.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  ) : selectedCountry === "CA" ? (
                    <Select
                      onValueChange={(value) => step1Form.setValue("state", value)}
                      defaultValue={step1Form.getValues("state")}
                    >
                      <SelectTrigger className="dark:bg-slate-800 dark:border-slate-700">
                        <SelectValue placeholder="Select province" />
                      </SelectTrigger>
                      <SelectContent>
                        {canadianProvinces.map((province) => (
                          <SelectItem key={province.value} value={province.value}>
                            {province.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  ) : (
                    <Input
                      id="state"
                      {...step1Form.register("state")}
                      placeholder="Enter state/province/region"
                      className="dark:bg-slate-800 dark:border-slate-700"
                    />
                  )}
                </div>

                <div>
                  <Label htmlFor="zip">
                    {selectedCountry === "US" ? "ZIP Code" : "Postal Code"} *
                  </Label>
                  <Input
                    id="zip"
                    {...step1Form.register("zip")}
                    placeholder={selectedCountry === "US" ? "78701" : "M5V 1A1"}
                    className="dark:bg-slate-800 dark:border-slate-700"
                  />
                </div>

                <div>
                  <Label htmlFor="county">County</Label>
                  <Input
                    id="county"
                    {...step1Form.register("county")}
                    placeholder="Travis"
                    className="dark:bg-slate-800 dark:border-slate-700"
                  />
                </div>

                <div>
                  <Label htmlFor="propertyType">Property Type *</Label>
                  <Select
                    onValueChange={(value: any) =>
                      step1Form.setValue("propertyType", value)
                    }
                    defaultValue={step1Form.getValues("propertyType")}
                  >
                    <SelectTrigger className="dark:bg-slate-800 dark:border-slate-700">
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      {propertyTypes.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="bedrooms">Bedrooms</Label>
                  <NumberInput
                    id="bedrooms"
                    value={step1Form.watch("bedrooms") || 0}
                    onChange={(val) => step1Form.setValue("bedrooms", val)}
                    min={0}
                    max={20}
                    step={1}
                  />
                </div>

                <div>
                  <Label htmlFor="bathrooms">Bathrooms</Label>
                  <NumberInput
                    id="bathrooms"
                    value={step1Form.watch("bathrooms") || 0}
                    onChange={(val) => step1Form.setValue("bathrooms", val)}
                    min={0}
                    max={20}
                    step={0.5}
                  />
                </div>

                <div>
                  <Label htmlFor="sqft">Square Feet</Label>
                  <NumberInput
                    id="sqft"
                    value={step1Form.watch("sqft") || 0}
                    onChange={(val) => step1Form.setValue("sqft", val)}
                    min={0}
                    step={100}
                    showControls={false}
                  />
                </div>

                <div>
                  <Label htmlFor="yearBuilt">Year Built</Label>
                  <NumberInput
                    id="yearBuilt"
                    value={step1Form.watch("yearBuilt") || 0}
                    onChange={(val) => step1Form.setValue("yearBuilt", val)}
                    min={1800}
                    max={2025}
                    step={1}
                    showControls={false}
                  />
                </div>
              </div>

              <div className="flex justify-end pt-4">
                <Button type="submit">
                  Next
                  <ChevronRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Step 2: Repair Scope */}
      {currentStep === 2 && (
        <Card className="dark:bg-slate-900/50 dark:border-slate-800">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Wrench className="h-5 w-5" />
              Repair Scope
            </CardTitle>
            <CardDescription>Estimate repair costs by category. Check items that need work.</CardDescription>
          </CardHeader>
          <CardContent>
            <form
              onSubmit={step2Form.handleSubmit(handleStep2Submit)}
              className="space-y-6"
            >
              {/* ARV Input */}
              <div>
                <Label htmlFor="estimatedARV">Estimated After Repair Value (ARV) *</Label>
                <CurrencyInput
                  id="estimatedARV"
                  value={step2Form.watch("estimatedARV") || 0}
                  onChange={(val) => step2Form.setValue("estimatedARV", val)}
                  step={5000}
                />
                <p className="mt-1 text-xs text-muted-foreground">
                  What will the property be worth after repairs?
                </p>
              </div>

              {/* Repair Categories */}
              <div className="space-y-4">
                <Label>Repair Items (check items that need work)</Label>
                <div className="grid gap-4 sm:grid-cols-2">
                  {repairCategories.map((category) => {
                    const isEnabled = selectedRepairs[category.id]?.enabled || false;
                    const cost = selectedRepairs[category.id]?.cost ?? category.defaultCost;

                    return (
                      <div
                        key={category.id}
                        className={`rounded-lg border p-4 transition-colors ${
                          isEnabled 
                            ? "border-primary bg-primary/5 dark:bg-primary/10" 
                            : "border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600"
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <Checkbox
                              id={category.id}
                              checked={isEnabled}
                              onCheckedChange={(checked) => {
                                setSelectedRepairs((prev) => ({
                                  ...prev,
                                  [category.id]: {
                                    enabled: checked as boolean,
                                    cost: prev[category.id]?.cost ?? category.defaultCost,
                                  },
                                }));
                              }}
                            />
                            <Label htmlFor={category.id} className="cursor-pointer font-medium">
                              {category.label}
                            </Label>
                          </div>
                          {isEnabled && (
                            <span className="text-sm font-semibold text-primary">
                              {formatCurrency(cost)}
                            </span>
                          )}
                        </div>
                        {isEnabled && (
                          <div className="mt-3">
                            <Slider
                              value={[cost]}
                              onValueChange={(value: number[]) => {
                                setSelectedRepairs((prev) => ({
                                  ...prev,
                                  [category.id]: {
                                    enabled: true,
                                    cost: value[0],
                                  },
                                }));
                              }}
                              min={0}
                              max={category.defaultCost * 3}
                              step={500}
                              className="[&>span:first-child]:bg-slate-700 [&_[role=slider]]:bg-primary"
                            />
                            <div className="mt-1 flex justify-between text-xs text-muted-foreground">
                              <span>$0</span>
                              <span>{formatCurrency(category.defaultCost * 3)}</span>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Total Repair Cost Summary */}
              <Card className="bg-gradient-to-r from-orange-500/10 to-red-500/10 border-orange-500/30">
                <CardContent className="py-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Calculator className="h-5 w-5 text-orange-500" />
                      <span className="font-medium">Total Repair Estimate</span>
                    </div>
                    <span className="text-2xl font-bold text-orange-500">
                      {formatCurrency(totalRepairCost)}
                    </span>
                  </div>
                </CardContent>
              </Card>

              {/* Additional Notes */}
              <div>
                <Label htmlFor="repairNotes">Repair Notes (optional)</Label>
                <Textarea
                  id="repairNotes"
                  {...step2Form.register("repairNotes")}
                  placeholder="Any additional notes about the repair scope..."
                  rows={3}
                  className="dark:bg-slate-800 dark:border-slate-700"
                />
              </div>

              <div className="flex justify-between pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setCurrentStep(1)}
                >
                  <ChevronLeft className="mr-2 h-4 w-4" />
                  Back
                </Button>
                <Button type="submit">
                  Next
                  <ChevronRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Step 3: Financing */}
      {currentStep === 3 && (
        <Card className="dark:bg-slate-900/50 dark:border-slate-800">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5" />
              Financing Details
            </CardTitle>
            <CardDescription>How will this deal be financed?</CardDescription>
          </CardHeader>
          <CardContent>
            <form
              onSubmit={step3Form.handleSubmit(handleStep3Submit)}
              className="space-y-4"
            >
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <Label htmlFor="loanType">Loan Type</Label>
                  <Select
                    onValueChange={(value) => step3Form.setValue("loanType", value)}
                    defaultValue={step3Form.getValues("loanType") || "hard_money"}
                  >
                    <SelectTrigger className="dark:bg-slate-800 dark:border-slate-700">
                      <SelectValue placeholder="Select loan type" />
                    </SelectTrigger>
                    <SelectContent>
                      {loanTypes.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="downPaymentPercent">Down Payment %</Label>
                  <div className="flex items-center gap-4">
                    <Slider
                      value={[step3Form.watch("downPaymentPercent") || 20]}
                      onValueChange={(value: number[]) => {
                        step3Form.setValue("downPaymentPercent", value[0]);
                        // Calculate down payment amount based on asking price
                        const askingPrice = formData.askingPrice || 0;
                        step3Form.setValue("downPayment", askingPrice * (value[0] / 100));
                      }}
                      min={0}
                      max={100}
                      step={5}
                      className="flex-1 [&>span:first-child]:bg-slate-700 [&_[role=slider]]:bg-primary"
                    />
                    <span className="w-16 text-right font-semibold">
                      {step3Form.watch("downPaymentPercent") || 20}%
                    </span>
                  </div>
                </div>

                <div>
                  <Label htmlFor="interestRate">Interest Rate (%)</Label>
                  <NumberInput
                    id="interestRate"
                    value={step3Form.watch("interestRate") || 12}
                    onChange={(val) => step3Form.setValue("interestRate", val)}
                    min={0}
                    max={30}
                    step={0.25}
                    showControls={false}
                  />
                </div>

                <div>
                  <Label htmlFor="loanTerm">Loan Term (months)</Label>
                  <NumberInput
                    id="loanTerm"
                    value={step3Form.watch("loanTerm") || 12}
                    onChange={(val) => step3Form.setValue("loanTerm", val)}
                    min={1}
                    max={360}
                    step={1}
                  />
                </div>

                <div>
                  <Label htmlFor="closingCosts">Closing Costs (Buy)</Label>
                  <CurrencyInput
                    id="closingCosts"
                    value={step3Form.watch("closingCosts") || 0}
                    onChange={(val) => step3Form.setValue("closingCosts", val)}
                    step={500}
                  />
                </div>

                <div>
                  <Label htmlFor="holdingCostsMonthly">Monthly Holding Costs</Label>
                  <CurrencyInput
                    id="holdingCostsMonthly"
                    value={step3Form.watch("holdingCostsMonthly") || 0}
                    onChange={(val) => step3Form.setValue("holdingCostsMonthly", val)}
                    step={100}
                  />
                  <p className="mt-1 text-xs text-muted-foreground">
                    Insurance, utilities, lawn care, etc.
                  </p>
                </div>

                <div>
                  <Label htmlFor="estimatedHoldTime">Estimated Hold Time (months)</Label>
                  <NumberInput
                    id="estimatedHoldTime"
                    value={step3Form.watch("estimatedHoldTime") || 6}
                    onChange={(val) => step3Form.setValue("estimatedHoldTime", val)}
                    min={1}
                    max={60}
                    step={1}
                  />
                </div>
              </div>

              <div className="flex justify-between pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setCurrentStep(2)}
                >
                  <ChevronLeft className="mr-2 h-4 w-4" />
                  Back
                </Button>
                <Button type="submit">
                  Next
                  <ChevronRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Step 4: Seller Info */}
      {currentStep === 4 && (
        <Card className="dark:bg-slate-900/50 dark:border-slate-800">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Seller Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form
              onSubmit={step4Form.handleSubmit(handleStep4Submit)}
              className="space-y-4"
            >
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <Label htmlFor="sellerName">Seller Name *</Label>
                  <Input
                    id="sellerName"
                    {...step4Form.register("sellerName")}
                    placeholder="John Smith"
                    className="dark:bg-slate-800 dark:border-slate-700"
                  />
                  {step4Form.formState.errors.sellerName && (
                    <p className="mt-1 text-sm text-red-500">
                      {step4Form.formState.errors.sellerName.message}
                    </p>
                  )}
                </div>

                <div>
                  <Label htmlFor="sellerPhone">Seller Phone</Label>
                  <Input
                    id="sellerPhone"
                    {...step4Form.register("sellerPhone")}
                    placeholder="(512) 555-0123"
                    className="dark:bg-slate-800 dark:border-slate-700"
                  />
                </div>

                <div>
                  <Label htmlFor="sellerEmail">Seller Email</Label>
                  <Input
                    id="sellerEmail"
                    type="email"
                    {...step4Form.register("sellerEmail")}
                    placeholder="seller@email.com"
                    className="dark:bg-slate-800 dark:border-slate-700"
                  />
                </div>

                <div>
                  <Label htmlFor="askingPrice">Asking Price *</Label>
                  <CurrencyInput
                    id="askingPrice"
                    value={step4Form.watch("askingPrice") || 0}
                    onChange={(val) => step4Form.setValue("askingPrice", val)}
                    step={5000}
                  />
                  {step4Form.formState.errors.askingPrice && (
                    <p className="mt-1 text-sm text-red-500">
                      {step4Form.formState.errors.askingPrice.message}
                    </p>
                  )}
                </div>

                <div className="md:col-span-2">
                  <Label htmlFor="sellerMotivation">Seller Motivation</Label>
                  <Textarea
                    id="sellerMotivation"
                    {...step4Form.register("sellerMotivation")}
                    placeholder="Why is the seller looking to sell?"
                    rows={3}
                    className="dark:bg-slate-800 dark:border-slate-700"
                  />
                </div>

                <div className="md:col-span-2">
                  <Label htmlFor="notes">Additional Notes</Label>
                  <Textarea
                    id="notes"
                    {...step4Form.register("notes")}
                    placeholder="Any other relevant information..."
                    rows={3}
                    className="dark:bg-slate-800 dark:border-slate-700"
                  />
                </div>
              </div>

              <div className="flex justify-between pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setCurrentStep(3)}
                >
                  <ChevronLeft className="mr-2 h-4 w-4" />
                  Back
                </Button>
                <Button type="submit">
                  Next
                  <ChevronRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Step 5: Photos */}
      {currentStep === 5 && (
        <Card className="dark:bg-slate-900/50 dark:border-slate-800">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Camera className="h-5 w-5" />
              Property Photos
            </CardTitle>
            <CardDescription>Upload photos of the property (optional)</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-lg border-2 border-dashed border-slate-200 dark:border-slate-700 p-8 text-center">
              <input
                type="file"
                accept="image/*"
                capture="environment"
                multiple
                onChange={handlePhotoUpload}
                className="hidden"
                id="photo-upload"
                disabled={uploading}
              />
              <label
                htmlFor="photo-upload"
                className="flex cursor-pointer flex-col items-center gap-2"
              >
                {uploading ? (
                  <Loader2 className="h-10 w-10 animate-spin text-slate-400" />
                ) : (
                  <Upload className="h-10 w-10 text-slate-400" />
                )}
                <span className="text-sm text-slate-600 dark:text-slate-400">
                  {uploading
                    ? "Uploading..."
                    : "Click to upload photos or drag and drop"}
                </span>
                <span className="text-xs text-slate-400">
                  PNG, JPG up to 10MB each
                </span>
              </label>
            </div>

            {photos.length > 0 && (
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
                {photos.map((photo, index) => (
                  <div key={index} className="group relative aspect-square">
                    <img
                      src={photo}
                      alt={`Property photo ${index + 1}`}
                      className="h-full w-full rounded-lg object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => removePhoto(index)}
                      className="absolute right-2 top-2 rounded-full bg-red-500 p-1 text-white opacity-0 transition-opacity group-hover:opacity-100"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            <div className="flex justify-between pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setCurrentStep(4)}
              >
                <ChevronLeft className="mr-2 h-4 w-4" />
                Back
              </Button>
              <Button onClick={handlePhotosNext}>
                Next
                <ChevronRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 6: Review & Submit */}
      {currentStep === 6 && (
        <div className="space-y-6">
          {/* Deal Score Card */}
          <Card className={`border-2 ${
            investmentMetrics.dealScore === "Great" ? "border-emerald-500 bg-emerald-500/5" :
            investmentMetrics.dealScore === "Good" ? "border-blue-500 bg-blue-500/5" :
            investmentMetrics.dealScore === "Marginal" ? "border-yellow-500 bg-yellow-500/5" :
            "border-red-500 bg-red-500/5"
          }`}>
            <CardContent className="py-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  {investmentMetrics.dealScore === "Great" ? (
                    <CheckCircle2 className="h-12 w-12 text-emerald-500" />
                  ) : investmentMetrics.dealScore === "Good" ? (
                    <TrendingUp className="h-12 w-12 text-blue-500" />
                  ) : investmentMetrics.dealScore === "Marginal" ? (
                    <AlertTriangle className="h-12 w-12 text-yellow-500" />
                  ) : (
                    <X className="h-12 w-12 text-red-500" />
                  )}
                  <div>
                    <p className="text-sm text-muted-foreground">Deal Analysis Score</p>
                    <p className={`text-3xl font-bold ${investmentMetrics.dealColor}`}>
                      {investmentMetrics.dealScore} Deal
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm text-muted-foreground">Estimated ROI</p>
                  <p className={`text-3xl font-bold ${investmentMetrics.dealColor}`}>
                    {investmentMetrics.roi.toFixed(1)}%
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Summary Cards */}
          <div className="grid gap-4 md:grid-cols-2">
            {/* Property Summary */}
            <Card className="dark:bg-slate-900/50 dark:border-slate-800">
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-base">
                  <Building2 className="h-4 w-4" />
                  Property
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <p className="font-medium">{formData.address}</p>
                <p className="text-muted-foreground">
                  {formData.city}, {formData.state} {formData.zip}
                </p>
                <p className="text-muted-foreground">
                  {formData.propertyType?.replace("_", " ")} • {formData.bedrooms || 0} bed • {formData.bathrooms || 0} bath • {formData.sqft?.toLocaleString() || 0} sqft
                </p>
              </CardContent>
            </Card>

            {/* Financial Summary */}
            <Card className="dark:bg-slate-900/50 dark:border-slate-800">
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-base">
                  <DollarSign className="h-4 w-4" />
                  Financial Summary
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Asking Price</span>
                  <span className="font-medium">{formatCurrency(investmentMetrics.askingPrice)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">ARV</span>
                  <span className="font-medium">{formatCurrency(investmentMetrics.arv)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Repairs</span>
                  <span className="font-medium">{formatCurrency(investmentMetrics.repairs)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">70% MAO</span>
                  <span className="font-medium">{formatCurrency(investmentMetrics.mao70)}</span>
                </div>
              </CardContent>
            </Card>

            {/* Investment Breakdown */}
            <Card className="dark:bg-slate-900/50 dark:border-slate-800">
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-base">
                  <Calculator className="h-4 w-4" />
                  Investment Breakdown
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Purchase</span>
                  <span>{formatCurrency(investmentMetrics.askingPrice)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Repairs</span>
                  <span>{formatCurrency(investmentMetrics.repairs)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Closing (Buy)</span>
                  <span>{formatCurrency(investmentMetrics.closingCosts)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Holding Costs</span>
                  <span>{formatCurrency(investmentMetrics.totalHoldingCosts)}</span>
                </div>
                <div className="flex justify-between border-t pt-2 font-medium">
                  <span>Total Investment</span>
                  <span>{formatCurrency(investmentMetrics.totalInvestment)}</span>
                </div>
              </CardContent>
            </Card>

            {/* Profit Analysis */}
            <Card className="dark:bg-slate-900/50 dark:border-slate-800">
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-base">
                  <TrendingUp className="h-4 w-4" />
                  Profit Analysis
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Sale Price (ARV)</span>
                  <span>{formatCurrency(investmentMetrics.arv)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Total Investment</span>
                  <span>-{formatCurrency(investmentMetrics.totalInvestment)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Selling Costs (8%)</span>
                  <span>-{formatCurrency(investmentMetrics.sellingCosts)}</span>
                </div>
                <div className="flex justify-between border-t pt-2 font-medium">
                  <span>Net Profit</span>
                  <span className={investmentMetrics.profit >= 0 ? "text-emerald-500" : "text-red-500"}>
                    {formatCurrency(investmentMetrics.profit)}
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Seller Info */}
          <Card className="dark:bg-slate-900/50 dark:border-slate-800">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-base">
                <User className="h-4 w-4" />
                Seller Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 text-sm sm:grid-cols-3">
                <div>
                  <span className="text-muted-foreground">Name</span>
                  <p className="font-medium">{formData.sellerName || "Not provided"}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Phone</span>
                  <p className="font-medium">{formData.sellerPhone || "Not provided"}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Email</span>
                  <p className="font-medium">{formData.sellerEmail || "Not provided"}</p>
                </div>
              </div>
              {formData.sellerMotivation && (
                <div className="mt-4">
                  <span className="text-sm text-muted-foreground">Motivation</span>
                  <p className="text-sm">{formData.sellerMotivation}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Photos */}
          {photos.length > 0 && (
            <Card className="dark:bg-slate-900/50 dark:border-slate-800">
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-base">
                  <Camera className="h-4 w-4" />
                  Photos ({photos.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-4 gap-2 sm:grid-cols-6">
                  {photos.map((photo, index) => (
                    <div key={index} className="aspect-square">
                      <img
                        src={photo}
                        alt={`Property ${index + 1}`}
                        className="h-full w-full rounded object-cover"
                      />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          <div className="flex justify-between pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setCurrentStep(5)}
            >
              <ChevronLeft className="mr-2 h-4 w-4" />
              Back
            </Button>
            <Button
              onClick={handleFinalSubmit}
              disabled={submitting}
              size="lg"
              className="bg-gradient-to-r from-primary to-purple-600"
            >
              {submitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Submitting...
                </>
              ) : (
                <>
                  <Check className="mr-2 h-4 w-4" />
                  Submit Deal for Review
                </>
              )}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
