import { NextRequest, NextResponse } from "next/server";
import { renderToBuffer } from "@react-pdf/renderer";
import { DealAnalysisReport, DealReportData } from "@/components/pdf/deal-analysis-report";
import React from "react";

export async function POST(request: NextRequest) {
  try {
    const data: DealReportData = await request.json();

    // Validate required fields
    if (!data.property?.address || !data.financials?.askingPrice) {
      return NextResponse.json(
        { error: "Missing required deal data" },
        { status: 400 }
      );
    }

    // Calculate deal score if not provided
    if (!data.dealScore) {
      const roi = data.financials.roi || 0;
      if (roi >= 25) {
        data.dealScore = "Great";
      } else if (roi >= 15) {
        data.dealScore = "Good";
      } else if (roi >= 5) {
        data.dealScore = "Marginal";
      } else {
        data.dealScore = "Pass";
      }
    }

    // Set generated date if not provided
    if (!data.generatedAt) {
      data.generatedAt = new Date().toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    }

    // Generate PDF - use type assertion for react-pdf compatibility
    const pdfElement = React.createElement(DealAnalysisReport, { data });
    const pdfBuffer = await renderToBuffer(
      pdfElement as Parameters<typeof renderToBuffer>[0]
    );

    // Convert Buffer to Uint8Array for NextResponse
    const uint8Array = new Uint8Array(pdfBuffer);

    // Return PDF as response
    return new NextResponse(uint8Array, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="deal-analysis-${data.property.address.replace(/[^a-zA-Z0-9]/g, "-")}.pdf"`,
      },
    });
  } catch (error) {
    console.error("Error generating PDF:", error);
    return NextResponse.json(
      { error: "Failed to generate PDF report" },
      { status: 500 }
    );
  }
}
