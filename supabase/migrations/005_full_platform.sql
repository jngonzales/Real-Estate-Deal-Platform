-- Full Platform Enhancement Migration
-- Run this in Supabase SQL Editor

-- =====================================================
-- 1. ADD INVESTOR ROLE SUPPORT
-- =====================================================

-- Enhance profiles table
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS phone TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS notification_preferences JSONB DEFAULT '{"email": true, "sms": false, "push": true}';

-- =====================================================
-- 2. ENHANCE DEALS TABLE
-- =====================================================

ALTER TABLE deals ADD COLUMN IF NOT EXISTS investor_id UUID REFERENCES profiles(id);
ALTER TABLE deals ADD COLUMN IF NOT EXISTS priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent'));
ALTER TABLE deals ADD COLUMN IF NOT EXISTS tags TEXT[];
ALTER TABLE deals ADD COLUMN IF NOT EXISTS closed_at TIMESTAMPTZ;
ALTER TABLE deals ADD COLUMN IF NOT EXISTS final_price NUMERIC(12,2);
ALTER TABLE deals ADD COLUMN IF NOT EXISTS deal_number SERIAL;

-- =====================================================
-- 3. ENHANCE UNDERWRITING RECORDS
-- =====================================================

ALTER TABLE underwriting_records ADD COLUMN IF NOT EXISTS version INTEGER DEFAULT 1;
ALTER TABLE underwriting_records ADD COLUMN IF NOT EXISTS risk_score INTEGER CHECK (risk_score BETWEEN 1 AND 10);
ALTER TABLE underwriting_records ADD COLUMN IF NOT EXISTS risk_factors JSONB;
ALTER TABLE underwriting_records ADD COLUMN IF NOT EXISTS arv_comps JSONB;
ALTER TABLE underwriting_records ADD COLUMN IF NOT EXISTS repair_breakdown JSONB;

-- =====================================================
-- 4. INVESTOR FUNDING TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS investor_funding (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  deal_id UUID REFERENCES deals(id) ON DELETE CASCADE,
  investor_id UUID REFERENCES profiles(id),
  -- Funding Details
  requested_amount NUMERIC(12,2),
  approved_amount NUMERIC(12,2),
  funded_amount NUMERIC(12,2),
  -- Status
  status TEXT DEFAULT 'pending' CHECK (status IN (
    'pending', 'under_review', 'approved', 'funded', 'declined', 'withdrawn'
  )),
  -- Terms
  interest_rate NUMERIC(5,2),
  term_months INTEGER,
  notes TEXT,
  -- Timestamps
  requested_at TIMESTAMPTZ DEFAULT NOW(),
  approved_at TIMESTAMPTZ,
  funded_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- 5. DEAL ACTIVITIES TABLE (Activity Log)
-- =====================================================

CREATE TABLE IF NOT EXISTS deal_activities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  deal_id UUID REFERENCES deals(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id),
  activity_type TEXT NOT NULL,
  description TEXT,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- 6. OFFER DOCUMENTS TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS offer_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  deal_id UUID REFERENCES deals(id) ON DELETE CASCADE,
  created_by UUID REFERENCES profiles(id),
  template_type TEXT DEFAULT 'standard',
  pdf_url TEXT,
  sent_at TIMESTAMPTZ,
  viewed_at TIMESTAMPTZ,
  signed_at TIMESTAMPTZ,
  docusign_envelope_id TEXT,
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'sent', 'viewed', 'signed', 'declined', 'expired')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- 7. ROW LEVEL SECURITY
-- =====================================================

-- Enable RLS on new tables
ALTER TABLE investor_funding ENABLE ROW LEVEL SECURITY;
ALTER TABLE deal_activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE offer_documents ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist (for re-runs)
DROP POLICY IF EXISTS "Investors can view own funding" ON investor_funding;
DROP POLICY IF EXISTS "Investors can create funding requests" ON investor_funding;
DROP POLICY IF EXISTS "Admins can manage all funding" ON investor_funding;
DROP POLICY IF EXISTS "Users can view deal activities" ON deal_activities;
DROP POLICY IF EXISTS "Users can create activities" ON deal_activities;
DROP POLICY IF EXISTS "Users can view offer documents" ON offer_documents;
DROP POLICY IF EXISTS "Admins can manage offer documents" ON offer_documents;

-- Investor Funding Policies
CREATE POLICY "Investors can view own funding" ON investor_funding
  FOR SELECT USING (
    auth.uid() = investor_id OR
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'underwriter'))
  );

CREATE POLICY "Investors can create funding requests" ON investor_funding
  FOR INSERT WITH CHECK (auth.uid() = investor_id);

CREATE POLICY "Admins can manage all funding" ON investor_funding
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'underwriter'))
  );

-- Deal Activities Policies
CREATE POLICY "Users can view deal activities" ON deal_activities
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM deals d
      WHERE d.id = deal_activities.deal_id
      AND (
        d.agent_id = auth.uid() OR
        d.assigned_to = auth.uid() OR
        EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'underwriter', 'investor'))
      )
    )
  );

CREATE POLICY "Users can create activities" ON deal_activities
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Offer Documents Policies
CREATE POLICY "Users can view offer documents" ON offer_documents
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM deals d
      WHERE d.id = offer_documents.deal_id
      AND (
        d.agent_id = auth.uid() OR
        d.assigned_to = auth.uid() OR
        EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'underwriter'))
      )
    )
  );

CREATE POLICY "Admins can manage offer documents" ON offer_documents
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'underwriter'))
  );

-- =====================================================
-- 8. INDEXES FOR PERFORMANCE
-- =====================================================

CREATE INDEX IF NOT EXISTS idx_deals_investor ON deals(investor_id);
CREATE INDEX IF NOT EXISTS idx_deals_priority ON deals(priority);
CREATE INDEX IF NOT EXISTS idx_deals_closed_at ON deals(closed_at);
CREATE INDEX IF NOT EXISTS idx_investor_funding_deal ON investor_funding(deal_id);
CREATE INDEX IF NOT EXISTS idx_investor_funding_investor ON investor_funding(investor_id);
CREATE INDEX IF NOT EXISTS idx_investor_funding_status ON investor_funding(status);
CREATE INDEX IF NOT EXISTS idx_deal_activities_deal ON deal_activities(deal_id);
CREATE INDEX IF NOT EXISTS idx_deal_activities_created ON deal_activities(created_at);
CREATE INDEX IF NOT EXISTS idx_offer_documents_deal ON offer_documents(deal_id);

-- =====================================================
-- 9. ANALYTICS VIEWS
-- =====================================================

-- Pipeline Summary View
CREATE OR REPLACE VIEW pipeline_summary AS
SELECT 
  status::text as status,
  COUNT(*) as deal_count,
  SUM(asking_price) as total_asking,
  SUM(offer_price) as total_offers,
  AVG(asking_price) as avg_asking,
  AVG(offer_price) as avg_offer
FROM deals
GROUP BY status;

-- Agent Performance View
CREATE OR REPLACE VIEW agent_performance AS
SELECT 
  p.id as agent_id,
  p.full_name,
  p.email,
  COUNT(d.id) as total_deals,
  COUNT(CASE WHEN d.status::text = 'closed' THEN 1 END) as closed_deals,
  COUNT(CASE WHEN d.status::text NOT IN ('closed') THEN 1 END) as active_deals,
  SUM(CASE WHEN d.status::text = 'closed' THEN COALESCE(d.final_price, d.offer_price, 0) ELSE 0 END) as total_closed_value,
  ROUND(COUNT(CASE WHEN d.status::text = 'closed' THEN 1 END)::NUMERIC / NULLIF(COUNT(d.id), 0) * 100, 2) as conversion_rate
FROM profiles p
LEFT JOIN deals d ON d.agent_id = p.id
WHERE p.role = 'agent'
GROUP BY p.id, p.full_name, p.email;

-- Monthly Metrics View
CREATE OR REPLACE VIEW monthly_metrics AS
SELECT 
  DATE_TRUNC('month', submitted_at) as month,
  COUNT(*) as deals_submitted,
  COUNT(CASE WHEN status::text = 'closed' THEN 1 END) as deals_closed,
  SUM(asking_price) as total_asking_value,
  SUM(CASE WHEN status::text = 'closed' THEN COALESCE(final_price, offer_price, 0) ELSE 0 END) as total_closed_value
FROM deals
WHERE submitted_at >= NOW() - INTERVAL '12 months'
GROUP BY DATE_TRUNC('month', submitted_at)
ORDER BY month DESC;

-- =====================================================
-- 10. GRANT PERMISSIONS
-- =====================================================

GRANT SELECT ON pipeline_summary TO authenticated;
GRANT SELECT ON agent_performance TO authenticated;
GRANT SELECT ON monthly_metrics TO authenticated;
