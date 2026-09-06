import { createClient } from "@/utils/supabase/server";
import { logout } from "@/lib/auth-actions";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { MobileSidebar } from "./mobile-sidebar";
import { LogOut, Settings, Shield, ShieldCheck, ShieldAlert, Wallet } from "@/components/ui/icons";
import Link from "next/link";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { TopbarClient } from "./topbar-client";
import { NotificationBell } from "@/components/notifications/notification-bell";
import { BrandMark } from "@/components/brand";

const roleConfig = {
  agent: {
    icon: Shield,
    color: "bg-muted text-muted-foreground dark:bg-muted dark:text-muted-foreground",
  },
  underwriter: {
    icon: ShieldCheck,
    color: "bg-muted text-muted-foreground dark:bg-muted dark:text-muted-foreground",
  },
  admin: {
    icon: ShieldAlert,
    color: "bg-muted text-muted-foreground dark:bg-muted dark:text-muted-foreground",
  },
  investor: {
    icon: Wallet,
    color: "bg-muted text-muted-foreground dark:bg-muted dark:text-muted-foreground",
  },
};

export async function Topbar() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Get user profile with role
  const { data: profile } = await supabase
    .from("profiles")
    .select("role, full_name")
    .eq("id", user?.id)
    .single();

  const role = (profile?.role || "agent") as keyof typeof roleConfig;
  const RoleIcon = roleConfig[role].icon;

  const initials = profile?.full_name
    ? profile.full_name.split(" ").map((n: string) => n[0]).join("").toUpperCase().slice(0, 2)
    : user?.email?.substring(0, 2).toUpperCase() || "U";

  return (
    <header className="flex min-h-16 shrink-0 items-center justify-between gap-1 border-b border-border bg-background px-3 sm:px-4 md:justify-end md:px-6">
      <div className="flex min-w-0 items-center gap-1 md:hidden">
        <MobileSidebar userRole={role} />
        <BrandMark className="[&>span:first-child]:size-7 [&>span:first-child]:shrink-0 [&>span:last-child]:text-base max-[25rem]:[&>span:last-child]:sr-only" />
      </div>

      <div className="flex shrink-0 items-center gap-1 sm:gap-2.5 [&>button]:min-h-11 [&>button]:min-w-11 [&>button]:focus-visible:outline-2 [&>button]:focus-visible:outline-offset-2 [&>button]:focus-visible:outline-ring">
        {/* Command Palette / Search */}
        <TopbarClient />

        {/* Role Badge */}
        <div className="hidden items-center gap-1.5 px-1.5 text-xs font-medium text-muted-foreground sm:flex">
          <RoleIcon aria-hidden="true" className="size-3" />
          <span className="capitalize">{role}</span>
        </div>

        {/* Notifications */}
        <NotificationBell />

        <ThemeToggle />
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" aria-label="Account menu" className="relative size-11 rounded-full transition-colors">
              <Avatar className="size-8">
                <AvatarFallback className="bg-muted text-muted-foreground">
                  {initials}
                </AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent aria-label="Account" align="end" className="w-56 max-w-[calc(100vw-1rem)] rounded-lg border-border shadow-sm motion-reduce:animate-none">
            <DropdownMenuLabel>
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium [overflow-wrap:anywhere]">{profile?.full_name || "Account"}</p>
                <p className="text-xs text-muted-foreground [overflow-wrap:anywhere]">{user?.email}</p>
                <div className={`mt-1 inline-flex items-center gap-1 w-fit px-2 py-0.5 rounded-full text-xs font-medium ${roleConfig[role].color}`}>
                  <RoleIcon aria-hidden="true" className="size-3" />
                  <span className="capitalize">{role}</span>
                </div>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild className="min-h-11 focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-ring">
              <Link href="/dashboard/settings" className="cursor-pointer">
                <Settings aria-hidden="true" className="size-4" />
                Settings
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <form action={logout}>
              <DropdownMenuItem asChild className="min-h-11 focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-ring">
                <button type="submit" className="w-full cursor-pointer">
                  <LogOut aria-hidden="true" className="size-4" />
                  Log out
                </button>
              </DropdownMenuItem>
            </form>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
