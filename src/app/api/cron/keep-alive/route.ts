import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

/**
 * Free-tier keep-alive ping, invoked by the Vercel Cron defined in
 * vercel.json (every 5 days). Runs one cheap Supabase query so the
 * project never hits Supabase's 7-day inactivity pause. The GitHub
 * Actions workflow is a backup that pings this same route.
 *
 * Auth: Vercel Cron sends `Authorization: Bearer $CRON_SECRET`
 * automatically when that env var is set. If CRON_SECRET is not
 * configured the route is open, because it does nothing but read.
 */
export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET;
  if (secret) {
    const auth = request.headers.get("authorization");
    const isVercelCron = request.headers.get("x-vercel-cron") !== null;
    if (auth !== `Bearer ${secret}` && !isVercelCron) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  }

  try {
    const supabase = await createClient();
    const { error } = await supabase.from("deals").select("id").limit(1);

    if (error) {
      return NextResponse.json(
        { status: "error", source: "keep-alive", message: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      status: "healthy",
      source: "keep-alive",
      message: "Keep-alive ping reached the database",
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    return NextResponse.json(
      {
        status: "error",
        source: "keep-alive",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
