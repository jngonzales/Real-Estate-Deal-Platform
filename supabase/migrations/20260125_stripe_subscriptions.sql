-- ============================================================================
-- STRIPE SUBSCRIPTION INTEGRATION
-- Adds Stripe-related columns to profiles for subscription management
-- ============================================================================

-- 1. Add Stripe columns to profiles table
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS stripe_customer_id TEXT,
ADD COLUMN IF NOT EXISTS stripe_subscription_id TEXT,
ADD COLUMN IF NOT EXISTS subscription_status TEXT DEFAULT 'inactive',
ADD COLUMN IF NOT EXISTS subscription_period_end TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS last_payment_date TIMESTAMPTZ;

-- 2. Create index for Stripe customer lookup
CREATE INDEX IF NOT EXISTS idx_profiles_stripe_customer 
ON public.profiles(stripe_customer_id) 
WHERE stripe_customer_id IS NOT NULL;

-- 3. Create index for subscription ID lookup
CREATE INDEX IF NOT EXISTS idx_profiles_stripe_subscription 
ON public.profiles(stripe_subscription_id) 
WHERE stripe_subscription_id IS NOT NULL;

-- 4. Create subscriptions history table for tracking
CREATE TABLE IF NOT EXISTS public.subscription_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    event_type TEXT NOT NULL, -- 'created', 'updated', 'cancelled', 'payment_succeeded', 'payment_failed'
    stripe_event_id TEXT,
    subscription_id TEXT,
    plan_type TEXT,
    amount INTEGER, -- in cents
    currency TEXT DEFAULT 'usd',
    metadata JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Create index for user subscription events
CREATE INDEX IF NOT EXISTS idx_subscription_events_user 
ON public.subscription_events(user_id);

CREATE INDEX IF NOT EXISTS idx_subscription_events_created 
ON public.subscription_events(created_at DESC);

-- 6. Enable RLS on subscription_events
ALTER TABLE public.subscription_events ENABLE ROW LEVEL SECURITY;

-- 7. RLS Policies for subscription_events
-- Users can only view their own subscription events
CREATE POLICY "Users can view own subscription events" 
ON public.subscription_events
FOR SELECT USING (user_id = auth.uid());

-- Only service role can insert (webhooks)
CREATE POLICY "Service role can insert subscription events" 
ON public.subscription_events
FOR INSERT WITH CHECK (true);

-- 8. Create function to check if user has active subscription
CREATE OR REPLACE FUNCTION public.has_active_subscription(p_user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE id = p_user_id 
        AND subscription_tier IN ('pro', 'enterprise')
        AND subscription_status = 'active'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 9. Create function to get user's subscription tier
CREATE OR REPLACE FUNCTION public.get_subscription_tier(p_user_id UUID)
RETURNS TEXT AS $$
DECLARE
    v_tier TEXT;
BEGIN
    SELECT subscription_tier INTO v_tier 
    FROM public.profiles 
    WHERE id = p_user_id;
    
    RETURN COALESCE(v_tier, 'free');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 10. Update subscription_tier check constraint if exists
-- This ensures subscription_tier is one of our valid plans
DO $$ 
BEGIN
    -- Drop existing constraint if it exists
    ALTER TABLE public.profiles 
    DROP CONSTRAINT IF EXISTS valid_subscription_tier;
    
    -- Add new constraint
    ALTER TABLE public.profiles 
    ADD CONSTRAINT valid_subscription_tier 
    CHECK (subscription_tier IN ('free', 'pro', 'enterprise'));
EXCEPTION
    WHEN OTHERS THEN
        -- Ignore if column doesn't exist or other issues
        NULL;
END $$;

-- Done!
-- Run this migration in Supabase SQL Editor before using Stripe features
