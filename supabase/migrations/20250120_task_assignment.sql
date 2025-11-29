-- Add assigned_to column for task assignment
ALTER TABLE public.deals 
ADD COLUMN IF NOT EXISTS assigned_to UUID REFERENCES auth.users(id) ON DELETE SET NULL;

-- Create index for assigned_to queries
CREATE INDEX IF NOT EXISTS idx_deals_assigned_to ON public.deals(assigned_to);

-- Update RLS policy to allow underwriters to see deals assigned to them
DROP POLICY IF EXISTS "Users can view their own deals" ON public.deals;

CREATE POLICY "Users can view accessible deals" ON public.deals
    FOR SELECT
    USING (
        -- User is admin or underwriter (can see all)
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.role IN ('admin', 'underwriter')
        )
        OR
        -- User is the agent who submitted the deal
        agent_id = auth.uid()
        OR
        -- User is assigned to the deal
        assigned_to = auth.uid()
    );

-- Policy for admins/underwriters to update deal assignments
DROP POLICY IF EXISTS "Admins can update deals" ON public.deals;

CREATE POLICY "Authorized users can update deals" ON public.deals
    FOR UPDATE
    USING (
        -- Admins and underwriters can update any deal
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.role IN ('admin', 'underwriter')
        )
        OR
        -- Agents can update their own deals (limited fields handled in app)
        agent_id = auth.uid()
    );
