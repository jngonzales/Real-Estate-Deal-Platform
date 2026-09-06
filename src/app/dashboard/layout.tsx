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
      <div className="flex h-dvh bg-background font-sans text-foreground">
        <a
          href="#workspace-content"
          className="sr-only focus-visible:not-sr-only focus-visible:absolute focus-visible:top-2 focus-visible:start-2 focus-visible:z-50 focus-visible:rounded-md focus-visible:bg-card focus-visible:px-4 focus-visible:py-3 focus-visible:outline-2 focus-visible:outline-ring"
        >
          Skip to content
        </a>
        <Sidebar />
        <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
          <Topbar />
          <main id="workspace-content" tabIndex={-1} className="min-h-0 min-w-0 flex-1 overflow-y-auto p-4 focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-ring md:p-6">
            {children}
          </main>
        </div>
        <PWAInstallPrompt />
      </div>
    </DashboardProviders>
  );
}
