import { createClient } from "@/utils/supabase/server";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get user's profile with organization
    const { data: profile } = await supabase
      .from("profiles")
      .select("organization_id")
      .eq("id", user.id)
      .single();

    if (!profile?.organization_id) {
      return NextResponse.json({ name: null, accountType: null });
    }

    // Get organization details
    const { data: org } = await supabase
      .from("organizations")
      .select("name, settings")
      .eq("id", profile.organization_id)
      .single();

    if (!org) {
      return NextResponse.json({ name: null, accountType: null });
    }

    const settings = org.settings as { account_type?: string } | null;

    return NextResponse.json({
      name: org.name,
      accountType: settings?.account_type || null,
    });
  } catch (error) {
    console.error("Error fetching organization:", error);
    return NextResponse.json({ error: "Failed to fetch organization" }, { status: 500 });
  }
}
