-- =====================================================
-- USAGE TRACKING + FREEMIUM MODEL
-- Enables tracking of user actions for freemium limits
-- =====================================================

-- Usage Tracking Table
CREATE TABLE IF NOT EXISTS public.usage_tracking (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  action_type TEXT NOT NULL,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for fast queries by user and action type
CREATE INDEX IF NOT EXISTS idx_usage_tracking_user_action 
ON public.usage_tracking(user_id, action_type, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_usage_tracking_created_at 
ON public.usage_tracking(created_at DESC);

-- User Formulas Table (for Formula Builder)
CREATE TABLE IF NOT EXISTS public.user_formulas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  formula TEXT NOT NULL,
  variables JSONB DEFAULT '[]',
  is_public BOOLEAN DEFAULT false,
  category TEXT DEFAULT 'custom',
  usage_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_user_formulas_user 
ON public.user_formulas(user_id);

CREATE INDEX IF NOT EXISTS idx_user_formulas_org 
ON public.user_formulas(organization_id);

CREATE INDEX IF NOT EXISTS idx_user_formulas_public 
ON public.user_formulas(is_public) WHERE is_public = true;

-- Add subscription_tier to user_profiles if not exists
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'user_profiles' 
    AND column_name = 'subscription_tier'
  ) THEN
    ALTER TABLE public.user_profiles 
    ADD COLUMN subscription_tier TEXT DEFAULT 'free';
  END IF;
END $$;

-- Add subscription_tier to organizations if not exists
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'organizations' 
    AND column_name = 'subscription_tier'
  ) THEN
    ALTER TABLE public.organizations 
    ADD COLUMN subscription_tier TEXT DEFAULT 'free';
  END IF;
END $$;

-- =====================================================
-- ROW LEVEL SECURITY
-- =====================================================

ALTER TABLE public.usage_tracking ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_formulas ENABLE ROW LEVEL SECURITY;

-- Usage Tracking Policies
DROP POLICY IF EXISTS "Users can view own usage" ON public.usage_tracking;
CREATE POLICY "Users can view own usage" ON public.usage_tracking
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own usage" ON public.usage_tracking;
CREATE POLICY "Users can insert own usage" ON public.usage_tracking
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- User Formulas Policies
DROP POLICY IF EXISTS "Users can view own formulas" ON public.user_formulas;
CREATE POLICY "Users can view own formulas" ON public.user_formulas
  FOR SELECT USING (
    auth.uid() = user_id 
    OR is_public = true
    OR organization_id IN (
      SELECT organization_id FROM public.user_profiles WHERE user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Users can insert own formulas" ON public.user_formulas;
CREATE POLICY "Users can insert own formulas" ON public.user_formulas
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own formulas" ON public.user_formulas;
CREATE POLICY "Users can update own formulas" ON public.user_formulas
  FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own formulas" ON public.user_formulas;
CREATE POLICY "Users can delete own formulas" ON public.user_formulas
  FOR DELETE USING (auth.uid() = user_id);

-- =====================================================
-- HELPER FUNCTIONS
-- =====================================================

-- Function to get user's monthly usage count
CREATE OR REPLACE FUNCTION get_monthly_usage(
  p_user_id UUID,
  p_action_type TEXT
) RETURNS INTEGER AS $$
DECLARE
  v_count INTEGER;
BEGIN
  SELECT COUNT(*)::INTEGER INTO v_count
  FROM public.usage_tracking
  WHERE user_id = p_user_id
    AND action_type = p_action_type
    AND created_at >= date_trunc('month', CURRENT_TIMESTAMP);
  RETURN v_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get user's daily usage count
CREATE OR REPLACE FUNCTION get_daily_usage(
  p_user_id UUID,
  p_action_type TEXT
) RETURNS INTEGER AS $$
DECLARE
  v_count INTEGER;
BEGIN
  SELECT COUNT(*)::INTEGER INTO v_count
  FROM public.usage_tracking
  WHERE user_id = p_user_id
    AND action_type = p_action_type
    AND created_at >= date_trunc('day', CURRENT_TIMESTAMP);
  RETURN v_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check if user can perform action (returns remaining count)
CREATE OR REPLACE FUNCTION check_usage_limit(
  p_user_id UUID,
  p_action_type TEXT,
  p_limit INTEGER,
  p_period TEXT DEFAULT 'month'
) RETURNS INTEGER AS $$
DECLARE
  v_used INTEGER;
BEGIN
  IF p_period = 'day' THEN
    v_used := get_daily_usage(p_user_id, p_action_type);
  ELSE
    v_used := get_monthly_usage(p_user_id, p_action_type);
  END IF;
  
  RETURN GREATEST(0, p_limit - v_used);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- CLEANUP OLD USAGE DATA (keep 90 days)
-- Run this via cron job or scheduled function
-- =====================================================

CREATE OR REPLACE FUNCTION cleanup_old_usage_data() RETURNS void AS $$
BEGIN
  DELETE FROM public.usage_tracking
  WHERE created_at < CURRENT_TIMESTAMP - INTERVAL '90 days';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION get_monthly_usage TO authenticated;
GRANT EXECUTE ON FUNCTION get_daily_usage TO authenticated;
GRANT EXECUTE ON FUNCTION check_usage_limit TO authenticated;
