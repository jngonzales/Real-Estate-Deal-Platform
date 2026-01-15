import { NextResponse } from 'next/server';

// DocuSign integration status check
export async function GET() {
  try {
    const DOCUSIGN_API_KEY = process.env.DOCUSIGN_INTEGRATION_KEY;
    
    if (!DOCUSIGN_API_KEY) {
      return NextResponse.json(
        { 
          status: 'warning', 
          message: 'DocuSign API key not configured',
          timestamp: new Date().toISOString()
        },
        { status: 200 }
      );
    }

    return NextResponse.json({
      status: 'healthy',
      message: 'DocuSign integration configured',
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
