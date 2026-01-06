-- ============================================
-- PRE-MIGRATION: Handle existing data before multi-tenancy
-- Run this BEFORE running 20250601_multi_tenancy.sql
-- ============================================

-- Step 1: Check what exists
DO $$
DECLARE
  profile_count INTEGER;
  deal_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO profile_count FROM public.profiles;
  SELECT COUNT(*) INTO deal_count FROM public.deals;
  
  RAISE NOTICE 'Found % existing profiles and % existing deals', profile_count, deal_count;
END $$;

-- Step 2: Create organizations table first (if not exists)
CREATE TABLE IF NOT EXISTS public.organizations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  owner_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  subscription_status TEXT DEFAULT 'trial',
  subscription_plan TEXT DEFAULT 'free',
  trial_ends_at TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '14 days'),
  settings JSONB DEFAULT '{}'::jsonb
);

-- Step 3: Add organization_id column to profiles (if not exists)
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE;

-- Step 4: Create organization for each existing user who doesn't have one
DO $$
DECLARE
  user_record RECORD;
  new_org_id UUID;
BEGIN
  -- Find all profiles without an organization
  FOR user_record IN 
    SELECT p.id, p.email, p.full_name 
    FROM public.profiles p 
    WHERE p.organization_id IS NULL
  LOOP
    -- Create organization for this user
    INSERT INTO public.organizations (name, slug, owner_id)
    VALUES (
      COALESCE(user_record.full_name, split_part(user_record.email, '@', 1)) || '''s Organization',
      LOWER(REPLACE(gen_random_uuid()::text, '-', '')),
      user_record.id
    )
    RETURNING id INTO new_org_id;
    
    -- Update the profile with the new organization_id
    UPDATE public.profiles 
    SET organization_id = new_org_id,
        role = 'admin' -- Make them admin of their own org
    WHERE id = user_record.id;
    
    RAISE NOTICE 'Created organization for user: %', user_record.email;
  END LOOP;
END $$;

-- Step 5: Add organization_id to deals (if not exists)
ALTER TABLE public.deals 
ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE;

-- Step 6: Assign existing deals to their agent's organization
UPDATE public.deals d
SET organization_id = (
  SELECT p.organization_id 
  FROM public.profiles p 
  WHERE p.id = d.agent_id
)
WHERE d.organization_id IS NULL AND d.agent_id IS NOT NULL;

-- Step 7: For deals without an agent, assign to the first admin org (fallback)
DO $$
DECLARE
  fallback_org_id UUID;
BEGIN
  -- Get the first organization as fallback
  SELECT id INTO fallback_org_id FROM public.organizations LIMIT 1;
  
  IF fallback_org_id IS NOT NULL THEN
    UPDATE public.deals 
    SET organization_id = fallback_org_id
    WHERE organization_id IS NULL;
  END IF;
END $$;

-- Step 8: Add organization_id to other tables
ALTER TABLE public.underwriting_records 
ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE;

ALTER TABLE public.comments 
ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE;

ALTER TABLE public.notifications 
ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE;

ALTER TABLE public.audit_logs 
ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE;

-- Step 9: Update related tables to match their deal's organization
UPDATE public.underwriting_records ur
SET organization_id = (
  SELECT d.organization_id 
  FROM public.deals d 
  WHERE d.id = ur.deal_id
)
WHERE ur.organization_id IS NULL;

UPDATE public.comments c
SET organization_id = (
  SELECT d.organization_id 
  FROM public.deals d 
  WHERE d.id = c.deal_id
)
WHERE c.organization_id IS NULL;

-- Step 10: Notifications - update to user's org
UPDATE public.notifications n
SET organization_id = (
  SELECT p.organization_id 
  FROM public.profiles p 
  WHERE p.id = n.user_id
)
WHERE n.organization_id IS NULL;

-- Step 11: Verify migration
DO $$
DECLARE
  orphan_profiles INTEGER;
  orphan_deals INTEGER;
  org_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO orphan_profiles FROM public.profiles WHERE organization_id IS NULL;
  SELECT COUNT(*) INTO orphan_deals FROM public.deals WHERE organization_id IS NULL;
  SELECT COUNT(*) INTO org_count FROM public.organizations;
  
  RAISE NOTICE '=== Migration Summary ===';
  RAISE NOTICE 'Organizations created: %', org_count;
  RAISE NOTICE 'Orphan profiles (should be 0): %', orphan_profiles;
  RAISE NOTICE 'Orphan deals (should be 0): %', orphan_deals;
  
  IF orphan_profiles > 0 OR orphan_deals > 0 THEN
    RAISE WARNING 'There are still orphaned records! Please investigate.';
  ELSE
    RAISE NOTICE 'SUCCESS: All existing data has been migrated!';
  END IF;
END $$;

-- ============================================
-- AFTER RUNNING THIS, run 20250601_multi_tenancy.sql
-- ============================================
