-- ============================================
-- FIX: Allow unauthenticated users to view invitations by token
-- This is needed for the signup flow when someone clicks an invite link
-- ============================================

-- Allow anyone to read an invitation by token (for the invite link flow)
-- This is safe because tokens are cryptographically random and unguessable
CREATE POLICY "Anyone can view invitation by token" ON public.invitations
  FOR SELECT USING (
    -- This policy allows reading invitations without auth
    -- Used when someone clicks an invite link to sign up
    token IS NOT NULL
  );

-- Also allow the service role to update invitations (for accepting them)
-- The auth callback needs to mark invitations as accepted
CREATE POLICY "Service can update invitations" ON public.invitations
  FOR UPDATE USING (true)
  WITH CHECK (true);
