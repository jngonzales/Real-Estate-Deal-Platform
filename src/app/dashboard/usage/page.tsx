import { Metadata } from "next";
import { UsageDashboard } from "@/components/dashboard/usage-dashboard";
import { WorkspaceHeading } from "@/components/layout/workspace-heading";

export const metadata: Metadata = {
  title: "Usage & Billing | LotMerit",
  description: "View your usage stats and manage your subscription"
};

export default function UsagePage() {
  return (
    <div className="w-full min-w-0 max-w-6xl space-y-6">
      <WorkspaceHeading title="Usage & billing" />
      <UsageDashboard />
    </div>
  );
}
