import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import { NotificationsPageClient } from "./notifications-page-client";

export const metadata = {
  title: "Notifications | Real Estate Deals",
  description: "View and manage your notifications",
};

export default async function NotificationsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    redirect("/login");
  }

  // Get user profile with notification preferences
  const { data: profile } = await supabase
    .from("profiles")
    .select("notification_preferences, phone")
    .eq("id", user.id)
    .single();

  // Get notifications
  const { data: notifications } = await supabase
    .from("notifications")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(50);

  const defaultPreferences = {
    email: true,
    sms: false,
    push: true,
    digest: "none" as const,
    statusChanges: true,
    newAssignments: true,
    comments: true,
    fundingUpdates: true,
  };

  return (
    <NotificationsPageClient 
      notifications={notifications || []}
      preferences={profile?.notification_preferences || defaultPreferences}
      hasPhone={!!profile?.phone}
    />
  );
}
