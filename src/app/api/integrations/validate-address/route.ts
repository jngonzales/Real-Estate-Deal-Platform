import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import {
  isGoogleMapsConfigured,
  validateAddress,
  getMockGeocodingResult,
} from "@/lib/integrations/google-maps";

export async function POST(request: NextRequest) {
  try {
    // Verify authentication
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { address, city, state, zip } = body;

    if (!address || !city || !state) {
      return NextResponse.json(
        { error: "Missing required fields: address, city, state" },
        { status: 400 }
      );
    }

    // Check if Google Maps is configured
    if (!isGoogleMapsConfigured()) {
      // Return mock data for development
      console.log("Google Maps not configured, returning mock data");
      const mockData = getMockGeocodingResult(address, city, state);
      return NextResponse.json({
        success: true,
        data: mockData,
        isMock: true,
        message: "Google Maps API not configured. Returning sample data.",
      });
    }

    // Validate address with Google Maps
    const { data, error, isValid } = await validateAddress(address, city, state, zip);

    if (error && !data) {
      return NextResponse.json(
        { error, success: false, isValid: false },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      data,
      isValid,
      isMock: false,
    });
  } catch (error) {
    console.error("Google Maps API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
