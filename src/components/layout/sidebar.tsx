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
  ShieldCheck,
  Calculator,
  Home,
  TrendingUp,
  Hammer,
  UserCircle,
  Sparkles,
  Building2,
  User,
  MapPin,
} from "lucide-react";
import { useEffect, useState } from "react";

type UserRole = "agent" | "underwriter" | "admin" | "investor";

interface OrganizationInfo {
  name: string;
  accountType: "solo" | "team" | null;
}

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
    title: "Formula Builder",
    href: "/dashboard/analysis/formula",
    icon: Calculator,
    roles: ["agent", "underwriter", "admin"] as UserRole[],
    indent: true,
  },
  {
    title: "Property Lookup",
    href: "/dashboard/analysis/property",
    icon: MapPin,
    roles: ["agent", "underwriter", "admin"] as UserRole[],
    indent: true,
  },
  {
    title: "My Formulas",
    href: "/dashboard/formulas",
    icon: Sparkles,
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
  // Team & Analytics
  {
    title: "Team",
    href: "/dashboard/team",
    icon: Users,
    roles: ["admin"] as UserRole[],
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
  {
    title: "Usage & Billing",
    href: "/dashboard/usage",
    icon: Wallet,
    roles: ["agent", "underwriter", "admin", "investor"] as UserRole[],
  },
];

interface NavItem {
  title: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  roles: UserRole[];
  badge?: string;
  indent?: boolean;
}

export function Sidebar() {
  const pathname = usePathname();
  const [userRole, setUserRole] = useState<UserRole | null>(null);
  const [orgInfo, setOrgInfo] = useState<OrganizationInfo | null>(null);

  useEffect(() => {
    // Fetch user role on mount
    fetch("/api/user/role")
      .then(res => res.json())
      .then(data => {
        if (data.role) {
          setUserRole(data.role);
        } else {
          setUserRole("agent");
        }
      })
      .catch(() => setUserRole("agent"));

    // Fetch organization info
    fetch("/api/user/organization")
      .then(res => res.json())
      .then(data => {
        if (data.name) {
          setOrgInfo({
            name: data.name,
            accountType: data.accountType,
          });
        }
      })
      .catch(() => {});
  }, []);

  // Show consistent skeleton during loading to prevent hydration mismatch
  const navItems = userRole 
    ? (baseNavItems as NavItem[]).filter(item => item.roles.includes(userRole))
    : [];

  return (
    <aside className="hidden md:flex h-screen w-64 flex-col border-r border-border bg-sidebar">
      {/* Decorative gradient orbs */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute -top-24 -left-24 w-48 h-48 bg-primary/20 rounded-full blur-3xl" />
        <div className="absolute top-1/2 -left-12 w-32 h-32 bg-purple-500/10 rounded-full blur-2xl" />
      </div>
      
      {/* Logo */}
      <div className="relative flex h-16 items-center border-b border-border px-6">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-purple-600 shadow-lg shadow-primary/25">
            <Sparkles className="h-5 w-5 text-white" />
          </div>
          <div>
            <span className="font-bold text-foreground text-lg tracking-tight">DealFlow</span>
            <span className="text-[10px] text-muted-foreground block -mt-0.5">Deal Analysis Platform</span>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="relative flex-1 space-y-1 p-4 overflow-y-auto">
        {navItems.map((item) => {
          const isActive =
            pathname === item.href ||
            (item.href !== "/dashboard" && pathname.startsWith(item.href));

          return (
            <Link
              key={item.href + item.title}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200",
                item.indent && "ml-4 pl-3",
                isActive
                  ? "bg-primary/10 text-foreground border border-primary/30 shadow-lg shadow-primary/10"
                  : "text-muted-foreground hover:text-foreground hover:bg-accent"
              )}
            >
              <item.icon className={cn(
                "h-4 w-4 transition-colors",
                item.indent && "h-3.5 w-3.5",
                isActive ? "text-primary" : "text-muted-foreground"
              )} />
              <span className="flex-1">{item.title}</span>
              {item.badge && (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-gradient-to-r from-primary to-purple-500 text-white shadow-sm">
                  {item.badge}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Organization & Role badge */}
      <div className="relative border-t border-border p-4">
        {/* Organization info */}
        {orgInfo && (
          <div className="flex items-center gap-2 mb-3 pb-3 border-b border-border/50">
            {orgInfo.accountType === "team" ? (
              <Building2 className="h-4 w-4 text-muted-foreground" />
            ) : (
              <User className="h-4 w-4 text-muted-foreground" />
            )}
            <span className="text-xs text-muted-foreground truncate">
              {orgInfo.accountType === "solo" ? "Personal Workspace" : orgInfo.name}
            </span>
          </div>
        )}
        
        {/* Role badge */}
        <div className="flex items-center gap-2 mb-2">
          <ShieldCheck className="h-4 w-4 text-muted-foreground" />
          <span className={cn(
            "text-xs font-semibold px-2.5 py-1 rounded-full capitalize",
            userRole === "admin" && "bg-purple-500/20 text-purple-600 dark:text-purple-300 border border-purple-500/30",
            userRole === "underwriter" && "bg-blue-500/20 text-blue-600 dark:text-blue-300 border border-blue-500/30",
            userRole === "agent" && "bg-green-500/20 text-green-600 dark:text-green-300 border border-green-500/30",
            userRole === "investor" && "bg-emerald-500/20 text-emerald-600 dark:text-emerald-300 border border-emerald-500/30",
            !userRole && "bg-muted text-muted-foreground"
          )}>
            {userRole || "Loading..."}
          </span>
        </div>
        <p className="text-xs text-muted-foreground">© 2026 DealFlow</p>
      </div>
    </aside>
  );
}
