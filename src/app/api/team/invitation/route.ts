import { createServiceClient } from "@/utils/supabase/server";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get("token");

    if (!token) {
      return NextResponse.json({ error: "Token is required" }, { status: 400 });
    }

    // Use service client to bypass RLS - this endpoint needs to work for unauthenticated users
    const supabase = createServiceClient();

    // Get invitation details
    const { data: invitation } = await supabase
      .from("invitations")
      .select(`
        id,
        email,
        role,
        status,
        expires_at,
        organizations (
          id,
          name
        )
      `)
      .eq("token", token)
      .eq("status", "pending")
      .gt("expires_at", new Date().toISOString())
      .single();

    if (!invitation) {
      return NextResponse.json({ error: "Invalid or expired invitation" }, { status: 404 });
    }

    const org = invitation.organizations as unknown as { id: string; name: string };

    return NextResponse.json({
      email: invitation.email,
      role: invitation.role,
      organization_id: org.id,
      organization_name: org.name,
    });
  } catch (error) {
    console.error("Error checking invitation:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
