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
  ChevronsUpDown,
  MapPin,
} from "@/components/ui/icons";
import { useEffect, useState } from "react";
import { BrandMark } from "@/components/brand";

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
      {/* Logo */}
      <div className="relative flex h-16 items-center border-b border-border px-6">
        <BrandMark />
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
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors duration-150",
                item.indent && "ml-4 pl-3",
                isActive
                  ? "bg-primary/10 text-primary"
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
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-primary text-primary-foreground">
                  {item.badge}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Organization workspace card */}
      <div className="relative border-t border-border p-4">
        <div className="flex items-center gap-3 rounded-xl border border-border bg-card p-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-primary/25 bg-primary/10">
            <Building2 className="h-4 w-4 text-primary" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold text-foreground">
              {orgInfo?.name || "DealFlow Workspace"}
            </p>
            <p className="text-xs text-muted-foreground">
              {orgInfo?.accountType === "team" ? "Team Plan" : orgInfo?.accountType === "solo" ? "Free Plan" : "Enterprise Plan"}
            </p>
          </div>
          <ChevronsUpDown className="h-4 w-4 shrink-0 text-muted-foreground" />
        </div>
        <div className="mt-3 flex items-center gap-2">
          <ShieldCheck className="h-4 w-4 text-muted-foreground" />
          <span className={cn(
            "text-xs font-semibold px-2.5 py-0.5 rounded-full capitalize",
            userRole === "admin" && "bg-primary/15 text-emerald-400 border border-primary/30",
            userRole === "underwriter" && "bg-muted text-muted-foreground border border-border",
            userRole === "agent" && "bg-muted text-muted-foreground border border-border",
            userRole === "investor" && "bg-muted text-muted-foreground border border-border",
            !userRole && "bg-muted text-muted-foreground"
          )}>
            {userRole || "Loading..."}
          </span>
        </div>
      </div>
    </aside>
  );
}
