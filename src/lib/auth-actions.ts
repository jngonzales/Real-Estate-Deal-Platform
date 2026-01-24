"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient, createServiceClient } from "@/utils/supabase/server";

async function getRedirectPath(supabase: Awaited<ReturnType<typeof createClient>>, customRedirect?: string): Promise<string> {
  // If custom redirect is provided and is a valid internal path, use it
  if (customRedirect && customRedirect.startsWith("/") && !customRedirect.startsWith("//")) {
    return customRedirect;
  }

  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) return "/dashboard";

  const { data: profile } = await supabase
    .from("profiles")
    .select("organization_id")
    .eq("id", user.id)
    .single();

  if (profile?.organization_id) {
    const { data: org } = await supabase
      .from("organizations")
      .select("settings")
      .eq("id", profile.organization_id)
      .single();

    const settings = org?.settings as { onboarding_completed?: boolean } | null;
    
    if (!settings?.onboarding_completed) {
      return "/onboarding";
    }
  }

  return "/dashboard";
}

export async function login(formData: FormData) {
  const supabase = await createClient();
  const email = formData.get("email") as string;

  const data = {
    email: email,
    password: formData.get("password") as string,
  };

  const { data: signInData, error } = await supabase.auth.signInWithPassword(data);

  if (error) {
    return { error: error.message };
  }

  // Check if user has a pending invitation and no organization
  if (signInData?.user) {
    try {
      const serviceClient = createServiceClient();
      
      // Check user's current profile
      const { data: profile } = await serviceClient
        .from("profiles")
        .select("organization_id")
        .eq("id", signInData.user.id)
        .single();

      // If user has no organization, check for pending invitations
      if (!profile?.organization_id) {
        const { data: invitation } = await serviceClient
          .from("invitations")
          .select("id, organization_id, role")
          .eq("email", email.toLowerCase())
          .eq("status", "pending")
          .gt("expires_at", new Date().toISOString())
          .order("created_at", { ascending: false })
          .limit(1)
          .single();

        if (invitation) {
          // Update profile with organization
          await serviceClient
            .from("profiles")
            .update({
              organization_id: invitation.organization_id,
              role: invitation.role,
            })
            .eq("id", signInData.user.id);

          // Mark invitation as accepted
          await serviceClient
            .from("invitations")
            .update({ status: "accepted", accepted_at: new Date().toISOString() })
            .eq("id", invitation.id);

          console.log(`User ${email} joined organization via invitation on login`);
          
          // Redirect to custom path or dashboard - skip onboarding
          revalidatePath("/", "layout");
          const customRedirect = formData.get("redirect") as string | null;
          redirect(customRedirect && customRedirect.startsWith("/") ? customRedirect : "/dashboard");
        }
      }
    } catch (e) {
      console.error("Error processing invitation on login:", e);
    }
  }

  revalidatePath("/", "layout");
  const customRedirect = formData.get("redirect") as string | null;
  const redirectPath = await getRedirectPath(supabase, customRedirect || undefined);
  redirect(redirectPath);
}

export async function signup(formData: FormData) {
  const supabase = await createClient();
  const inviteToken = formData.get("inviteToken") as string | null;
  const email = formData.get("email") as string;

  const data = {
    email: email,
    password: formData.get("password") as string,
    options: {
      data: {
        full_name: formData.get("fullName") as string,
        invite_token: inviteToken, // Store invite token in user metadata
      },
    },
  };

  const { data: signUpData, error } = await supabase.auth.signUp(data);

  if (error) {
    return { error: error.message };
  }

  // If email confirmation is disabled, user is immediately signed in
  // Process invitation immediately after signup
  if (signUpData?.user && inviteToken) {
    try {
      const serviceClient = createServiceClient();
      
      // Look up the invitation by token
      const { data: invitation } = await serviceClient
        .from("invitations")
        .select("id, organization_id, role, status, expires_at, email")
        .eq("token", inviteToken)
        .single();

      if (invitation && 
          invitation.status === "pending" && 
          new Date(invitation.expires_at) > new Date() &&
          invitation.email.toLowerCase() === email.toLowerCase()) {
        
        // Update profile with organization
        await serviceClient
          .from("profiles")
          .update({
            organization_id: invitation.organization_id,
            role: invitation.role,
          })
          .eq("id", signUpData.user.id);

        // Mark invitation as accepted
        await serviceClient
          .from("invitations")
          .update({ status: "accepted", accepted_at: new Date().toISOString() })
          .eq("id", invitation.id);

        console.log(`User ${email} joined organization via invitation`);
        
        // Redirect to custom path or dashboard - skip onboarding
        revalidatePath("/", "layout");
        const customRedirect = formData.get("redirect") as string | null;
        redirect(customRedirect && customRedirect.startsWith("/") ? customRedirect : "/dashboard");
      }
    } catch (e) {
      console.error("Error processing invitation after signup:", e);
    }
  }

  // If no invite token or processing failed, return success message
  // User might need to confirm email (if enabled) or will be redirected
  // Include redirect URL for after email confirmation
  const customRedirect = formData.get("redirect") as string | null;
  return { 
    success: true, 
    message: "Check your email for a confirmation link to complete your registration.",
    redirect: customRedirect || "/dashboard"
  };
}

export async function logout() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  revalidatePath("/", "layout");
  redirect("/login");
}
