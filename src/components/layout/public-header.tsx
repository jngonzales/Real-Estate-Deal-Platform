"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowLeft } from "@/components/ui/icons";
import { Button } from "@/components/ui/button";
import { BrandMark } from "@/components/brand";
import { createClient } from "@/utils/supabase/client";
import type { User } from "@supabase/supabase-js";
import { cn } from "@/lib/utils";

interface PublicHeaderProps {
  /**
   * If set, the header shows a back-arrow on the left that links here.
   * Used on individual calculator pages.
   */
  backHref?: string;
  /**
   * Right-hand CTA label. Defaults to "Save Analysis".
   */
  ctaLabel?: string;
  /**
   * Right-hand CTA destination.
   */
  ctaHref?: string;
  /**
   * If true, the right side shows "Log in" + "Get Started Free" instead
   * of the back-arrow + Save Analysis. Used on the calculators index.
   */
  variant?: "default" | "marketing";
}

/**
 * Shared header for the public marketing surface (landing, calculators
 * index, individual calculator pages, pricing). Reads auth state from
 * Supabase to swap CTA → "Dashboard" for signed-in users.
 */
export function PublicHeader({
  backHref,
  ctaLabel = "Save Analysis",
  ctaHref = "/login",
  variant = "default",
}: PublicHeaderProps) {
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

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-card/80 backdrop-blur-xl">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <div className="flex items-center gap-3">
          {backHref && (
            <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground" asChild>
              <Link href={backHref} aria-label="Back">
                <ArrowLeft className="h-5 w-5" />
              </Link>
            </Button>
          )}
          <Link href="/" aria-label="DealFlow home">
            <BrandMark />
          </Link>
        </div>

        <div className="flex items-center gap-3">
          {variant === "marketing" ? (
            <>
              <Button variant="ghost" className="text-muted-foreground hover:text-foreground" asChild>
                <Link href="/login">Log in</Link>
              </Button>
              <Button asChild>
                <Link href="/login">Get Started Free</Link>
              </Button>
            </>
          ) : loading ? (
            <div className="h-9 w-24 animate-pulse rounded-lg bg-secondary" />
          ) : user ? (
            <Button asChild>
              <Link href="/dashboard">Dashboard</Link>
            </Button>
          ) : (
            <Button asChild>
              <Link href={ctaHref}>{ctaLabel}</Link>
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}

export { cn };
