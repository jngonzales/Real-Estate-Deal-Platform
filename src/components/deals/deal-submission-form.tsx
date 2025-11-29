"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
  propertyDetailsSchema,
  sellerInfoSchema,
  propertyTypes,
  usStates,
  type PropertyDetailsForm,
  type SellerInfoForm,
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
} from "lucide-react";

const steps = [
  { id: 1, name: "Property Details", icon: Building2 },
  { id: 2, name: "Seller Info", icon: User },
  { id: 3, name: "Photos", icon: Camera },
];

export function DealSubmissionForm() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<Partial<DealSubmissionForm>>({});
  const [photos, setPhotos] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Step 1 form
  const step1Form = useForm<PropertyDetailsForm>({
    resolver: zodResolver(propertyDetailsSchema) as any,
    defaultValues: {
      address: formData.address || "",
      city: formData.city || "",
      state: formData.state || "",
      zip: formData.zip || "",
      county: formData.county || "",
      propertyType: formData.propertyType || "single_family",
      bedrooms: formData.bedrooms ?? undefined,
      bathrooms: formData.bathrooms ?? undefined,
      sqft: formData.sqft ?? undefined,
      yearBuilt: formData.yearBuilt ?? undefined,
    },
  });

  // Step 2 form
  const step2Form = useForm<SellerInfoForm>({
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

  const handleStep1Submit = (data: PropertyDetailsForm) => {
    setFormData((prev) => ({ ...prev, ...data }));
    setCurrentStep(2);
  };

  const handleStep2Submit = (data: SellerInfoForm) => {
    setFormData((prev) => ({ ...prev, ...data }));
    setCurrentStep(3);
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
      setSubmitting(false);
    } else {
      router.push("/dashboard/deals");
    }
  };

  const progress = (currentStep / steps.length) * 100;

  return (
    <div className="space-y-6">
      {/* Progress */}
      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          {steps.map((step) => (
            <div
              key={step.id}
              className={`flex items-center gap-2 ${
                currentStep >= step.id ? "text-slate-900" : "text-slate-400"
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
        <div className="rounded-md bg-red-50 p-4 text-sm text-red-600">
          {error}
        </div>
      )}

      {/* Step 1: Property Details */}
      {currentStep === 1 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              Property Details
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form
              onSubmit={step1Form.handleSubmit(handleStep1Submit)}
              className="space-y-4"
            >
              <div className="grid gap-4 md:grid-cols-2">
                <div className="md:col-span-2">
                  <Label htmlFor="address">Street Address *</Label>
                  <Input
                    id="address"
                    {...step1Form.register("address")}
                    placeholder="123 Main Street"
                  />
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
                  />
                  {step1Form.formState.errors.city && (
                    <p className="mt-1 text-sm text-red-500">
                      {step1Form.formState.errors.city.message}
                    </p>
                  )}
                </div>

                <div>
                  <Label htmlFor="state">State *</Label>
                  <Select
                    onValueChange={(value) => step1Form.setValue("state", value)}
                    defaultValue={step1Form.getValues("state")}
                  >
                    <SelectTrigger>
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
                  {step1Form.formState.errors.state && (
                    <p className="mt-1 text-sm text-red-500">
                      {step1Form.formState.errors.state.message}
                    </p>
                  )}
                </div>

                <div>
                  <Label htmlFor="zip">ZIP Code *</Label>
                  <Input
                    id="zip"
                    {...step1Form.register("zip")}
                    placeholder="78701"
                  />
                  {step1Form.formState.errors.zip && (
                    <p className="mt-1 text-sm text-red-500">
                      {step1Form.formState.errors.zip.message}
                    </p>
                  )}
                </div>

                <div>
                  <Label htmlFor="county">County</Label>
                  <Input
                    id="county"
                    {...step1Form.register("county")}
                    placeholder="Travis"
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
                    <SelectTrigger>
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
                  <Input
                    id="bedrooms"
                    type="number"
                    {...step1Form.register("bedrooms")}
                    placeholder="3"
                  />
                </div>

                <div>
                  <Label htmlFor="bathrooms">Bathrooms</Label>
                  <Input
                    id="bathrooms"
                    type="number"
                    step="0.5"
                    {...step1Form.register("bathrooms")}
                    placeholder="2"
                  />
                </div>

                <div>
                  <Label htmlFor="sqft">Square Feet</Label>
                  <Input
                    id="sqft"
                    type="number"
                    {...step1Form.register("sqft")}
                    placeholder="1500"
                  />
                </div>

                <div>
                  <Label htmlFor="yearBuilt">Year Built</Label>
                  <Input
                    id="yearBuilt"
                    type="number"
                    {...step1Form.register("yearBuilt")}
                    placeholder="1985"
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

      {/* Step 2: Seller Info */}
      {currentStep === 2 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Seller Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form
              onSubmit={step2Form.handleSubmit(handleStep2Submit)}
              className="space-y-4"
            >
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <Label htmlFor="sellerName">Seller Name *</Label>
                  <Input
                    id="sellerName"
                    {...step2Form.register("sellerName")}
                    placeholder="John Smith"
                  />
                  {step2Form.formState.errors.sellerName && (
                    <p className="mt-1 text-sm text-red-500">
                      {step2Form.formState.errors.sellerName.message}
                    </p>
                  )}
                </div>

                <div>
                  <Label htmlFor="sellerPhone">Seller Phone</Label>
                  <Input
                    id="sellerPhone"
                    {...step2Form.register("sellerPhone")}
                    placeholder="(512) 555-0123"
                  />
                </div>

                <div>
                  <Label htmlFor="sellerEmail">Seller Email</Label>
                  <Input
                    id="sellerEmail"
                    type="email"
                    {...step2Form.register("sellerEmail")}
                    placeholder="seller@email.com"
                  />
                  {step2Form.formState.errors.sellerEmail && (
                    <p className="mt-1 text-sm text-red-500">
                      {step2Form.formState.errors.sellerEmail.message}
                    </p>
                  )}
                </div>

                <div>
                  <Label htmlFor="askingPrice">Asking Price *</Label>
                  <Input
                    id="askingPrice"
                    type="number"
                    {...step2Form.register("askingPrice")}
                    placeholder="250000"
                  />
                  {step2Form.formState.errors.askingPrice && (
                    <p className="mt-1 text-sm text-red-500">
                      {step2Form.formState.errors.askingPrice.message}
                    </p>
                  )}
                </div>

                <div className="md:col-span-2">
                  <Label htmlFor="sellerMotivation">Seller Motivation</Label>
                  <Textarea
                    id="sellerMotivation"
                    {...step2Form.register("sellerMotivation")}
                    placeholder="Why is the seller looking to sell?"
                    rows={3}
                  />
                </div>

                <div className="md:col-span-2">
                  <Label htmlFor="notes">Additional Notes</Label>
                  <Textarea
                    id="notes"
                    {...step2Form.register("notes")}
                    placeholder="Any other relevant information..."
                    rows={3}
                  />
                </div>
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

      {/* Step 3: Photos */}
      {currentStep === 3 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Camera className="h-5 w-5" />
              Property Photos
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Upload area */}
            <div className="rounded-lg border-2 border-dashed border-slate-200 p-8 text-center">
              <input
                type="file"
                accept="image/*"
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
                <span className="text-sm text-slate-600">
                  {uploading
                    ? "Uploading..."
                    : "Click to upload photos or drag and drop"}
                </span>
                <span className="text-xs text-slate-400">
                  PNG, JPG up to 10MB each
                </span>
              </label>
            </div>

            {/* Photo grid */}
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

            <p className="text-sm text-slate-500">
              Photos are optional but help with underwriting. You can skip this
              step if needed.
            </p>

            <div className="flex justify-between pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setCurrentStep(2)}
              >
                <ChevronLeft className="mr-2 h-4 w-4" />
                Back
              </Button>
              <Button
                onClick={handleFinalSubmit}
                disabled={submitting}
              >
                {submitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  <>
                    <Check className="mr-2 h-4 w-4" />
                    Submit Deal
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
