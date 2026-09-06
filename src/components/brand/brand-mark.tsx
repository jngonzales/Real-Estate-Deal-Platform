import { cn } from "@/lib/utils";

interface BrandMarkProps {
  className?: string;
  /**
   * Toggles the wordmark next to the glyph. Default true.
   */
  withWordmark?: boolean;
  /**
   * "solid" uses the primary tile. "ghost" uses the mark on a quiet card surface.
   */
  variant?: "solid" | "ghost";
}

const markMask = "url('/brand/lotmerit-mark.png') center / contain no-repeat";

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
        <span
          className={cn("h-5 w-5 shrink-0", variant === "solid" ? "bg-primary-foreground" : "bg-primary")}
          style={{ mask: markMask, WebkitMask: markMask }}
        />
      </span>
      {withWordmark && (
        <span className="text-xl font-bold tracking-tight text-foreground">LotMerit</span>
      )}
    </span>
  );
}
