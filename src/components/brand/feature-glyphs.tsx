import { cn } from "@/lib/utils";

type GlyphProps = {
  className?: string;
};

/**
 * A real calculator grid. Twelve keys, a display bar, and a small
 * result indicator. Replaces Lucide's generic <Calculator /> on the
 * landing feature row.
 */
export function CalculatorGlyph({ className }: GlyphProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={cn("h-6 w-6", className)}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <rect x="4" y="3" width="16" height="18" rx="2" />
      <rect x="6.5" y="5.5" width="11" height="3" rx="0.5" />
      {/* keypad rows */}
      <path d="M8 12h2M12 12h2M16 12h0.01" />
      <path d="M8 15.5h2M12 15.5h2M16 15.5h0.01" />
      <path d="M8 19h2M12 19h2" />
    </svg>
  );
}

/**
 * An ascending line chart with a single data point emphasized.
 * The line is jagged (not smooth like Lucide's ChartSpline) and
 * ends at a small filled dot — distinctive, not "BarChart3".
 */
export function InsightGlyph({ className }: GlyphProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={cn("h-6 w-6", className)}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M3 3v18h18" />
      {/* the trend line */}
      <path d="M6 15l4-4 3 2 5-7" />
      {/* emphasized data point */}
      <circle cx="18" cy="6" r="1.5" fill="currentColor" stroke="none" />
    </svg>
  );
}

/**
 * A document with a folded top-right corner and an emerald check
 * inside the body. Reads as "report" but is hand-drawn and distinct
 * from Lucide's <FileDown />.
 */
export function ReportGlyph({ className }: GlyphProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={cn("h-6 w-6", className)}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M14 3H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z" />
      <path d="M14 3v6h6" />
      <path d="M9 14l2 2 4-4" />
    </svg>
  );
}

/**
 * Calculator-category glyphs for the public calculators grid.
 * Each one is a small monoline icon that hints at the underlying
 * calculation, distinct from the Lucide set used everywhere else.
 */
export function ArvGlyph({ className }: GlyphProps) {
  return (
    <svg viewBox="0 0 24 24" className={cn("h-5 w-5", className)} fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M3 21h18" />
      <path d="M5 21V11l7-6 7 6v10" />
      <path d="M10 21v-6h4v6" />
    </svg>
  );
}

export function RepairGlyph({ className }: GlyphProps) {
  return (
    <svg viewBox="0 0 24 24" className={cn("h-5 w-5", className)} fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M14.7 6.3a4 4 0 0 0-5.4 5.4L3 18l3 3 6.3-6.3a4 4 0 0 0 5.4-5.4l-2.5 2.5-2.5-2.5z" />
    </svg>
  );
}

export function RoiGlyph({ className }: GlyphProps) {
  return (
    <svg viewBox="0 0 24 24" className={cn("h-5 w-5", className)} fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M3 17l6-6 4 4 8-8" />
      <path d="M14 7h7v7" />
    </svg>
  );
}

export function MaoGlyph({ className }: GlyphProps) {
  return (
    <svg viewBox="0 0 24 24" className={cn("h-5 w-5", className)} fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="12" cy="12" r="9" />
      <circle cx="12" cy="12" r="5" />
      <circle cx="12" cy="12" r="1.2" fill="currentColor" stroke="none" />
    </svg>
  );
}

export function ExchangeGlyph({ className }: GlyphProps) {
  return (
    <svg viewBox="0 0 24 24" className={cn("h-5 w-5", className)} fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M4 7h12l-3-3" />
      <path d="M20 17H8l3 3" />
    </svg>
  );
}

export function FinancingGlyph({ className }: GlyphProps) {
  return (
    <svg viewBox="0 0 24 24" className={cn("h-5 w-5", className)} fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="3" y="6" width="18" height="13" rx="2" />
      <path d="M3 10h18" />
      <path d="M7 15h3" />
    </svg>
  );
}
