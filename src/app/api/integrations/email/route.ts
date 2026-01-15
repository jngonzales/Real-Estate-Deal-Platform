import { NextResponse } from 'next/server';

// Email service (Resend) status check
export async function GET() {
  try {
    const RESEND_API_KEY = process.env.RESEND_API_KEY;
    
    if (!RESEND_API_KEY) {
      return NextResponse.json(
        { 
          status: 'warning', 
          message: 'Resend API key not configured',
          timestamp: new Date().toISOString()
        },
        { status: 200 }
      );
    }

    // Test Resend API connectivity
    const response = await fetch('https://api.resend.com/domains', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${RESEND_API_KEY}`,
      },
    });

    if (!response.ok) {
      return NextResponse.json(
        { 
          status: 'error', 
          message: `Resend API returned ${response.status}`,
          timestamp: new Date().toISOString()
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      status: 'healthy',
      message: 'Email service connected',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    return NextResponse.json(
      { 
        status: 'error', 
        message: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    );
  }
}
