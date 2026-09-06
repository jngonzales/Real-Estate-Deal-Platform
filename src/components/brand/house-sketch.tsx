import { cn } from "@/lib/utils";

/**
 * Hand-drawn house sketch in emerald ink for the landing hero.
 * Slightly wobbly lines are intentional — it should read as drawn,
 * not drafted. Decorative only, so screen readers skip it.
 */
export function HouseSketch({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 480 360"
      fill="none"
      aria-hidden="true"
      className={cn("h-auto w-full", className)}
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {/* roof */}
      <path d="M94 172 Q166 112 242 64 Q318 116 390 172" />
      {/* walls */}
      <path d="M112 174 V282" />
      <path d="M368 176 V284" />
      {/* ground */}
      <path d="M84 284 Q240 277 396 286" />
      {/* chimney */}
      <path d="M330 98 V64 H354 V122" />
      {/* door */}
      <path d="M212 282 V210 Q212 198 224 198 H248 Q260 198 260 210 V282" />
      <circle cx="250" cy="244" r="2.5" />
      {/* left window */}
      <path d="M134 206 h44 v40 h-44 z" />
      <path d="M156 206 v40 M134 226 h44" />
      {/* right window */}
      <path d="M286 206 h44 v40 h-44 z" />
      <path d="M308 206 v40 M286 226 h44" />
      {/* tree, left */}
      <path d="M52 282 V238" />
      <path d="M52 184 q24 0 26 24 q2 24 -26 24 q-28 0 -26 -24 q2 -24 26 -24" />
      {/* bushes */}
      <path d="M96 282 q4 -18 18 -16 q14 2 12 16" />
      <path d="M352 284 q2 -16 16 -15 q13 1 12 15" />
      {/* grass ticks */}
      <path d="M124 296 l-3 9 M210 298 l3 8 M302 295 l-3 8 M398 298 l3 8" />
    </svg>
  );
}
