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
  Building2,
  Menu,
  Users,
  BarChart3,
  ClipboardList,
  ShieldCheck,
  Wallet,
  DollarSign,
} from "lucide-react";

type UserRole = "agent" | "underwriter" | "admin" | "investor";

const baseNavItems = [
  {
    title: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
    roles: ["agent", "underwriter", "admin"] as UserRole[],
  },
  {
    title: "Investor Portal",
    href: "/dashboard/investor",
    icon: Wallet,
    roles: ["investor"] as UserRole[],
  },
  {
    title: "Submit Deal",
    href: "/dashboard/submit",
    icon: PlusCircle,
    roles: ["agent", "admin"] as UserRole[],
  },
  {
    title: "My Deals",
    href: "/dashboard/deals",
    icon: FileText,
    roles: ["agent", "underwriter", "admin"] as UserRole[],
  },
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
        <Button variant="ghost" size="icon" className="md:hidden">
          <Menu className="h-5 w-5" />
          <span className="sr-only">Toggle menu</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-72 p-0 dark:bg-slate-900 dark:border-slate-800">
        {/* Logo */}
        <div className="flex h-16 items-center border-b border-slate-200 px-4 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-md bg-blue-600">
              <Building2 className="h-4 w-4 text-white" />
            </div>
            <span className="font-semibold text-slate-900 dark:text-white">DealFlow</span>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-1 p-4">
          {navItems.map((item) => {
            const isActive =
              pathname === item.href ||
              (item.href !== "/dashboard" && pathname.startsWith(item.href));

            return (
              <SheetClose asChild key={item.href + item.title}>
                <Link
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                    isActive
                      ? "bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"
                      : "text-slate-600 hover:bg-slate-50 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white"
                  )}
                >
                  <item.icon className="h-5 w-5" />
                  {item.title}
                </Link>
              </SheetClose>
            );
          })}
        </nav>

        {/* Role badge */}
        <div className="border-t border-slate-200 p-4 dark:border-slate-800">
          <div className="flex items-center gap-2 mb-2">
            <ShieldCheck className="h-4 w-4 text-slate-400" />
            <span className={cn(
              "text-xs font-medium px-2 py-0.5 rounded-full capitalize",
              userRole === "admin" && "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400",
              userRole === "underwriter" && "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
              userRole === "agent" && "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
            )}>
              {userRole}
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-500">© 2025 DealFlow</p>
        </div>
      </SheetContent>
    </Sheet>
  );
}
