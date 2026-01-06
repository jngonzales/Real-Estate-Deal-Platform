-- ============================================
-- FIX: Remove conflicting trigger and keep only the one that handles invitations
-- Run this in Supabase SQL Editor
-- ============================================

-- First, see all triggers on auth.users
SELECT trigger_name, action_statement 
FROM information_schema.triggers 
WHERE event_object_schema = 'auth' AND event_object_table = 'users';

-- Drop the OLD simple trigger that doesn't check invitations
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Drop the old function
DROP FUNCTION IF EXISTS public.handle_new_user();

-- Ensure only our new trigger exists
DROP TRIGGER IF EXISTS on_auth_user_created_org ON auth.users;

CREATE TRIGGER on_auth_user_created_org
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user_organization();

-- Verify only one trigger exists now
SELECT trigger_name, action_statement 
FROM information_schema.triggers 
WHERE event_object_schema = 'auth' AND event_object_table = 'users';
