import { NextRequest, NextResponse } from 'next/server';
import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import { verifyTurnstileToken } from '@/components/security/turnstile';
import { isFormSubmittedTooFast } from '@/components/security/honeypot';
import { SecurityLogger } from '@/lib/services/security';

// Use service role to bypass RLS for public submissions
function getServiceClient() {
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  
  if (!serviceRoleKey) {
    throw new Error('SUPABASE_SERVICE_ROLE_KEY is not set');
  }
  
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    serviceRoleKey,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  );
}

export async function POST(request: NextRequest) {
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0] ?? 
             request.headers.get('x-real-ip') ?? 
             '127.0.0.1';
             
  try {
    const body = await request.json();
    
    const {
      property_address,
      city,
      state,
      zip_code,
      property_type,
      condition,
      notes,
      photos,
      scout_name,
      scout_phone,
      scout_email,
      voice_notes,
      referral_code,
      latitude,
      longitude,
      turnstile_token,
      website_url, // Honeypot field
      _form_started, // Timing field
    } = body;
    
    // Combine notes and voice notes
    const combinedNotes = [notes, voice_notes].filter(Boolean).join('\n\n---\n\n');

    // Check honeypot - if filled, it's a bot
    if (website_url) {
      await SecurityLogger.logHoneypot(ip, '/api/scout/submit');
      // Return success to confuse bots
      return NextResponse.json({ success: true, id: 'fake-id' });
    }
    
    // Check form timing - if submitted too fast (< 3 seconds), likely a bot
    if (isFormSubmittedTooFast(_form_started, 3)) {
      await SecurityLogger.log('suspicious_activity', 'medium', ip, undefined, {
        endpoint: '/api/scout/submit',
        reason: 'Form submitted too quickly',
        elapsed_ms: _form_started ? Date.now() - parseInt(_form_started) : 0,
      });
      // Return success to confuse bots
      return NextResponse.json({ success: true, id: 'fake-id' });
    }
    
    // Verify Turnstile token if configured
    if (process.env.TURNSTILE_SECRET_KEY && turnstile_token) {
      const isValid = await verifyTurnstileToken(turnstile_token);
      if (!isValid) {
        await SecurityLogger.log('invalid_token', 'high', ip, undefined, {
          endpoint: '/api/scout/submit',
          reason: 'Invalid Turnstile token',
        });
        return NextResponse.json(
          { error: 'Security verification failed' },
          { status: 403 }
        );
      }
    }

    // Validate required fields
    if (!property_address || property_address.length < 5) {
      return NextResponse.json(
        { error: 'Property address is required' },
        { status: 400 }
      );
    }

    const supabase = getServiceClient();

    // Look up organization from referral code if provided
    let organizationId: string | null = null;
    
    if (referral_code) {
      const { data: referralData } = await supabase
        .from('referral_codes')
        .select('organization_id')
        .eq('code', referral_code)
        .eq('is_active', true)
        .single();

      if (referralData) {
        organizationId = referralData.organization_id;
        
        // Increment leads count for the referral code
        await supabase
          .from('referral_codes')
          .update({ leads_count: supabase.rpc('increment_referral_leads', { code: referral_code }) })
          .eq('code', referral_code);
      }
    }

    // Insert the scout lead
    const { data, error } = await supabase
      .from('scout_leads')
      .insert({
        property_address,
        city: city || null,
        state: state || null,
        zip_code: zip_code || null,
        property_type: property_type || 'single_family',
        condition: condition || 'unknown',
        notes: combinedNotes || null,
        photos: photos || [],
        scout_name: scout_name || null,
        scout_phone: scout_phone || null,
        scout_email: scout_email || null,
        referral_code: referral_code || null,
        organization_id: organizationId,
        latitude: latitude || null,
        longitude: longitude || null,
        status: 'new',
      })
      .select()
      .single();

    if (error) {
      console.error('Database error:', error);
      
      // If scout_leads table doesn't exist yet, insert into deals as a fallback
      if (error.code === '42P01') {
        // Table doesn't exist, create a lead in deals table instead
        const { data: dealData, error: dealError } = await supabase
          .from('deals')
          .insert({
            property_address,
            city: city || null,
            state: state || null,
            zip_code: zip_code || null,
            property_type: property_type || 'single_family',
            notes: combinedNotes ? `[SCOUT LEAD]\nCondition: ${condition}\nScout: ${scout_name || 'Anonymous'}\n${scout_phone ? `Phone: ${scout_phone}` : ''}\n${scout_email ? `Email: ${scout_email}` : ''}\n\n${combinedNotes}` : `[SCOUT LEAD] - Submitted via scout form`,
            status: 'new',
            priority: 'medium',
          })
          .select()
          .single();

        if (dealError) {
          console.error('Fallback to deals table failed:', dealError);
          return NextResponse.json(
            { error: 'Failed to submit lead' },
            { status: 500 }
          );
        }

        return NextResponse.json({
          success: true,
          message: 'Lead submitted successfully',
          id: dealData.id,
          type: 'deal',
        });
      }
      
      return NextResponse.json(
        { error: 'Failed to submit lead' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Lead submitted successfully',
      id: data.id,
      type: 'scout_lead',
    });
  } catch (error) {
    console.error('Scout submit error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Health check
export async function GET() {
  return NextResponse.json({
    status: 'ok',
    endpoint: 'scout/submit',
    description: 'Public endpoint for bird dog / scout lead submissions',
  });
}
