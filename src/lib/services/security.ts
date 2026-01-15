import crypto from 'crypto';

type SecurityEventType = 
  | 'rate_limit' 
  | 'honeypot' 
  | 'invalid_token' 
  | 'suspicious_activity'
  | 'failed_login'
  | 'brute_force'
  | 'api_abuse';

type Severity = 'low' | 'medium' | 'high' | 'critical';

interface SecurityEventDetails {
  endpoint?: string;
  method?: string;
  userAgent?: string;
  referer?: string;
  reason?: string;
  attempts?: number;
  [key: string]: unknown;
}

/**
 * Security Logger Service
 * Logs security events for monitoring and alerting
 */
export class SecurityLogger {
  /**
   * Hash an IP address for privacy while still allowing pattern detection
   */
  static hashIP(ip: string): string {
    return crypto.createHash('sha256').update(ip + process.env.HASH_SALT || 'dealflow-security').digest('hex').slice(0, 16);
  }

  /**
   * Log a security event
   * In production, this would write to the security_events table
   */
  static async log(
    eventType: SecurityEventType,
    severity: Severity,
    ip: string,
    userId?: string,
    details?: SecurityEventDetails
  ): Promise<void> {
    const hashedIP = this.hashIP(ip);

    // Log to console in development
    const logMessage = {
      timestamp: new Date().toISOString(),
      type: eventType,
      severity,
      ip_hash: hashedIP,
      user_id: userId,
      details,
    };

    if (severity === 'critical' || severity === 'high') {
      console.error('[SECURITY]', JSON.stringify(logMessage));
    } else {
      console.warn('[SECURITY]', JSON.stringify(logMessage));
    }

    // In production, also save to database
    if (process.env.NODE_ENV === 'production') {
      try {
        // Dynamic import to avoid circular dependencies
        const { createClient } = await import('@supabase/supabase-js');
        
        const supabase = createClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL!,
          process.env.SUPABASE_SERVICE_ROLE_KEY!,
          {
            auth: {
              autoRefreshToken: false,
              persistSession: false,
            },
          }
        );

        await supabase.from('security_events').insert({
          event_type: eventType,
          severity,
          ip_hash: hashedIP,
          user_id: userId,
          details,
        });
      } catch (error) {
        console.error('[SECURITY] Failed to log to database:', error);
      }
    }
  }

  /**
   * Log a rate limit event
   */
  static async logRateLimit(
    ip: string,
    endpoint: string,
    userId?: string
  ): Promise<void> {
    await this.log('rate_limit', 'medium', ip, userId, {
      endpoint,
      reason: 'Rate limit exceeded',
    });
  }

  /**
   * Log a honeypot trigger
   */
  static async logHoneypot(
    ip: string,
    endpoint: string,
    userAgent?: string
  ): Promise<void> {
    await this.log('honeypot', 'high', ip, undefined, {
      endpoint,
      userAgent,
      reason: 'Bot detected via honeypot field',
    });
  }

  /**
   * Log a failed login attempt
   */
  static async logFailedLogin(
    ip: string,
    email?: string,
    attempts?: number
  ): Promise<void> {
    const severity: Severity = (attempts && attempts > 5) ? 'high' : 'medium';
    
    await this.log('failed_login', severity, ip, undefined, {
      email_hash: email ? crypto.createHash('sha256').update(email).digest('hex').slice(0, 8) : undefined,
      attempts,
      reason: 'Failed login attempt',
    });
  }

  /**
   * Log API abuse
   */
  static async logAPIAbuse(
    ip: string,
    endpoint: string,
    reason: string,
    userId?: string
  ): Promise<void> {
    await this.log('api_abuse', 'high', ip, userId, {
      endpoint,
      reason,
    });
  }
}

/**
 * System Flags Service
 * Manages kill switches and feature flags
 */
export class SystemFlags {
  private static cache: Map<string, { value: unknown; expiresAt: number }> = new Map();
  private static CACHE_TTL_MS = 60000; // 1 minute cache

  /**
   * Get a system flag value
   */
  static async get<T = boolean>(key: string, defaultValue: T): Promise<T> {
    // Check cache first
    const cached = this.cache.get(key);
    if (cached && cached.expiresAt > Date.now()) {
      return cached.value as T;
    }

    try {
      // Dynamic import
      const { createClient } = await import('@supabase/supabase-js');
      
      const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!,
        {
          auth: {
            autoRefreshToken: false,
            persistSession: false,
          },
        }
      );

      const { data, error } = await supabase
        .from('system_flags')
        .select('value')
        .eq('key', key)
        .single();

      if (error || !data) {
        return defaultValue;
      }

      const value = data.value as T;
      
      // Update cache
      this.cache.set(key, {
        value,
        expiresAt: Date.now() + this.CACHE_TTL_MS,
      });

      return value;
    } catch (error) {
      console.error('[SystemFlags] Get error:', error);
      return defaultValue;
    }
  }

  /**
   * Check if maintenance mode is enabled
   */
  static async isMaintenanceMode(): Promise<boolean> {
    // Also check env var for quick toggle
    if (process.env.MAINTENANCE_MODE === 'true') {
      return true;
    }
    return this.get<boolean>('maintenance_mode', false);
  }

  /**
   * Check if signups are disabled
   */
  static async areSignupsDisabled(): Promise<boolean> {
    return this.get<boolean>('disable_signups', false);
  }

  /**
   * Check if AI features are disabled
   */
  static async areAIFeaturesDisabled(): Promise<boolean> {
    return this.get<boolean>('disable_ai_features', false);
  }

  /**
   * Get rate limit multiplier
   */
  static async getRateLimitMultiplier(): Promise<number> {
    return this.get<number>('rate_limit_multiplier', 1);
  }

  /**
   * Check if an IP is allowed (bypasses rate limiting)
   */
  static async isIPAllowed(ip: string): Promise<boolean> {
    const allowedIPs = await this.get<string[]>('allowed_ips', []);
    return allowedIPs.includes(ip);
  }
}
