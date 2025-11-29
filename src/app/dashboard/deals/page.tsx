import { getDeals } from "@/lib/actions/deal-actions";
import { DealsPageClient } from "@/components/deals/deals-page-client";

export default async function DealsPage() {
  const { deals, error, isAdmin } = await getDeals();

  if (error) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold text-foreground">{isAdmin ? "All Deals" : "My Deals"}</h2>
          <p className="text-muted-foreground">
            {isAdmin ? "View and manage all deals across the platform." : "View and manage all your submitted deals."}
          </p>
        </div>
        <div className="rounded-lg border border-red-500/30 bg-red-500/10 p-6 text-center">
          <p className="text-red-500">{error}</p>
        </div>
      </div>
    );
  }

  return <DealsPageClient deals={deals || []} isAdmin={isAdmin} />;
}
