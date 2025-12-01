import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import {
  isPropStreamConfigured,
  getARVEstimate,
  getMockARVEstimate,
} from "@/lib/integrations/propstream";

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

    // Check user role (only admin/underwriter can fetch comps)
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    if (!profile || !["admin", "underwriter"].includes(profile.role)) {
      return NextResponse.json(
        { error: "Access denied. Only admins and underwriters can fetch property data." },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { address, city, state, zip, beds, baths, sqft } = body;

    if (!address || !city || !state) {
      return NextResponse.json(
        { error: "Missing required fields: address, city, state" },
        { status: 400 }
      );
    }

    // Check if PropStream is configured
    if (!isPropStreamConfigured()) {
      // Return mock data for development
      console.log("PropStream not configured, returning mock data");
      const mockData = getMockARVEstimate(sqft || 1800, beds || 3, baths || 2);
      return NextResponse.json({
        success: true,
        data: mockData,
        isMock: true,
        message: "PropStream API not configured. Returning sample data.",
      });
    }

    // Fetch real ARV estimate from PropStream
    const { data, error } = await getARVEstimate({
      address,
      city,
      state,
      zip,
      minBeds: beds ? beds - 1 : undefined,
      maxBeds: beds ? beds + 1 : undefined,
      minBaths: baths ? baths - 1 : undefined,
      maxBaths: baths ? baths + 1 : undefined,
      minSqft: sqft ? sqft * 0.8 : undefined,
      maxSqft: sqft ? sqft * 1.2 : undefined,
    });

    if (error) {
      return NextResponse.json(
        { error, success: false },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data,
      isMock: false,
    });
  } catch (error) {
    console.error("PropStream API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
