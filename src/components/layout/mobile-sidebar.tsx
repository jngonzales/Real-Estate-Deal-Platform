"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { BrandMark } from "@/components/brand";
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
  Building2,
} from "@/components/ui/icons";

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
  {
    title: "My Comps",
    href: "/dashboard/comps",
    icon: Building2,
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
      <SheetContent side="left" className="w-72 p-0 bg-sidebar border-sidebar-border">
        {/* Logo */}
        <div className="relative flex h-16 items-center border-b border-sidebar-border px-4">
          <BrandMark />
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
                    "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors duration-150",
                    item.indent && "ml-4 pl-3",
                    isActive
                      ? "bg-primary/10 text-primary"
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
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-primary text-primary-foreground">
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
              userRole === "admin" && "bg-primary/15 text-emerald-400 border border-primary/30",
              userRole === "underwriter" && "bg-muted text-muted-foreground border border-border",
              userRole === "agent" && "bg-muted text-muted-foreground border border-border"
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
