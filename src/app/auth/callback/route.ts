import { createClient, createServiceClient } from "@/utils/supabase/server";
import { NextResponse } from "next/server";
import { SupabaseClient } from "@supabase/supabase-js";

async function processInvitation(serviceClient: SupabaseClient, userClient: Awaited<ReturnType<typeof createClient>>, userId: string, userEmail: string, inviteToken: string): Promise<{ success: boolean; orgId?: string }> {
  // Use service client to bypass RLS for reading/updating invitations
  const { data: invitation, error: inviteError } = await serviceClient
    .from("invitations")
    .select("id, organization_id, role, status, expires_at, email")
    .eq("token", inviteToken)
    .single();

  if (inviteError || !invitation) {
    console.error("Invitation not found:", inviteError);
    return { success: false };
  }

  // Check if invitation is valid
  if (invitation.status !== "pending") {
    console.error("Invitation already used or cancelled");
    return { success: false };
  }

  if (new Date(invitation.expires_at) < new Date()) {
    console.error("Invitation expired");
    return { success: false };
  }

  // Update user's profile with organization and role (use service client to bypass RLS)
  const { error: profileError } = await serviceClient
    .from("profiles")
    .update({
      organization_id: invitation.organization_id,
      role: invitation.role,
    })
    .eq("id", userId);

  if (profileError) {
    console.error("Failed to update profile:", profileError);
    return { success: false };
  }

  // Mark invitation as accepted
  await serviceClient
    .from("invitations")
    .update({ status: "accepted" })
    .eq("id", invitation.id);

  // Clear the invite token from user metadata (use user client for auth operations)
  await userClient.auth.updateUser({
    data: { invite_token: null }
  });

  console.log(`User ${userEmail} joined organization via invitation`);
  return { success: true, orgId: invitation.organization_id };
}

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const next = requestUrl.searchParams.get("next") || "/dashboard";
  const error = requestUrl.searchParams.get("error");
  const error_description = requestUrl.searchParams.get("error_description");

  // Handle errors from Supabase
  if (error) {
    console.error("Auth callback error:", error, error_description);
    return NextResponse.redirect(
      new URL(`/login?error=${encodeURIComponent(error_description || error)}`, requestUrl.origin)
    );
  }

  if (code) {
    const supabase = await createClient();
    const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);
    
    if (exchangeError) {
      console.error("Error exchanging code for session:", exchangeError);
      return NextResponse.redirect(
        new URL(`/login?error=${encodeURIComponent(exchangeError.message)}`, requestUrl.origin)
      );
    }

    // Check if this is a password recovery flow
    // If next contains "settings", redirect to update password page
    if (next.includes("settings")) {
      return NextResponse.redirect(new URL("/auth/update-password", requestUrl.origin));
    }

    // Create service client for bypassing RLS when processing invitations
    let serviceClient: ReturnType<typeof createServiceClient> | null = null;
    try {
      serviceClient = createServiceClient();
    } catch (e) {
      console.warn("Service client not available:", e);
    }

    // Check if user has completed onboarding
    const { data: { user } } = await supabase.auth.getUser();
    
    if (user) {
      // Check if user came from an invitation (stored in metadata during signup)
      const inviteToken = user.user_metadata?.invite_token;
      
      if (inviteToken && serviceClient) {
        // Process the invitation - add user to organization
        const result = await processInvitation(serviceClient, supabase, user.id, user.email || "", inviteToken);
        
        if (result.success) {
          // Invited user joined successfully - skip onboarding, go to dashboard
          console.log("Invitation processed, redirecting to dashboard");
          return NextResponse.redirect(new URL("/dashboard", requestUrl.origin));
        }
      }

      // Also check if user has a pending invitation by email (in case token wasn't stored)
      if (serviceClient) {
        const { data: emailInvite } = await serviceClient
          .from("invitations")
          .select("id, organization_id, role")
          .eq("email", user.email)
          .eq("status", "pending")
          .gt("expires_at", new Date().toISOString())
          .order("created_at", { ascending: false })
          .limit(1)
          .single();

        if (emailInvite) {
          // User has a pending invitation by email - add them to the organization
          await serviceClient
            .from("profiles")
            .update({
              organization_id: emailInvite.organization_id,
              role: emailInvite.role,
            })
            .eq("id", user.id);

          await serviceClient
            .from("invitations")
            .update({ status: "accepted" })
            .eq("id", emailInvite.id);

          console.log("Invitation by email processed, redirecting to dashboard");
          return NextResponse.redirect(new URL("/dashboard", requestUrl.origin));
        }
      }

      const { data: profile } = await supabase
        .from("profiles")
        .select("organization_id")
        .eq("id", user.id)
        .single();

      if (profile?.organization_id) {
        // Check if onboarding is completed
        const { data: org } = await supabase
          .from("organizations")
          .select("settings")
          .eq("id", profile.organization_id)
          .single();

        const settings = org?.settings as { onboarding_completed?: boolean } | null;
        
        // If onboarding not completed, redirect to onboarding
        if (!settings?.onboarding_completed) {
          return NextResponse.redirect(new URL("/onboarding", requestUrl.origin));
        }
      } else {
        // No organization - user needs to go through onboarding
        return NextResponse.redirect(new URL("/onboarding", requestUrl.origin));
      }
    }
  }

  // Redirect to the next page or dashboard
  return NextResponse.redirect(new URL(next, requestUrl.origin));
}
