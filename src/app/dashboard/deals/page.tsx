import { getDeals } from "@/lib/actions/deal-actions";
import { DealsPageClient } from "@/components/deals/deals-page-client";

export default async function DealsPage() {
  const { deals, error } = await getDeals();

  if (error) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">My Deals</h2>
          <p className="text-slate-600 dark:text-slate-400">
            View and manage all your submitted deals.
          </p>
        </div>
        <div className="rounded-lg border border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-900/30 p-6 text-center">
          <p className="text-red-600 dark:text-red-400">{error}</p>
        </div>
      </div>
    );
  }

  return <DealsPageClient deals={deals || []} />;
}
