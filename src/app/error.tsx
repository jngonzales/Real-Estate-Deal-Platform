"use client";

import Link from "next/link";
import { PublicHeading, PublicPage } from "@/components/layout/public-page";
import { Button } from "@/components/ui/button";

export default function PageError({ reset }: { reset: () => void }) {
  return (
    <PublicPage>
      <section className="max-w-xl space-y-4">
        <PublicHeading>This page could not load</PublicHeading>
        <p className="text-muted-foreground">Try loading the page again or return to LotMerit home.</p>
        <div className="flex flex-wrap gap-2">
          <Button type="button" className="min-h-11" onClick={reset}>Try again</Button>
          <Button asChild variant="outline" className="min-h-11">
            <Link href="/">Go to home</Link>
          </Button>
        </div>
      </section>
    </PublicPage>
  );
}
