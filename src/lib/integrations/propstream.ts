/**
 * PropStream API Integration
 * Fetch property comps and ARV data
 * 
 * Note: PropStream requires an API key and subscription.
 * Set PROPSTREAM_API_KEY in your .env.local file.
 * 
 * API Docs: https://www.propstream.com/api
 */

export interface PropStreamComp {
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
  daysOnMarket?: number;
}

export interface PropStreamPropertyData {
  address: string;
  city: string;
  state: string;
  zip: string;
  county: string;
  apn: string;
  bedrooms: number;
  bathrooms: number;
  sqft: number;
  lotSize: number;
  yearBuilt: number;
  propertyType: string;
  ownerName: string;
  ownerAddress: string;
  marketValue: number;
  assessedValue: number;
  taxAmount: number;
  lastSalePrice: number;
  lastSaleDate: string;
  equityPercent: number;
  estimatedValue: number;
}

export interface PropStreamARVResult {
  estimatedARV: number;
  confidenceScore: number; // 0-100
  comps: PropStreamComp[];
  averagePricePerSqft: number;
  medianSalePrice: number;
  compCount: number;
}

export interface PropStreamSearchParams {
  address: string;
  city: string;
  state: string;
  zip?: string;
  // Comp search parameters
  radius?: number; // miles, default 0.5
  maxAge?: number; // months, default 6
  minBeds?: number;
  maxBeds?: number;
  minBaths?: number;
  maxBaths?: number;
  minSqft?: number;
  maxSqft?: number;
  propertyType?: string;
  limit?: number; // max comps to return
}

const PROPSTREAM_API_BASE = "https://api.propstream.com/v1";

/**
 * Get API key from environment
 */
function getApiKey(): string | null {
  return process.env.PROPSTREAM_API_KEY || null;
}

/**
 * Check if PropStream is configured
 */
export function isPropStreamConfigured(): boolean {
  return !!getApiKey();
}

/**
 * Make authenticated request to PropStream API
 */
async function propstreamRequest<T>(
  endpoint: string,
  params: Record<string, string | number | undefined>
): Promise<{ data: T | null; error: string | null }> {
  const apiKey = getApiKey();
  
  if (!apiKey) {
    return { data: null, error: "PropStream API key not configured" };
  }

  try {
    // Build query string, filtering out undefined values
    const queryParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) {
        queryParams.append(key, String(value));
      }
    });

    const url = `${PROPSTREAM_API_BASE}${endpoint}?${queryParams.toString()}`;
    
    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("PropStream API error:", errorText);
      return { data: null, error: `PropStream API error: ${response.status}` };
    }

    const data = await response.json();
    return { data: data as T, error: null };
  } catch (error) {
    console.error("PropStream request failed:", error);
    return { data: null, error: "Failed to connect to PropStream API" };
  }
}

/**
 * Get property details from PropStream
 */
export async function getPropertyDetails(
  params: Pick<PropStreamSearchParams, "address" | "city" | "state" | "zip">
): Promise<{ data: PropStreamPropertyData | null; error: string | null }> {
  return propstreamRequest<PropStreamPropertyData>("/property/details", {
    address: params.address,
    city: params.city,
    state: params.state,
    zip: params.zip,
  });
}

/**
 * Get comparable sales for ARV calculation
 */
export async function getComps(
  params: PropStreamSearchParams
): Promise<{ data: PropStreamComp[] | null; error: string | null }> {
  const { data, error } = await propstreamRequest<{ comps: PropStreamComp[] }>("/comps/search", {
    address: params.address,
    city: params.city,
    state: params.state,
    zip: params.zip,
    radius: params.radius || 0.5,
    max_age_months: params.maxAge || 6,
    min_beds: params.minBeds,
    max_beds: params.maxBeds,
    min_baths: params.minBaths,
    max_baths: params.maxBaths,
    min_sqft: params.minSqft,
    max_sqft: params.maxSqft,
    property_type: params.propertyType,
    limit: params.limit || 10,
  });

  if (error || !data) {
    return { data: null, error };
  }

  return { data: data.comps, error: null };
}

/**
 * Calculate ARV from comps
 * Uses average of 3-6 comparable sales
 */
export function calculateARVFromComps(comps: PropStreamComp[]): PropStreamARVResult | null {
  if (!comps || comps.length === 0) {
    return null;
  }

  // Sort by distance (closest first) then by recency
  const sortedComps = [...comps].sort((a, b) => {
    if (a.distanceMiles !== b.distanceMiles) {
      return a.distanceMiles - b.distanceMiles;
    }
    return new Date(b.saleDate).getTime() - new Date(a.saleDate).getTime();
  });

  // Use top 3-6 comps
  const selectedComps = sortedComps.slice(0, Math.min(6, sortedComps.length));
  
  // Calculate average sale price
  const totalPrice = selectedComps.reduce((sum, comp) => sum + comp.salePrice, 0);
  const averagePrice = totalPrice / selectedComps.length;

  // Calculate average price per sqft
  const totalPricePerSqft = selectedComps.reduce((sum, comp) => sum + comp.pricePerSqft, 0);
  const averagePricePerSqft = totalPricePerSqft / selectedComps.length;

  // Calculate median sale price
  const sortedPrices = selectedComps.map(c => c.salePrice).sort((a, b) => a - b);
  const medianIndex = Math.floor(sortedPrices.length / 2);
  const medianSalePrice = sortedPrices.length % 2 === 0
    ? (sortedPrices[medianIndex - 1] + sortedPrices[medianIndex]) / 2
    : sortedPrices[medianIndex];

  // Calculate confidence score based on:
  // - Number of comps (more = higher)
  // - Distance consistency (closer = higher)
  // - Recency (more recent = higher)
  let confidenceScore = 50;
  
  // Comp count bonus (up to 20 points)
  confidenceScore += Math.min(selectedComps.length * 4, 20);
  
  // Distance bonus (up to 15 points)
  const avgDistance = selectedComps.reduce((sum, c) => sum + c.distanceMiles, 0) / selectedComps.length;
  if (avgDistance < 0.25) confidenceScore += 15;
  else if (avgDistance < 0.5) confidenceScore += 10;
  else if (avgDistance < 1) confidenceScore += 5;
  
  // Recency bonus (up to 15 points)
  const now = new Date();
  const avgAgeDays = selectedComps.reduce((sum, c) => {
    const saleDate = new Date(c.saleDate);
    return sum + (now.getTime() - saleDate.getTime()) / (1000 * 60 * 60 * 24);
  }, 0) / selectedComps.length;
  
  if (avgAgeDays < 90) confidenceScore += 15;
  else if (avgAgeDays < 180) confidenceScore += 10;
  else if (avgAgeDays < 270) confidenceScore += 5;

  return {
    estimatedARV: Math.round(averagePrice),
    confidenceScore: Math.min(confidenceScore, 100),
    comps: selectedComps,
    averagePricePerSqft: Math.round(averagePricePerSqft),
    medianSalePrice: Math.round(medianSalePrice),
    compCount: selectedComps.length,
  };
}

/**
 * Get ARV estimate for a property
 * Combines fetching comps and calculating ARV
 */
export async function getARVEstimate(
  params: PropStreamSearchParams
): Promise<{ data: PropStreamARVResult | null; error: string | null }> {
  const { data: comps, error } = await getComps(params);

  if (error || !comps) {
    return { data: null, error };
  }

  const arvResult = calculateARVFromComps(comps);

  if (!arvResult) {
    return { data: null, error: "Not enough comps to calculate ARV" };
  }

  return { data: arvResult, error: null };
}

/**
 * Mock PropStream response for development/testing
 * Use when API key is not configured
 */
export function getMockARVEstimate(
  sqft: number = 1800,
  beds: number = 3,
  baths: number = 2
): PropStreamARVResult {
  const basePrice = 350000;
  const sqftAdjustment = (sqft - 1800) * 150;
  const bedAdjustment = (beds - 3) * 15000;
  const bathAdjustment = (baths - 2) * 10000;
  
  const estimatedARV = basePrice + sqftAdjustment + bedAdjustment + bathAdjustment;

  const mockComps: PropStreamComp[] = [
    {
      address: "123 Oak Street",
      city: "Charleston",
      state: "SC",
      zip: "29401",
      salePrice: estimatedARV - 15000,
      saleDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
      distanceMiles: 0.2,
      bedrooms: beds,
      bathrooms: baths,
      sqft: sqft - 100,
      yearBuilt: 2010,
      pricePerSqft: Math.round((estimatedARV - 15000) / (sqft - 100)),
    },
    {
      address: "456 Maple Avenue",
      city: "Charleston",
      state: "SC",
      zip: "29401",
      salePrice: estimatedARV + 10000,
      saleDate: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000).toISOString(),
      distanceMiles: 0.3,
      bedrooms: beds,
      bathrooms: baths,
      sqft: sqft + 50,
      yearBuilt: 2012,
      pricePerSqft: Math.round((estimatedARV + 10000) / (sqft + 50)),
    },
    {
      address: "789 Pine Road",
      city: "Charleston",
      state: "SC",
      zip: "29401",
      salePrice: estimatedARV + 5000,
      saleDate: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
      distanceMiles: 0.4,
      bedrooms: beds,
      bathrooms: baths + 1,
      sqft: sqft + 200,
      yearBuilt: 2015,
      pricePerSqft: Math.round((estimatedARV + 5000) / (sqft + 200)),
    },
  ];

  return {
    estimatedARV: Math.round(estimatedARV),
    confidenceScore: 75,
    comps: mockComps,
    averagePricePerSqft: Math.round(estimatedARV / sqft),
    medianSalePrice: Math.round(estimatedARV),
    compCount: mockComps.length,
  };
}
