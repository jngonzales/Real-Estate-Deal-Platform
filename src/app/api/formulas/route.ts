import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

// GET - List user's formulas + public formulas
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const includePublic = searchParams.get('public') === 'true';
    const category = searchParams.get('category');

    // Get user's own formulas
    let query = supabase
      .from('user_formulas')
      .select('*')
      .order('created_at', { ascending: false });

    if (includePublic) {
      // Get user's formulas + public formulas
      query = query.or(`user_id.eq.${user.id},is_public.eq.true`);
    } else {
      // Only user's formulas
      query = query.eq('user_id', user.id);
    }

    if (category) {
      query = query.eq('category', category);
    }

    const { data: formulas, error } = await query;

    if (error) {
      console.error('Error fetching formulas:', error);
      return NextResponse.json(
        { error: 'Failed to fetch formulas' },
        { status: 500 }
      );
    }

    return NextResponse.json({ formulas });
  } catch (error) {
    console.error('Formulas API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST - Create a new formula
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { name, description, formula, variables, isPublic, category } = body;

    if (!name || !formula) {
      return NextResponse.json(
        { error: 'Name and formula are required' },
        { status: 400 }
      );
    }

    // Check formula limit
    const { count } = await supabase
      .from('user_formulas')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', user.id);

    // Free tier limit is 2 formulas (check against usage)
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('subscription_tier')
      .eq('user_id', user.id)
      .single();

    const tier = profile?.subscription_tier || 'free';
    const limits: Record<string, number> = {
      free: 2,
      basic: 10,
      pro: 50,
      enterprise: 999999
    };

    if ((count || 0) >= limits[tier]) {
      return NextResponse.json(
        { 
          error: 'Formula limit reached',
          message: `You can save up to ${limits[tier]} formulas on your ${tier} plan. Upgrade to save more!`
        },
        { status: 403 }
      );
    }

    // Get user's organization if exists
    const { data: profileData } = await supabase
      .from('user_profiles')
      .select('organization_id')
      .eq('user_id', user.id)
      .single();

    const { data: newFormula, error } = await supabase
      .from('user_formulas')
      .insert({
        user_id: user.id,
        organization_id: profileData?.organization_id || null,
        name,
        description: description || null,
        formula,
        variables: variables || [],
        is_public: isPublic || false,
        category: category || 'custom'
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating formula:', error);
      return NextResponse.json(
        { error: 'Failed to save formula' },
        { status: 500 }
      );
    }

    return NextResponse.json({ formula: newFormula }, { status: 201 });
  } catch (error) {
    console.error('Formulas API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PUT - Update a formula
export async function PUT(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { id, name, description, formula, variables, isPublic, category } = body;

    if (!id) {
      return NextResponse.json(
        { error: 'Formula ID is required' },
        { status: 400 }
      );
    }

    // Verify ownership
    const { data: existing } = await supabase
      .from('user_formulas')
      .select('user_id')
      .eq('id', id)
      .single();

    if (!existing || existing.user_id !== user.id) {
      return NextResponse.json(
        { error: 'Formula not found or access denied' },
        { status: 404 }
      );
    }

    const { data: updatedFormula, error } = await supabase
      .from('user_formulas')
      .update({
        name,
        description,
        formula,
        variables,
        is_public: isPublic,
        category,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating formula:', error);
      return NextResponse.json(
        { error: 'Failed to update formula' },
        { status: 500 }
      );
    }

    return NextResponse.json({ formula: updatedFormula });
  } catch (error) {
    console.error('Formulas API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE - Delete a formula
export async function DELETE(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'Formula ID is required' },
        { status: 400 }
      );
    }

    // Verify ownership
    const { data: existing } = await supabase
      .from('user_formulas')
      .select('user_id')
      .eq('id', id)
      .single();

    if (!existing || existing.user_id !== user.id) {
      return NextResponse.json(
        { error: 'Formula not found or access denied' },
        { status: 404 }
      );
    }

    const { error } = await supabase
      .from('user_formulas')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting formula:', error);
      return NextResponse.json(
        { error: 'Failed to delete formula' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Formulas API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
