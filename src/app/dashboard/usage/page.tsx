import { Metadata } from "next";
import { UsageDashboard } from "@/components/dashboard/usage-dashboard";

export const metadata: Metadata = {
  title: "Usage & Billing | LotMerit",
  description: "View your usage stats and manage your subscription"
};

export default function UsagePage() {
  return (
    <div className="container max-w-6xl py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Usage & Billing</h1>
        <p className="text-muted-foreground mt-2">
          Track your usage and manage your subscription
        </p>
      </div>
      
      <UsageDashboard />
    </div>
  );
}
