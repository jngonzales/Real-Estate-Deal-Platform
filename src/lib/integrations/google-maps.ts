/**
 * Google Maps Integration
 * Address validation, geocoding, and drive time calculation
 * 
 * Note: Google Maps requires an API key with the following APIs enabled:
 * - Geocoding API
 * - Distance Matrix API
 * - Places API (optional, for address autocomplete)
 * 
 * Set GOOGLE_MAPS_API_KEY in your .env.local file.
 */

export interface GeocodingResult {
  formattedAddress: string;
  lat: number;
  lng: number;
  placeId: string;
  streetNumber?: string;
  route?: string;
  city?: string;
  county?: string;
  state?: string;
  stateCode?: string;
  zip?: string;
  country?: string;
  isValid: boolean;
}

export interface DriveTimeResult {
  originAddress: string;
  destinationAddress: string;
  distanceMeters: number;
  distanceMiles: number;
  durationSeconds: number;
  durationMinutes: number;
  durationText: string;
  distanceText: string;
}

export interface AddressComponent {
  long_name: string;
  short_name: string;
  types: string[];
}

export interface GoogleGeocodingResponse {
  results: {
    formatted_address: string;
    geometry: {
      location: {
        lat: number;
        lng: number;
      };
    };
    place_id: string;
    address_components: AddressComponent[];
  }[];
  status: string;
  error_message?: string;
}

export interface GoogleDistanceMatrixResponse {
  origin_addresses: string[];
  destination_addresses: string[];
  rows: {
    elements: {
      status: string;
      distance?: {
        value: number;
        text: string;
      };
      duration?: {
        value: number;
        text: string;
      };
    }[];
  }[];
  status: string;
  error_message?: string;
}

const GOOGLE_MAPS_BASE_URL = "https://maps.googleapis.com/maps/api";

/**
 * Get API key from environment
 */
function getApiKey(): string | null {
  return process.env.GOOGLE_MAPS_API_KEY || null;
}

/**
 * Check if Google Maps is configured
 */
export function isGoogleMapsConfigured(): boolean {
  return !!getApiKey();
}

/**
 * Extract address component by type
 */
function getAddressComponent(
  components: AddressComponent[],
  type: string,
  useShort: boolean = false
): string | undefined {
  const component = components.find((c) => c.types.includes(type));
  return component ? (useShort ? component.short_name : component.long_name) : undefined;
}

/**
 * Geocode an address to get lat/lng and validate
 */
export async function geocodeAddress(
  address: string
): Promise<{ data: GeocodingResult | null; error: string | null }> {
  const apiKey = getApiKey();
  
  if (!apiKey) {
    return { data: null, error: "Google Maps API key not configured" };
  }

  try {
    const params = new URLSearchParams({
      address,
      key: apiKey,
    });

    const response = await fetch(`${GOOGLE_MAPS_BASE_URL}/geocode/json?${params}`);

    if (!response.ok) {
      return { data: null, error: `Google Maps API error: ${response.status}` };
    }

    const data: GoogleGeocodingResponse = await response.json();

    if (data.status !== "OK" || data.results.length === 0) {
      // Provide more specific error messages
      let errorMessage = data.error_message || `Geocoding failed: ${data.status}`;
      if (data.status === "REQUEST_DENIED") {
        errorMessage = "API not authorized. Please enable Geocoding API in Google Cloud Console.";
      } else if (data.status === "OVER_QUERY_LIMIT") {
        errorMessage = "API quota exceeded. Please check your Google Cloud billing.";
      } else if (data.status === "ZERO_RESULTS") {
        errorMessage = "Address not found. Please check the address and try again.";
      }
      return { 
        data: null, 
        error: errorMessage 
      };
    }

    const result = data.results[0];
    const components = result.address_components;

    return {
      data: {
        formattedAddress: result.formatted_address,
        lat: result.geometry.location.lat,
        lng: result.geometry.location.lng,
        placeId: result.place_id,
        streetNumber: getAddressComponent(components, "street_number"),
        route: getAddressComponent(components, "route"),
        city: getAddressComponent(components, "locality") || 
              getAddressComponent(components, "sublocality"),
        county: getAddressComponent(components, "administrative_area_level_2"),
        state: getAddressComponent(components, "administrative_area_level_1"),
        stateCode: getAddressComponent(components, "administrative_area_level_1", true),
        zip: getAddressComponent(components, "postal_code"),
        country: getAddressComponent(components, "country"),
        isValid: true,
      },
      error: null,
    };
  } catch (error) {
    console.error("Geocoding failed:", error);
    return { data: null, error: "Failed to geocode address" };
  }
}

/**
 * Validate and normalize an address
 */
export async function validateAddress(
  address: string,
  city: string,
  state: string,
  zip?: string
): Promise<{ data: GeocodingResult | null; error: string | null; isValid: boolean }> {
  const fullAddress = zip 
    ? `${address}, ${city}, ${state} ${zip}` 
    : `${address}, ${city}, ${state}`;

  const result = await geocodeAddress(fullAddress);

  if (!result.data) {
    return { data: null, error: result.error, isValid: false };
  }

  // Check if the geocoded result matches the input
  const geocoded = result.data;
  const inputCity = city.toLowerCase();
  const geocodedCity = geocoded.city?.toLowerCase() || "";
  const inputState = state.toLowerCase();
  const geocodedState = (geocoded.stateCode || geocoded.state || "").toLowerCase();

  // Validate city and state match (allow for slight variations)
  const cityMatches = geocodedCity.includes(inputCity) || inputCity.includes(geocodedCity);
  const stateMatches = geocodedState === inputState || 
                       geocodedState === inputState.slice(0, 2);

  const isValid = cityMatches && stateMatches;

  return {
    data: { ...geocoded, isValid },
    error: isValid ? null : "Address validation failed - location may not match input",
    isValid,
  };
}

/**
 * Calculate drive time between two addresses
 */
export async function calculateDriveTime(
  origin: string,
  destination: string,
  departureTime?: Date
): Promise<{ data: DriveTimeResult | null; error: string | null }> {
  const apiKey = getApiKey();
  
  if (!apiKey) {
    return { data: null, error: "Google Maps API key not configured" };
  }

  try {
    const params = new URLSearchParams({
      origins: origin,
      destinations: destination,
      key: apiKey,
      units: "imperial",
    });

    if (departureTime) {
      params.append("departure_time", Math.floor(departureTime.getTime() / 1000).toString());
    }

    const response = await fetch(`${GOOGLE_MAPS_BASE_URL}/distancematrix/json?${params}`);

    if (!response.ok) {
      return { data: null, error: `Google Maps API error: ${response.status}` };
    }

    const data: GoogleDistanceMatrixResponse = await response.json();

    if (data.status !== "OK") {
      return { 
        data: null, 
        error: data.error_message || `Distance Matrix failed: ${data.status}` 
      };
    }

    const element = data.rows[0]?.elements[0];

    if (!element || element.status !== "OK" || !element.distance || !element.duration) {
      return { data: null, error: "Could not calculate route between addresses" };
    }

    const distanceMeters = element.distance.value;
    const durationSeconds = element.duration.value;

    return {
      data: {
        originAddress: data.origin_addresses[0],
        destinationAddress: data.destination_addresses[0],
        distanceMeters,
        distanceMiles: Math.round(distanceMeters * 0.000621371 * 10) / 10,
        durationSeconds,
        durationMinutes: Math.round(durationSeconds / 60),
        durationText: element.duration.text,
        distanceText: element.distance.text,
      },
      error: null,
    };
  } catch (error) {
    console.error("Drive time calculation failed:", error);
    return { data: null, error: "Failed to calculate drive time" };
  }
}

/**
 * Calculate drive times from property to multiple investor locations
 */
export async function calculateInvestorDriveTimes(
  propertyAddress: string,
  investorLocations: { id: string; name: string; address: string }[]
): Promise<{ data: (DriveTimeResult & { investorId: string; investorName: string })[] | null; error: string | null }> {
  const apiKey = getApiKey();
  
  if (!apiKey) {
    return { data: null, error: "Google Maps API key not configured" };
  }

  if (investorLocations.length === 0) {
    return { data: [], error: null };
  }

  try {
    // Google Distance Matrix API allows up to 25 destinations per request
    const destinations = investorLocations.map(i => i.address).join("|");
    
    const params = new URLSearchParams({
      origins: propertyAddress,
      destinations,
      key: apiKey,
      units: "imperial",
    });

    const response = await fetch(`${GOOGLE_MAPS_BASE_URL}/distancematrix/json?${params}`);

    if (!response.ok) {
      return { data: null, error: `Google Maps API error: ${response.status}` };
    }

    const data: GoogleDistanceMatrixResponse = await response.json();

    if (data.status !== "OK") {
      return { 
        data: null, 
        error: data.error_message || `Distance Matrix failed: ${data.status}` 
      };
    }

    const results = data.rows[0].elements.map((element, index) => {
      const investor = investorLocations[index];
      
      if (element.status !== "OK" || !element.distance || !element.duration) {
        return null;
      }

      const distanceMeters = element.distance.value;
      const durationSeconds = element.duration.value;

      return {
        investorId: investor.id,
        investorName: investor.name,
        originAddress: data.origin_addresses[0],
        destinationAddress: data.destination_addresses[index],
        distanceMeters,
        distanceMiles: Math.round(distanceMeters * 0.000621371 * 10) / 10,
        durationSeconds,
        durationMinutes: Math.round(durationSeconds / 60),
        durationText: element.duration.text,
        distanceText: element.distance.text,
      };
    }).filter((r): r is NonNullable<typeof r> => r !== null);

    return { data: results, error: null };
  } catch (error) {
    console.error("Investor drive times calculation failed:", error);
    return { data: null, error: "Failed to calculate investor drive times" };
  }
}

/**
 * Get a static map image URL for a property
 */
export function getStaticMapUrl(
  lat: number,
  lng: number,
  options: {
    width?: number;
    height?: number;
    zoom?: number;
    markerColor?: string;
  } = {}
): string | null {
  const apiKey = getApiKey();
  
  if (!apiKey) {
    return null;
  }

  const { width = 400, height = 300, zoom = 15, markerColor = "red" } = options;

  const params = new URLSearchParams({
    center: `${lat},${lng}`,
    zoom: zoom.toString(),
    size: `${width}x${height}`,
    markers: `color:${markerColor}|${lat},${lng}`,
    key: apiKey,
  });

  return `${GOOGLE_MAPS_BASE_URL}/staticmap?${params}`;
}

/**
 * Generate Google Maps link for directions
 */
export function getDirectionsUrl(
  origin: string,
  destination: string
): string {
  const params = new URLSearchParams({
    origin,
    destination,
    travelmode: "driving",
  });

  return `https://www.google.com/maps/dir/?api=1&${params}`;
}

/**
 * Mock geocoding result for development/testing
 */
export function getMockGeocodingResult(
  address: string,
  city: string = "Charleston",
  state: string = "SC"
): GeocodingResult {
  return {
    formattedAddress: `${address}, ${city}, ${state} 29401`,
    lat: 32.7765 + (Math.random() - 0.5) * 0.1,
    lng: -79.9311 + (Math.random() - 0.5) * 0.1,
    placeId: `mock-place-${Date.now()}`,
    streetNumber: address.split(" ")[0],
    route: address.split(" ").slice(1).join(" "),
    city,
    county: "Charleston County",
    state,
    stateCode: state,
    zip: "29401",
    country: "USA",
    isValid: true,
  };
}

/**
 * Mock drive time result for development/testing
 */
export function getMockDriveTimeResult(
  origin: string,
  destination: string
): DriveTimeResult {
  const distanceMiles = 5 + Math.random() * 20;
  const durationMinutes = Math.round(distanceMiles * 2.5);

  return {
    originAddress: origin,
    destinationAddress: destination,
    distanceMeters: Math.round(distanceMiles * 1609.34),
    distanceMiles: Math.round(distanceMiles * 10) / 10,
    durationSeconds: durationMinutes * 60,
    durationMinutes,
    durationText: `${durationMinutes} mins`,
    distanceText: `${Math.round(distanceMiles * 10) / 10} mi`,
  };
}
