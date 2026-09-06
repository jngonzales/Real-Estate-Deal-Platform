import { createClient } from "@/utils/supabase/server";
import { NextResponse } from "next/server";

/**
 * Cron Job: Send Deal Reminders
 * Purpose: Notify agents about deals needing attention
 * Schedule: Every weekday at 10:00 AM
 * 
 * Sends reminders for:
 * - Deals in "needs_info" status for 3+ days
 * - Deals in "submitted" status for 5+ days
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
    const reminders = [];

    // Find deals needing info for 3+ days
    const threeDaysAgo = new Date();
    threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);

    const { data: needsInfoDeals, error: needsInfoError } = await supabase
      .from("deals")
      .select(`
        id,
        seller_name,
        updated_at,
        agent:profiles!deals_agent_id_fkey(id, email, full_name),
        property:properties(address, city, state)
      `)
      .eq("status", "needs_info")
      .lt("updated_at", threeDaysAgo.toISOString());

    if (needsInfoError) {
      console.error("[CRON] Error fetching needs_info deals:", needsInfoError);
    } else if (needsInfoDeals && needsInfoDeals.length > 0) {
      for (const deal of needsInfoDeals) {
        const agent = Array.isArray(deal.agent) ? deal.agent[0] : deal.agent;
        const property = Array.isArray(deal.property) ? deal.property[0] : deal.property;
        
        reminders.push({
          type: "needs_info",
          dealId: deal.id,
          agentEmail: agent?.email,
          agentName: agent?.full_name,
          propertyAddress: property?.address,
          daysWaiting: Math.floor((Date.now() - new Date(deal.updated_at).getTime()) / (1000 * 60 * 60 * 24)),
        });

        console.log(`[CRON] Reminder: Deal ${deal.id} needs info from ${agent?.full_name}`);
      }
    }

    // Find deals submitted for 5+ days without review
    const fiveDaysAgo = new Date();
    fiveDaysAgo.setDate(fiveDaysAgo.getDate() - 5);

    const { data: submittedDeals, error: submittedError } = await supabase
      .from("deals")
      .select(`
        id,
        seller_name,
        submitted_at,
        agent:profiles!deals_agent_id_fkey(id, email, full_name),
        property:properties(address, city, state)
      `)
      .eq("status", "submitted")
      .lt("submitted_at", fiveDaysAgo.toISOString());

    if (submittedError) {
      console.error("[CRON] Error fetching submitted deals:", submittedError);
    } else if (submittedDeals && submittedDeals.length > 0) {
      for (const deal of submittedDeals) {
        const agent = Array.isArray(deal.agent) ? deal.agent[0] : deal.agent;
        const property = Array.isArray(deal.property) ? deal.property[0] : deal.property;
        
        reminders.push({
          type: "pending_review",
          dealId: deal.id,
          agentEmail: agent?.email,
          agentName: agent?.full_name,
          propertyAddress: property?.address,
          daysWaiting: Math.floor((Date.now() - new Date(deal.submitted_at).getTime()) / (1000 * 60 * 60 * 24)),
        });

        console.log(`[CRON] Reminder: Deal ${deal.id} pending review for ${Math.floor((Date.now() - new Date(deal.submitted_at).getTime()) / (1000 * 60 * 60 * 24))} days`);
      }
    }

    console.log(`[CRON] Sent ${reminders.length} reminders`);

    return NextResponse.json({
      success: true,
      message: `Processed ${reminders.length} reminders`,
      reminders: reminders.map(r => ({
        type: r.type,
        dealId: r.dealId,
        daysWaiting: r.daysWaiting,
      })),
    });

  } catch (error) {
    console.error("[CRON] Send reminders failed:", error);
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
