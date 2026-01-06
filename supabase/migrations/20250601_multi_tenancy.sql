-- Multi-Tenancy Migration: Organization-based data isolation
-- This ensures each organization/customer has completely isolated data

-- 1. Create organizations table
CREATE TABLE IF NOT EXISTS public.organizations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  owner_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  subscription_status TEXT DEFAULT 'trial', -- trial, active, cancelled, expired
  subscription_plan TEXT DEFAULT 'free', -- free, starter, professional, enterprise
  trial_ends_at TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '14 days'),
  settings JSONB DEFAULT '{}'::jsonb
);

-- 2. Add organization_id to profiles
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE;

-- 3. Add organization_id to deals
ALTER TABLE public.deals 
ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE;

-- 4. Add organization_id to other tables that need isolation
ALTER TABLE public.underwriting_records 
ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE;

ALTER TABLE public.comments 
ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE;

ALTER TABLE public.notifications 
ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE;

ALTER TABLE public.audit_logs 
ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE;

-- 5. Enable RLS on organizations
ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;

-- 6. Create helper function to get current user's organization
CREATE OR REPLACE FUNCTION public.get_user_organization_id()
RETURNS UUID AS $$
  SELECT organization_id FROM public.profiles WHERE id = auth.uid();
$$ LANGUAGE SQL SECURITY DEFINER STABLE;

-- 7. Drop existing RLS policies and create organization-based policies

-- Organizations policies
CREATE POLICY "Users can view own organization" ON public.organizations 
  FOR SELECT USING (id = public.get_user_organization_id() OR owner_id = auth.uid());

CREATE POLICY "Owners can update own organization" ON public.organizations 
  FOR UPDATE USING (owner_id = auth.uid());

-- Profiles policies (updated for org isolation)
DROP POLICY IF EXISTS "Users can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users can view profiles" ON public.profiles;

CREATE POLICY "Users can view org profiles" ON public.profiles 
  FOR SELECT USING (organization_id = public.get_user_organization_id());

CREATE POLICY "Users can update own profile" ON public.profiles 
  FOR UPDATE USING (id = auth.uid());

-- Deals policies (updated for org isolation)
DROP POLICY IF EXISTS "Users can view deals" ON public.deals;
DROP POLICY IF EXISTS "Users can update deals" ON public.deals;
DROP POLICY IF EXISTS "Agents can create deals" ON public.deals;
DROP POLICY IF EXISTS "Users can insert deals" ON public.deals;

CREATE POLICY "Users can view org deals" ON public.deals 
  FOR SELECT USING (organization_id = public.get_user_organization_id());

CREATE POLICY "Users can insert org deals" ON public.deals 
  FOR INSERT WITH CHECK (organization_id = public.get_user_organization_id());

CREATE POLICY "Users can update org deals" ON public.deals 
  FOR UPDATE USING (organization_id = public.get_user_organization_id());

CREATE POLICY "Users can delete org deals" ON public.deals 
  FOR DELETE USING (
    organization_id = public.get_user_organization_id() AND 
    (auth.uid() = agent_id OR EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'))
  );

-- Underwriting records policies (updated)
DROP POLICY IF EXISTS "Users can view underwriting" ON public.underwriting_records;
DROP POLICY IF EXISTS "Users can insert underwriting" ON public.underwriting_records;
DROP POLICY IF EXISTS "Users can update underwriting" ON public.underwriting_records;

CREATE POLICY "Users can view org underwriting" ON public.underwriting_records 
  FOR SELECT USING (organization_id = public.get_user_organization_id());

CREATE POLICY "Users can insert org underwriting" ON public.underwriting_records 
  FOR INSERT WITH CHECK (
    organization_id = public.get_user_organization_id() AND
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('underwriter', 'admin'))
  );

CREATE POLICY "Users can update org underwriting" ON public.underwriting_records 
  FOR UPDATE USING (
    organization_id = public.get_user_organization_id() AND
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('underwriter', 'admin'))
  );

-- Comments policies (updated)
DROP POLICY IF EXISTS "Users can view comments" ON public.comments;
DROP POLICY IF EXISTS "Users can insert comments" ON public.comments;

CREATE POLICY "Users can view org comments" ON public.comments 
  FOR SELECT USING (organization_id = public.get_user_organization_id());

CREATE POLICY "Users can insert org comments" ON public.comments 
  FOR INSERT WITH CHECK (organization_id = public.get_user_organization_id() AND auth.uid() = user_id);

-- Notifications policies (already user-specific, add org layer)
DROP POLICY IF EXISTS "Users can view own notifications" ON public.notifications;
DROP POLICY IF EXISTS "Users can update own notifications" ON public.notifications;
DROP POLICY IF EXISTS "System can insert notifications" ON public.notifications;

CREATE POLICY "Users can view own org notifications" ON public.notifications 
  FOR SELECT USING (auth.uid() = user_id AND organization_id = public.get_user_organization_id());

CREATE POLICY "Users can update own org notifications" ON public.notifications 
  FOR UPDATE USING (auth.uid() = user_id AND organization_id = public.get_user_organization_id());

CREATE POLICY "System can insert org notifications" ON public.notifications 
  FOR INSERT WITH CHECK (organization_id = public.get_user_organization_id());

-- Audit logs policies (updated)
DROP POLICY IF EXISTS "Admins can view audit logs" ON public.audit_logs;
DROP POLICY IF EXISTS "System can insert audit logs" ON public.audit_logs;

CREATE POLICY "Admins can view org audit logs" ON public.audit_logs 
  FOR SELECT USING (
    organization_id = public.get_user_organization_id() AND
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "System can insert org audit logs" ON public.audit_logs 
  FOR INSERT WITH CHECK (true);

-- 8. Create function to auto-create organization on first user signup
CREATE OR REPLACE FUNCTION public.handle_new_user_organization()
RETURNS TRIGGER AS $$
DECLARE
  new_org_id UUID;
  user_email TEXT;
BEGIN
  user_email := NEW.email;
  
  -- Create a new organization for the user
  INSERT INTO public.organizations (name, slug, owner_id)
  VALUES (
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(user_email, '@', 1)) || '''s Organization',
    LOWER(REPLACE(gen_random_uuid()::text, '-', '')),
    NEW.id
  )
  RETURNING id INTO new_org_id;
  
  -- Create the user's profile with the new organization
  INSERT INTO public.profiles (id, email, full_name, role, organization_id)
  VALUES (
    NEW.id,
    user_email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(user_email, '@', 1)),
    'admin', -- First user of org is always admin
    new_org_id
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 9. Create or replace the trigger (check if profile trigger exists and update it)
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP TRIGGER IF EXISTS on_auth_user_created_org ON auth.users;

CREATE TRIGGER on_auth_user_created_org
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user_organization();

-- 10. Create function to invite users to an organization
CREATE OR REPLACE FUNCTION public.invite_user_to_organization(
  invite_email TEXT,
  invite_role TEXT DEFAULT 'agent'
)
RETURNS UUID AS $$
DECLARE
  org_id UUID;
  invite_id UUID;
BEGIN
  -- Get the current user's organization
  SELECT organization_id INTO org_id FROM public.profiles WHERE id = auth.uid();
  
  IF org_id IS NULL THEN
    RAISE EXCEPTION 'User does not belong to an organization';
  END IF;
  
  -- Check if current user is admin
  IF NOT EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin') THEN
    RAISE EXCEPTION 'Only admins can invite users';
  END IF;
  
  -- Create invitation record (you'd need an invitations table for full implementation)
  -- For now, return org_id for the invitation flow
  RETURN org_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 11. Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_profiles_organization_id ON public.profiles(organization_id);
CREATE INDEX IF NOT EXISTS idx_deals_organization_id ON public.deals(organization_id);
CREATE INDEX IF NOT EXISTS idx_underwriting_records_organization_id ON public.underwriting_records(organization_id);
CREATE INDEX IF NOT EXISTS idx_comments_organization_id ON public.comments(organization_id);
CREATE INDEX IF NOT EXISTS idx_notifications_organization_id ON public.notifications(organization_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_organization_id ON public.audit_logs(organization_id);
CREATE INDEX IF NOT EXISTS idx_organizations_owner_id ON public.organizations(owner_id);
CREATE INDEX IF NOT EXISTS idx_organizations_slug ON public.organizations(slug);
