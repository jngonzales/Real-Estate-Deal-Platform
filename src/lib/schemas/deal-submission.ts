import { z } from "zod";

// Property types enum matching database
export const propertyTypes = [
  { value: "single_family", label: "Single Family" },
  { value: "multi_family", label: "Multi Family" },
  { value: "condo", label: "Condo" },
  { value: "townhouse", label: "Townhouse" },
  { value: "land", label: "Land" },
  { value: "commercial", label: "Commercial" },
  { value: "other", label: "Other" },
] as const;

// US States
export const usStates = [
  { value: "AL", label: "Alabama" },
  { value: "AK", label: "Alaska" },
  { value: "AZ", label: "Arizona" },
  { value: "AR", label: "Arkansas" },
  { value: "CA", label: "California" },
  { value: "CO", label: "Colorado" },
  { value: "CT", label: "Connecticut" },
  { value: "DE", label: "Delaware" },
  { value: "FL", label: "Florida" },
  { value: "GA", label: "Georgia" },
  { value: "HI", label: "Hawaii" },
  { value: "ID", label: "Idaho" },
  { value: "IL", label: "Illinois" },
  { value: "IN", label: "Indiana" },
  { value: "IA", label: "Iowa" },
  { value: "KS", label: "Kansas" },
  { value: "KY", label: "Kentucky" },
  { value: "LA", label: "Louisiana" },
  { value: "ME", label: "Maine" },
  { value: "MD", label: "Maryland" },
  { value: "MA", label: "Massachusetts" },
  { value: "MI", label: "Michigan" },
  { value: "MN", label: "Minnesota" },
  { value: "MS", label: "Mississippi" },
  { value: "MO", label: "Missouri" },
  { value: "MT", label: "Montana" },
  { value: "NE", label: "Nebraska" },
  { value: "NV", label: "Nevada" },
  { value: "NH", label: "New Hampshire" },
  { value: "NJ", label: "New Jersey" },
  { value: "NM", label: "New Mexico" },
  { value: "NY", label: "New York" },
  { value: "NC", label: "North Carolina" },
  { value: "ND", label: "North Dakota" },
  { value: "OH", label: "Ohio" },
  { value: "OK", label: "Oklahoma" },
  { value: "OR", label: "Oregon" },
  { value: "PA", label: "Pennsylvania" },
  { value: "RI", label: "Rhode Island" },
  { value: "SC", label: "South Carolina" },
  { value: "SD", label: "South Dakota" },
  { value: "TN", label: "Tennessee" },
  { value: "TX", label: "Texas" },
  { value: "UT", label: "Utah" },
  { value: "VT", label: "Vermont" },
  { value: "VA", label: "Virginia" },
  { value: "WA", label: "Washington" },
  { value: "WV", label: "West Virginia" },
  { value: "WI", label: "Wisconsin" },
  { value: "WY", label: "Wyoming" },
] as const;

// Step 1: Property Details Schema
export const propertyDetailsSchema = z.object({
  address: z.string().min(5, "Address must be at least 5 characters"),
  city: z.string().min(2, "City is required"),
  state: z.string().min(2, "State is required"),
  zip: z.string().regex(/^\d{5}(-\d{4})?$/, "Invalid ZIP code"),
  county: z.string().optional(),
  propertyType: z.enum([
    "single_family",
    "multi_family",
    "condo",
    "townhouse",
    "land",
    "commercial",
    "other",
  ]),
  bedrooms: z.coerce.number().min(0).max(20).optional().nullable(),
  bathrooms: z.coerce.number().min(0).max(20).optional().nullable(),
  sqft: z.coerce.number().min(0).max(100000).optional().nullable(),
  yearBuilt: z.coerce.number().min(1800).max(2030).optional().nullable(),
});

// Step 2: Seller Info Schema
export const sellerInfoSchema = z.object({
  sellerName: z.string().min(2, "Seller name is required"),
  sellerPhone: z.string().optional(),
  sellerEmail: z.string().email("Invalid email").optional().or(z.literal("")),
  sellerMotivation: z.string().optional(),
  askingPrice: z.coerce.number().min(0, "Asking price must be positive"),
  notes: z.string().optional(),
});

// Step 3: Photos Schema (handled separately due to file uploads)
export const photosSchema = z.object({
  photos: z.array(z.string()).optional(),
});

// Combined schema for full form
export const dealSubmissionSchema = propertyDetailsSchema
  .merge(sellerInfoSchema)
  .merge(photosSchema);

export type PropertyDetailsForm = z.infer<typeof propertyDetailsSchema>;
export type SellerInfoForm = z.infer<typeof sellerInfoSchema>;
export type PhotosForm = z.infer<typeof photosSchema>;
export type DealSubmissionForm = z.infer<typeof dealSubmissionSchema>;
