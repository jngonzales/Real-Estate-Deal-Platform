import Link from "next/link";
import { PublicHeading, PublicPage } from "@/components/layout/public-page";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <PublicPage>
      <section className="max-w-xl space-y-4">
        <PublicHeading>Page not found</PublicHeading>
        <p className="text-muted-foreground">Check the address or return to LotMerit home.</p>
        <Button asChild className="min-h-11">
          <Link href="/">Go to home</Link>
        </Button>
      </section>
    </PublicPage>
  );
}
