import { getDeals } from "@/lib/actions/deal-actions";
import { DealsPageClient } from "@/components/deals/deals-page-client";
import { WorkspaceHeading } from "@/components/layout/workspace-heading";
import { createClient } from "@/utils/supabase/server";

export default async function DealsPage() {
  const supabase = await createClient();
  const [{ deals, error, isAdmin }, { data: { user } }] = await Promise.all([
    getDeals(),
    supabase.auth.getUser(),
  ]);
  const title = isAdmin ? "All deals" : "My deals";

  if (error) {
    return (
      <div className="mx-auto max-w-7xl space-y-5">
        <WorkspaceHeading title={title} />
        <div role="alert" className="rounded-lg border border-border bg-card p-5">
          <h2 className="font-semibold">Couldn’t load deals</h2>
          <p className="mt-1 text-sm text-muted-foreground">{error}</p>
        </div>
      </div>
    );
  }

  const visibleDeals = deals ?? [];
  const movableDealIds = user
    ? visibleDeals
        .filter((deal) => isAdmin || deal.agent_id === user.id || deal.assigned_to === user.id)
        .map((deal) => deal.id)
    : [];

  return <DealsPageClient deals={visibleDeals} isAdmin={isAdmin} movableDealIds={movableDealIds} />;
}
