import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import { Sidebar, Topbar } from "@/components/layout";
import { PWAInstallPrompt } from "@/components/pwa/install-prompt";
import { DashboardProviders } from "@/components/providers/dashboard-providers";

// Prevent caching to always get fresh user data
export const dynamic = "force-dynamic";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  return (
    <DashboardProviders>
      <div className="flex h-screen bg-background dark:bg-slate-950">
        <Sidebar />
        <div className="flex flex-1 flex-col overflow-hidden">
          <Topbar />
          <main className="flex-1 overflow-y-auto bg-background dark:bg-slate-900/50 p-4 md:p-6">{children}</main>
        </div>
        <PWAInstallPrompt />
      </div>
    </DashboardProviders>
  );
}
