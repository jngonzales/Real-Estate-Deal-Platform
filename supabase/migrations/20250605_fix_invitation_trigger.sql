-- ============================================
-- FIX: Update trigger to properly handle invitations
-- Run this in Supabase SQL Editor
-- ============================================

-- First, drop the old trigger
DROP TRIGGER IF EXISTS on_auth_user_created_org ON auth.users;
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Drop and recreate the function
DROP FUNCTION IF EXISTS public.handle_new_user_organization();

-- Create the updated function that checks for invitations
CREATE OR REPLACE FUNCTION public.handle_new_user_organization()
RETURNS TRIGGER AS $$
DECLARE
  new_org_id UUID;
  user_email TEXT;
  pending_invite RECORD;
BEGIN
  user_email := NEW.email;
  
  -- Check if user has a pending invitation
  SELECT * INTO pending_invite
  FROM public.invitations
  WHERE email = user_email
  AND status = 'pending'
  AND expires_at > NOW()
  ORDER BY created_at DESC
  LIMIT 1;
  
  IF pending_invite IS NOT NULL THEN
    -- User was invited - join existing organization
    INSERT INTO public.profiles (id, email, full_name, role, organization_id)
    VALUES (
      NEW.id,
      user_email,
      COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(user_email, '@', 1)),
      pending_invite.role,
      pending_invite.organization_id
    )
    ON CONFLICT (id) DO UPDATE SET
      organization_id = pending_invite.organization_id,
      role = pending_invite.role;
    
    -- Mark invitation as accepted
    UPDATE public.invitations
    SET status = 'accepted',
        accepted_at = NOW()
    WHERE id = pending_invite.id;
    
    -- The org already has onboarding completed
    RAISE NOTICE 'User % joined organization % via invitation', user_email, pending_invite.organization_id;
  ELSE
    -- No invitation - do NOT create organization here
    -- Let the onboarding flow handle it
    INSERT INTO public.profiles (id, email, full_name, role)
    VALUES (
      NEW.id,
      user_email,
      COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(user_email, '@', 1)),
      'agent' -- Default role
    )
    ON CONFLICT (id) DO NOTHING;
    
    RAISE NOTICE 'User % created without organization, needs onboarding', user_email;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Recreate the trigger
CREATE TRIGGER on_auth_user_created_org
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user_organization();

-- Verification: Check the trigger exists
SELECT trigger_name, event_manipulation, action_statement 
FROM information_schema.triggers 
WHERE event_object_table = 'users';
