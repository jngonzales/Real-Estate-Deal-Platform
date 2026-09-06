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
  MapPin,
} from "@/components/ui/icons";
import { useEffect, useState } from "react";
import { BrandMark } from "@/components/brand";

type UserRole = "agent" | "underwriter" | "admin" | "investor";

interface OrganizationInfo {
  name: string;
  accountType: "solo" | "team" | "enterprise" | null;
}

const planLabels = { solo: "Free plan", team: "Team plan", enterprise: "Enterprise plan" };
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
    title: "Formula builder",
    href: "/dashboard/analysis/formula",
    icon: Calculator,
    roles: ["agent", "underwriter", "admin"] as UserRole[],
    indent: true,
  },
  {
    title: "Property lookup",
    href: "/dashboard/analysis/property",
    icon: MapPin,
    roles: ["agent", "underwriter", "admin"] as UserRole[],
    indent: true,
  },
  {
    title: "My formulas",
    href: "/dashboard/formulas",
    icon: Sparkles,
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
    title: "Usage & billing",
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
    <aside className="hidden w-56 shrink-0 flex-col border-r border-border bg-sidebar md:flex lg:w-60">
      <div className="flex h-16 shrink-0 items-center border-b border-border px-5">
        <BrandMark />
      </div>

      <nav aria-label="Workspace" className="min-h-0 flex-1 space-y-0.5 overflow-y-auto p-3" aria-busy={userRole === null}>
        {navItems.map((item) => {
          const isActive =
            pathname === item.href ||
            (item.href !== "/dashboard" && pathname.startsWith(item.href + "/"));

          return (
            <Link
              key={item.href + item.title}
              href={item.href}
              aria-current={pathname === item.href ? "page" : undefined}
              className={cn(
                "flex min-h-10 items-center gap-2.5 rounded-lg px-3 text-sm font-medium transition-colors duration-150 focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-ring",
                item.indent && "ms-3",
                isActive
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:text-foreground hover:bg-accent"
              )}
            >
              <item.icon aria-hidden="true" className={cn(
                "size-4 shrink-0",
                item.indent && "h-3.5 w-3.5",
                isActive ? "text-primary" : "text-muted-foreground"
              )} />
              <span>{item.title}</span>
            </Link>
          );
        })}
      </nav>

      <div className="shrink-0 border-t border-border px-4 py-3.5">
        <div className="flex items-center gap-2.5">
          <Building2 aria-hidden="true" className="size-4 shrink-0 text-primary" />
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold [overflow-wrap:anywhere]">
              {orgInfo?.name || "LotMerit workspace"}
            </p>
            {orgInfo?.accountType && planLabels[orgInfo.accountType] && (
              <p className="text-xs text-muted-foreground">
                {planLabels[orgInfo.accountType]}
              </p>
            )}
          </div>
        </div>
        <div className="mt-2.5 flex items-center gap-2.5 text-xs text-muted-foreground">
          <ShieldCheck aria-hidden="true" className="size-4" />
          <span className="capitalize">{userRole || "Loading…"}</span>
        </div>
      </div>
    </aside>
  );
}
