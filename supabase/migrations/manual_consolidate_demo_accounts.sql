-- ============================================
-- CONSOLIDATE DEMO ACCOUNTS INTO ONE ORGANIZATION
-- Run this in Supabase SQL Editor
-- ============================================

-- First, let's identify the demo organization (the first one created)
-- We'll use "Demo User's Organization" as the main one

-- Step 1: Get the Demo User's Organization ID (copy this ID)
SELECT id, name, owner_id 
FROM organizations 
WHERE name LIKE '%Demo%' 
LIMIT 1;

-- Step 2: Find all demo/test profiles that need to be consolidated
SELECT p.id, p.email, p.full_name, p.role, o.name as org_name
FROM profiles p
LEFT JOIN organizations o ON p.organization_id = o.id
WHERE p.email LIKE '%demo%' 
   OR p.email LIKE '%underwriter%' 
   OR p.email LIKE '%agent%' 
   OR p.email LIKE '%investor%'
   OR p.email LIKE '%test%';

-- ============================================
-- EXECUTE THE CONSOLIDATION
-- Replace 'DEMO_ORG_ID_HERE' with the actual ID from Step 1
-- ============================================

-- Step 3: Update all demo profiles to use the same organization
-- IMPORTANT: Replace 'DEMO_ORG_ID_HERE' with the actual UUID!

/*
UPDATE profiles
SET organization_id = 'DEMO_ORG_ID_HERE'
WHERE email LIKE '%demo%' 
   OR email LIKE '%underwriter%' 
   OR email LIKE '%agent%' 
   OR email LIKE '%investor%'
   OR (email LIKE '%test%' AND email NOT LIKE '%jngonzales%');
*/

-- Step 4: Delete orphaned organizations (organizations with no users)
/*
DELETE FROM organizations
WHERE id NOT IN (SELECT DISTINCT organization_id FROM profiles WHERE organization_id IS NOT NULL);
*/

-- Step 5: Rename the demo organization to something cleaner
/*
UPDATE organizations
SET name = 'Demo Team'
WHERE id = 'DEMO_ORG_ID_HERE';
*/

-- ============================================
-- VERIFICATION
-- ============================================

-- Check the result
SELECT p.email, p.full_name, p.role, o.name as organization
FROM profiles p
LEFT JOIN organizations o ON p.organization_id = o.id
ORDER BY o.name, p.role;

-- Check remaining organizations
SELECT id, name, owner_id, subscription_status
FROM organizations
ORDER BY created_at;
