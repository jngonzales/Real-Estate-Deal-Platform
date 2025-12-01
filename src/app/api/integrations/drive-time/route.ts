import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import {
  isGoogleMapsConfigured,
  calculateDriveTime,
  getMockDriveTimeResult,
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
    const { origin, destination } = body;

    if (!origin || !destination) {
      return NextResponse.json(
        { error: "Missing required fields: origin, destination" },
        { status: 400 }
      );
    }

    // Check if Google Maps is configured
    if (!isGoogleMapsConfigured()) {
      // Return mock data for development
      console.log("Google Maps not configured, returning mock data");
      const mockData = getMockDriveTimeResult(origin, destination);
      return NextResponse.json({
        success: true,
        data: mockData,
        isMock: true,
        message: "Google Maps API not configured. Returning sample data.",
      });
    }

    // Calculate drive time with Google Maps
    const { data, error } = await calculateDriveTime(origin, destination);

    if (error) {
      return NextResponse.json(
        { error, success: false },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      data,
      isMock: false,
    });
  } catch (error) {
    console.error("Drive time API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
