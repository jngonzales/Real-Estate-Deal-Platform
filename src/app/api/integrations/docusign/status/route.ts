import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import {
  isDocuSignConfigured,
  getEnvelopeStatus,
  getMockEnvelopeStatus,
  mapDocuSignStatusToDealStatus,
} from "@/lib/integrations/docusign";

export async function GET(request: NextRequest) {
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

    const { searchParams } = new URL(request.url);
    const envelopeId = searchParams.get("envelopeId");
    const dealId = searchParams.get("dealId");

    if (!envelopeId) {
      return NextResponse.json(
        { error: "Missing envelopeId parameter" },
        { status: 400 }
      );
    }

    // Check if DocuSign is configured
    if (!isDocuSignConfigured()) {
      // Return mock data for development
      console.log("DocuSign not configured, returning mock status");
      const mockData = getMockEnvelopeStatus(envelopeId);
      return NextResponse.json({
        success: true,
        data: mockData,
        isMock: true,
        message: "DocuSign not configured. Returning mock status.",
      });
    }

    // Get envelope status from DocuSign
    const { data, error } = await getEnvelopeStatus(envelopeId);

    if (error) {
      return NextResponse.json(
        { error, success: false },
        { status: 500 }
      );
    }

    // Update deal status based on DocuSign status
    if (data && dealId) {
      const newDealStatus = mapDocuSignStatusToDealStatus(data.status);
      
      if (newDealStatus) {
        await supabase
          .from("deals")
          .update({
            status: newDealStatus,
            updated_at: new Date().toISOString(),
          })
          .eq("id", dealId);
      }
    }

    return NextResponse.json({
      success: true,
      data,
      isMock: false,
    });
  } catch (error) {
    console.error("DocuSign status API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
