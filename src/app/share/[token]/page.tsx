import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import { Badge } from '@/components/ui/badge';
import { PublicHeading, PublicPage } from '@/components/layout/public-page';

// Use service role to bypass RLS for public access
function getServiceClient() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  );
}

export async function generateMetadata({ params }: { params: Promise<{ token: string }> }): Promise<Metadata> {
  const { token } = await params;
  const supabase = getServiceClient();
  
  const { data: deal } = await supabase
    .from('deals')
    .select('property_address, city, state')
    .eq('share_token', token)
    .eq('share_enabled', true)
    .single();

  if (!deal) {
    return { title: 'Deal Not Found | LotMerit' };
  }

  return {
    title: `${deal.property_address} | LotMerit`,
    description: `Real estate deal analysis for ${deal.property_address}, ${deal.city}, ${deal.state}`,
    openGraph: {
      title: `Deal Analysis: ${deal.property_address}`,
      description: `View the complete investment analysis for this property in ${deal.city}, ${deal.state}`,
      type: 'website',
    },
  };
}

// Format currency
function formatCurrency(amount: number | null | undefined): string {
  if (amount == null) return 'Not recorded';
  return new Intl.NumberFormat('en-US', { 
    style: 'currency', 
    currency: 'USD',
    maximumFractionDigits: 0 
  }).format(amount);
}

// Get score badge
function getScoreBadge(score: number): { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' } {
  if (score >= 80) return { label: 'Excellent Deal', variant: 'default' };
  if (score >= 60) return { label: 'Good Deal', variant: 'secondary' };
  if (score >= 40) return { label: 'Fair Deal', variant: 'outline' };
  return { label: 'Risky Deal', variant: 'destructive' };
}

export default async function PublicSharePage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const supabase = getServiceClient();

  // Fetch the deal using the share token
  const { data: deal, error } = await supabase
    .from('deals')
    .select('*')
    .eq('share_token', token)
    .eq('share_enabled', true)
    .single();

  // Check if expired
  if (deal?.share_expires_at && new Date(deal.share_expires_at) < new Date()) {
    return (
      <PublicPage className="max-w-lg">
        <section className="rounded-lg border border-border bg-card p-4 sm:p-6">
          <PublicHeading>Share link expired</PublicHeading>
          <p className="mt-3 text-muted-foreground">Contact the deal owner for a new link.</p>
        </section>
      </PublicPage>
    );
  }

  if (error || !deal) {
    notFound();
  }

  // Increment view count (fire and forget)
  supabase.rpc('increment_share_view', { deal_share_token: token }).then(() => {});

  // Calculate potential profit
  const potentialProfit = deal.arv && deal.mao 
    ? deal.arv - deal.mao - (deal.repair_cost || 0) 
    : null;

  // Calculate equity spread
  const equitySpread = deal.arv && deal.asking_price 
    ? ((deal.arv - deal.asking_price) / deal.arv) * 100 
    : null;

  // AI Analysis
  const aiAnalysis = deal.ai_analysis || {};
  const pros = aiAnalysis.pros || [];
  const cons = aiAnalysis.cons || [];
  const recommendation = aiAnalysis.recommendation || '';

  const locality = [deal.city, [deal.state, deal.zip_code].filter(Boolean).join(' ')].filter(Boolean).join(', ');
  const score = deal.ai_score;
  const scoreBadge = score == null ? null : getScoreBadge(score);

  return (
    <PublicPage className="max-w-5xl [overflow-wrap:anywhere]">
      <div className="mb-6">
        <PublicHeading>{deal.property_address}</PublicHeading>
        {locality && <p className="mt-2 text-muted-foreground">{locality}</p>}
      </div>

      <div className="grid gap-x-8 gap-y-6 lg:grid-cols-[minmax(0,3fr)_minmax(0,2fr)]">
        <div className="min-w-0 space-y-6">
          <section aria-labelledby="deal-financials" className="rounded-lg border border-border bg-card p-4 sm:p-6">
            <h2 id="deal-financials" className="text-lg font-semibold">Deal figures</h2>
            <dl className="mt-2 divide-y divide-border">
              <ShareValue label="Asking price" value={formatCurrency(deal.asking_price)} numeric />
              <ShareValue label="After-repair value" value={formatCurrency(deal.arv)} numeric />
              <ShareValue label="Estimated repairs" value={formatCurrency(deal.repair_cost)} numeric />
              <ShareValue label="Maximum offer" value={formatCurrency(deal.mao)} numeric />
              <ShareValue label="Wholesale fee" value={formatCurrency(deal.wholesale_fee)} numeric />
              <ShareValue label="Potential profit" value={formatCurrency(potentialProfit)} numeric />
              {equitySpread !== null && <ShareValue label="Equity spread" value={equitySpread.toFixed(1) + '%'} numeric />}
            </dl>
          </section>

          {scoreBadge && (
            <section aria-labelledby="deal-analysis" className="rounded-lg border border-border bg-card p-4 sm:p-6">
              <h2 id="deal-analysis" className="text-lg font-semibold">AI deal analysis</h2>
              <p className="mt-2 flex flex-wrap items-center gap-2 text-sm">
                <span className="font-semibold tabular-nums">{score} / 100</span>
                <Badge variant={scoreBadge.variant}>{scoreBadge.label}</Badge>
              </p>
              {recommendation && <p className="mt-4 whitespace-pre-wrap text-muted-foreground">{recommendation}</p>}
              {(pros.length > 0 || cons.length > 0) && (
                <div className="mt-4 grid gap-4 border-t border-border pt-4 sm:grid-cols-2">
                  {pros.length > 0 && (
                    <div className="min-w-0">
                      <h3 className="font-medium">Strengths</h3>
                      <ul className="mt-2 list-disc space-y-1 ps-5 text-sm text-muted-foreground">
                        {pros.map((pro: string, index: number) => <li key={index}>{pro}</li>)}
                      </ul>
                    </div>
                  )}
                  {cons.length > 0 && (
                    <div className="min-w-0">
                      <h3 className="font-medium">Risks</h3>
                      <ul className="mt-2 list-disc space-y-1 ps-5 text-sm text-muted-foreground">
                        {cons.map((con: string, index: number) => <li key={index}>{con}</li>)}
                      </ul>
                    </div>
                  )}
                </div>
              )}
            </section>
          )}
        </div>

        <div className="min-w-0 space-y-6">
          <section aria-labelledby="deal-property" className="rounded-lg border border-border bg-card p-4 sm:p-6">
            <h2 id="deal-property" className="text-lg font-semibold">Property details</h2>
            <dl className="mt-2 divide-y divide-border">
              <ShareValue label="Property type" value={deal.property_type?.replaceAll('_', ' ')} />
              <ShareValue label="Stage" value={deal.status?.replaceAll('_', ' ')} />
              <ShareValue label="Priority" value={deal.priority} />
              <ShareValue label="Date listed" value={deal.created_at ? new Date(deal.created_at).toLocaleDateString() : null} />
            </dl>
            {deal.tags && deal.tags.length > 0 && (
              <div className="border-t border-border pt-3">
                <h3 className="text-sm font-medium">Tags</h3>
                <ul className="mt-2 flex flex-wrap gap-2">
                  {deal.tags.map((tag: string, index: number) => (
                    <li key={index} className="max-w-full rounded-lg border border-border px-2 py-1 text-sm">{tag}</li>
                  ))}
                </ul>
              </div>
            )}
          </section>

          {deal.notes && (
            <section aria-labelledby="deal-notes" className="border-t border-border pt-4">
              <h2 id="deal-notes" className="text-lg font-semibold">Notes</h2>
              <p className="mt-2 whitespace-pre-wrap text-muted-foreground">{deal.notes}</p>
            </section>
          )}
          <p className="text-sm text-muted-foreground">Contact the deal owner for more information or next steps.</p>
        </div>
      </div>
    </PublicPage>
  );
}

function ShareValue({ label, value, numeric }: { label: string; value?: string | null; numeric?: boolean }) {
  return (
    <div className="grid grid-cols-[minmax(0,1fr)_minmax(0,1fr)] items-baseline gap-3 py-2 text-sm">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className={numeric ? 'text-end font-medium tabular-nums' : 'text-end first-letter:uppercase'}>
        {value ?? 'Not recorded'}
      </dd>
    </div>
  );
}
