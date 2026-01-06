-- ============================================
-- FIX: Trigger that properly handles invitations
-- The issue was INSERT vs UPDATE timing
-- ============================================

DROP TRIGGER IF EXISTS on_auth_user_created_org ON auth.users;

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
    -- User was invited - create profile with the invited organization
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
    
    RAISE LOG 'User % joined organization % via invitation', user_email, pending_invite.organization_id;
  ELSE
    -- No invitation - create profile without organization (needs onboarding)
    INSERT INTO public.profiles (id, email, full_name, role)
    VALUES (
      NEW.id,
      user_email,
      COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(user_email, '@', 1)),
      'agent'
    );
    
    RAISE LOG 'User % created without organization', user_email;
  END IF;
  
  RETURN NEW;
EXCEPTION 
  WHEN unique_violation THEN
    -- Profile already exists, try to update it with invitation data
    IF pending_invite IS NOT NULL THEN
      UPDATE public.profiles 
      SET organization_id = pending_invite.organization_id,
          role = pending_invite.role
      WHERE id = NEW.id;
      
      UPDATE public.invitations
      SET status = 'accepted', accepted_at = NOW()
      WHERE id = pending_invite.id;
    END IF;
    RETURN NEW;
  WHEN OTHERS THEN
    RAISE LOG 'Error in handle_new_user_organization: %', SQLERRM;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created_org
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user_organization();
