import { createClient } from "@/utils/supabase/server";
import { SettingsClient } from "@/components/settings/settings-client";

// Prevent caching to always show fresh profile data
export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  // Get profile data
  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user?.id)
    .single();

  // Get user settings
  const { data: settings } = await supabase
    .from("user_settings")
    .select("*")
    .eq("user_id", user?.id)
    .single();

  return (
    <SettingsClient 
      profile={profile} 
      userEmail={user?.email || ""} 
      settings={settings}
    />
  );
}
