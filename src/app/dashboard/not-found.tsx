import Link from "next/link";
import { WorkspaceHeading } from "@/components/layout/workspace-heading";
import { Button } from "@/components/ui/button";

export default function WorkspaceNotFound() {
  return (
    <div className="max-w-xl space-y-4">
      <WorkspaceHeading
        title="Page not found"
        description="The page may have moved or your account may lack access."
      />
      <Button asChild className="min-h-11">
        <Link href="/dashboard">Back to workspace</Link>
      </Button>
    </div>
  );
}
