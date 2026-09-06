import { cn } from "@/lib/utils";

interface BrandMarkProps {
  className?: string;
  /**
   * Toggles the wordmark next to the glyph. Default true.
   */
  withWordmark?: boolean;
  /**
   * "solid" uses a filled emerald tile (good for nav on dark surfaces).
   * "ghost" uses just the outline glyph (good inside cards / footer).
   */
  variant?: "solid" | "ghost";
}

/**
 * DealFlow brand mark.
 *
 * A quartered compass (cross-hair circle) with a small ascending bar
 * breaking into the bottom-right quadrant. Reads as "navigate + analyze"
 * without leaning on the proptech "Building2" cliché.
 */
export function BrandMark({ className, withWordmark = true, variant = "solid" }: BrandMarkProps) {
  return (
    <span className={cn("inline-flex items-center gap-2", className)}>
      <span
        aria-hidden="true"
        className={cn(
          "inline-flex h-9 w-9 items-center justify-center rounded-lg",
          variant === "solid" ? "bg-primary" : "border border-border bg-card"
        )}
      >
        <svg
          viewBox="0 0 24 24"
          className={cn("h-5 w-5", variant === "solid" ? "text-primary-foreground" : "text-primary")}
          fill="none"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          {/* outer ring */}
          <circle cx="12" cy="12" r="9" />
          {/* cross-hair (compass) */}
          <path d="M12 3v3" />
          <path d="M12 18v3" />
          <path d="M3 12h3" />
          <path d="M18 12h3" />
          {/* ascending bar that breaks into the SE quadrant */}
          <path d="M7 17v-3" />
          <path d="M11 17v-5" />
          <path d="M15 17v-7" />
        </svg>
      </span>
      {withWordmark && (
        <span className="text-xl font-bold tracking-tight text-foreground">DealFlow</span>
      )}
    </span>
  );
}
