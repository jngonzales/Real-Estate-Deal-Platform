"use client";

import { Button } from "@/components/ui/button";
import { PublicHeading, PublicPage, publicAction } from "@/components/layout/public-page";

export default function OfflinePage() {
  return (
    <PublicPage className="max-w-lg">
      <section className="rounded-lg border border-border bg-card p-4 sm:p-6">
        <PublicHeading>You&apos;re offline</PublicHeading>
        <p className="mt-3 text-muted-foreground">Check your internet connection and try again.</p>
        <Button type="button" onClick={() => window.location.reload()} className={publicAction + " mt-6"}>
          Try again
        </Button>
      </section>
    </PublicPage>
  );
}
