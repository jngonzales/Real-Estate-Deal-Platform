import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { getIntegrationStatus } from "@/lib/integrations";

export async function GET() {
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

    // Check user role (only admin can see full integration status)
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    if (!profile || profile.role !== "admin") {
      return NextResponse.json(
        { error: "Access denied. Admin only." },
        { status: 403 }
      );
    }

    const status = getIntegrationStatus();

    return NextResponse.json({
      success: true,
      status,
    });
  } catch (error) {
    console.error("Integration status error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
