-- Share Token & Scout Features Migration
-- Run this in Supabase SQL Editor

-- =====================================================
-- 1. ADD SHARE TOKEN TO DEALS TABLE
-- =====================================================

-- Add share_token column for public deal rooms
ALTER TABLE deals ADD COLUMN IF NOT EXISTS share_token UUID DEFAULT gen_random_uuid();

-- Add index for fast token lookups
CREATE INDEX IF NOT EXISTS idx_deals_share_token ON deals(share_token);

-- Add share expiration and settings
ALTER TABLE deals ADD COLUMN IF NOT EXISTS share_enabled BOOLEAN DEFAULT false;
ALTER TABLE deals ADD COLUMN IF NOT EXISTS share_expires_at TIMESTAMPTZ;
ALTER TABLE deals ADD COLUMN IF NOT EXISTS share_view_count INTEGER DEFAULT 0;

-- =====================================================
-- 2. CREATE SCOUT LEADS TABLE
-- =====================================================

-- Scout leads are unauthenticated submissions from bird dogs
CREATE TABLE IF NOT EXISTS scout_leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Property Information
  property_address TEXT NOT NULL,
  city TEXT,
  state TEXT,
  zip_code TEXT,
  
  -- Lead Source
  scout_name TEXT,
  scout_phone TEXT,
  scout_email TEXT,
  referral_code TEXT,
  
  -- Property Details
  property_type TEXT DEFAULT 'single_family',
  condition TEXT DEFAULT 'unknown',
  notes TEXT,
  
  -- Photos (stored as JSON array of Cloudinary URLs)
  photos JSONB DEFAULT '[]',
  
  -- Location
  latitude NUMERIC(10, 7),
  longitude NUMERIC(10, 7),
  
  -- Status
  status TEXT DEFAULT 'new' CHECK (status IN (
    'new', 'reviewing', 'converted', 'rejected', 'duplicate'
  )),
  
  -- Conversion tracking
  converted_deal_id UUID REFERENCES deals(id),
  converted_at TIMESTAMPTZ,
  converted_by UUID,
  
  -- Organization (if referral code links to one)
  organization_id UUID,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for organization lookup
CREATE INDEX IF NOT EXISTS idx_scout_leads_org ON scout_leads(organization_id);
CREATE INDEX IF NOT EXISTS idx_scout_leads_status ON scout_leads(status);
CREATE INDEX IF NOT EXISTS idx_scout_leads_referral ON scout_leads(referral_code);

-- =====================================================
-- 3. CREATE REFERRAL CODES TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS referral_codes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT UNIQUE NOT NULL,
  organization_id UUID NOT NULL,
  user_id UUID, -- Optional: assign to specific user
  description TEXT,
  is_active BOOLEAN DEFAULT true,
  commission_rate NUMERIC(5, 2), -- Optional commission percentage
  leads_count INTEGER DEFAULT 0,
  conversions_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_referral_codes_code ON referral_codes(code);

-- =====================================================
-- 4. ROW LEVEL SECURITY
-- =====================================================

-- Enable RLS on new tables
ALTER TABLE scout_leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE referral_codes ENABLE ROW LEVEL SECURITY;

-- Scout leads: Allow insert from anyone (public), but only org members can read
CREATE POLICY "Anyone can insert scout leads"
ON scout_leads FOR INSERT
TO anon, authenticated
WITH CHECK (true);

CREATE POLICY "Org members can view their scout leads"
ON scout_leads FOR SELECT
TO authenticated
USING (
  organization_id IN (
    SELECT organization_id FROM user_profiles 
    WHERE id = auth.uid()
  )
);

CREATE POLICY "Org members can update their scout leads"
ON scout_leads FOR UPDATE
TO authenticated
USING (
  organization_id IN (
    SELECT organization_id FROM user_profiles 
    WHERE id = auth.uid()
  )
);

-- Referral codes: Only authenticated users can manage
CREATE POLICY "Org members can manage referral codes"
ON referral_codes FOR ALL
TO authenticated
USING (
  organization_id IN (
    SELECT organization_id FROM user_profiles 
    WHERE id = auth.uid()
  )
);

-- =====================================================
-- 5. FUNCTION TO INCREMENT SHARE VIEW COUNT
-- =====================================================

CREATE OR REPLACE FUNCTION increment_share_view(deal_share_token UUID)
RETURNS void AS $$
BEGIN
  UPDATE deals 
  SET share_view_count = share_view_count + 1 
  WHERE share_token = deal_share_token;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Allow anonymous users to call this function
GRANT EXECUTE ON FUNCTION increment_share_view(UUID) TO anon;

-- =====================================================
-- 6. FUNCTION TO LOOK UP DEAL BY SHARE TOKEN
-- =====================================================

CREATE OR REPLACE FUNCTION get_shared_deal(token UUID)
RETURNS TABLE (
  id UUID,
  property_address TEXT,
  city TEXT,
  state TEXT,
  zip_code TEXT,
  property_type TEXT,
  asking_price NUMERIC,
  arv NUMERIC,
  repair_cost NUMERIC,
  mao NUMERIC,
  wholesale_fee NUMERIC,
  ai_score INTEGER,
  ai_analysis JSONB,
  status TEXT,
  priority TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ,
  share_enabled BOOLEAN,
  share_expires_at TIMESTAMPTZ
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    d.id,
    d.property_address,
    d.city,
    d.state,
    d.zip_code,
    d.property_type,
    d.asking_price,
    d.arv,
    d.repair_cost,
    d.mao,
    d.wholesale_fee,
    d.ai_score,
    d.ai_analysis,
    d.status,
    d.priority,
    d.notes,
    d.created_at,
    d.share_enabled,
    d.share_expires_at
  FROM deals d
  WHERE d.share_token = token
    AND d.share_enabled = true
    AND (d.share_expires_at IS NULL OR d.share_expires_at > NOW());
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Allow anonymous users to call this function
GRANT EXECUTE ON FUNCTION get_shared_deal(UUID) TO anon;
