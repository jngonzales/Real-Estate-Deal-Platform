import type { ReactNode } from "react";
import Link from "next/link";
import { BrandMark } from "@/components/brand";
import { cn } from "@/lib/utils";

export const publicFocus = "focus-visible:outline-solid focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring";
export const publicAction = cn("min-h-11 rounded-lg transition-colors motion-reduce:transition-none", publicFocus);
export const publicLink = cn("rounded-sm text-primary underline underline-offset-4", publicFocus);
export const publicField = cn("min-h-11 rounded-lg md:text-base motion-reduce:transition-none", publicFocus);

export function PublicPage({
  children,
  className,
  footer,
  links,
}: {
  children: ReactNode;
  className?: string;
  footer?: ReactNode;
  links?: readonly { href: string; label: string }[];
}) {
  return (
    <div className="min-h-screen bg-background">
      <a
        href="#page-content"
        className="sr-only z-20 rounded-lg bg-primary px-4 py-3 text-primary-foreground focus-visible:not-sr-only focus-visible:absolute focus-visible:start-4 focus-visible:top-2"
      >
        Skip to content
      </a>
      <header className="border-b border-border">
        <div className="mx-auto flex min-h-16 max-w-[75rem] flex-wrap items-center justify-between gap-x-4 px-4 sm:px-6 lg:px-8">
          <Link href="/" aria-label="LotMerit home" className={cn("inline-flex min-h-11 items-center rounded-lg", publicFocus)}>
            <BrandMark />
          </Link>
          {links && (
            <nav aria-label="Public navigation" className="flex flex-wrap gap-x-4 text-sm">
              {links.map(({ href, label }) => (
                <Link key={href} href={href} className={cn("inline-flex min-h-11 items-center rounded-sm text-muted-foreground hover:text-foreground hover:underline", publicFocus)}>
                  {label}
                </Link>
              ))}
            </nav>
          )}
        </div>
      </header>
      <main id="page-content" tabIndex={-1} className={cn("mx-auto w-full max-w-[75rem] px-4 py-8 sm:px-6 sm:py-12", publicFocus, className)}>
        {children}
      </main>
      {footer}
    </div>
  );
}

export function PublicHeading({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <h1 className={cn("text-[1.75rem] font-semibold leading-tight tracking-tight text-foreground sm:text-4xl", className)}>
      {children}
    </h1>
  );
}
