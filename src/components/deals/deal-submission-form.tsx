"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useForm, useWatch, type FieldErrors, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { CurrencyInput, NumberInput } from "@/components/ui/currency-input";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardDescription } from "@/components/ui/card";
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
  X,
  Check,
  Loader2,
  MapPin,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
} from "@/components/ui/icons";

const steps = [
  { id: 1, name: "Property" },
  { id: 2, name: "Repairs" },
  { id: 3, name: "Financing" },
  { id: 4, name: "Seller" },
  { id: 5, name: "Photos" },
  { id: 6, name: "Review" },
];

function fieldValidation(name: string, message?: string, description?: string) {
  return {
    "aria-invalid": message ? true : undefined,
    "aria-describedby": [description, message && name + "-error"].filter(Boolean).join(" ") || undefined,
  };
}

function FieldError({ name, message }: { name: string; message?: string }) {
  return message ? <p id={name + "-error"} className="mt-1 text-sm text-destructive">{message}</p> : null;
}

function focusFirstInvalid(errors: FieldErrors) {
  const [name] = Object.keys(errors);
  if (name) document.getElementById(name)?.focus();
}

export function DealSubmissionForm() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<Partial<DealSubmissionForm>>({});
  const [photos, setPhotos] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lookingUpAddress, setLookingUpAddress] = useState(false);
  const [addressFeedback, setAddressFeedback] = useState("");
  const previousStep = useRef(currentStep);

  useEffect(() => {
    if (previousStep.current === currentStep) return;
    previousStep.current = currentStep;
    document.getElementById("deal-intake-step")?.focus();
  }, [currentStep]);
  
  // Repair items state
  const [selectedRepairs, setSelectedRepairs] = useState<Record<string, { enabled: boolean; cost: number }>>({});

  // Step 1 form
  const step1Form = useForm<PropertyDetailsForm>({
    shouldFocusError: false,
    resolver: zodResolver(propertyDetailsSchema) as Resolver<PropertyDetailsForm>,
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

  // Step 2: Repair estimates form
  const step2Form = useForm<RepairScopeForm>({
    shouldFocusError: false,
    resolver: zodResolver(repairScopeSchema) as Resolver<RepairScopeForm>,
    defaultValues: {
      estimatedARV: formData.estimatedARV || 0,
      totalRepairCost: formData.totalRepairCost || 0,
      repairNotes: formData.repairNotes || "",
    },
  });

  // Step 3: Financing form
  const step3Form = useForm<FinancingForm>({
    shouldFocusError: false,
    resolver: zodResolver(financingSchema) as Resolver<FinancingForm>,
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
    shouldFocusError: false,
    resolver: zodResolver(sellerInfoSchema) as Resolver<SellerInfoForm>,
    defaultValues: {
      sellerName: formData.sellerName || "",
      sellerPhone: formData.sellerPhone || "",
      sellerEmail: formData.sellerEmail || "",
      sellerMotivation: formData.sellerMotivation || "",
      askingPrice: formData.askingPrice || 0,
      notes: formData.notes || "",
    },
  });

  const [selectedCountry, selectedState, selectedPropertyType] = useWatch({
    control: step1Form.control,
    name: ["country", "state", "propertyType"] as const,
  });
  const watchedArv = useWatch({ control: step2Form.control, name: "estimatedARV" });
  const [watchedLoanType, watchedDownPayment, watchedLoanTerm, watchedClosingCosts, watchedHoldingCosts, watchedHoldTime] = useWatch({
    control: step3Form.control,
    name: ["loanType", "downPaymentPercent", "loanTerm", "closingCosts", "holdingCostsMonthly", "estimatedHoldTime"] as const,
  });
  const watchedAskingPrice = useWatch({ control: step4Form.control, name: "askingPrice" });

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
    const dealColor = roi >= 25 ? "text-primary" : roi >= 15 ? "text-primary" : roi >= 5 ? "text-amber-700 dark:text-amber-400" : "text-destructive";

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
    if (lookingUpAddress) return;
    setFormData((prev) => ({ ...prev, ...data }));
    setCurrentStep(2);
  };

  // Address lookup using Google Maps API
  const handleAddressLookup = async () => {
    if (lookingUpAddress) return;
    const address = step1Form.getValues("address");
    const city = step1Form.getValues("city");
    const state = step1Form.getValues("state");
    const country = step1Form.getValues("country");

    if (!address) {
      setAddressFeedback("Enter a street address before looking it up.");
      document.getElementById("address")?.focus();
      return;
    }

    setLookingUpAddress(true);
    setAddressFeedback("");
    try {
      const response = await fetch("/api/integrations/validate-address", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ address, city, state }),
      });

      const result = await response.json();
      if (
        step1Form.getValues("address") !== address ||
        step1Form.getValues("city") !== city ||
        step1Form.getValues("state") !== state ||
        step1Form.getValues("country") !== country
      ) {
        setAddressFeedback("The address changed during lookup. Try again or continue with the current address.");
        return;
      }

      if (result.success && result.data) {
        const data = result.data;
        
        // Auto-fill the form fields
        if (data.city) step1Form.setValue("city", data.city);
        if (data.stateCode || data.state) step1Form.setValue("state", data.stateCode || data.state);
        if (data.postalCode) step1Form.setValue("zip", data.postalCode);
        if (data.county) step1Form.setValue("county", data.county);
        if (data.formattedAddress) step1Form.setValue("address", data.formattedAddress.split(",")[0] || address);

        setAddressFeedback(result.isMock
          ? "The lookup returned sample data. Check the filled address before continuing."
          : "Google Maps supplied the address details. Check the filled fields before continuing.");
      } else {
        setAddressFeedback("Address lookup did not return a match. Check the address or enter the details manually.");
      }
    } catch {
      setAddressFeedback("Address lookup is unavailable. You can enter the details manually.");
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

    try {
      const failedFiles: string[] = [];
      for (const file of Array.from(files)) {
        const formDataUpload = new FormData();
        formDataUpload.append("file", file);
        try {
          const result = await uploadPhoto(formDataUpload);
          if (!result.url) {
            failedFiles.push(file.name);
            continue;
          }
          const url = result.url;
          setPhotos((previous) => [...previous, url]);
        } catch {
          failedFiles.push(file.name);
        }
      }
      if (failedFiles.length) setError("Could not upload: " + failedFiles.join(", "));
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  };

  const removePhoto = (index: number) => {
    setPhotos((prev) => prev.filter((_, i) => i !== index));
    document.getElementById("photo-upload")?.focus();
  };

  const handlePhotosNext = () => {
    if (uploading) return;
    setError(null);
    setFormData((prev) => ({ ...prev, photos }));
    setCurrentStep(6);
  };

  const handleFinalSubmit = async () => {
    if (submitting) return;
    setSubmitting(true);
    setError(null);

    const fullData: DealSubmissionForm = {
      ...(formData as DealSubmissionForm),
      photos,
    };

    try {
      const result = await submitDeal(fullData);
      if (result.error) {
        setError(result.error);
        setSubmitting(false);
        return;
      }
      toast.success("Deal submitted for review");
      router.push("/dashboard/deals");
    } catch {
      setError("Could not submit the deal. Your entries are still here.");
      setSubmitting(false);
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
    <div className="space-y-6 [&_input[aria-invalid=true]]:border-destructive [&_input:not([type=file])]:min-h-11 [&_textarea]:text-base [&_[data-slot=select-trigger]]:min-h-11 [&_[data-slot=select-trigger]]:w-full [&_[data-slot=select-trigger]]:text-base">
      <ol aria-label="Intake steps" className="grid grid-cols-2 gap-x-4 gap-y-1 border-y border-border py-2 text-sm min-[380px]:grid-cols-3 sm:grid-cols-6">
        {steps.map((step) => (
          <li
            key={step.id}
            aria-current={currentStep === step.id ? "step" : undefined}
            className={currentStep === step.id ? "py-1 font-semibold text-primary" : "py-1 text-muted-foreground"}
          >
            {step.id}. {step.name}
            {step.id < currentStep && <span className="sr-only">, completed</span>}
          </li>
        ))}
      </ol>

      <div role="alert">
        {error && <p className="rounded-lg border border-destructive/30 p-3 text-sm text-destructive [overflow-wrap:anywhere]">{error}</p>}
      </div>

      {/* Step 1: Property details */}
      {currentStep === 1 && (
        <Card className="min-w-0 gap-4 rounded-lg border-border shadow-none">
          <CardHeader className="px-4 sm:px-6">
            <h2 id="deal-intake-step" tabIndex={-1} className="scroll-mt-20 text-xl font-semibold focus:outline-ring">Property details</h2>
            <CardDescription>Fields marked required must be completed.</CardDescription>
          </CardHeader>
          <CardContent className="px-4 sm:px-6">
            <form
              noValidate
              onSubmit={step1Form.handleSubmit(handleStep1Submit, focusFirstInvalid)}
              className="space-y-4"
            >
              <div className="grid gap-4 md:grid-cols-2">
                <div className="md:col-span-2">
                  <Label htmlFor="address">Street address (required)</Label>
                  <div className="flex flex-wrap items-center gap-2">
                    <Input
                      id="address"
                      aria-required="true"
                      {...fieldValidation("address", step1Form.formState.errors.address?.message)}
                      {...step1Form.register("address", { onChange: () => setAddressFeedback("") })}
                      placeholder="123 Main Street"
                      className="min-w-0 flex-1"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleAddressLookup}
                      aria-disabled={lookingUpAddress}
                      aria-describedby="address-lookup-feedback"
                      className="min-h-11 shrink-0"
                    >
                      {lookingUpAddress ? (
                        <Loader2 className="h-4 w-4 motion-safe:animate-spin" aria-hidden="true" />
                      ) : (
                        <MapPin className="h-4 w-4" />
                      )}
                      {lookingUpAddress ? "Looking up address…" : "Look up address"}
                    </Button>
                  </div>
                  <p id="address-lookup-feedback" role="status" className="mt-1 text-sm text-muted-foreground">{addressFeedback}</p>
                  <FieldError name="address" message={step1Form.formState.errors.address?.message} />
                </div>

                <div>
                  <Label htmlFor="city">City (required)</Label>
                  <Input
                    id="city"
                    aria-required="true"
                    {...fieldValidation("city", step1Form.formState.errors.city?.message)}
                    {...step1Form.register("city", { onChange: () => setAddressFeedback("") })}
                    placeholder="Austin"
                    className="mt-1"
                  />
                  <FieldError name="city" message={step1Form.formState.errors.city?.message} />
                </div>

                <div>
                  <Label htmlFor="country">Country (required)</Label>
                  <Select
                    onValueChange={(value) => {
                      step1Form.setValue("country", value);
                      step1Form.setValue("state", "");
                      setAddressFeedback("");
                    }}
                    value={selectedCountry ?? ""}
                  >
                    <SelectTrigger id="country" className="mt-1" aria-required="true" {...fieldValidation("country", step1Form.formState.errors.country?.message)}>
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
                  <FieldError name="country" message={step1Form.formState.errors.country?.message} />
                </div>

                <div>
                  <Label htmlFor="state">
                    {selectedCountry === "US" ? "State" : selectedCountry === "CA" ? "Province" : "Region"} (required)
                  </Label>
                  {selectedCountry === "US" ? (
                    <Select
                      onValueChange={(value) => { step1Form.setValue("state", value, { shouldValidate: true }); setAddressFeedback(""); }}
                      value={selectedState ?? ""}
                    >
                      <SelectTrigger id="state" className="mt-1" aria-required="true" {...fieldValidation("state", step1Form.formState.errors.state?.message)}>
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
                      onValueChange={(value) => { step1Form.setValue("state", value, { shouldValidate: true }); setAddressFeedback(""); }}
                      value={selectedState ?? ""}
                    >
                      <SelectTrigger id="state" className="mt-1" aria-required="true" {...fieldValidation("state", step1Form.formState.errors.state?.message)}>
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
                      aria-required="true"
                      {...fieldValidation("state", step1Form.formState.errors.state?.message)}
                      {...step1Form.register("state", { onChange: () => setAddressFeedback("") })}
                      placeholder="Enter state/province/region"
                      className="mt-1"
                    />
                  )}
                  <FieldError name="state" message={step1Form.formState.errors.state?.message} />
                </div>

                <div>
                  <Label htmlFor="zip">
                    {selectedCountry === "US" ? "ZIP code" : "Postal code"} (required)
                  </Label>
                  <Input
                    id="zip"
                    aria-required="true"
                    {...fieldValidation("zip", step1Form.formState.errors.zip?.message)}
                    {...step1Form.register("zip")}
                    placeholder={selectedCountry === "US" ? "78701" : "M5V 1A1"}
                    className="mt-1"
                  />
                  <FieldError name="zip" message={step1Form.formState.errors.zip?.message} />
                </div>

                <div>
                  <Label htmlFor="county">County</Label>
                  <Input
                    id="county"
                    {...step1Form.register("county")}
                    placeholder="Travis"
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="propertyType">Property type (required)</Label>
                  <Select
                    onValueChange={(value: string) =>
                      step1Form.setValue("propertyType", value as PropertyDetailsForm["propertyType"])
                    }
                    value={selectedPropertyType ?? ""}
                  >
                    <SelectTrigger id="propertyType" className="mt-1" aria-required="true" {...fieldValidation("propertyType", step1Form.formState.errors.propertyType?.message)}>
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
                  <FieldError name="propertyType" message={step1Form.formState.errors.propertyType?.message} />
                </div>

                <div>
                  <Label htmlFor="bedrooms">Bedrooms</Label>
                  <Input
                    id="bedrooms"
                    type="number"
                    inputMode="decimal"
                    min={0}
                    max={20}
                    step={1}
                    className="mt-1 tabular-nums"
                    {...step1Form.register("bedrooms", { setValueAs: (value) => value === "" ? undefined : Number(value) })}
                    {...fieldValidation("bedrooms", step1Form.formState.errors.bedrooms?.message)}
                  />
                  <FieldError name="bedrooms" message={step1Form.formState.errors.bedrooms?.message} />
                </div>

                <div>
                  <Label htmlFor="bathrooms">Bathrooms</Label>
                  <Input
                    id="bathrooms"
                    type="number"
                    inputMode="decimal"
                    min={0}
                    max={20}
                    step={0.5}
                    className="mt-1 tabular-nums"
                    {...step1Form.register("bathrooms", { setValueAs: (value) => value === "" ? undefined : Number(value) })}
                    {...fieldValidation("bathrooms", step1Form.formState.errors.bathrooms?.message)}
                  />
                  <FieldError name="bathrooms" message={step1Form.formState.errors.bathrooms?.message} />
                </div>

                <div>
                  <Label htmlFor="sqft">Floor area (sq ft)</Label>
                  <Input
                    id="sqft"
                    type="number"
                    inputMode="decimal"
                    min={100}
                    max={100000}
                    step={1}
                    className="mt-1 tabular-nums"
                    {...step1Form.register("sqft", { setValueAs: (value) => value === "" ? undefined : Number(value) })}
                    {...fieldValidation("sqft", step1Form.formState.errors.sqft?.message)}
                  />
                  <FieldError name="sqft" message={step1Form.formState.errors.sqft?.message} />
                </div>

                <div>
                  <Label htmlFor="yearBuilt">Year built</Label>
                  <Input
                    id="yearBuilt"
                    type="number"
                    inputMode="decimal"
                    min={1800}
                    max={2030}
                    step={1}
                    className="mt-1 tabular-nums"
                    {...step1Form.register("yearBuilt", { setValueAs: (value) => value === "" ? undefined : Number(value) })}
                    {...fieldValidation("yearBuilt", step1Form.formState.errors.yearBuilt?.message)}
                  />
                  <FieldError name="yearBuilt" message={step1Form.formState.errors.yearBuilt?.message} />
                </div>
              </div>

              <div className="flex justify-end border-t border-border pt-4">
                <Button type="submit" className="min-h-11" aria-disabled={lookingUpAddress}>
                  Next
                  <ChevronRight className="h-4 w-4" aria-hidden="true" />
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Step 2: Repair estimates */}
      {currentStep === 2 && (
        <Card className="min-w-0 gap-4 rounded-lg border-border shadow-none">
          <CardHeader className="px-4 sm:px-6">
            <h2 id="deal-intake-step" tabIndex={-1} className="scroll-mt-20 text-xl font-semibold focus:outline-ring">Repair estimates</h2>
            <CardDescription>Estimate repair costs by category. Check items that need work.</CardDescription>
          </CardHeader>
          <CardContent className="px-4 sm:px-6">
            <form
              noValidate
              onSubmit={step2Form.handleSubmit(handleStep2Submit, focusFirstInvalid)}
              className="space-y-6"
            >
              {/* ARV Input */}
              <div>
                <Label htmlFor="estimatedARV">Estimated after-repair value (USD, required)</Label>
                <CurrencyInput
                  id="estimatedARV"
                  aria-required="true"
                  {...fieldValidation("estimatedARV", step2Form.formState.errors.estimatedARV?.message, "estimatedARV-help")}
                  value={watchedArv || 0}
                  onChange={(val) => step2Form.setValue("estimatedARV", val, { shouldValidate: step2Form.formState.isSubmitted })}
                  step={5000}
                />
                <p id="estimatedARV-help" className="mt-1 text-sm text-muted-foreground">
                  What will the property be worth after repairs?
                </p>
                <FieldError name="estimatedARV" message={step2Form.formState.errors.estimatedARV?.message} />
              </div>

              {/* Repair Categories */}
              <div className="space-y-4">
                <p className="text-sm font-medium">Select the repairs this property needs</p>
                <div className="grid gap-4 sm:grid-cols-2">
                  {repairCategories.map((category) => {
                    const isEnabled = selectedRepairs[category.id]?.enabled || false;
                    const cost = selectedRepairs[category.id]?.cost ?? category.defaultCost;

                    return (
                      <div
                        key={category.id}
                        className="min-w-0 border-b border-border py-2"
                      >
                        <div className="flex flex-wrap items-center justify-between gap-2">
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
                            <Label htmlFor={category.id} className="min-h-11 cursor-pointer font-medium">
                              {category.label}
                            </Label>
                          </div>
                          {isEnabled && (
                            <span className="text-sm font-semibold tabular-nums">
                              {formatCurrency(cost)}
                            </span>
                          )}
                        </div>
                        {isEnabled && (
                          <div className="mt-3">
                            <input
                              type="range"
                              aria-label={category.label + " repair cost"}
                              aria-valuetext={formatCurrency(cost)}
                              value={cost}
                              onChange={(event) => {
                                const value = Number(event.target.value);
                                setSelectedRepairs((prev) => ({
                                  ...prev,
                                  [category.id]: {
                                    enabled: true,
                                    cost: value,
                                  },
                                }));
                              }}
                              min={0}
                              max={category.defaultCost * 3}
                              step={500}
                              className="w-full accent-primary"
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

              <div className="flex flex-wrap items-baseline justify-between gap-2 border-y border-border py-3">
                <span className="font-medium">Total repair estimate</span>
                <span className="text-xl font-semibold tabular-nums">{formatCurrency(totalRepairCost)}</span>
              </div>

              {/* Additional notes */}
              <div>
                <Label htmlFor="repairNotes">Repair notes</Label>
                <Textarea
                  id="repairNotes"
                  {...step2Form.register("repairNotes")}
                  placeholder="Any additional notes about the repair scope..."
                  rows={3}
                  className="mt-1"
                />
              </div>

              <div className="flex flex-wrap justify-between gap-2 border-t border-border pt-4">
                <Button
                  type="button"
                  variant="outline"
                  className="min-h-11"
                  onClick={() => setCurrentStep(1)}
                >
                  <ChevronLeft className="h-4 w-4" aria-hidden="true" />
                  Back
                </Button>
                <Button type="submit" className="min-h-11">
                  Next
                  <ChevronRight className="h-4 w-4" aria-hidden="true" />
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Step 3: Financing */}
      {currentStep === 3 && (
        <Card className="min-w-0 gap-4 rounded-lg border-border shadow-none">
          <CardHeader className="px-4 sm:px-6">
            <h2 id="deal-intake-step" tabIndex={-1} className="scroll-mt-20 text-xl font-semibold focus:outline-ring">Financing assumptions</h2>
            <CardDescription>How will this deal be financed?</CardDescription>
          </CardHeader>
          <CardContent className="px-4 sm:px-6">
            <form
              noValidate
              onSubmit={step3Form.handleSubmit(handleStep3Submit, focusFirstInvalid)}
              className="space-y-4"
            >
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <Label htmlFor="loanType">Loan type</Label>
                  <Select
                    onValueChange={(value) => step3Form.setValue("loanType", value)}
                    value={watchedLoanType ?? ""}
                  >
                    <SelectTrigger id="loanType" className="mt-1">
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
                  <Label htmlFor="downPaymentPercent">Down payment (%)</Label>
                  <div className="flex items-center gap-4">
                    <input
                      id="downPaymentPercent"
                      type="range"
                      aria-valuetext={(watchedDownPayment ?? 20) + "%"}
                      value={watchedDownPayment ?? 20}
                      onChange={(event) => {
                        const value = Number(event.target.value);
                        step3Form.setValue("downPaymentPercent", value);
                        // Calculate down payment amount based on asking price
                        const askingPrice = formData.askingPrice || 0;
                        step3Form.setValue("downPayment", askingPrice * (value / 100));
                      }}
                      min={0}
                      max={100}
                      step={5}
                      className="min-w-0 flex-1 accent-primary"
                    />
                    <span className="w-16 text-right font-semibold">
                      {watchedDownPayment ?? 20}%
                    </span>
                  </div>
                </div>

                <div>
                  <Label htmlFor="interestRate">Interest rate (%)</Label>
                  <Input
                    id="interestRate"
                    type="number"
                    inputMode="decimal"
                    min={0}
                    max={30}
                    step={0.25}
                    className="mt-1 tabular-nums"
                    {...step3Form.register("interestRate", { setValueAs: (value) => value === "" ? undefined : Number(value) })}
                    {...fieldValidation("interestRate", step3Form.formState.errors.interestRate?.message)}
                  />
                  <FieldError name="interestRate" message={step3Form.formState.errors.interestRate?.message} />
                </div>

                <div>
                  <Label htmlFor="loanTerm">Loan term (months)</Label>
                  <NumberInput
                    id="loanTerm"
                    value={watchedLoanTerm || 12}
                    onChange={(val) => step3Form.setValue("loanTerm", val)}
                    min={1}
                    max={360}
                    step={1}
                  />
                </div>

                <div>
                  <Label htmlFor="closingCosts">Buying closing costs (USD)</Label>
                  <CurrencyInput
                    id="closingCosts"
                    value={watchedClosingCosts || 0}
                    onChange={(val) => step3Form.setValue("closingCosts", val)}
                    step={500}
                  />
                </div>

                <div>
                  <Label htmlFor="holdingCostsMonthly">Monthly holding costs (USD)</Label>
                  <CurrencyInput
                    id="holdingCostsMonthly"
                    value={watchedHoldingCosts || 0}
                    onChange={(val) => step3Form.setValue("holdingCostsMonthly", val)}
                    step={100}
                  />
                  <p className="mt-1 text-xs text-muted-foreground">
                    Insurance, utilities, lawn care, etc.
                  </p>
                </div>

                <div>
                  <Label htmlFor="estimatedHoldTime">Holding period (months)</Label>
                  <NumberInput
                    id="estimatedHoldTime"
                    value={watchedHoldTime || 6}
                    onChange={(val) => step3Form.setValue("estimatedHoldTime", val)}
                    min={1}
                    max={60}
                    step={1}
                  />
                </div>
              </div>

              <div className="flex flex-wrap justify-between gap-2 border-t border-border pt-4">
                <Button
                  type="button"
                  variant="outline"
                  className="min-h-11"
                  onClick={() => setCurrentStep(2)}
                >
                  <ChevronLeft className="h-4 w-4" aria-hidden="true" />
                  Back
                </Button>
                <Button type="submit" className="min-h-11">
                  Next
                  <ChevronRight className="h-4 w-4" aria-hidden="true" />
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Step 4: Seller Info */}
      {currentStep === 4 && (
        <Card className="min-w-0 gap-4 rounded-lg border-border shadow-none">
          <CardHeader className="px-4 sm:px-6">
            <h2 id="deal-intake-step" tabIndex={-1} className="scroll-mt-20 text-xl font-semibold focus:outline-ring">Seller information</h2>
          </CardHeader>
          <CardContent className="px-4 sm:px-6">
            <form
              noValidate
              onSubmit={step4Form.handleSubmit(handleStep4Submit, focusFirstInvalid)}
              className="space-y-4"
            >
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <Label htmlFor="sellerName">Seller name (required)</Label>
                  <Input
                    id="sellerName"
                      aria-required="true"
                      {...fieldValidation("sellerName", step4Form.formState.errors.sellerName?.message)}
                    {...step4Form.register("sellerName")}
                    placeholder="John Smith"
                    className="mt-1"
                  />
                  <FieldError name="sellerName" message={step4Form.formState.errors.sellerName?.message} />
                </div>

                <div>
                  <Label htmlFor="sellerPhone">Seller phone</Label>
                  <Input
                    id="sellerPhone"
                    type="tel"
                    {...step4Form.register("sellerPhone")}
                    placeholder="(512) 555-0123"
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="sellerEmail">Seller email</Label>
                  <Input
                    id="sellerEmail"
                      {...fieldValidation("sellerEmail", step4Form.formState.errors.sellerEmail?.message)}
                    type="email"
                    {...step4Form.register("sellerEmail")}
                    placeholder="seller@email.com"
                    className="mt-1"
                  />
                  <FieldError name="sellerEmail" message={step4Form.formState.errors.sellerEmail?.message} />
                </div>

                <div>
                  <Label htmlFor="askingPrice">Asking price (USD, required)</Label>
                  <CurrencyInput
                    id="askingPrice"
                      aria-required="true"
                      {...fieldValidation("askingPrice", step4Form.formState.errors.askingPrice?.message)}
                    value={watchedAskingPrice || 0}
                    onChange={(val) => step4Form.setValue("askingPrice", val)}
                    step={5000}
                  />
                  <FieldError name="askingPrice" message={step4Form.formState.errors.askingPrice?.message} />
                </div>

                <div className="md:col-span-2">
                  <Label htmlFor="sellerMotivation">Seller motivation</Label>
                  <Textarea
                    id="sellerMotivation"
                    {...step4Form.register("sellerMotivation")}
                    placeholder="Why is the seller looking to sell?"
                    rows={3}
                    className="mt-1"
                  />
                </div>

                <div className="md:col-span-2">
                  <Label htmlFor="notes">Additional notes</Label>
                  <Textarea
                    id="notes"
                    {...step4Form.register("notes")}
                    placeholder="Any other relevant information..."
                    rows={3}
                    className="mt-1"
                  />
                </div>
              </div>

              <div className="flex flex-wrap justify-between gap-2 border-t border-border pt-4">
                <Button
                  type="button"
                  variant="outline"
                  className="min-h-11"
                  onClick={() => setCurrentStep(3)}
                >
                  <ChevronLeft className="h-4 w-4" aria-hidden="true" />
                  Back
                </Button>
                <Button type="submit" className="min-h-11">
                  Next
                  <ChevronRight className="h-4 w-4" aria-hidden="true" />
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Step 5: Photos */}
      {currentStep === 5 && (
        <Card className="min-w-0 gap-4 rounded-lg border-border shadow-none">
          <CardHeader className="px-4 sm:px-6">
            <h2 id="deal-intake-step" tabIndex={-1} className="scroll-mt-20 text-xl font-semibold focus:outline-ring">Property photos</h2>
            <CardDescription>Photos are optional. Add other documents from the deal after submission.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="photo-upload">Add property photos</Label>
              <Input
                id="photo-upload"
                type="file"
                accept="image/*"
                capture="environment"
                multiple
                onChange={handlePhotoUpload}
                disabled={uploading}
                className="min-h-11 max-w-full"
              />
              <p role="status" className="text-sm text-muted-foreground">{uploading ? "Uploading photos…" : photos.length + " photos attached"}</p>
            </div>

            {photos.length > 0 && (
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
                {photos.map((photo, index) => (
                  <div key={index} className="group relative aspect-square">
                    {/* Photos are user-supplied storage URLs; next/image would
                        require a configured remotePatterns entry per host. */}
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={photo}
                      alt={`Property photo ${index + 1}`}
                      className="h-full w-full rounded-lg object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => removePhoto(index)}
                      className="absolute right-2 top-2 grid size-11 place-items-center rounded-md border border-border bg-background text-foreground hover:bg-muted focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
                      aria-label={"Remove property photo " + (index + 1)}
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            <div className="flex flex-wrap justify-between gap-2 border-t border-border pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setCurrentStep(4)}
                disabled={uploading}
              >
                <ChevronLeft className="h-4 w-4" aria-hidden="true" />
                Back
              </Button>
              <Button className="min-h-11" onClick={handlePhotosNext} disabled={uploading}>
                Next
                <ChevronRight className="h-4 w-4" aria-hidden="true" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 6: Review & Submit */}
      {currentStep === 6 && (
        <div className="space-y-6">
          <h2 id="deal-intake-step" tabIndex={-1} className="scroll-mt-20 text-xl font-semibold focus:outline-ring">Review submission</h2>
          <p className="max-w-prose text-sm text-muted-foreground">
            When buying or monthly holding costs are blank or zero, the estimate uses 3% of asking price for buying costs and $500 per month for holding costs. Selling costs are 8% of after-repair value.
          </p>
          {/* Deal Score Card */}
          <Card className="rounded-lg border-border shadow-none">
            <CardContent className="py-6">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-4">
                  {investmentMetrics.dealScore === "Great" ? (
                    <CheckCircle2 className="h-12 w-12 text-emerald-500" />
                  ) : investmentMetrics.dealScore === "Good" ? (
                    <TrendingUp className="h-12 w-12 text-emerald-500" />
                  ) : investmentMetrics.dealScore === "Marginal" ? (
                    <AlertTriangle className="h-12 w-12 text-yellow-500" />
                  ) : (
                    <X className="h-12 w-12 text-red-500" />
                  )}
                  <div>
                    <p className="text-sm text-muted-foreground">Estimated deal score</p>
                    <p className={`text-2xl font-semibold tabular-nums ${investmentMetrics.dealColor}`}>
                      {investmentMetrics.dealScore} Deal
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm text-muted-foreground">Estimated ROI</p>
                  <p className={`text-2xl font-semibold tabular-nums ${investmentMetrics.dealColor}`}>
                    {investmentMetrics.roi.toFixed(1)}%
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Summary Cards */}
          <div className="grid gap-4 md:grid-cols-2">
            {/* Property Summary */}
            <Card className="min-w-0 gap-4 rounded-lg border-border shadow-none">
              <CardHeader className="pb-2">
                <h3 className="font-semibold">Property</h3>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <p className="font-medium">{formData.address}</p>
                <p className="text-muted-foreground">
                  {formData.city}, {formData.state} {formData.zip}
                </p>
                <p className="text-muted-foreground">
                  {propertyTypes.find((type) => type.value === formData.propertyType)?.label}
                  {formData.bedrooms != null && ", " + formData.bedrooms + " bedrooms"}
                  {formData.bathrooms != null && ", " + formData.bathrooms + " bathrooms"}
                  {formData.sqft != null && ", " + formData.sqft.toLocaleString() + " sq ft"}
                </p>
              </CardContent>
            </Card>

            {/* Financial summary */}
            <Card className="min-w-0 gap-4 rounded-lg border-border shadow-none">
              <CardHeader className="pb-2">
                <h3 className="font-semibold">Financial summary</h3>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <div className="flex justify-between gap-3 tabular-nums [&>span:last-child]:text-end [&>span:last-child]:[overflow-wrap:anywhere]">
                  <span className="text-muted-foreground">Asking price</span>
                  <span className="font-medium">{formatCurrency(investmentMetrics.askingPrice)}</span>
                </div>
                <div className="flex justify-between gap-3 tabular-nums [&>span:last-child]:text-end [&>span:last-child]:[overflow-wrap:anywhere]">
                  <span className="text-muted-foreground">ARV</span>
                  <span className="font-medium">{formatCurrency(investmentMetrics.arv)}</span>
                </div>
                <div className="flex justify-between gap-3 tabular-nums [&>span:last-child]:text-end [&>span:last-child]:[overflow-wrap:anywhere]">
                  <span className="text-muted-foreground">Repairs</span>
                  <span className="font-medium">{formatCurrency(investmentMetrics.repairs)}</span>
                </div>
                <div className="flex justify-between gap-3 tabular-nums [&>span:last-child]:text-end [&>span:last-child]:[overflow-wrap:anywhere]">
                  <span className="text-muted-foreground">70% rule maximum offer</span>
                  <span className="font-medium">{formatCurrency(investmentMetrics.mao70)}</span>
                </div>
              </CardContent>
            </Card>

            {/* Investment breakdown */}
            <Card className="min-w-0 gap-4 rounded-lg border-border shadow-none">
              <CardHeader className="pb-2">
                <h3 className="font-semibold">Investment breakdown</h3>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <div className="flex justify-between gap-3 tabular-nums [&>span:last-child]:text-end [&>span:last-child]:[overflow-wrap:anywhere]">
                  <span className="text-muted-foreground">Purchase</span>
                  <span>{formatCurrency(investmentMetrics.askingPrice)}</span>
                </div>
                <div className="flex justify-between gap-3 tabular-nums [&>span:last-child]:text-end [&>span:last-child]:[overflow-wrap:anywhere]">
                  <span className="text-muted-foreground">Repairs</span>
                  <span>{formatCurrency(investmentMetrics.repairs)}</span>
                </div>
                <div className="flex justify-between gap-3 tabular-nums [&>span:last-child]:text-end [&>span:last-child]:[overflow-wrap:anywhere]">
                  <span className="text-muted-foreground">Buying closing costs</span>
                  <span>{formatCurrency(investmentMetrics.closingCosts)}</span>
                </div>
                <div className="flex justify-between gap-3 tabular-nums [&>span:last-child]:text-end [&>span:last-child]:[overflow-wrap:anywhere]">
                  <span className="text-muted-foreground">Holding costs</span>
                  <span>{formatCurrency(investmentMetrics.totalHoldingCosts)}</span>
                </div>
                <div className="flex justify-between gap-3 border-t border-border pt-2 font-medium tabular-nums [&>span:last-child]:text-end [&>span:last-child]:[overflow-wrap:anywhere]">
                  <span>Total investment</span>
                  <span>{formatCurrency(investmentMetrics.totalInvestment)}</span>
                </div>
              </CardContent>
            </Card>

            {/* Profit analysis */}
            <Card className="min-w-0 gap-4 rounded-lg border-border shadow-none">
              <CardHeader className="pb-2">
                <h3 className="font-semibold">Profit analysis</h3>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <div className="flex justify-between gap-3 tabular-nums [&>span:last-child]:text-end [&>span:last-child]:[overflow-wrap:anywhere]">
                  <span className="text-muted-foreground">After-repair value</span>
                  <span>{formatCurrency(investmentMetrics.arv)}</span>
                </div>
                <div className="flex justify-between gap-3 tabular-nums [&>span:last-child]:text-end [&>span:last-child]:[overflow-wrap:anywhere]">
                  <span className="text-muted-foreground">Total investment</span>
                  <span>-{formatCurrency(investmentMetrics.totalInvestment)}</span>
                </div>
                <div className="flex justify-between gap-3 tabular-nums [&>span:last-child]:text-end [&>span:last-child]:[overflow-wrap:anywhere]">
                  <span className="text-muted-foreground">Selling costs (8%)</span>
                  <span>-{formatCurrency(investmentMetrics.sellingCosts)}</span>
                </div>
                <div className="flex justify-between gap-3 border-t border-border pt-2 font-medium tabular-nums [&>span:last-child]:text-end [&>span:last-child]:[overflow-wrap:anywhere]">
                  <span>Net profit</span>
                  <span className={investmentMetrics.profit >= 0 ? "text-primary" : "text-destructive"}>
                    {formatCurrency(investmentMetrics.profit)}
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Seller Info */}
          <Card className="min-w-0 gap-4 rounded-lg border-border shadow-none">
            <CardHeader className="pb-2">
              <h3 className="font-semibold">Seller information</h3>
            </CardHeader>
            <CardContent className="px-4 sm:px-6">
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
            <Card className="min-w-0 gap-4 rounded-lg border-border shadow-none">
              <CardHeader className="pb-2">
                <h3 className="font-semibold">Photos ({photos.length})</h3>
              </CardHeader>
              <CardContent className="px-4 sm:px-6">
                <div className="grid grid-cols-4 gap-2 sm:grid-cols-6">
                  {photos.map((photo, index) => (
                    <div key={index} className="aspect-square">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
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

          <div className="flex flex-wrap justify-between gap-2 border-t border-border pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setCurrentStep(5)}
              disabled={submitting}
              className="min-h-11"
            >
              <ChevronLeft className="h-4 w-4" aria-hidden="true" />
              Back
            </Button>
            <Button
              onClick={handleFinalSubmit}
              aria-disabled={submitting}
              size="lg"
              className="min-h-11 whitespace-normal"
            >
              {submitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Submitting…
                </>
              ) : (
                <>
                  <Check className="h-4 w-4" aria-hidden="true" />
                  Submit deal for review
                </>
              )}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
