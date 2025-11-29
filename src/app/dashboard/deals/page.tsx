import { getDeals } from "@/lib/actions/deal-actions";
import { DealsPageClient } from "@/components/deals/deals-page-client";

export default async function DealsPage() {
  const { deals, error } = await getDeals();

  if (error) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">My Deals</h2>
          <p className="text-slate-600">
            View and manage all your submitted deals.
          </p>
        </div>
        <div className="rounded-lg border border-red-200 bg-red-50 p-6 text-center">
          <p className="text-red-600">{error}</p>
        </div>
      </div>
    );
  }

  return <DealsPageClient deals={deals || []} />;
}
