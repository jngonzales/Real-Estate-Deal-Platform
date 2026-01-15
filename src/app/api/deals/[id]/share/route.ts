import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

// Update deal share settings
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = await createClient();

    // Check auth
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { share_enabled, share_expires_at } = body;

    // Update deal share settings
    const { data, error } = await supabase
      .from('deals')
      .update({
        share_enabled,
        share_expires_at,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select('id, share_token, share_enabled, share_expires_at, share_view_count')
      .single();

    if (error) {
      console.error('Update share error:', error);
      return NextResponse.json(
        { error: 'Failed to update share settings' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data,
    });
  } catch (error) {
    console.error('Share settings error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Get deal share info
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = await createClient();

    // Check auth
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data, error } = await supabase
      .from('deals')
      .select('id, share_token, share_enabled, share_expires_at, share_view_count')
      .eq('id', id)
      .single();

    if (error) {
      console.error('Get share error:', error);
      return NextResponse.json(
        { error: 'Failed to get share settings' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data,
    });
  } catch (error) {
    console.error('Share get error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Regenerate share token
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = await createClient();

    // Check auth
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Generate new share token using raw SQL
    const { data, error } = await supabase
      .from('deals')
      .update({
        share_token: crypto.randomUUID(),
        share_view_count: 0, // Reset view count
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select('id, share_token, share_enabled, share_expires_at, share_view_count')
      .single();

    if (error) {
      console.error('Regenerate token error:', error);
      return NextResponse.json(
        { error: 'Failed to regenerate share token' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data,
      message: 'Share token regenerated. Previous links will no longer work.',
    });
  } catch (error) {
    console.error('Token regeneration error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
