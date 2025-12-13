import { createClient } from "@/utils/supabase/server";
import { NextResponse } from "next/server";

/**
 * Cron Job: Weekly Pipeline Report
 * Purpose: Generate and log weekly statistics for admin review
 * Schedule: Every Monday at 9:00 AM
 * 
 * Future Enhancement: Send email report to admins
 */
export async function GET(request: Request) {
  try {
    // Verify authorization
    const authHeader = request.headers.get("authorization");
    const cronSecret = process.env.CRON_SECRET;
    
    if (!cronSecret) {
      return NextResponse.json(
        { error: "Cron secret not configured" },
        { status: 500 }
      );
    }

    if (authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const supabase = await createClient();
    
    // Calculate date range (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    // Get weekly deals
    const { data: weeklyDeals, error: dealsError } = await supabase
      .from("deals")
      .select("status, asking_price, submitted_at")
      .gte("submitted_at", sevenDaysAgo.toISOString());

    if (dealsError) {
      throw dealsError;
    }

    // Calculate statistics
    const stats = {
      period: {
        start: sevenDaysAgo.toISOString(),
        end: new Date().toISOString(),
      },
      totalDeals: weeklyDeals?.length || 0,
      totalValue: weeklyDeals?.reduce((sum, d) => sum + (d.asking_price || 0), 0) || 0,
      byStatus: weeklyDeals?.reduce((acc: Record<string, number>, d) => {
        acc[d.status] = (acc[d.status] || 0) + 1;
        return acc;
      }, {}),
      dailySubmissions: weeklyDeals?.reduce((acc: Record<string, number>, d) => {
        const date = new Date(d.submitted_at).toLocaleDateString();
        acc[date] = (acc[date] || 0) + 1;
        return acc;
      }, {}),
    };

    // Get active users count
    const { count: usersCount } = await supabase
      .from("profiles")
      .select("*", { count: "exact", head: true });

    console.log("=".repeat(60));
    console.log("📊 WEEKLY PIPELINE REPORT");
    console.log("=".repeat(60));
    console.log(`Period: ${new Date(stats.period.start).toLocaleDateString()} - ${new Date(stats.period.end).toLocaleDateString()}`);
    console.log(`Total Deals: ${stats.totalDeals}`);
    console.log(`Pipeline Value: $${stats.totalValue.toLocaleString()}`);
    console.log(`Active Users: ${usersCount}`);
    console.log("\nDeals by Status:");
    Object.entries(stats.byStatus).forEach(([status, count]) => {
      console.log(`  ${status}: ${count}`);
    });
    console.log("\nDaily Submissions:");
    Object.entries(stats.dailySubmissions).forEach(([date, count]) => {
      console.log(`  ${date}: ${count}`);
    });
    console.log("=".repeat(60));

    // TODO: Send email report using Resend or SendGrid
    // Example:
    // await sendEmail({
    //   to: "admin@realestate.com",
    //   subject: "Weekly Pipeline Report",
    //   html: generateReportHTML(stats)
    // });

    return NextResponse.json({
      success: true,
      message: "Weekly report generated",
      stats,
      activeUsers: usersCount,
    });

  } catch (error) {
    console.error("[CRON] Weekly report failed:", error);
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
