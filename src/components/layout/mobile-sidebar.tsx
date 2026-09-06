"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { BrandMark } from "@/components/brand";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger, SheetClose, SheetTitle } from "@/components/ui/sheet";
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
  {
    title: "Analysis hub",
    href: "/dashboard/analysis",
    icon: Calculator,
    roles: ["agent", "underwriter", "admin"] as UserRole[],
  },
  {
    title: "ARV calculator",
    href: "/dashboard/analysis/arv",
    icon: Home,
    roles: ["agent", "underwriter", "admin"] as UserRole[],
    indent: true,
  },
  {
    title: "Repair estimator",
    href: "/dashboard/analysis/repairs",
    icon: Hammer,
    roles: ["agent", "underwriter", "admin"] as UserRole[],
    indent: true,
  },
  {
    title: "ROI calculator",
    href: "/dashboard/analysis/roi",
    icon: TrendingUp,
    roles: ["agent", "underwriter", "admin"] as UserRole[],
    indent: true,
  },
  {
    title: "MAO calculator",
    href: "/dashboard/analysis/mao",
    icon: DollarSign,
    roles: ["agent", "underwriter", "admin"] as UserRole[],
    indent: true,
  },
  {
    title: "My comps",
    href: "/dashboard/comps",
    icon: Building2,
    roles: ["agent", "underwriter", "admin"] as UserRole[],
    indent: true,
  },
  // Deal Workflow
  {
    title: "Submit deal",
    href: "/dashboard/submit",
    icon: PlusCircle,
    roles: ["agent", "underwriter", "admin"] as UserRole[],
  },
  {
    title: "My deals",
    href: "/dashboard/deals",
    icon: FileText,
    roles: ["agent"] as UserRole[],
  },
  {
    title: "All deals",
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
    title: "Investor portal",
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
    title: "Funding requests",
    href: "/dashboard/admin/funding",
    icon: DollarSign,
    roles: ["admin", "underwriter"] as UserRole[],
  },
  {
    title: "User management",
    href: "/dashboard/admin/users",
    icon: Users,
    roles: ["admin"] as UserRole[],
  },
  {
    title: "Audit logs",
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

export function MobileSidebar({ userRole }: { userRole: UserRole }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const navItems = baseNavItems.filter(item => item.roles.includes(userRole));

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="size-11 rounded-lg text-foreground transition-colors hover:bg-accent focus-visible:outline-2 focus-visible:outline-ring md:hidden">
          <Menu aria-hidden="true" className="size-5" />
          <span className="sr-only">Open workspace navigation</span>
        </Button>
      </SheetTrigger>
      <SheetContent
        side="left"
        aria-describedby={undefined}
        className="w-72 max-w-[90%] gap-0 border-sidebar-border bg-sidebar p-0 font-sans data-[state=closed]:duration-200 data-[state=open]:duration-200 motion-reduce:animate-none [&>button]:top-2.5 [&>button]:right-2.5 [&>button]:flex [&>button]:size-11 [&>button]:items-center [&>button]:justify-center"
      >
        <SheetTitle className="sr-only">Workspace navigation</SheetTitle>
        <div className="flex h-16 shrink-0 items-center border-b border-sidebar-border px-4">
          <BrandMark />
        </div>

        <nav aria-label="Workspace" className="min-h-0 flex-1 space-y-0.5 overflow-y-auto p-3">
          {navItems.map((item) => {
            const isActive =
              pathname === item.href ||
              (item.href !== "/dashboard" && pathname.startsWith(item.href + "/"));

            return (
              <SheetClose asChild key={item.href + item.title}>
                <Link
                  href={item.href}
                  aria-current={pathname === item.href ? "page" : undefined}
                  className={cn(
                    "flex min-h-11 items-center gap-3 rounded-lg px-3 text-sm font-medium transition-colors duration-150 focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-ring",
                    item.indent && "ms-3",
                    isActive
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground hover:bg-sidebar-accent hover:text-sidebar-foreground"
                  )}
                >
                  <item.icon aria-hidden="true" className={cn(
                    "size-4 shrink-0",
                    item.indent && "h-4 w-4",
                    isActive ? "text-primary" : "text-muted-foreground"
                  )} />
                  <span>{item.title}</span>
                </Link>
              </SheetClose>
            );
          })}
        </nav>

        <div className="flex shrink-0 items-center gap-2 border-t border-sidebar-border px-4 py-3 text-sm text-muted-foreground">
          <ShieldCheck aria-hidden="true" className="size-4" />
          <span className="capitalize">{userRole}</span>
        </div>
      </SheetContent>
    </Sheet>
  );
}
