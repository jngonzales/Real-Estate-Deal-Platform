-- =====================================================
-- MIGRATION: Fix missing tables and columns
-- Run this in your Supabase SQL Editor
-- Last Updated: December 13, 2025
-- =====================================================

-- 0. Enable uuid extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Add missing columns to deals table
ALTER TABLE deals ADD COLUMN IF NOT EXISTS assigned_to UUID REFERENCES profiles(id) ON DELETE SET NULL;
ALTER TABLE deals ADD COLUMN IF NOT EXISTS assigned_at TIMESTAMPTZ;

-- Update status constraint to include all statuses
ALTER TABLE deals DROP CONSTRAINT IF EXISTS deals_status_check;
ALTER TABLE deals ADD CONSTRAINT deals_status_check CHECK (status IN ('submitted', 'needs_info', 'underwriting', 'offer_prepared', 'offer_sent', 'in_contract', 'funding', 'approved', 'rejected', 'closed'));

-- 2. Create underwriting_records table (if not exists)
CREATE TABLE IF NOT EXISTS underwriting_records (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  deal_id UUID REFERENCES deals(id) ON DELETE CASCADE,
  underwriter_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  arv NUMERIC,
  repair_estimate NUMERIC,
  max_offer NUMERIC,
  recommended_offer NUMERIC,
  profit_estimate NUMERIC,
  risk_score NUMERIC,
  notes TEXT,
  status TEXT DEFAULT 'draft',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2b. Add missing columns to underwriting_records if table already exists but is missing columns
ALTER TABLE underwriting_records ADD COLUMN IF NOT EXISTS deal_id UUID REFERENCES deals(id) ON DELETE CASCADE;
ALTER TABLE underwriting_records ADD COLUMN IF NOT EXISTS underwriter_id UUID REFERENCES profiles(id) ON DELETE SET NULL;
ALTER TABLE underwriting_records ADD COLUMN IF NOT EXISTS arv NUMERIC;
ALTER TABLE underwriting_records ADD COLUMN IF NOT EXISTS repair_estimate NUMERIC;
ALTER TABLE underwriting_records ADD COLUMN IF NOT EXISTS max_offer NUMERIC;
ALTER TABLE underwriting_records ADD COLUMN IF NOT EXISTS recommended_offer NUMERIC;
ALTER TABLE underwriting_records ADD COLUMN IF NOT EXISTS profit_estimate NUMERIC;
ALTER TABLE underwriting_records ADD COLUMN IF NOT EXISTS risk_score NUMERIC;
ALTER TABLE underwriting_records ADD COLUMN IF NOT EXISTS notes TEXT;
ALTER TABLE underwriting_records ADD COLUMN IF NOT EXISTS status TEXT;
ALTER TABLE underwriting_records ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW();
ALTER TABLE underwriting_records ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

-- 3. Create comments table (if not exists)
CREATE TABLE IF NOT EXISTS comments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  deal_id UUID REFERENCES deals(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Create notifications table (if not exists)
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  message TEXT,
  link TEXT,
  read BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Create audit_logs table (if not exists)
CREATE TABLE IF NOT EXISTS audit_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id UUID,
  old_values JSONB,
  new_values JSONB,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Fix attachments table - add file_url if missing
ALTER TABLE attachments ADD COLUMN IF NOT EXISTS file_url TEXT;
-- Copy file_path to file_url if file_url is empty
UPDATE attachments SET file_url = file_path WHERE file_url IS NULL AND file_path IS NOT NULL;

-- 7. Enable RLS on new tables
ALTER TABLE underwriting_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- 8. Drop old policies that might conflict
DROP POLICY IF EXISTS "Users can view deals" ON deals;
DROP POLICY IF EXISTS "Agents can view own deals" ON deals;
DROP POLICY IF EXISTS "Users can update deals" ON deals;
DROP POLICY IF EXISTS "Users can view all profiles" ON profiles;
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;

-- 9. Create updated RLS policies for deals (includes assigned_to)
CREATE POLICY "Users can view deals" ON deals FOR SELECT USING (
  auth.uid() = agent_id OR 
  auth.uid() = assigned_to OR
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('underwriter', 'admin'))
);

CREATE POLICY "Users can update deals" ON deals FOR UPDATE USING (
  auth.uid() = agent_id OR 
  auth.uid() = assigned_to OR
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('underwriter', 'admin'))
);

-- 10. Create RLS policies for profiles (allow viewing all for dropdown lists)
CREATE POLICY "Users can view all profiles" ON profiles FOR SELECT USING (true);

-- 11. Create RLS policies for underwriting_records
DROP POLICY IF EXISTS "Users can view underwriting" ON underwriting_records;
DROP POLICY IF EXISTS "Users can insert underwriting" ON underwriting_records;
DROP POLICY IF EXISTS "Users can update underwriting" ON underwriting_records;

CREATE POLICY "Users can view underwriting" ON underwriting_records FOR SELECT USING (true);
CREATE POLICY "Users can insert underwriting" ON underwriting_records FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('underwriter', 'admin'))
);
CREATE POLICY "Users can update underwriting" ON underwriting_records FOR UPDATE USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('underwriter', 'admin'))
);

-- 12. Create RLS policies for comments
DROP POLICY IF EXISTS "Users can view comments" ON comments;
DROP POLICY IF EXISTS "Users can insert comments" ON comments;

CREATE POLICY "Users can view comments" ON comments FOR SELECT USING (true);
CREATE POLICY "Users can insert comments" ON comments FOR INSERT WITH CHECK (auth.uid() = user_id);

-- 13. Create RLS policies for notifications
DROP POLICY IF EXISTS "Users can view own notifications" ON notifications;
DROP POLICY IF EXISTS "Users can update own notifications" ON notifications;
DROP POLICY IF EXISTS "System can insert notifications" ON notifications;

CREATE POLICY "Users can view own notifications" ON notifications FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update own notifications" ON notifications FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "System can insert notifications" ON notifications FOR INSERT WITH CHECK (true);

-- 14. Create RLS policies for audit_logs
DROP POLICY IF EXISTS "Admins can view audit logs" ON audit_logs;
DROP POLICY IF EXISTS "System can insert audit logs" ON audit_logs;

CREATE POLICY "Admins can view audit logs" ON audit_logs FOR SELECT USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);
CREATE POLICY "System can insert audit logs" ON audit_logs FOR INSERT WITH CHECK (true);

-- 15. Add country column to properties if missing
ALTER TABLE properties ADD COLUMN IF NOT EXISTS country TEXT DEFAULT 'US';
UPDATE properties SET country = 'US' WHERE country IS NULL;

-- Done! Your database should now be compatible with the application.
