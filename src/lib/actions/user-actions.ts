"use server";

import { createClient } from "@/utils/supabase/server";

export type UserRole = "agent" | "underwriter" | "admin" | "investor";

export type UserProfile = {
  id: string;
  email: string;
  full_name: string | null;
  role: UserRole;
  phone: string | null;
  company: string | null;
  is_active?: boolean;
  created_at: string;
};

export async function getCurrentUserProfile(): Promise<{ profile: UserProfile | null; error: string | null }> {
  const supabase = await createClient();

  const { data: { user }, error: userError } = await supabase.auth.getUser();

  if (userError || !user) {
    return { profile: null, error: "Not authenticated" };
  }

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  if (profileError) {
    console.error("Error fetching profile:", profileError);
    return { profile: null, error: "Failed to fetch profile" };
  }

  return { profile: profile as UserProfile, error: null };
}

export async function getAllUsers(): Promise<{ users: UserProfile[] | null; error: string | null }> {
  const supabase = await createClient();

  const { data: { user }, error: userError } = await supabase.auth.getUser();

  if (userError || !user) {
    return { users: null, error: "Not authenticated" };
  }

  // Check if user is admin
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "admin") {
    return { users: null, error: "Unauthorized - Admin access required" };
  }

  const { data: users, error } = await supabase
    .from("profiles")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching users:", error);
    return { users: null, error: "Failed to fetch users" };
  }

  return { users: users as UserProfile[], error: null };
}

export async function updateUserRole(userId: string, role: UserRole): Promise<{ success: boolean; error: string | null }> {
  const supabase = await createClient();

  const { data: { user }, error: userError } = await supabase.auth.getUser();

  if (userError || !user) {
    return { success: false, error: "Not authenticated" };
  }

  // Check if current user is admin
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "admin") {
    return { success: false, error: "Unauthorized - Admin access required" };
  }

  // Prevent admin from demoting themselves
  if (userId === user.id && role !== "admin") {
    return { success: false, error: "You cannot change your own admin role" };
  }

  const { error } = await supabase
    .from("profiles")
    .update({ role })
    .eq("id", userId);

  if (error) {
    console.error("Error updating user role:", error);
    return { success: false, error: "Failed to update user role" };
  }

  return { success: true, error: null };
}

export async function isAdmin(): Promise<boolean> {
  const { profile } = await getCurrentUserProfile();
  return profile?.role === "admin";
}

export async function isUnderwriterOrAdmin(): Promise<boolean> {
  const { profile } = await getCurrentUserProfile();
  return profile?.role === "admin" || profile?.role === "underwriter";
}

export async function getUnderwriters(): Promise<{ underwriters: UserProfile[] | null; error: string | null }> {
  const supabase = await createClient();

  const { data: { user }, error: userError } = await supabase.auth.getUser();

  if (userError || !user) {
    return { underwriters: null, error: "Not authenticated" };
  }

  // Check if user is admin or underwriter
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (!profile || !["admin", "underwriter"].includes(profile.role)) {
    return { underwriters: null, error: "Unauthorized" };
  }

  const { data: underwriters, error } = await supabase
    .from("profiles")
    .select("*")
    .in("role", ["admin", "underwriter"])
    .order("full_name", { ascending: true });

  if (error) {
    console.error("Error fetching underwriters:", error);
    return { underwriters: null, error: "Failed to fetch underwriters" };
  }

  return { underwriters: underwriters as UserProfile[], error: null };
}
