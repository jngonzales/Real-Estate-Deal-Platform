import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import type { OfferPdfData } from "@/components/pdf/offer-pdf-template";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: dealId } = await params;
    const supabase = await createClient();

    // Verify user is authenticated
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Fetch deal with property
    const { data: deal, error: dealError } = await supabase
      .from("deals")
      .select("*")
      .eq("id", dealId)
      .single();

    if (dealError || !deal) {
      console.error("Deal error:", dealError);
      return NextResponse.json({ error: "Deal not found" }, { status: 404 });
    }

    // Fetch property
    const { data: property, error: propertyError } = await supabase
      .from("properties")
      .select("*")
      .eq("id", deal.property_id)
      .single();

    if (propertyError || !property) {
      console.error("Property error:", propertyError);
      return NextResponse.json({ error: "Property not found" }, { status: 404 });
    }

    // Fetch underwriting record
    const { data: underwriting } = await supabase
      .from("underwriting_records")
      .select("*")
      .eq("deal_id", dealId)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    // Fetch photos
    const { data: attachments } = await supabase
      .from("attachments")
      .select("file_url")
      .eq("deal_id", dealId)
      .eq("file_type", "image");

    // Fetch user profile for "prepared by"
    const { data: profile } = await supabase
      .from("profiles")
      .select("full_name")
      .eq("id", user.id)
      .single();

    // Dynamically import react-pdf to avoid bundling issues
    const reactPdf = await import("@react-pdf/renderer");
    const { OfferPdfTemplate } = await import("@/components/pdf/offer-pdf-template");

    // Build PDF data
    const pdfData: OfferPdfData = {
      dealId: deal.id,
      submittedDate: deal.submitted_at,
      status: deal.status,
      property: {
        address: property.address,
        city: property.city,
        state: property.state,
        zip: property.zip,
        county: property.county,
        propertyType: property.property_type,
        bedrooms: property.bedrooms,
        bathrooms: property.bathrooms,
        sqft: property.sqft,
        yearBuilt: property.year_built,
      },
      seller: {
        name: deal.seller_name,
        phone: deal.seller_phone,
        email: deal.seller_email,
        motivation: deal.seller_motivation,
      },
      askingPrice: deal.asking_price,
      companyName: "DealFlow",
      preparedBy: profile?.full_name || user.email || undefined,
    };

    // Add underwriting if exists
    if (underwriting) {
      pdfData.underwriting = {
        arv: underwriting.arv,
        repairEstimate: underwriting.repair_estimate,
        maxOffer: underwriting.max_offer,
        recommendedOffer: underwriting.recommended_offer,
        profitEstimate: underwriting.profit_estimate,
        notes: underwriting.notes,
      };
    }

    // Add photos if exist (limit to first 4 for PDF)
    if (attachments && attachments.length > 0) {
      pdfData.photos = attachments.slice(0, 4).map(a => a.file_url);
    }

    console.log("Generating PDF for deal:", dealId);

    // Generate PDF - call the template function directly to get the Document element
    const pdfDocument = OfferPdfTemplate({ data: pdfData });
    const pdfBuffer = await reactPdf.renderToBuffer(pdfDocument);

    console.log("PDF generated successfully, size:", pdfBuffer.length);

    // Convert Buffer to Uint8Array for NextResponse
    const uint8Array = new Uint8Array(pdfBuffer);

    // Return PDF as response
    return new NextResponse(uint8Array, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="offer-${property.address.replace(/\s+/g, "-").toLowerCase()}.pdf"`,
        "Content-Length": pdfBuffer.length.toString(),
      },
    });
  } catch (error) {
    console.error("Error generating PDF:", error);
    // Return more details in development
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { error: "Failed to generate PDF", details: errorMessage },
      { status: 500 }
    );
  }
}
