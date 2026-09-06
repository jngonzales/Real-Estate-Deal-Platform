import Link from "next/link";
import { BrandMark } from "@/components/brand";

/**
 * Shared footer for the public marketing surface. Matches the
 * header's neutral palette and uses the same brand mark.
 */
export function PublicFooter() {
  const year = new Date().getFullYear();
  return (
    <footer className="border-t border-border">
      <div className="container mx-auto flex flex-col items-start justify-between gap-6 px-4 py-10 sm:flex-row sm:items-center">
        <BrandMark variant="ghost" />
        <nav className="flex flex-wrap items-center gap-6 text-sm text-muted-foreground">
          <Link href="/calculators" className="transition-colors hover:text-foreground">Calculators</Link>
          <Link href="/pricing" className="transition-colors hover:text-foreground">Pricing</Link>
          <Link href="/terms" className="transition-colors hover:text-foreground">Terms</Link>
          <Link href="/privacy" className="transition-colors hover:text-foreground">Privacy</Link>
          <Link href="/login" className="transition-colors hover:text-foreground">Sign In</Link>
        </nav>
        <p className="text-sm text-muted-foreground">
          &copy; {year} LotMerit. Investment analysis for real estate teams.
        </p>
      </div>
    </footer>
  );
}
