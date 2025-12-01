"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  PlusCircle,
  FileText,
  Settings,
  Users,
  ClipboardList,
  BarChart3,
  Wallet,
  DollarSign,
  Building2,
  ShieldCheck,
} from "lucide-react";
import { useEffect, useState } from "react";

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

export function Sidebar() {
  const pathname = usePathname();
  const [userRole, setUserRole] = useState<UserRole>("agent");

  useEffect(() => {
    // Fetch user role on mount
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
    <aside className="hidden md:flex h-screen w-64 flex-col border-r border-slate-800 bg-slate-900">
      {/* Logo */}
      <div className="flex h-16 items-center border-b border-slate-800 px-6">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-md bg-blue-600">
            <Building2 className="h-4 w-4 text-white" />
          </div>
          <span className="font-semibold text-white">DealFlow</span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 p-4">
        {navItems.map((item) => {
          const isActive =
            pathname === item.href ||
            (item.href !== "/dashboard" && pathname.startsWith(item.href));

          return (
            <Link
              key={item.href + item.title}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                isActive
                  ? "bg-blue-900/30 text-blue-400"
                  : "text-slate-400 hover:bg-slate-800 hover:text-white"
              )}
            >
              <item.icon className="h-4 w-4" />
              {item.title}
            </Link>
          );
        })}
      </nav>

      {/* Role badge */}
      <div className="border-t border-slate-800 p-4">
        <div className="flex items-center gap-2 mb-2">
          <ShieldCheck className="h-4 w-4 text-slate-400" />
          <span className={cn(
            "text-xs font-medium px-2 py-0.5 rounded-full capitalize",
            userRole === "admin" && "bg-purple-900/30 text-purple-400",
            userRole === "underwriter" && "bg-blue-900/30 text-blue-400",
            userRole === "agent" && "bg-green-900/30 text-green-400",
            userRole === "investor" && "bg-emerald-900/30 text-emerald-400"
          )}>
            {userRole}
          </span>
        </div>
        <p className="text-xs text-slate-500">© 2025 DealFlow</p>
      </div>
    </aside>
  );
}
