import { createClient } from "@/utils/supabase/server";
import { NextResponse } from "next/server";
import { sendInvitationEmail } from "@/lib/email";

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get user's profile and check if admin
    const { data: profile } = await supabase
      .from("profiles")
      .select("organization_id, role, full_name")
      .eq("id", user.id)
      .single();

    if (!profile?.organization_id) {
      return NextResponse.json({ error: "No organization found" }, { status: 400 });
    }

    if (profile.role !== "admin") {
      return NextResponse.json({ error: "Only admins can invite team members" }, { status: 403 });
    }

    // Get organization name
    const { data: org } = await supabase
      .from("organizations")
      .select("name")
      .eq("id", profile.organization_id)
      .single();

    const body = await request.json();
    const { email, role } = body;

    if (!email || !role) {
      return NextResponse.json({ error: "Email and role are required" }, { status: 400 });
    }

    // Check if email is already a member
    const { data: existingMember } = await supabase
      .from("profiles")
      .select("id")
      .eq("email", email.toLowerCase())
      .eq("organization_id", profile.organization_id)
      .single();

    if (existingMember) {
      return NextResponse.json({ error: "This email is already a team member" }, { status: 400 });
    }

    // Check if there's already a pending invitation
    const { data: existingInvite } = await supabase
      .from("invitations")
      .select("id")
      .eq("email", email.toLowerCase())
      .eq("organization_id", profile.organization_id)
      .eq("status", "pending")
      .single();

    if (existingInvite) {
      return NextResponse.json({ error: "An invitation has already been sent to this email" }, { status: 400 });
    }

    // Create the invitation
    const { data: invitation, error: inviteError } = await supabase
      .from("invitations")
      .insert({
        organization_id: profile.organization_id,
        email: email.toLowerCase(),
        role,
        invited_by: user.id,
      })
      .select()
      .single();

    if (inviteError) {
      console.error("Error creating invitation:", inviteError);
      return NextResponse.json({ error: "Failed to create invitation" }, { status: 500 });
    }

    // Build the invite link
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    const inviteLink = `${baseUrl}/login?invite=${invitation.token}`;

    // Send the invitation email
    const emailResult = await sendInvitationEmail({
      to: email.toLowerCase(),
      inviterName: profile.full_name || "A team member",
      organizationName: org?.name || "your team",
      role: role.charAt(0).toUpperCase() + role.slice(1), // Capitalize
      inviteLink,
    });

    if (!emailResult.success) {
      console.warn("Failed to send invitation email, but invitation was created:", emailResult.error);
      // Don't fail the request - the invitation is still created and can be copied manually
    }
    
    return NextResponse.json({
      success: true,
      emailSent: emailResult.success,
      inviteLink, // Return the link so it can be copied manually
      invitation: {
        id: invitation.id,
        email: invitation.email,
        role: invitation.role,
        token: invitation.token,
      },
    });
  } catch (error) {
    console.error("Error in invite API:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function GET() {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get user's profile
    const { data: profile } = await supabase
      .from("profiles")
      .select("organization_id, role")
      .eq("id", user.id)
      .single();

    if (!profile?.organization_id || profile.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    // Get pending invitations
    const { data: invitations } = await supabase
      .from("invitations")
      .select("*")
      .eq("organization_id", profile.organization_id)
      .eq("status", "pending")
      .order("created_at", { ascending: false });

    return NextResponse.json({ invitations: invitations || [] });
  } catch (error) {
    console.error("Error fetching invitations:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
