-- Create deal_comments table
CREATE TABLE IF NOT EXISTS public.deal_comments (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    deal_id UUID NOT NULL REFERENCES public.deals(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_deal_comments_deal_id ON public.deal_comments(deal_id);
CREATE INDEX IF NOT EXISTS idx_deal_comments_user_id ON public.deal_comments(user_id);
CREATE INDEX IF NOT EXISTS idx_deal_comments_created_at ON public.deal_comments(created_at DESC);

-- Enable RLS
ALTER TABLE public.deal_comments ENABLE ROW LEVEL SECURITY;

-- RLS Policies for deal_comments

-- Allow users to view comments on deals they can access
-- Agents can see comments on their own deals
-- Admins and underwriters can see all comments
CREATE POLICY "Users can view comments on accessible deals" ON public.deal_comments
    FOR SELECT
    USING (
        -- User is admin or underwriter
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.role IN ('admin', 'underwriter')
        )
        OR
        -- User is the agent who submitted the deal
        EXISTS (
            SELECT 1 FROM public.deals 
            WHERE deals.id = deal_comments.deal_id 
            AND deals.agent_id = auth.uid()
        )
    );

-- Allow authenticated users to create comments on deals they can access
CREATE POLICY "Users can create comments on accessible deals" ON public.deal_comments
    FOR INSERT
    WITH CHECK (
        auth.uid() = user_id
        AND (
            -- User is admin or underwriter
            EXISTS (
                SELECT 1 FROM public.profiles 
                WHERE profiles.id = auth.uid() 
                AND profiles.role IN ('admin', 'underwriter')
            )
            OR
            -- User is the agent who submitted the deal
            EXISTS (
                SELECT 1 FROM public.deals 
                WHERE deals.id = deal_comments.deal_id 
                AND deals.agent_id = auth.uid()
            )
        )
    );

-- Allow users to delete their own comments
-- Admins can delete any comment
CREATE POLICY "Users can delete their own comments" ON public.deal_comments
    FOR DELETE
    USING (
        auth.uid() = user_id
        OR
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.role = 'admin'
        )
    );

-- Allow users to update their own comments
CREATE POLICY "Users can update their own comments" ON public.deal_comments
    FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- Grant permissions
GRANT ALL ON public.deal_comments TO authenticated;
GRANT ALL ON public.deal_comments TO service_role;
