// Geoapify - Free geocoding and maps service
// FREE: 3,000 credits/day = ~10,000 geocodes
// Get API key at: https://www.geoapify.com/

export interface GeocodeResult {
  lat: number;
  lng: number;
  formatted: string;
  address_line1: string;
  address_line2: string;
  city: string;
  state: string;
  state_code: string;
  county: string;
  postcode: string;
  country: string;
  country_code: string;
  result_type: string;
  confidence: number;
}

export interface PropertyDetails {
  address: string;
  city: string;
  state: string;
  zipcode: string;
  county: string;
  coordinates: {
    lat: number;
    lng: number;
  };
}

const GEOAPIFY_API_KEY = process.env.NEXT_PUBLIC_GEOAPIFY_API_KEY || process.env.GEOAPIFY_API_KEY;

/**
 * Geocode an address using Geoapify (FREE alternative to Google Maps)
 */
export async function geocodeAddress(address: string): Promise<GeocodeResult | null> {
  if (!GEOAPIFY_API_KEY) {
    console.warn("Geoapify API key not configured, using fallback");
    return geocodeWithNominatim(address);
  }

  try {
    const encodedAddress = encodeURIComponent(address);
    const response = await fetch(
      `https://api.geoapify.com/v1/geocode/search?text=${encodedAddress}&apiKey=${GEOAPIFY_API_KEY}`
    );

    if (!response.ok) {
      throw new Error(`Geoapify error: ${response.statusText}`);
    }

    const data = await response.json();
    
    if (data.features && data.features.length > 0) {
      const feature = data.features[0];
      const props = feature.properties;
      
      return {
        lat: props.lat,
        lng: props.lon,
        formatted: props.formatted,
        address_line1: props.address_line1 || "",
        address_line2: props.address_line2 || "",
        city: props.city || props.town || props.village || "",
        state: props.state || "",
        state_code: props.state_code || "",
        county: props.county || "",
        postcode: props.postcode || "",
        country: props.country || "",
        country_code: props.country_code || "",
        result_type: props.result_type || "",
        confidence: props.rank?.confidence || 0,
      };
    }

    return null;
  } catch (error) {
    console.error("Geoapify geocoding error:", error);
    // Fallback to free Nominatim
    return geocodeWithNominatim(address);
  }
}

/**
 * Fallback: Use OpenStreetMap Nominatim (completely free, no API key)
 */
async function geocodeWithNominatim(address: string): Promise<GeocodeResult | null> {
  try {
    const encodedAddress = encodeURIComponent(address);
    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?q=${encodedAddress}&format=json&addressdetails=1&limit=1`,
      {
        headers: {
          "User-Agent": "DealFlow Real Estate Platform",
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Nominatim error: ${response.statusText}`);
    }

    const data = await response.json();

    if (data.length > 0) {
      const result = data[0];
      const addr = result.address || {};

      return {
        lat: parseFloat(result.lat),
        lng: parseFloat(result.lon),
        formatted: result.display_name,
        address_line1: `${addr.house_number || ""} ${addr.road || ""}`.trim(),
        address_line2: "",
        city: addr.city || addr.town || addr.village || addr.municipality || "",
        state: addr.state || "",
        state_code: "",
        county: addr.county || "",
        postcode: addr.postcode || "",
        country: addr.country || "",
        country_code: addr.country_code || "",
        result_type: result.type || "",
        confidence: parseFloat(result.importance) || 0,
      };
    }

    return null;
  } catch (error) {
    console.error("Nominatim geocoding error:", error);
    return null;
  }
}

/**
 * Get address suggestions for autocomplete (FREE)
 */
export async function getAddressSuggestions(query: string): Promise<GeocodeResult[]> {
  if (!query || query.length < 3) return [];

  if (!GEOAPIFY_API_KEY) {
    // No API key - use basic geocoding
    const result = await geocodeWithNominatim(query);
    return result ? [result] : [];
  }

  try {
    const encodedQuery = encodeURIComponent(query);
    const response = await fetch(
      `https://api.geoapify.com/v1/geocode/autocomplete?text=${encodedQuery}&filter=countrycode:us&limit=5&apiKey=${GEOAPIFY_API_KEY}`
    );

    if (!response.ok) {
      throw new Error(`Geoapify error: ${response.statusText}`);
    }

    const data = await response.json();

    return (data.features || []).map((feature: { properties: Record<string, unknown> }) => {
      const props = feature.properties;
      return {
        lat: props.lat as number,
        lng: props.lon as number,
        formatted: props.formatted as string,
        address_line1: (props.address_line1 as string) || "",
        address_line2: (props.address_line2 as string) || "",
        city: (props.city as string) || (props.town as string) || (props.village as string) || "",
        state: (props.state as string) || "",
        state_code: (props.state_code as string) || "",
        county: (props.county as string) || "",
        postcode: (props.postcode as string) || "",
        country: (props.country as string) || "",
        country_code: (props.country_code as string) || "",
        result_type: (props.result_type as string) || "",
        confidence: ((props.rank as Record<string, unknown>)?.confidence as number) || 0,
      };
    });
  } catch (error) {
    console.error("Geoapify autocomplete error:", error);
    return [];
  }
}

/**
 * Reverse geocode coordinates to address (FREE)
 */
export async function reverseGeocode(lat: number, lng: number): Promise<GeocodeResult | null> {
  if (!GEOAPIFY_API_KEY) {
    // Fallback to Nominatim
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json&addressdetails=1`,
        {
          headers: {
            "User-Agent": "DealFlow Real Estate Platform",
          },
        }
      );

      if (!response.ok) return null;

      const data = await response.json();
      const addr = data.address || {};

      return {
        lat,
        lng,
        formatted: data.display_name,
        address_line1: `${addr.house_number || ""} ${addr.road || ""}`.trim(),
        address_line2: "",
        city: addr.city || addr.town || addr.village || "",
        state: addr.state || "",
        state_code: "",
        county: addr.county || "",
        postcode: addr.postcode || "",
        country: addr.country || "",
        country_code: addr.country_code || "",
        result_type: data.type || "",
        confidence: 0,
      };
    } catch {
      return null;
    }
  }

  try {
    const response = await fetch(
      `https://api.geoapify.com/v1/geocode/reverse?lat=${lat}&lon=${lng}&apiKey=${GEOAPIFY_API_KEY}`
    );

    if (!response.ok) return null;

    const data = await response.json();

    if (data.features && data.features.length > 0) {
      const props = data.features[0].properties;
      return {
        lat: props.lat,
        lng: props.lon,
        formatted: props.formatted,
        address_line1: props.address_line1 || "",
        address_line2: props.address_line2 || "",
        city: props.city || props.town || props.village || "",
        state: props.state || "",
        state_code: props.state_code || "",
        county: props.county || "",
        postcode: props.postcode || "",
        country: props.country || "",
        country_code: props.country_code || "",
        result_type: props.result_type || "",
        confidence: props.rank?.confidence || 0,
      };
    }

    return null;
  } catch {
    return null;
  }
}

/**
 * Calculate distance between two coordinates (Haversine formula - FREE, no API)
 */
export function calculateDistance(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number {
  const R = 3959; // Earth's radius in miles
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) * Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function toRad(deg: number): number {
  return deg * (Math.PI / 180);
}

/**
 * Get static map image URL (FREE with Geoapify)
 */
export function getStaticMapUrl(
  lat: number,
  lng: number,
  zoom: number = 15,
  width: number = 600,
  height: number = 400
): string {
  if (!GEOAPIFY_API_KEY) {
    // Fallback to OpenStreetMap tiles
    return `https://www.openstreetmap.org/export/embed.html?bbox=${lng - 0.01},${lat - 0.01},${lng + 0.01},${lat + 0.01}&marker=${lat},${lng}`;
  }

  return `https://maps.geoapify.com/v1/staticmap?style=osm-bright&width=${width}&height=${height}&center=lonlat:${lng},${lat}&zoom=${zoom}&marker=lonlat:${lng},${lat};color:%23ff0000;size:medium&apiKey=${GEOAPIFY_API_KEY}`;
}
