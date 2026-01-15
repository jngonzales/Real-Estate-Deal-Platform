-- ============================================================================
-- USER COMPS SYSTEM
-- Allows users to submit their own comparable sales for ARV calculations
-- ============================================================================

-- 1. Create comps table
CREATE TABLE IF NOT EXISTS public.comps (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
    submitted_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    
    -- Property Location
    address TEXT NOT NULL,
    city TEXT NOT NULL,
    state TEXT NOT NULL,
    zip TEXT NOT NULL,
    county TEXT,
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    
    -- Property Details
    property_type TEXT NOT NULL DEFAULT 'single_family',
    bedrooms INTEGER,
    bathrooms DECIMAL(3, 1),
    sqft INTEGER,
    lot_size INTEGER,
    year_built INTEGER,
    stories INTEGER DEFAULT 1,
    garage_spaces INTEGER DEFAULT 0,
    pool BOOLEAN DEFAULT FALSE,
    
    -- Sale Information
    sale_price INTEGER NOT NULL,
    sale_date DATE NOT NULL,
    price_per_sqft DECIMAL(10, 2) GENERATED ALWAYS AS (
        CASE WHEN sqft > 0 THEN sale_price::DECIMAL / sqft ELSE NULL END
    ) STORED,
    
    -- Condition & Updates
    condition TEXT CHECK (condition IN ('excellent', 'good', 'fair', 'poor', 'distressed')),
    was_renovated BOOLEAN DEFAULT FALSE,
    renovation_cost INTEGER,
    
    -- Source & Verification
    source TEXT DEFAULT 'user_submitted', -- 'user_submitted', 'mls', 'public_records', 'scraped'
    mls_number TEXT,
    verified BOOLEAN DEFAULT FALSE,
    verified_by UUID REFERENCES auth.users(id),
    verified_at TIMESTAMPTZ,
    
    -- Photos (array of URLs)
    photos JSONB DEFAULT '[]'::JSONB,
    
    -- Notes
    notes TEXT,
    
    -- Visibility
    is_public BOOLEAN DEFAULT FALSE, -- Share with all platform users
    
    -- Metadata
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Create indexes for fast searching
CREATE INDEX IF NOT EXISTS idx_comps_organization ON public.comps(organization_id);
CREATE INDEX IF NOT EXISTS idx_comps_location ON public.comps(city, state, zip);
CREATE INDEX IF NOT EXISTS idx_comps_sale_date ON public.comps(sale_date DESC);
CREATE INDEX IF NOT EXISTS idx_comps_price ON public.comps(sale_price);
CREATE INDEX IF NOT EXISTS idx_comps_property_type ON public.comps(property_type);
CREATE INDEX IF NOT EXISTS idx_comps_sqft ON public.comps(sqft);
CREATE INDEX IF NOT EXISTS idx_comps_bedrooms ON public.comps(bedrooms);
CREATE INDEX IF NOT EXISTS idx_comps_geo ON public.comps(latitude, longitude);
CREATE INDEX IF NOT EXISTS idx_comps_is_public ON public.comps(is_public) WHERE is_public = TRUE;

-- 3. Full-text search index for address
CREATE INDEX IF NOT EXISTS idx_comps_address_search ON public.comps USING GIN (to_tsvector('english', address || ' ' || city || ' ' || state));

-- 4. Enable RLS
ALTER TABLE public.comps ENABLE ROW LEVEL SECURITY;

-- 5. RLS Policies
-- Users can view their own org's comps
CREATE POLICY "Users can view org comps" ON public.comps
    FOR SELECT USING (
        organization_id = public.get_user_organization_id()
        OR is_public = TRUE
    );

-- Users can insert comps for their org
CREATE POLICY "Users can insert comps" ON public.comps
    FOR INSERT WITH CHECK (
        organization_id = public.get_user_organization_id()
    );

-- Users can update their own submitted comps
CREATE POLICY "Users can update own comps" ON public.comps
    FOR UPDATE USING (
        submitted_by = auth.uid()
        OR EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = auth.uid() 
            AND role IN ('admin', 'manager')
        )
    );

-- Admins can delete comps
CREATE POLICY "Admins can delete comps" ON public.comps
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = auth.uid() 
            AND role = 'admin'
        )
    );

-- 6. Create comp_photos table for better photo management
CREATE TABLE IF NOT EXISTS public.comp_photos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    comp_id UUID REFERENCES public.comps(id) ON DELETE CASCADE,
    url TEXT NOT NULL,
    caption TEXT,
    photo_type TEXT DEFAULT 'exterior', -- 'exterior', 'interior', 'kitchen', 'bathroom', 'before', 'after'
    is_primary BOOLEAN DEFAULT FALSE,
    uploaded_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_comp_photos_comp ON public.comp_photos(comp_id);
ALTER TABLE public.comp_photos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view comp photos" ON public.comp_photos
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.comps 
            WHERE id = comp_id 
            AND (organization_id = public.get_user_organization_id() OR is_public = TRUE)
        )
    );

CREATE POLICY "Users can insert comp photos" ON public.comp_photos
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.comps 
            WHERE id = comp_id 
            AND organization_id = public.get_user_organization_id()
        )
    );

-- 7. Create comp_verifications table for community verification
CREATE TABLE IF NOT EXISTS public.comp_verifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    comp_id UUID REFERENCES public.comps(id) ON DELETE CASCADE,
    verified_by UUID REFERENCES auth.users(id),
    verification_type TEXT CHECK (verification_type IN ('confirmed', 'disputed', 'flagged')),
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(comp_id, verified_by)
);

CREATE INDEX IF NOT EXISTS idx_comp_verifications_comp ON public.comp_verifications(comp_id);
ALTER TABLE public.comp_verifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view verifications" ON public.comp_verifications
    FOR SELECT USING (TRUE);

CREATE POLICY "Users can add verifications" ON public.comp_verifications
    FOR INSERT WITH CHECK (verified_by = auth.uid());

-- 8. Create function to find nearby comps
CREATE OR REPLACE FUNCTION public.find_nearby_comps(
    p_latitude DECIMAL,
    p_longitude DECIMAL,
    p_radius_miles DECIMAL DEFAULT 1,
    p_bedrooms INTEGER DEFAULT NULL,
    p_property_type TEXT DEFAULT NULL,
    p_min_sqft INTEGER DEFAULT NULL,
    p_max_sqft INTEGER DEFAULT NULL,
    p_limit INTEGER DEFAULT 10
)
RETURNS TABLE (
    id UUID,
    address TEXT,
    city TEXT,
    state TEXT,
    zip TEXT,
    sale_price INTEGER,
    sale_date DATE,
    price_per_sqft DECIMAL,
    bedrooms INTEGER,
    bathrooms DECIMAL,
    sqft INTEGER,
    year_built INTEGER,
    condition TEXT,
    distance_miles DECIMAL,
    photos JSONB
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        c.id,
        c.address,
        c.city,
        c.state,
        c.zip,
        c.sale_price,
        c.sale_date,
        c.price_per_sqft,
        c.bedrooms,
        c.bathrooms,
        c.sqft,
        c.year_built,
        c.condition,
        (3959 * acos(
            cos(radians(p_latitude)) * 
            cos(radians(c.latitude)) * 
            cos(radians(c.longitude) - radians(p_longitude)) + 
            sin(radians(p_latitude)) * 
            sin(radians(c.latitude))
        ))::DECIMAL AS distance_miles,
        c.photos
    FROM public.comps c
    WHERE 
        c.latitude IS NOT NULL 
        AND c.longitude IS NOT NULL
        AND (c.organization_id = public.get_user_organization_id() OR c.is_public = TRUE)
        AND (p_bedrooms IS NULL OR c.bedrooms = p_bedrooms)
        AND (p_property_type IS NULL OR c.property_type = p_property_type)
        AND (p_min_sqft IS NULL OR c.sqft >= p_min_sqft)
        AND (p_max_sqft IS NULL OR c.sqft <= p_max_sqft)
        AND (3959 * acos(
            cos(radians(p_latitude)) * 
            cos(radians(c.latitude)) * 
            cos(radians(c.longitude) - radians(p_longitude)) + 
            sin(radians(p_latitude)) * 
            sin(radians(c.latitude))
        )) <= p_radius_miles
    ORDER BY distance_miles
    LIMIT p_limit;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 9. Create function to calculate ARV from comps
CREATE OR REPLACE FUNCTION public.calculate_arv_from_comps(
    p_sqft INTEGER,
    p_bedrooms INTEGER,
    p_latitude DECIMAL,
    p_longitude DECIMAL,
    p_radius_miles DECIMAL DEFAULT 0.5
)
RETURNS TABLE (
    estimated_arv INTEGER,
    avg_price_per_sqft DECIMAL,
    comp_count INTEGER,
    confidence TEXT
) AS $$
DECLARE
    v_avg_ppsf DECIMAL;
    v_count INTEGER;
BEGIN
    SELECT 
        AVG(c.price_per_sqft),
        COUNT(*)
    INTO v_avg_ppsf, v_count
    FROM public.comps c
    WHERE 
        c.latitude IS NOT NULL 
        AND c.longitude IS NOT NULL
        AND (c.organization_id = public.get_user_organization_id() OR c.is_public = TRUE)
        AND c.sale_date >= CURRENT_DATE - INTERVAL '12 months'
        AND ABS(c.bedrooms - p_bedrooms) <= 1
        AND (3959 * acos(
            cos(radians(p_latitude)) * 
            cos(radians(c.latitude)) * 
            cos(radians(c.longitude) - radians(p_longitude)) + 
            sin(radians(p_latitude)) * 
            sin(radians(c.latitude))
        )) <= p_radius_miles;
    
    RETURN QUERY SELECT 
        (p_sqft * COALESCE(v_avg_ppsf, 0))::INTEGER,
        COALESCE(v_avg_ppsf, 0),
        COALESCE(v_count, 0),
        CASE 
            WHEN v_count >= 5 THEN 'high'
            WHEN v_count >= 3 THEN 'medium'
            WHEN v_count >= 1 THEN 'low'
            ELSE 'no_data'
        END;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 10. Updated_at trigger
CREATE OR REPLACE FUNCTION public.update_comps_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_comps_updated_at ON public.comps;
CREATE TRIGGER trigger_comps_updated_at
    BEFORE UPDATE ON public.comps
    FOR EACH ROW
    EXECUTE FUNCTION public.update_comps_updated_at();

-- Done!
-- Run this migration in Supabase SQL Editor
