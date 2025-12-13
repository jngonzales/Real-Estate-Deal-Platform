import { createClient } from "@/utils/supabase/server";
import { NextResponse } from "next/server";

/**
 * Cron Job: Daily Cleanup
 * Purpose: Delete old rejected deals and archive old closed deals
 * Schedule: Daily at 2:00 AM
 * 
 * Security: Requires CRON_SECRET authorization header
 */
export async function GET(request: Request) {
  try {
    // Verify authorization
    const authHeader = request.headers.get("authorization");
    const cronSecret = process.env.CRON_SECRET;
    
    if (!cronSecret) {
      console.error("[CRON] CRON_SECRET not configured");
      return NextResponse.json(
        { error: "Cron secret not configured" },
        { status: 500 }
      );
    }

    if (authHeader !== `Bearer ${cronSecret}`) {
      console.warn("[CRON] Unauthorized cleanup attempt");
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const supabase = await createClient();
    const results = {
      timestamp: new Date().toISOString(),
      deletedRejected: 0,
      archivedClosed: 0,
      errors: [] as string[],
    };

    // 1. Delete rejected deals older than 90 days
    try {
      const ninetyDaysAgo = new Date();
      ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);

      const { data: rejectedDeals, error: deleteError } = await supabase
        .from("deals")
        .delete()
        .eq("status", "rejected")
        .lt("submitted_at", ninetyDaysAgo.toISOString())
        .select("id");

      if (deleteError) {
        throw deleteError;
      }

      results.deletedRejected = rejectedDeals?.length || 0;
      console.log(`[CRON] Deleted ${results.deletedRejected} old rejected deals`);
    } catch (error) {
      const errorMsg = `Failed to delete rejected deals: ${error}`;
      console.error("[CRON]", errorMsg);
      results.errors.push(errorMsg);
    }

    // 2. Archive closed deals older than 1 year
    try {
      const oneYearAgo = new Date();
      oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);

      const { data: closedDeals, error: archiveError } = await supabase
        .from("deals")
        .update({ archived: true })
        .eq("status", "closed")
        .lt("submitted_at", oneYearAgo.toISOString())
        .is("archived", null)
        .select("id");

      if (archiveError) {
        throw archiveError;
      }

      results.archivedClosed = closedDeals?.length || 0;
      console.log(`[CRON] Archived ${results.archivedClosed} old closed deals`);
    } catch (error) {
      const errorMsg = `Failed to archive closed deals: ${error}`;
      console.error("[CRON]", errorMsg);
      results.errors.push(errorMsg);
    }

    // Return success with summary
    return NextResponse.json({
      success: true,
      message: "Cleanup completed successfully",
      results,
    });

  } catch (error) {
    console.error("[CRON] Cleanup failed:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Internal server error",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
