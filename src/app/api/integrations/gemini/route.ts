import { NextResponse } from 'next/server';

const GEMINI_API_KEY = process.env.GOOGLE_GEMINI_API_KEY;

export async function GET() {
  try {
    if (!GEMINI_API_KEY) {
      return NextResponse.json(
        { status: 'error', message: 'Gemini API key not configured' },
        { status: 500 }
      );
    }

    // Test Gemini API with a simple request
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models?key=${GEMINI_API_KEY}`,
      { method: 'GET' }
    );

    if (!response.ok) {
      return NextResponse.json(
        { status: 'error', message: `Gemini API returned ${response.status}` },
        { status: 500 }
      );
    }

    return NextResponse.json({
      status: 'healthy',
      message: 'Gemini AI connection successful',
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
