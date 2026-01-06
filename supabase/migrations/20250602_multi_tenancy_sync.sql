-- ============================================
-- MULTI-TENANCY SYNC: Add organization_id to all tables
-- Run this in Supabase SQL Editor
-- ============================================

-- 1. Add organization_id to tables that are missing it
ALTER TABLE public.attachments 
ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE;

ALTER TABLE public.deal_activities 
ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE;

ALTER TABLE public.deal_comments 
ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE;

ALTER TABLE public.investor_funding 
ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE;

ALTER TABLE public.offer_documents 
ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE;

ALTER TABLE public.properties 
ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE;

-- 2. Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_attachments_organization_id ON public.attachments(organization_id);
CREATE INDEX IF NOT EXISTS idx_deal_activities_organization_id ON public.deal_activities(organization_id);
CREATE INDEX IF NOT EXISTS idx_deal_comments_organization_id ON public.deal_comments(organization_id);
CREATE INDEX IF NOT EXISTS idx_investor_funding_organization_id ON public.investor_funding(organization_id);
CREATE INDEX IF NOT EXISTS idx_offer_documents_organization_id ON public.offer_documents(organization_id);
CREATE INDEX IF NOT EXISTS idx_properties_organization_id ON public.properties(organization_id);

-- 3. Update existing data: Set organization_id from related deals/profiles
-- Properties: Get org from the creator's profile
UPDATE public.properties p
SET organization_id = (
  SELECT pr.organization_id 
  FROM public.profiles pr 
  WHERE pr.id = p.created_by
)
WHERE p.organization_id IS NULL;

-- Attachments: Get org from the deal
UPDATE public.attachments a
SET organization_id = (
  SELECT d.organization_id 
  FROM public.deals d 
  WHERE d.id = a.deal_id
)
WHERE a.organization_id IS NULL;

-- Deal Activities: Get org from the deal
UPDATE public.deal_activities da
SET organization_id = (
  SELECT d.organization_id 
  FROM public.deals d 
  WHERE d.id = da.deal_id
)
WHERE da.organization_id IS NULL;

-- Deal Comments: Get org from the deal
UPDATE public.deal_comments dc
SET organization_id = (
  SELECT d.organization_id 
  FROM public.deals d 
  WHERE d.id = dc.deal_id
)
WHERE dc.organization_id IS NULL;

-- Investor Funding: Get org from the deal
UPDATE public.investor_funding if2
SET organization_id = (
  SELECT d.organization_id 
  FROM public.deals d 
  WHERE d.id = if2.deal_id
)
WHERE if2.organization_id IS NULL;

-- Offer Documents: Get org from the deal
UPDATE public.offer_documents od
SET organization_id = (
  SELECT d.organization_id 
  FROM public.deals d 
  WHERE d.id = od.deal_id
)
WHERE od.organization_id IS NULL;

-- 4. Enable RLS on new tables (if not already enabled)
ALTER TABLE public.attachments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.deal_activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.deal_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.investor_funding ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.offer_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.properties ENABLE ROW LEVEL SECURITY;

-- 5. Create RLS policies for organization isolation

-- Attachments policies
DROP POLICY IF EXISTS "Users can view org attachments" ON public.attachments;
DROP POLICY IF EXISTS "Users can insert org attachments" ON public.attachments;
DROP POLICY IF EXISTS "Users can delete own attachments" ON public.attachments;

CREATE POLICY "Users can view org attachments" ON public.attachments 
  FOR SELECT USING (organization_id = public.get_user_organization_id());

CREATE POLICY "Users can insert org attachments" ON public.attachments 
  FOR INSERT WITH CHECK (organization_id = public.get_user_organization_id());

CREATE POLICY "Users can delete own attachments" ON public.attachments 
  FOR DELETE USING (organization_id = public.get_user_organization_id() AND uploaded_by = auth.uid());

-- Deal Activities policies
DROP POLICY IF EXISTS "Users can view org deal_activities" ON public.deal_activities;
DROP POLICY IF EXISTS "Users can insert org deal_activities" ON public.deal_activities;

CREATE POLICY "Users can view org deal_activities" ON public.deal_activities 
  FOR SELECT USING (organization_id = public.get_user_organization_id());

CREATE POLICY "Users can insert org deal_activities" ON public.deal_activities 
  FOR INSERT WITH CHECK (organization_id = public.get_user_organization_id());

-- Deal Comments policies  
DROP POLICY IF EXISTS "Users can view org deal_comments" ON public.deal_comments;
DROP POLICY IF EXISTS "Users can insert org deal_comments" ON public.deal_comments;
DROP POLICY IF EXISTS "Users can update own deal_comments" ON public.deal_comments;
DROP POLICY IF EXISTS "Users can delete own deal_comments" ON public.deal_comments;

CREATE POLICY "Users can view org deal_comments" ON public.deal_comments 
  FOR SELECT USING (organization_id = public.get_user_organization_id());

CREATE POLICY "Users can insert org deal_comments" ON public.deal_comments 
  FOR INSERT WITH CHECK (organization_id = public.get_user_organization_id() AND user_id = auth.uid());

CREATE POLICY "Users can update own deal_comments" ON public.deal_comments 
  FOR UPDATE USING (organization_id = public.get_user_organization_id() AND user_id = auth.uid());

CREATE POLICY "Users can delete own deal_comments" ON public.deal_comments 
  FOR DELETE USING (organization_id = public.get_user_organization_id() AND user_id = auth.uid());

-- Investor Funding policies
DROP POLICY IF EXISTS "Users can view org investor_funding" ON public.investor_funding;
DROP POLICY IF EXISTS "Users can insert org investor_funding" ON public.investor_funding;
DROP POLICY IF EXISTS "Users can update org investor_funding" ON public.investor_funding;

CREATE POLICY "Users can view org investor_funding" ON public.investor_funding 
  FOR SELECT USING (organization_id = public.get_user_organization_id());

CREATE POLICY "Users can insert org investor_funding" ON public.investor_funding 
  FOR INSERT WITH CHECK (organization_id = public.get_user_organization_id());

CREATE POLICY "Users can update org investor_funding" ON public.investor_funding 
  FOR UPDATE USING (
    organization_id = public.get_user_organization_id() AND
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'underwriter'))
  );

-- Offer Documents policies
DROP POLICY IF EXISTS "Users can view org offer_documents" ON public.offer_documents;
DROP POLICY IF EXISTS "Users can insert org offer_documents" ON public.offer_documents;
DROP POLICY IF EXISTS "Users can update org offer_documents" ON public.offer_documents;

CREATE POLICY "Users can view org offer_documents" ON public.offer_documents 
  FOR SELECT USING (organization_id = public.get_user_organization_id());

CREATE POLICY "Users can insert org offer_documents" ON public.offer_documents 
  FOR INSERT WITH CHECK (organization_id = public.get_user_organization_id());

CREATE POLICY "Users can update org offer_documents" ON public.offer_documents 
  FOR UPDATE USING (organization_id = public.get_user_organization_id());

-- Properties policies
DROP POLICY IF EXISTS "Users can view org properties" ON public.properties;
DROP POLICY IF EXISTS "Users can insert org properties" ON public.properties;
DROP POLICY IF EXISTS "Users can update org properties" ON public.properties;

CREATE POLICY "Users can view org properties" ON public.properties 
  FOR SELECT USING (organization_id = public.get_user_organization_id());

CREATE POLICY "Users can insert org properties" ON public.properties 
  FOR INSERT WITH CHECK (organization_id = public.get_user_organization_id());

CREATE POLICY "Users can update org properties" ON public.properties 
  FOR UPDATE USING (organization_id = public.get_user_organization_id());

-- 6. Verify all tables have organization_id
DO $$
DECLARE
  tables_without_org TEXT[] := ARRAY[]::TEXT[];
  tbl RECORD;
BEGIN
  FOR tbl IN 
    SELECT table_name 
    FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_type = 'BASE TABLE'
    AND table_name NOT IN ('email_templates', 'email_queue', 'monthly_metrics', 'pipeline_summary', 'agent_performance', 'user_formula_settings', 'user_settings')
  LOOP
    IF NOT EXISTS (
      SELECT 1 FROM information_schema.columns 
      WHERE table_schema = 'public' 
      AND table_name = tbl.table_name 
      AND column_name = 'organization_id'
    ) THEN
      tables_without_org := array_append(tables_without_org, tbl.table_name);
    END IF;
  END LOOP;
  
  IF array_length(tables_without_org, 1) > 0 THEN
    RAISE NOTICE 'Tables without organization_id (may be intentional): %', tables_without_org;
  ELSE
    RAISE NOTICE 'All required tables have organization_id!';
  END IF;
END $$;

-- 7. Mark Demo Team onboarding as complete
UPDATE public.organizations
SET settings = jsonb_set(
  jsonb_set(
    COALESCE(settings, '{}'::jsonb),
    '{account_type}',
    '"team"'
  ),
  '{onboarding_completed}',
  'true'
)
WHERE id = '1a1d704b-f521-424b-bf2c-e903bdd606e3';

-- Done! Multi-tenancy sync complete.
