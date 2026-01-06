-- ============================================
-- INVITATION SYSTEM: Allow admins to invite team members
-- ============================================

-- 1. Create invitations table
CREATE TABLE IF NOT EXISTS public.invitations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'agent',
  invited_by UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  token TEXT NOT NULL UNIQUE DEFAULT encode(gen_random_bytes(32), 'hex'),
  status TEXT NOT NULL DEFAULT 'pending', -- pending, accepted, expired, cancelled
  expires_at TIMESTAMPTZ NOT NULL DEFAULT (NOW() + INTERVAL '7 days'),
  accepted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  CONSTRAINT valid_role CHECK (role IN ('agent', 'underwriter', 'admin', 'investor'))
);

-- 2. Create indexes
CREATE INDEX IF NOT EXISTS idx_invitations_email ON public.invitations(email);
CREATE INDEX IF NOT EXISTS idx_invitations_token ON public.invitations(token);
CREATE INDEX IF NOT EXISTS idx_invitations_organization ON public.invitations(organization_id);
CREATE INDEX IF NOT EXISTS idx_invitations_status ON public.invitations(status);

-- 3. Enable RLS
ALTER TABLE public.invitations ENABLE ROW LEVEL SECURITY;

-- 4. RLS Policies for invitations
CREATE POLICY "Admins can view org invitations" ON public.invitations
  FOR SELECT USING (
    organization_id = public.get_user_organization_id() AND
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "Admins can create invitations" ON public.invitations
  FOR INSERT WITH CHECK (
    organization_id = public.get_user_organization_id() AND
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "Admins can update invitations" ON public.invitations
  FOR UPDATE USING (
    organization_id = public.get_user_organization_id() AND
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "Admins can delete invitations" ON public.invitations
  FOR DELETE USING (
    organization_id = public.get_user_organization_id() AND
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- 5. Function to accept an invitation
CREATE OR REPLACE FUNCTION public.accept_invitation(invitation_token TEXT)
RETURNS JSON AS $$
DECLARE
  inv RECORD;
  new_user_id UUID;
BEGIN
  -- Find the invitation
  SELECT * INTO inv FROM public.invitations 
  WHERE token = invitation_token 
  AND status = 'pending' 
  AND expires_at > NOW();
  
  IF inv IS NULL THEN
    RETURN json_build_object('success', false, 'error', 'Invalid or expired invitation');
  END IF;
  
  -- Get the current user
  new_user_id := auth.uid();
  
  IF new_user_id IS NULL THEN
    RETURN json_build_object('success', false, 'error', 'User not authenticated');
  END IF;
  
  -- Update the user's profile to join the organization
  UPDATE public.profiles
  SET organization_id = inv.organization_id,
      role = inv.role
  WHERE id = new_user_id;
  
  -- Mark invitation as accepted
  UPDATE public.invitations
  SET status = 'accepted',
      accepted_at = NOW()
  WHERE id = inv.id;
  
  -- Delete the auto-created organization for this user (if any)
  DELETE FROM public.organizations
  WHERE owner_id = new_user_id
  AND id != inv.organization_id;
  
  RETURN json_build_object(
    'success', true, 
    'organization_id', inv.organization_id,
    'role', inv.role
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 6. Function to check if an email has a pending invitation
CREATE OR REPLACE FUNCTION public.get_pending_invitation(user_email TEXT)
RETURNS JSON AS $$
DECLARE
  inv RECORD;
  org RECORD;
BEGIN
  SELECT i.*, o.name as org_name
  INTO inv
  FROM public.invitations i
  JOIN public.organizations o ON o.id = i.organization_id
  WHERE i.email = user_email
  AND i.status = 'pending'
  AND i.expires_at > NOW()
  ORDER BY i.created_at DESC
  LIMIT 1;
  
  IF inv IS NULL THEN
    RETURN NULL;
  END IF;
  
  RETURN json_build_object(
    'id', inv.id,
    'organization_id', inv.organization_id,
    'organization_name', inv.org_name,
    'role', inv.role,
    'token', inv.token
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 7. Update the signup trigger to check for invitations
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
    );
    
    -- Mark invitation as accepted
    UPDATE public.invitations
    SET status = 'accepted',
        accepted_at = NOW()
    WHERE id = pending_invite.id;
    
    -- Mark the org as onboarding completed (they're joining existing team)
    -- No need to go through onboarding again
  ELSE
    -- No invitation - create new organization
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
      'admin', -- First user of new org is always admin
      new_org_id
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Recreate the trigger
DROP TRIGGER IF EXISTS on_auth_user_created_org ON auth.users;
CREATE TRIGGER on_auth_user_created_org
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user_organization();
