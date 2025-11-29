"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import {
  LayoutDashboard,
  PlusCircle,
  FileText,
  Settings,
  Building2,
  Menu,
} from "lucide-react";

const navItems = [
  {
    title: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    title: "Submit Deal",
    href: "/dashboard/submit",
    icon: PlusCircle,
  },
  {
    title: "My Deals",
    href: "/dashboard/deals",
    icon: FileText,
  },
  {
    title: "Settings",
    href: "/dashboard/settings",
    icon: Settings,
  },
];

export function MobileSidebar() {
  const pathname = usePathname();

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="md:hidden">
          <Menu className="h-5 w-5" />
          <span className="sr-only">Toggle menu</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-64 p-0 dark:bg-slate-900 dark:border-slate-800">
        {/* Logo */}
        <div className="flex h-16 items-center gap-2 border-b border-slate-200 px-6 dark:border-slate-800">
          <div className="flex h-8 w-8 items-center justify-center rounded-md bg-blue-600">
            <Building2 className="h-4 w-4 text-white" />
          </div>
          <span className="font-semibold text-slate-900 dark:text-white">DealFlow</span>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-1 p-4">
          {navItems.map((item) => {
            const isActive =
              pathname === item.href ||
              (item.href !== "/dashboard" && pathname.startsWith(item.href));

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"
                    : "text-slate-600 hover:bg-slate-50 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white"
                )}
              >
                <item.icon className="h-4 w-4" />
                {item.title}
              </Link>
            );
          })}
        </nav>
      </SheetContent>
    </Sheet>
  );
}
