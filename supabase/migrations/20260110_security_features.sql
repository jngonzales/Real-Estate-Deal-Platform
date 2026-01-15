-- Security Features Migration
-- Implements Phase 4 & 5 from security.md

-- ============================================
-- System Flags Table (Kill Switch)
-- ============================================
CREATE TABLE IF NOT EXISTS system_flags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key TEXT UNIQUE NOT NULL,
  value JSONB NOT NULL DEFAULT 'false'::jsonb,
  description TEXT,
  updated_at TIMESTAMPTZ DEFAULT now(),
  updated_by UUID REFERENCES auth.users(id)
);

-- Insert default flags
INSERT INTO system_flags (key, value, description) VALUES
  ('maintenance_mode', 'false', 'When true, all API routes return 503'),
  ('disable_signups', 'false', 'When true, new user registration is disabled'),
  ('disable_ai_features', 'false', 'When true, AI scoring and analysis is disabled'),
  ('rate_limit_multiplier', '1', 'Multiplier for rate limits (0.5 = stricter, 2 = more lenient)'),
  ('allowed_ips', '[]', 'JSON array of IPs that bypass rate limiting')
ON CONFLICT (key) DO NOTHING;

-- Allow authenticated users to read flags
ALTER TABLE system_flags ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read system flags"
  ON system_flags
  FOR SELECT
  USING (true);

-- Only service role can update flags
CREATE POLICY "Service role can update flags"
  ON system_flags
  FOR UPDATE
  USING (auth.role() = 'service_role');

-- ============================================
-- Property Cache Table (API Response Caching)
-- ============================================
CREATE TABLE IF NOT EXISTS property_cache (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  address_hash TEXT UNIQUE NOT NULL, -- MD5 hash of normalized address
  address TEXT NOT NULL,
  city TEXT,
  state TEXT,
  zip_code TEXT,
  
  -- Geoapify data
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  formatted_address TEXT,
  geocode_data JSONB,
  
  -- Property data from external APIs
  property_data JSONB,
  valuation_data JSONB,
  
  -- AI Analysis cache
  ai_analysis JSONB,
  ai_analysis_at TIMESTAMPTZ,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  expires_at TIMESTAMPTZ DEFAULT (now() + INTERVAL '30 days')
);

-- Index for fast lookups
CREATE INDEX IF NOT EXISTS idx_property_cache_hash ON property_cache(address_hash);
-- Note: Removed gin_trgm_ops index as it requires pg_trgm extension
CREATE INDEX IF NOT EXISTS idx_property_cache_expires ON property_cache(expires_at);

-- RLS - anyone can read cache, service role can write
ALTER TABLE property_cache ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read property cache"
  ON property_cache
  FOR SELECT
  USING (expires_at > now());

CREATE POLICY "Service role can manage cache"
  ON property_cache
  FOR ALL
  USING (auth.role() = 'service_role');

-- ============================================
-- API Usage Tracking (Rate Limit Analytics)
-- ============================================
CREATE TABLE IF NOT EXISTS api_usage_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  endpoint TEXT NOT NULL,
  method TEXT NOT NULL,
  ip_hash TEXT NOT NULL, -- Hashed IP for privacy
  user_id UUID REFERENCES auth.users(id),
  organization_id UUID,
  
  -- Request details
  status_code INTEGER,
  response_time_ms INTEGER,
  rate_limited BOOLEAN DEFAULT false,
  
  -- Cost tracking
  tokens_used INTEGER DEFAULT 0, -- AI tokens
  api_credits_used DECIMAL(10, 4) DEFAULT 0, -- External API costs
  
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Partition by date for performance (optional)
CREATE INDEX IF NOT EXISTS idx_api_usage_endpoint ON api_usage_log(endpoint, created_at);
CREATE INDEX IF NOT EXISTS idx_api_usage_user ON api_usage_log(user_id, created_at);
CREATE INDEX IF NOT EXISTS idx_api_usage_org ON api_usage_log(organization_id, created_at);
CREATE INDEX IF NOT EXISTS idx_api_usage_rate_limited ON api_usage_log(rate_limited, created_at) WHERE rate_limited = true;

-- RLS
ALTER TABLE api_usage_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own usage"
  ON api_usage_log
  FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Service role can manage usage logs"
  ON api_usage_log
  FOR ALL
  USING (auth.role() = 'service_role');

-- ============================================
-- Security Events Log
-- ============================================
CREATE TABLE IF NOT EXISTS security_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type TEXT NOT NULL, -- 'rate_limit', 'honeypot', 'invalid_token', 'suspicious_activity'
  severity TEXT NOT NULL DEFAULT 'medium', -- 'low', 'medium', 'high', 'critical'
  ip_hash TEXT,
  user_id UUID REFERENCES auth.users(id),
  details JSONB,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_security_events_type ON security_events(event_type, created_at);
CREATE INDEX IF NOT EXISTS idx_security_events_severity ON security_events(severity, created_at);

-- RLS - only service role can access
ALTER TABLE security_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role only"
  ON security_events
  FOR ALL
  USING (auth.role() = 'service_role');

-- ============================================
-- Helper Functions
-- ============================================

-- Function to get system flag value
CREATE OR REPLACE FUNCTION get_system_flag(flag_key TEXT)
RETURNS JSONB
LANGUAGE sql
STABLE
AS $$
  SELECT value FROM system_flags WHERE key = flag_key;
$$;

-- Function to check if address is cached
CREATE OR REPLACE FUNCTION get_cached_property(addr_hash TEXT)
RETURNS property_cache
LANGUAGE sql
STABLE
AS $$
  SELECT * FROM property_cache 
  WHERE address_hash = addr_hash 
    AND expires_at > now()
  LIMIT 1;
$$;

-- Function to create address hash (for consistent caching)
CREATE OR REPLACE FUNCTION create_address_hash(
  addr TEXT,
  city_name TEXT DEFAULT NULL,
  state_code TEXT DEFAULT NULL
)
RETURNS TEXT
LANGUAGE sql
IMMUTABLE
AS $$
  SELECT md5(
    lower(
      regexp_replace(
        concat_ws('|', 
          trim(coalesce(addr, '')), 
          trim(coalesce(city_name, '')), 
          trim(coalesce(state_code, ''))
        ),
        '\s+', ' ', 'g'
      )
    )
  );
$$;

-- ============================================
-- Cleanup Job (run daily via cron)
-- ============================================
-- This should be called by a scheduled job to clean up old data

-- Clean up expired cache entries
-- DELETE FROM property_cache WHERE expires_at < now();

-- Clean up old API usage logs (keep 90 days)
-- DELETE FROM api_usage_log WHERE created_at < now() - INTERVAL '90 days';

-- Clean up old security events (keep 1 year)
-- DELETE FROM security_events WHERE created_at < now() - INTERVAL '1 year';
