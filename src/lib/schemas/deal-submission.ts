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

// Countries list (commonly used countries first, then alphabetical)
export const countries = [
  { value: "US", label: "United States" },
  { value: "CA", label: "Canada" },
  { value: "GB", label: "United Kingdom" },
  { value: "AU", label: "Australia" },
  { value: "DE", label: "Germany" },
  { value: "FR", label: "France" },
  { value: "ES", label: "Spain" },
  { value: "IT", label: "Italy" },
  { value: "NL", label: "Netherlands" },
  { value: "BE", label: "Belgium" },
  { value: "AT", label: "Austria" },
  { value: "CH", label: "Switzerland" },
  { value: "IE", label: "Ireland" },
  { value: "NZ", label: "New Zealand" },
  { value: "SG", label: "Singapore" },
  { value: "HK", label: "Hong Kong" },
  { value: "JP", label: "Japan" },
  { value: "KR", label: "South Korea" },
  { value: "AE", label: "United Arab Emirates" },
  { value: "SA", label: "Saudi Arabia" },
  { value: "MX", label: "Mexico" },
  { value: "BR", label: "Brazil" },
  { value: "AR", label: "Argentina" },
  { value: "CL", label: "Chile" },
  { value: "CO", label: "Colombia" },
  { value: "PE", label: "Peru" },
  { value: "ZA", label: "South Africa" },
  { value: "NG", label: "Nigeria" },
  { value: "EG", label: "Egypt" },
  { value: "IN", label: "India" },
  { value: "PH", label: "Philippines" },
  { value: "TH", label: "Thailand" },
  { value: "MY", label: "Malaysia" },
  { value: "ID", label: "Indonesia" },
  { value: "VN", label: "Vietnam" },
  { value: "PL", label: "Poland" },
  { value: "CZ", label: "Czech Republic" },
  { value: "SE", label: "Sweden" },
  { value: "NO", label: "Norway" },
  { value: "DK", label: "Denmark" },
  { value: "FI", label: "Finland" },
  { value: "PT", label: "Portugal" },
  { value: "GR", label: "Greece" },
  { value: "TR", label: "Turkey" },
  { value: "IL", label: "Israel" },
  { value: "RU", label: "Russia" },
  { value: "UA", label: "Ukraine" },
  { value: "CN", label: "China" },
  { value: "TW", label: "Taiwan" },
  { value: "OTHER", label: "Other" },
] as const;

// US States (kept for backward compatibility and US-specific features)
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

// Canadian Provinces
export const canadianProvinces = [
  { value: "AB", label: "Alberta" },
  { value: "BC", label: "British Columbia" },
  { value: "MB", label: "Manitoba" },
  { value: "NB", label: "New Brunswick" },
  { value: "NL", label: "Newfoundland and Labrador" },
  { value: "NS", label: "Nova Scotia" },
  { value: "NT", label: "Northwest Territories" },
  { value: "NU", label: "Nunavut" },
  { value: "ON", label: "Ontario" },
  { value: "PE", label: "Prince Edward Island" },
  { value: "QC", label: "Quebec" },
  { value: "SK", label: "Saskatchewan" },
  { value: "YT", label: "Yukon" },
] as const;

// Step 1: Property Details Schema (International)
export const propertyDetailsSchema = z.object({
  address: z.string().min(5, "Address must be at least 5 characters"),
  city: z.string().min(2, "City is required"),
  state: z.string().min(1, "State/Province/Region is required"),
  zip: z.string().min(2, "Postal/ZIP code is required").max(20, "Postal code too long"),
  country: z.string().min(2, "Country is required").default("US"),
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

// Step 2: Repair Scope Schema
export const repairCategories = [
  { id: "roof", label: "Roof", defaultCost: 8000 },
  { id: "hvac", label: "HVAC", defaultCost: 6000 },
  { id: "plumbing", label: "Plumbing", defaultCost: 5000 },
  { id: "electrical", label: "Electrical", defaultCost: 4000 },
  { id: "foundation", label: "Foundation", defaultCost: 10000 },
  { id: "kitchen", label: "Kitchen", defaultCost: 15000 },
  { id: "bathrooms", label: "Bathrooms", defaultCost: 8000 },
  { id: "flooring", label: "Flooring", defaultCost: 6000 },
  { id: "paint", label: "Paint", defaultCost: 3000 },
  { id: "windows", label: "Windows", defaultCost: 5000 },
  { id: "landscaping", label: "Landscaping", defaultCost: 2000 },
  { id: "misc", label: "Miscellaneous", defaultCost: 3000 },
] as const;

export const repairScopeSchema = z.object({
  estimatedARV: z.coerce.number().min(0, "ARV must be positive").optional(),
  repairItems: z.array(z.object({
    category: z.string(),
    description: z.string().optional(),
    cost: z.coerce.number().min(0),
  })).optional(),
  totalRepairCost: z.coerce.number().min(0).optional(),
  repairNotes: z.string().optional(),
});

// Step 3: Financing Schema
export const loanTypes = [
  { value: "hard_money", label: "Hard Money" },
  { value: "private", label: "Private Money" },
  { value: "conventional", label: "Conventional" },
  { value: "fha", label: "FHA" },
  { value: "va", label: "VA" },
  { value: "cash", label: "Cash (No Loan)" },
  { value: "other", label: "Other" },
] as const;

export const financingSchema = z.object({
  loanType: z.string().optional(),
  loanAmount: z.coerce.number().min(0).optional(),
  interestRate: z.coerce.number().min(0).max(30).optional(),
  loanTerm: z.coerce.number().min(1).max(360).optional(), // months
  downPayment: z.coerce.number().min(0).optional(),
  downPaymentPercent: z.coerce.number().min(0).max(100).optional(),
  closingCosts: z.coerce.number().min(0).optional(),
  monthlyPayment: z.coerce.number().min(0).optional(),
  holdingCostsMonthly: z.coerce.number().min(0).optional(),
  estimatedHoldTime: z.coerce.number().min(1).max(60).optional(), // months
});

// Step 4: Seller Info Schema
export const sellerInfoSchema = z.object({
  sellerName: z.string().min(2, "Seller name is required"),
  sellerPhone: z.string().optional(),
  sellerEmail: z.string().email("Invalid email").optional().or(z.literal("")),
  sellerMotivation: z.string().optional(),
  askingPrice: z.coerce.number().min(0, "Asking price must be positive"),
  notes: z.string().optional(),
});

// Step 5: Photos Schema (handled separately due to file uploads)
export const photosSchema = z.object({
  photos: z.array(z.string()).optional(),
});

// Combined schema for full form
export const dealSubmissionSchema = propertyDetailsSchema
  .merge(repairScopeSchema)
  .merge(financingSchema)
  .merge(sellerInfoSchema)
  .merge(photosSchema);

export type PropertyDetailsForm = z.infer<typeof propertyDetailsSchema>;
export type RepairScopeForm = z.infer<typeof repairScopeSchema>;
export type FinancingForm = z.infer<typeof financingSchema>;
export type SellerInfoForm = z.infer<typeof sellerInfoSchema>;
export type PhotosForm = z.infer<typeof photosSchema>;
export type DealSubmissionForm = z.infer<typeof dealSubmissionSchema>;
