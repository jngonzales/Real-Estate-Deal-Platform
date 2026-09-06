"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowLeft } from "@/components/ui/icons";
import { Button } from "@/components/ui/button";
import { BrandMark } from "@/components/brand";
import { createClient } from "@/utils/supabase/client";
import type { User } from "@supabase/supabase-js";
import { cn } from "@/lib/utils";

const focusClass = "transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring focus-visible:ring-0";

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
   * Shows account links instead of a tool-specific CTA.
   */
  variant?: "default" | "marketing";
}

/**
 * Calculator navigation and account actions.
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
    <header className="sticky top-0 z-50 border-b border-border bg-background">
      <nav aria-label="Calculator navigation" className="mx-auto flex min-h-16 max-w-7xl items-center justify-between gap-1 px-4 sm:gap-3 sm:px-6 lg:px-8">
        <div className="flex shrink-0 items-center gap-1 sm:gap-3">
          {backHref && (
            <Button variant="ghost" size="icon" className={focusClass + " size-11 text-muted-foreground hover:text-foreground"} asChild>
              <Link href={backHref} aria-label="Back to calculators">
                <ArrowLeft aria-hidden="true" className="h-5 w-5" />
              </Link>
            </Button>
          )}
          <Link href="/" aria-label="LotMerit home" className="inline-flex min-h-11 items-center rounded-lg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring">
            <BrandMark className={backHref ? "[&>span:last-child]:max-[350px]:hidden" : undefined} />
          </Link>
        </div>

        <div className="flex items-center gap-1 sm:gap-3">
          {loading ? (
            <span role="status" className="h-9 w-24 rounded-lg bg-muted motion-safe:animate-pulse">
              <span className="sr-only">Loading account</span>
            </span>
          ) : user ? (
            <Button className={focusClass + " min-h-11 rounded-lg"} asChild>
              <Link href="/dashboard">Dashboard</Link>
            </Button>
          ) : variant === "marketing" ? (
            <>
              <Button variant="ghost" className={focusClass + " min-h-11 px-2 text-muted-foreground hover:text-foreground sm:px-4"} asChild>
                <Link href="/login">Log in</Link>
              </Button>
              <Button className={focusClass + " min-h-11 rounded-lg px-2 sm:px-4"} asChild>
                <Link href="/login">Start free</Link>
              </Button>
            </>
          ) : (
            <Button className={focusClass + " min-h-11 rounded-lg px-3 sm:px-4"} asChild>
              <Link href={ctaHref}>{ctaLabel}</Link>
            </Button>
          )}
        </div>
      </nav>
    </header>
  );
}

export { cn };
