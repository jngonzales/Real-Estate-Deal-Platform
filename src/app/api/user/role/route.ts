import { createClient } from "@/utils/supabase/server";
import { NextResponse } from "next/server";

// Prevent caching of this route
export const dynamic = "force-dynamic";

export async function GET() {
  const supabase = await createClient();

  const { data: { user }, error: userError } = await supabase.auth.getUser();

  if (userError || !user) {
    return NextResponse.json({ role: "agent" }, { status: 200 });
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  const response = NextResponse.json({ role: profile?.role || "agent" });
  response.headers.set("Cache-Control", "no-store, max-age=0");
  return response;
}
