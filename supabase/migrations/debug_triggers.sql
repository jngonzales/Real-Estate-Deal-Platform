-- ============================================
-- DEBUG: Check all triggers on auth.users
-- Run this in Supabase SQL Editor
-- ============================================

-- List all triggers on auth.users
SELECT 
    trigger_name,
    event_manipulation,
    action_timing,
    action_statement
FROM information_schema.triggers 
WHERE event_object_schema = 'auth' 
AND event_object_table = 'users'
ORDER BY action_timing, trigger_name;

-- Also check for any other functions that might handle new users
SELECT 
    p.proname as function_name,
    pg_get_functiondef(p.oid) as definition
FROM pg_proc p
JOIN pg_namespace n ON p.pronamespace = n.oid
WHERE n.nspname = 'public'
AND p.proname LIKE '%user%'
ORDER BY p.proname;
