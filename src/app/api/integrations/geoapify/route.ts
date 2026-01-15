import { NextResponse } from 'next/server';

const GEOAPIFY_API_KEY = process.env.NEXT_PUBLIC_GEOAPIFY_KEY;

export async function GET() {
  try {
    if (!GEOAPIFY_API_KEY) {
      return NextResponse.json(
        { status: 'error', message: 'Geoapify API key not configured' },
        { status: 500 }
      );
    }

    // Test geocoding with a simple address
    const response = await fetch(
      `https://api.geoapify.com/v1/geocode/search?text=New%20York&apiKey=${GEOAPIFY_API_KEY}&limit=1`,
      { method: 'GET' }
    );

    if (!response.ok) {
      return NextResponse.json(
        { status: 'error', message: `Geoapify returned ${response.status}` },
        { status: 500 }
      );
    }

    return NextResponse.json({
      status: 'healthy',
      message: 'Geoapify connection successful',
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
