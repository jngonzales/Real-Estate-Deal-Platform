import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import {
  isDocuSignConfigured,
  createOfferEnvelope,
  getMockEnvelopeResponse,
} from "@/lib/integrations/docusign";
import { formatDealNumber } from "@/lib/utils/deal-number";

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

    // Check user role (only admin/underwriter can send for signature)
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    if (!profile || !["admin", "underwriter"].includes(profile.role)) {
      return NextResponse.json(
        { error: "Access denied. Only admins and underwriters can send documents for signature." },
        { status: 403 }
      );
    }

    const body = await request.json();
    const {
      dealId,
      dealNumber,
      propertyAddress,
      offerPrice,
      sellerName,
      sellerEmail,
      buyerName,
      buyerEmail,
      pdfDocument, // Base64 encoded PDF
      ccEmails,
    } = body;

    // Validate required fields
    if (!dealId || !propertyAddress || !offerPrice || !sellerName || !sellerEmail || !buyerName || !buyerEmail || !pdfDocument) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const formattedDealNumber = dealNumber ? formatDealNumber(dealNumber) : `DEAL-${dealId.slice(0, 8).toUpperCase()}`;

    // Check if DocuSign is configured
    if (!isDocuSignConfigured()) {
      // Return mock data for development
      console.log("DocuSign not configured, returning mock data");
      const mockData = getMockEnvelopeResponse(formattedDealNumber);
      
      // Update deal with mock envelope ID
      await supabase
        .from("deals")
        .update({
          docusign_envelope_id: mockData.envelopeId,
          status: "offer_sent",
          updated_at: new Date().toISOString(),
        })
        .eq("id", dealId);

      return NextResponse.json({
        success: true,
        data: mockData,
        isMock: true,
        message: "DocuSign not configured. Mock envelope created.",
      });
    }

    // Send for signature via DocuSign
    const { data, error } = await createOfferEnvelope({
      dealNumber: formattedDealNumber,
      propertyAddress,
      offerPrice,
      sellerName,
      sellerEmail,
      buyerName,
      buyerEmail,
      pdfDocument,
      ccEmails,
    });

    if (error) {
      return NextResponse.json(
        { error, success: false },
        { status: 500 }
      );
    }

    // Update deal with envelope ID and status
    await supabase
      .from("deals")
      .update({
        docusign_envelope_id: data?.envelopeId,
        status: "offer_sent",
        updated_at: new Date().toISOString(),
      })
      .eq("id", dealId);

    return NextResponse.json({
      success: true,
      data,
      isMock: false,
    });
  } catch (error) {
    console.error("DocuSign API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
