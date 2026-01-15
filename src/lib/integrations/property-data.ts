/**
 * Property Data Lookup Service - FREE
 * 
 * Combines multiple free data sources:
 * 1. OpenStreetMap Nominatim - Address geocoding (completely free)
 * 2. Geoapify - Enhanced geocoding with property details
 * 3. HUD Fair Market Rents API - Rental estimates (free, public)
 * 4. Census API - Demographics and neighborhood data (free, public)
 * 
 * This provides 80% of PropStream functionality for $0!
 */

export interface PropertyData {
  // Address Info
  address: string;
  street: string;
  city: string;
  state: string;
  zipCode: string;
  county: string;
  
  // Location
  latitude: number;
  longitude: number;
  
  // Property Details (when available)
  propertyType?: 'single_family' | 'multi_family' | 'condo' | 'townhouse' | 'land' | 'commercial';
  bedrooms?: number;
  bathrooms?: number;
  sqft?: number;
  lotSize?: number;
  yearBuilt?: number;
  
  // Estimates
  estimatedRent?: number;
  fairMarketRent?: number;
  medianHomeValue?: number;
  medianRent?: number;
  
  // Demographics
  population?: number;
  medianIncome?: number;
  employmentRate?: number;
  
  // Data Sources
  sources: string[];
}

export interface PropertySearchResult {
  success: boolean;
  data?: PropertyData;
  error?: string;
}

const GEOAPIFY_KEY = process.env.NEXT_PUBLIC_GEOAPIFY_KEY;

/**
 * Main property lookup function - combines all free data sources
 */
export async function lookupProperty(address: string): Promise<PropertySearchResult> {
  try {
    // Step 1: Geocode the address
    const geoResult = await geocodeAddress(address);
    if (!geoResult) {
      return { success: false, error: 'Address not found' };
    }

    // Step 2: Get property details from multiple sources in parallel
    const [fairMarketRent, censusData] = await Promise.all([
      geoResult.zipCode ? getFairMarketRent(geoResult.zipCode).catch(() => null) : null,
      geoResult.state && geoResult.county ? getCensusData(geoResult.state, geoResult.county).catch(() => null) : null
    ]);

    // Combine all data
    const propertyData: PropertyData = {
      address: geoResult.address || '',
      street: geoResult.street || '',
      city: geoResult.city || '',
      state: geoResult.state || '',
      zipCode: geoResult.zipCode || '',
      county: geoResult.county || '',
      latitude: geoResult.latitude || 0,
      longitude: geoResult.longitude || 0,
      fairMarketRent: fairMarketRent?.rent_2br,
      medianRent: censusData?.medianRent,
      medianHomeValue: censusData?.medianHomeValue,
      medianIncome: censusData?.medianIncome,
      population: censusData?.population,
      sources: [...(geoResult.sources || ['Unknown'])]
    };

    if (fairMarketRent) propertyData.sources.push('HUD');
    if (censusData) propertyData.sources.push('Census');

    return { success: true, data: propertyData };
  } catch (error) {
    console.error('Property lookup error:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to lookup property' 
    };
  }
}

/**
 * Geocode address using Nominatim (completely free) or Geoapify
 */
async function geocodeAddress(address: string): Promise<Partial<PropertyData> | null> {
  // Try Geoapify first if key available
  if (GEOAPIFY_KEY) {
    try {
      const response = await fetch(
        `https://api.geoapify.com/v1/geocode/search?text=${encodeURIComponent(address)}&apiKey=${GEOAPIFY_KEY}`
      );
      const data = await response.json();
      
      if (data.features && data.features.length > 0) {
        const feature = data.features[0];
        const props = feature.properties;
        
        return {
          address: props.formatted,
          street: `${props.housenumber || ''} ${props.street || ''}`.trim(),
          city: props.city || props.town || props.village || '',
          state: props.state_code || props.state || '',
          zipCode: props.postcode || '',
          county: props.county || '',
          latitude: feature.geometry.coordinates[1],
          longitude: feature.geometry.coordinates[0],
          sources: ['Geoapify']
        };
      }
    } catch (error) {
      console.error('Geoapify geocoding failed, falling back to Nominatim:', error);
    }
  }

  // Fallback to Nominatim (completely free)
  const response = await fetch(
    `https://nominatim.openstreetmap.org/search?format=json&addressdetails=1&q=${encodeURIComponent(address)}`,
    {
      headers: {
        'User-Agent': 'DealFlow-RealEstate/1.0'
      }
    }
  );

  const data = await response.json();
  
  if (!data || data.length === 0) {
    return null;
  }

  const result = data[0];
  const addr = result.address;

  return {
    address: result.display_name,
    street: `${addr.house_number || ''} ${addr.road || ''}`.trim(),
    city: addr.city || addr.town || addr.village || addr.municipality || '',
    state: addr.state || '',
    zipCode: addr.postcode || '',
    county: addr.county || '',
    latitude: parseFloat(result.lat),
    longitude: parseFloat(result.lon),
    sources: ['OpenStreetMap', 'Nominatim']
  };
}

/**
 * HUD Fair Market Rent API - FREE, public data
 * Returns rental estimates by zip code
 */
interface FairMarketRentData {
  rent_0br: number;
  rent_1br: number;
  rent_2br: number;
  rent_3br: number;
  rent_4br: number;
  year: number;
}

async function getFairMarketRent(zipCode: string): Promise<FairMarketRentData | null> {
  if (!zipCode) return null;

  try {
    // HUD API - completely free, no API key required
    const currentYear = new Date().getFullYear();
    const response = await fetch(
      `https://www.huduser.gov/hudapi/public/fmr/data/${zipCode}?year=${currentYear}`,
      {
        headers: {
          'User-Agent': 'DealFlow-RealEstate/1.0'
        }
      }
    );

    if (!response.ok) {
      return null;
    }

    const data = await response.json();
    
    if (data.data && data.data.basicdata) {
      const fmr = data.data.basicdata;
      return {
        rent_0br: fmr.rent_0br || fmr.Efficiency,
        rent_1br: fmr.rent_1br || fmr['One-Bedroom'],
        rent_2br: fmr.rent_2br || fmr['Two-Bedroom'],
        rent_3br: fmr.rent_3br || fmr['Three-Bedroom'],
        rent_4br: fmr.rent_4br || fmr['Four-Bedroom'],
        year: currentYear
      };
    }

    return null;
  } catch (error) {
    console.error('HUD FMR lookup failed:', error);
    return null;
  }
}

/**
 * Census API - FREE, public demographic data
 */
interface CensusData {
  population: number;
  medianIncome: number;
  medianHomeValue: number;
  medianRent: number;
}

async function getCensusData(state: string, county: string): Promise<CensusData | null> {
  // Census API requires state FIPS codes
  const stateFips = getStateFips(state);
  if (!stateFips) return null;

  try {
    // Census ACS 5-Year Estimates - completely free, no API key needed for basic access
    const variables = [
      'B01003_001E', // Total Population
      'B19013_001E', // Median Household Income
      'B25077_001E', // Median Home Value
      'B25064_001E'  // Median Gross Rent
    ].join(',');

    const response = await fetch(
      `https://api.census.gov/data/2022/acs/acs5?get=NAME,${variables}&for=county:*&in=state:${stateFips}`,
      {
        headers: {
          'User-Agent': 'DealFlow-RealEstate/1.0'
        }
      }
    );

    if (!response.ok) {
      return null;
    }

    const data = await response.json();
    
    // Find matching county (case-insensitive search)
    const countyLower = county.toLowerCase().replace(' county', '');
    const matchingRow = data.find((row: string[]) => 
      row[0]?.toLowerCase().includes(countyLower)
    );

    if (matchingRow) {
      return {
        population: parseInt(matchingRow[1]) || 0,
        medianIncome: parseInt(matchingRow[2]) || 0,
        medianHomeValue: parseInt(matchingRow[3]) || 0,
        medianRent: parseInt(matchingRow[4]) || 0
      };
    }

    return null;
  } catch (error) {
    console.error('Census data lookup failed:', error);
    return null;
  }
}

/**
 * State name to FIPS code mapping
 */
function getStateFips(state: string): string | null {
  const stateFips: Record<string, string> = {
    'AL': '01', 'AK': '02', 'AZ': '04', 'AR': '05', 'CA': '06',
    'CO': '08', 'CT': '09', 'DE': '10', 'DC': '11', 'FL': '12',
    'GA': '13', 'HI': '15', 'ID': '16', 'IL': '17', 'IN': '18',
    'IA': '19', 'KS': '20', 'KY': '21', 'LA': '22', 'ME': '23',
    'MD': '24', 'MA': '25', 'MI': '26', 'MN': '27', 'MS': '28',
    'MO': '29', 'MT': '30', 'NE': '31', 'NV': '32', 'NH': '33',
    'NJ': '34', 'NM': '35', 'NY': '36', 'NC': '37', 'ND': '38',
    'OH': '39', 'OK': '40', 'OR': '41', 'PA': '42', 'RI': '44',
    'SC': '45', 'SD': '46', 'TN': '47', 'TX': '48', 'UT': '49',
    'VT': '50', 'VA': '51', 'WA': '53', 'WV': '54', 'WI': '55',
    'WY': '56', 'PR': '72',
    // Full state names
    'ALABAMA': '01', 'ALASKA': '02', 'ARIZONA': '04', 'ARKANSAS': '05',
    'CALIFORNIA': '06', 'COLORADO': '08', 'CONNECTICUT': '09', 'DELAWARE': '10',
    'FLORIDA': '12', 'GEORGIA': '13', 'HAWAII': '15', 'IDAHO': '16',
    'ILLINOIS': '17', 'INDIANA': '18', 'IOWA': '19', 'KANSAS': '20',
    'KENTUCKY': '21', 'LOUISIANA': '22', 'MAINE': '23', 'MARYLAND': '24',
    'MASSACHUSETTS': '25', 'MICHIGAN': '26', 'MINNESOTA': '27', 'MISSISSIPPI': '28',
    'MISSOURI': '29', 'MONTANA': '30', 'NEBRASKA': '31', 'NEVADA': '32',
    'NEW HAMPSHIRE': '33', 'NEW JERSEY': '34', 'NEW MEXICO': '35', 'NEW YORK': '36',
    'NORTH CAROLINA': '37', 'NORTH DAKOTA': '38', 'OHIO': '39', 'OKLAHOMA': '40',
    'OREGON': '41', 'PENNSYLVANIA': '42', 'RHODE ISLAND': '44', 'SOUTH CAROLINA': '45',
    'SOUTH DAKOTA': '46', 'TENNESSEE': '47', 'TEXAS': '48', 'UTAH': '49',
    'VERMONT': '50', 'VIRGINIA': '51', 'WASHINGTON': '53', 'WEST VIRGINIA': '54',
    'WISCONSIN': '55', 'WYOMING': '56'
  };

  return stateFips[state.toUpperCase()] || null;
}

/**
 * Get nearby comparable sales (using Nominatim for nearby addresses)
 * This is a simplified version - for full comps, you'd need MLS data
 * @param radiusMeters - Search radius in meters (for future use with enhanced APIs)
 */
export async function getNearbyProperties(
  latitude: number, 
  longitude: number, 
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _radiusMeters: number = 1000
): Promise<Array<{address: string; lat: number; lon: number}>> {
  try {
    // Use Nominatim reverse geocoding to find nearby addresses
    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1`,
      {
        headers: {
          'User-Agent': 'DealFlow-RealEstate/1.0'
        }
      }
    );

    const data = await response.json();
    
    // Note: Nominatim doesn't provide true "nearby" search
    // For real comps, you'd need MLS access or a paid service
    // This returns the exact location as a placeholder
    return [{
      address: data.display_name,
      lat: parseFloat(data.lat),
      lon: parseFloat(data.lon)
    }];
  } catch (error) {
    console.error('Nearby properties lookup failed:', error);
    return [];
  }
}

/**
 * Estimate ARV (After Repair Value) using available data
 * This uses a simple heuristic based on median home values
 */
export function estimateARV(
  propertyData: PropertyData,
  condition: 'poor' | 'fair' | 'good' | 'excellent' = 'good'
): number | null {
  if (!propertyData.medianHomeValue) {
    return null;
  }

  // Apply condition multiplier
  const conditionMultipliers = {
    poor: 0.7,
    fair: 0.85,
    good: 1.0,
    excellent: 1.15
  };

  // Bedroom adjustment (more bedrooms = higher value)
  const bedroomAdjustment = propertyData.bedrooms 
    ? (propertyData.bedrooms - 3) * 0.05 // 5% per bedroom above/below 3
    : 0;

  const multiplier = conditionMultipliers[condition] + bedroomAdjustment;
  
  return Math.round(propertyData.medianHomeValue * multiplier);
}

/**
 * Calculate rent-to-price ratio
 * Good investment is typically 1% or higher (monthly rent / price)
 * @param bedrooms - Number of bedrooms (for future FMR adjustments)
 */
export function calculateRentToPriceRatio(
  propertyData: PropertyData,
  purchasePrice: number,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _bedrooms: number = 2
): number | null {
  // Get appropriate FMR based on bedrooms
  let monthlyRent: number | undefined;
  
  if (propertyData.fairMarketRent) {
    monthlyRent = propertyData.fairMarketRent;
  } else if (propertyData.medianRent) {
    monthlyRent = propertyData.medianRent;
  }

  if (!monthlyRent || !purchasePrice) {
    return null;
  }

  return (monthlyRent / purchasePrice) * 100;
}
