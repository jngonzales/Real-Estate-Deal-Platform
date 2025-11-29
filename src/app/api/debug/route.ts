import { createClient } from "@/utils/supabase/server";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  const supabase = await createClient();

  const { data: { user }, error: userError } = await supabase.auth.getUser();

  if (userError || !user) {
    return NextResponse.json({ 
      error: "Not authenticated",
      userError: userError?.message 
    }, { status: 401 });
  }

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  return NextResponse.json({ 
    userId: user.id,
    userEmail: user.email,
    profile,
    profileError: profileError?.message,
    roleFromProfile: profile?.role,
  });
}
