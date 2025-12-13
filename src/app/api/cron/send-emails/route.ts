import { NextRequest, NextResponse } from "next/server";
import { processPendingEmails } from "@/lib/actions/email-actions";

/**
 * Cron job endpoint to process pending emails
 * 
 * Set up in vercel.json:
 * {
 *   "crons": [{
 *     "path": "/api/cron/send-emails",
 *     "schedule": "0/15 * * * *"
 *   }]
 * }
 * 
 * Or use this URL with external cron services like:
 * - cron-job.org (free)
 * - EasyCron (free tier)
 * - GitHub Actions (free)
 */
export async function GET(request: NextRequest) {
  // Verify the request is from a cron job (security)
  const authHeader = request.headers.get("authorization");
  
  if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const result = await processPendingEmails();
    
    return NextResponse.json(result, {
      status: result.success ? 200 : 500,
    });
  } catch (error) {
    console.error("Cron job error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// Allow POST as well for manual triggers
export async function POST(request: NextRequest) {
  return GET(request);
}
