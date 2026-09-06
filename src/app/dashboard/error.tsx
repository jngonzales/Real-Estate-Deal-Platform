"use client";

import Link from "next/link";
import { WorkspaceHeading } from "@/components/layout/workspace-heading";
import { Button } from "@/components/ui/button";

export default function WorkspaceError({ reset }: { reset: () => void }) {
  return (
    <div className="max-w-xl space-y-4">
      <WorkspaceHeading
        title="This page could not load"
        description="Try loading the page again or go back to your workspace."
      />
      <div className="flex flex-wrap gap-2">
        <Button type="button" className="min-h-11" onClick={reset}>Try again</Button>
        <Button asChild variant="outline" className="min-h-11">
          <Link href="/dashboard">Back to workspace</Link>
        </Button>
      </div>
    </div>
  );
}
