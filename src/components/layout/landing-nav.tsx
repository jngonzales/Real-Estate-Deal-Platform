"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import type { User } from "@supabase/supabase-js";
import { BrandMark } from "@/components/brand";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Menu } from "@/components/ui/icons";
import { createClient } from "@/utils/supabase/client";

const publicLinks = [
  { label: "Calculators", href: "/calculators" },
  { label: "Pricing", href: "/pricing" },
];

const focusClass = "focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring";
const mobileMenuTriggerId = "landing-mobile-menu-trigger";

export function LandingNav() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const supabase = createClient();

    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user);
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const accountLinks = user
    ? [{ label: "Dashboard", href: "/dashboard", primary: true }]
    : [
        { label: "Sign in", href: "/login", primary: false },
        { label: "Start free", href: "/login", primary: true },
      ];

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background">
      <nav aria-label="Main" className="mx-auto flex min-h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <Link href="/" className={`${focusClass} inline-flex min-h-11 shrink-0 items-center rounded-lg`}>
          <BrandMark />
        </Link>

        <div className="hidden items-center gap-5 sm:flex">
          {publicLinks.map((link) => (
            <Link key={link.href} href={link.href} className={`${focusClass} inline-flex min-h-11 items-center whitespace-nowrap text-sm font-medium text-muted-foreground hover:text-foreground`}>
              {link.label}
            </Link>
          ))}
          {loading ? (
            <span aria-label="Loading account" role="status" className="h-9 w-24 rounded-lg bg-muted motion-safe:animate-pulse" />
          ) : accountLinks.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              className={`${focusClass} inline-flex min-h-11 items-center whitespace-nowrap text-sm font-medium transition-colors ${link.primary
                ? "rounded-lg bg-primary px-4 text-primary-foreground hover:bg-primary/90 motion-safe:active:scale-[0.97]"
                : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {link.label}
            </Link>
          ))}
        </div>

        <div className="sm:hidden">
          <DropdownMenu>
            <DropdownMenuTrigger asChild id={mobileMenuTriggerId}>
              <button type="button" className={`${focusClass} inline-flex min-h-11 items-center gap-2 rounded-lg border border-input bg-card px-3 text-sm font-medium hover:bg-accent motion-safe:active:scale-[0.97]`}>
                <Menu aria-hidden="true" className="size-5" />
                Menu
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              aria-labelledby={mobileMenuTriggerId}
              align="end"
              sideOffset={8}
              className="w-48 rounded-lg bg-card font-sans motion-reduce:animate-none"
            >
              {(loading ? publicLinks : [...publicLinks, ...accountLinks]).map((link) => (
                <DropdownMenuItem key={link.label} asChild className="min-h-11">
                  <Link href={link.href}>{link.label}</Link>
                </DropdownMenuItem>
              ))}
              {loading && <p role="status" className="px-2 py-2 text-sm text-muted-foreground">Loading account…</p>}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </nav>
    </header>
  );
}
