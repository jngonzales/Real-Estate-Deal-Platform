"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger, SheetClose } from "@/components/ui/sheet";
import {
  LayoutDashboard,
  PlusCircle,
  FileText,
  Settings,
  Menu,
  Users,
  BarChart3,
  ClipboardList,
  ShieldCheck,
  Wallet,
  DollarSign,
  Calculator,
  Home,
  TrendingUp,
  Hammer,
  UserCircle,
  Sparkles,
} from "lucide-react";

type UserRole = "agent" | "underwriter" | "admin" | "investor";

const baseNavItems = [
  {
    title: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
    roles: ["agent", "underwriter", "admin"] as UserRole[],
  },
  // Analysis Hub - NEW PRIMARY SECTION
  {
    title: "Analysis Hub",
    href: "/dashboard/analysis",
    icon: Calculator,
    roles: ["agent", "underwriter", "admin"] as UserRole[],
    badge: "NEW",
  },
  {
    title: "ARV Calculator",
    href: "/dashboard/analysis/arv",
    icon: Home,
    roles: ["agent", "underwriter", "admin"] as UserRole[],
    indent: true,
  },
  {
    title: "Repair Estimator",
    href: "/dashboard/analysis/repairs",
    icon: Hammer,
    roles: ["agent", "underwriter", "admin"] as UserRole[],
    indent: true,
  },
  {
    title: "ROI Calculator",
    href: "/dashboard/analysis/roi",
    icon: TrendingUp,
    roles: ["agent", "underwriter", "admin"] as UserRole[],
    indent: true,
  },
  {
    title: "MAO Calculator",
    href: "/dashboard/analysis/mao",
    icon: DollarSign,
    roles: ["agent", "underwriter", "admin"] as UserRole[],
    indent: true,
  },
  // Deal Workflow
  {
    title: "Submit Deal",
    href: "/dashboard/submit",
    icon: PlusCircle,
    roles: ["agent", "underwriter", "admin"] as UserRole[],
  },
  {
    title: "My Deals",
    href: "/dashboard/deals",
    icon: FileText,
    roles: ["agent"] as UserRole[],
  },
  {
    title: "All Deals",
    href: "/dashboard/deals",
    icon: FileText,
    roles: ["underwriter", "admin"] as UserRole[],
  },
  // Contacts/CRM
  {
    title: "Contacts",
    href: "/dashboard/contacts",
    icon: UserCircle,
    roles: ["agent", "underwriter", "admin"] as UserRole[],
  },
  // Investor Portal
  {
    title: "Investor Portal",
    href: "/dashboard/investor",
    icon: Wallet,
    roles: ["investor"] as UserRole[],
  },
  // Analytics & Admin
  {
    title: "Analytics",
    href: "/dashboard/analytics",
    icon: BarChart3,
    roles: ["underwriter", "admin"] as UserRole[],
  },
  {
    title: "Funding Requests",
    href: "/dashboard/admin/funding",
    icon: DollarSign,
    roles: ["admin", "underwriter"] as UserRole[],
  },
  {
    title: "User Management",
    href: "/dashboard/admin/users",
    icon: Users,
    roles: ["admin"] as UserRole[],
  },
  {
    title: "Audit Logs",
    href: "/dashboard/admin/audit-logs",
    icon: ClipboardList,
    roles: ["admin"] as UserRole[],
  },
  {
    title: "Settings",
    href: "/dashboard/settings",
    icon: Settings,
    roles: ["agent", "underwriter", "admin", "investor"] as UserRole[],
  },
];

export function MobileSidebar() {
  const pathname = usePathname();
  const [userRole, setUserRole] = useState<UserRole>("agent");
  const [open, setOpen] = useState(false);

  useEffect(() => {
    fetch("/api/user/role")
      .then(res => res.json())
      .then(data => {
        if (data.role) {
          setUserRole(data.role);
        }
      })
      .catch(console.error);
  }, []);

  const navItems = baseNavItems.filter(item => item.roles.includes(userRole));

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="md:hidden text-foreground hover:bg-accent">
          <Menu className="h-5 w-5" />
          <span className="sr-only">Toggle menu</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-72 p-0 bg-sidebar border-sidebar-border dark:bg-gradient-to-b dark:from-slate-900 dark:via-slate-900 dark:to-slate-950">
        {/* Decorative gradient orbs */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
          <div className="absolute -top-24 -left-24 w-48 h-48 bg-primary/20 rounded-full blur-3xl" />
          <div className="absolute top-1/2 -left-12 w-32 h-32 bg-purple-500/10 rounded-full blur-2xl" />
        </div>
        
        {/* Logo */}
        <div className="relative flex h-16 items-center border-b border-sidebar-border px-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-purple-600 shadow-lg shadow-primary/25">
              <Sparkles className="h-5 w-5 text-white" />
            </div>
            <div>
              <span className="font-bold text-sidebar-foreground text-lg tracking-tight">DealFlow</span>
              <span className="text-[10px] text-sidebar-foreground/60 block -mt-0.5">Deal Analysis Platform</span>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="relative flex-1 space-y-1 p-4 overflow-y-auto max-h-[calc(100vh-180px)]">
          {navItems.map((item) => {
            const isActive =
              pathname === item.href ||
              (item.href !== "/dashboard" && pathname.startsWith(item.href));

            return (
              <SheetClose asChild key={item.href + item.title}>
                <Link
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200",
                    item.indent && "ml-4 pl-3",
                    isActive
                      ? "bg-gradient-to-r from-primary/20 to-purple-500/10 text-sidebar-foreground border border-primary/30"
                      : "text-sidebar-foreground/60 hover:text-sidebar-foreground hover:bg-sidebar-accent"
                  )}
                >
                  <item.icon className={cn(
                    "h-5 w-5 transition-colors",
                    item.indent && "h-4 w-4",
                    isActive ? "text-primary" : "text-sidebar-foreground/50"
                  )} />
                  <span className="flex-1">{item.title}</span>
                  {item.badge && (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-gradient-to-r from-primary to-purple-500 text-white">
                      {item.badge}
                    </span>
                  )}
                </Link>
              </SheetClose>
            );
          })}
        </nav>

        {/* Role badge */}
        <div className="relative border-t border-sidebar-border p-4">
          <div className="flex items-center gap-2 mb-2">
            <ShieldCheck className="h-4 w-4 text-sidebar-foreground/50" />
            <span className={cn(
              "text-xs font-semibold px-2.5 py-1 rounded-full capitalize",
              userRole === "admin" && "bg-purple-500/20 text-purple-600 dark:text-purple-300 border border-purple-500/30",
              userRole === "underwriter" && "bg-blue-500/20 text-blue-600 dark:text-blue-300 border border-blue-500/30",
              userRole === "agent" && "bg-green-500/20 text-green-600 dark:text-green-300 border border-green-500/30"
            )}>
              {userRole}
            </span>
          </div>
          <p className="text-xs text-sidebar-foreground/50">© 2026 DealFlow</p>
        </div>
      </SheetContent>
    </Sheet>
  );
}
