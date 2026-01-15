import { createClient } from '@/utils/supabase/server';
import crypto from 'crypto';

interface PropertyCacheData {
  latitude?: number;
  longitude?: number;
  formatted_address?: string;
  geocode_data?: Record<string, unknown>;
  property_data?: Record<string, unknown>;
  valuation_data?: Record<string, unknown>;
  ai_analysis?: Record<string, unknown>;
}

/**
 * Property Cache Service
 * Saves money by caching external API responses (Geoapify, Gemini, etc.)
 */
export class PropertyCache {
  /**
   * Create a normalized hash of an address for cache lookups
   */
  static createAddressHash(address: string, city?: string, state?: string): string {
    const normalized = [address, city, state]
      .filter(Boolean)
      .join('|')
      .toLowerCase()
      .replace(/\s+/g, ' ')
      .trim();
    
    return crypto.createHash('md5').update(normalized).digest('hex');
  }

  /**
   * Get cached property data
   * Returns null if not cached or expired
   */
  static async get(
    address: string,
    city?: string,
    state?: string
  ): Promise<PropertyCacheData | null> {
    try {
      const supabase = await createClient();
      const hash = this.createAddressHash(address, city, state);

      const { data, error } = await supabase
        .from('property_cache')
        .select('*')
        .eq('address_hash', hash)
        .gt('expires_at', new Date().toISOString())
        .single();

      if (error || !data) {
        return null;
      }

      console.log(`[PropertyCache] Cache HIT for: ${address}`);
      return {
        latitude: data.latitude,
        longitude: data.longitude,
        formatted_address: data.formatted_address,
        geocode_data: data.geocode_data,
        property_data: data.property_data,
        valuation_data: data.valuation_data,
        ai_analysis: data.ai_analysis,
      };
    } catch (error) {
      console.error('[PropertyCache] Get error:', error);
      return null;
    }
  }

  /**
   * Save property data to cache
   */
  static async set(
    address: string,
    city?: string,
    state?: string,
    zipCode?: string,
    data: PropertyCacheData = {},
    ttlDays = 30
  ): Promise<boolean> {
    try {
      const supabase = await createClient();
      const hash = this.createAddressHash(address, city, state);

      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + ttlDays);

      const { error } = await supabase
        .from('property_cache')
        .upsert(
          {
            address_hash: hash,
            address,
            city,
            state,
            zip_code: zipCode,
            ...data,
            expires_at: expiresAt.toISOString(),
            updated_at: new Date().toISOString(),
          },
          {
            onConflict: 'address_hash',
          }
        );

      if (error) {
        console.error('[PropertyCache] Set error:', error);
        return false;
      }

      console.log(`[PropertyCache] Cached: ${address}`);
      return true;
    } catch (error) {
      console.error('[PropertyCache] Set error:', error);
      return false;
    }
  }

  /**
   * Update specific fields in the cache
   */
  static async update(
    address: string,
    city?: string,
    state?: string,
    data: Partial<PropertyCacheData> = {}
  ): Promise<boolean> {
    try {
      const supabase = await createClient();
      const hash = this.createAddressHash(address, city, state);

      const { error } = await supabase
        .from('property_cache')
        .update({
          ...data,
          updated_at: new Date().toISOString(),
        })
        .eq('address_hash', hash);

      if (error) {
        console.error('[PropertyCache] Update error:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('[PropertyCache] Update error:', error);
      return false;
    }
  }

  /**
   * Invalidate cache for an address
   */
  static async invalidate(
    address: string,
    city?: string,
    state?: string
  ): Promise<boolean> {
    try {
      const supabase = await createClient();
      const hash = this.createAddressHash(address, city, state);

      const { error } = await supabase
        .from('property_cache')
        .delete()
        .eq('address_hash', hash);

      if (error) {
        console.error('[PropertyCache] Invalidate error:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('[PropertyCache] Invalidate error:', error);
      return false;
    }
  }
}

/**
 * Wrapper for expensive API calls with caching
 */
export async function withPropertyCache<T>(
  address: string,
  city: string | undefined,
  state: string | undefined,
  cacheKey: keyof PropertyCacheData,
  fetchFn: () => Promise<T>
): Promise<T> {
  // Check cache first
  const cached = await PropertyCache.get(address, city, state);
  if (cached && cached[cacheKey]) {
    console.log(`[PropertyCache] Serving ${cacheKey} from cache`);
    return cached[cacheKey] as T;
  }

  // Fetch from API
  const result = await fetchFn();

  // Save to cache
  await PropertyCache.update(address, city, state, {
    [cacheKey]: result,
  });

  return result;
}
