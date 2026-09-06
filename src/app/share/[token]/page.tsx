import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { 
  Building2, 
  MapPin, 
  DollarSign, 
  TrendingUp, 
  Calculator, 
  Wrench,
  Star,
  Calendar,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Sparkles
} from '@/components/ui/icons';

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
    return { title: 'Deal Not Found | DealFlow' };
  }

  return {
    title: `${deal.property_address} | DealFlow`,
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
  if (amount == null) return 'N/A';
  return new Intl.NumberFormat('en-US', { 
    style: 'currency', 
    currency: 'USD',
    maximumFractionDigits: 0 
  }).format(amount);
}

// Get score color
function getScoreColor(score: number): string {
  if (score >= 80) return 'text-green-600';
  if (score >= 60) return 'text-yellow-600';
  return 'text-red-600';
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
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardHeader className="text-center">
            <AlertTriangle className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
            <CardTitle>Link Expired</CardTitle>
            <CardDescription>
              This share link has expired. Please contact the deal owner for a new link.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
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

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Building2 className="h-6 w-6 text-emerald-500" />
            <span className="font-semibold text-white">DealFlow</span>
          </div>
          <Badge variant="outline" className="text-foreground/90 border-border">
            Shared Deal Analysis
          </Badge>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8">
        {/* Property Header */}
        <div className="mb-8">
          <div className="flex items-start justify-between flex-wrap gap-4">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">
                {deal.property_address}
              </h1>
              <div className="flex items-center gap-2 text-muted-foreground">
                <MapPin className="h-4 w-4" />
                <span>{deal.city}, {deal.state} {deal.zip_code}</span>
              </div>
            </div>
            
            {deal.ai_score && (
              <div className="text-center">
                <div className={`text-5xl font-bold ${getScoreColor(deal.ai_score)}`}>
                  {deal.ai_score}
                </div>
                <Badge {...getScoreBadge(deal.ai_score)} className="mt-2">
                  {getScoreBadge(deal.ai_score).label}
                </Badge>
              </div>
            )}
          </div>
        </div>

        {/* Key Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Card className="bg-card border-border">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/20">
                  <DollarSign className="h-5 w-5 text-emerald-400" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Asking Price</p>
                  <p className="text-xl font-semibold text-white">
                    {formatCurrency(deal.asking_price)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card border-border">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-green-500/20">
                  <TrendingUp className="h-5 w-5 text-green-400" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">After Repair Value</p>
                  <p className="text-xl font-semibold text-white">
                    {formatCurrency(deal.arv)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card border-border">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-amber-500/20">
                  <Wrench className="h-5 w-5 text-amber-400" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Repair Cost</p>
                  <p className="text-xl font-semibold text-white">
                    {formatCurrency(deal.repair_cost)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card border-border">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/15">
                  <Calculator className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Max Offer (MAO)</p>
                  <p className="text-xl font-semibold text-white">
                    {formatCurrency(deal.mao)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Two Column Layout */}
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Column - Financial Analysis */}
          <div className="lg:col-span-2 space-y-6">
            {/* Deal Summary */}
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Calculator className="h-5 w-5 text-emerald-400" />
                  Financial Summary
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 rounded-lg bg-secondary">
                    <p className="text-sm text-muted-foreground mb-1">Wholesale Fee</p>
                    <p className="text-2xl font-bold text-green-400">
                      {formatCurrency(deal.wholesale_fee)}
                    </p>
                  </div>
                  <div className="p-4 rounded-lg bg-secondary">
                    <p className="text-sm text-muted-foreground mb-1">Potential Profit</p>
                    <p className="text-2xl font-bold text-green-400">
                      {formatCurrency(potentialProfit)}
                    </p>
                  </div>
                </div>

                {equitySpread !== null && (
                  <div className="p-4 rounded-lg bg-secondary">
                    <div className="flex justify-between items-center mb-2">
                      <p className="text-sm text-muted-foreground">Equity Spread</p>
                      <p className="font-semibold text-white">{equitySpread.toFixed(1)}%</p>
                    </div>
                    <Progress value={Math.min(equitySpread, 100)} className="h-2" />
                  </div>
                )}

                <Separator className="bg-secondary" />

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Property Type</span>
                    <span className="text-white capitalize">
                      {deal.property_type?.replace('_', ' ') || 'N/A'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Priority</span>
                    <Badge variant={
                      deal.priority === 'urgent' ? 'destructive' :
                      deal.priority === 'high' ? 'default' :
                      'secondary'
                    }>
                      {deal.priority || 'Medium'}
                    </Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Status</span>
                    <span className="text-white capitalize">
                      {deal.status?.replace('_', ' ') || 'New'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Listed</span>
                    <span className="text-white">
                      {new Date(deal.created_at).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* AI Analysis */}
            {deal.ai_score && (
              <Card className="bg-card border-border">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Sparkles className="h-5 w-5 text-yellow-400" />
                    AI Deal Analysis
                  </CardTitle>
                  <CardDescription className="text-muted-foreground">
                    Powered by advanced AI underwriting
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Score Visual */}
                  <div className="flex items-center gap-4">
                    <div className="relative h-24 w-24">
                      <svg className="h-24 w-24 -rotate-90">
                        <circle
                          cx="48"
                          cy="48"
                          r="40"
                          stroke="currentColor"
                          strokeWidth="8"
                          fill="none"
                          className="text-foreground/90"
                        />
                        <circle
                          cx="48"
                          cy="48"
                          r="40"
                          stroke="currentColor"
                          strokeWidth="8"
                          fill="none"
                          strokeDasharray={`${(deal.ai_score / 100) * 251} 251`}
                          className={getScoreColor(deal.ai_score)}
                        />
                      </svg>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className={`text-2xl font-bold ${getScoreColor(deal.ai_score)}`}>
                          {deal.ai_score}
                        </span>
                      </div>
                    </div>
                    <div className="flex-1">
                      <p className="text-foreground/90 leading-relaxed">
                        {recommendation || 'This deal has been analyzed by our AI underwriting system.'}
                      </p>
                    </div>
                  </div>

                  {/* Pros and Cons */}
                  <div className="grid md:grid-cols-2 gap-4">
                    {pros.length > 0 && (
                      <div className="p-4 rounded-lg bg-green-500/10 border border-green-500/20">
                        <h4 className="font-semibold text-green-400 mb-3 flex items-center gap-2">
                          <CheckCircle2 className="h-4 w-4" />
                          Strengths
                        </h4>
                        <ul className="space-y-2">
                          {pros.map((pro: string, i: number) => (
                            <li key={i} className="text-sm text-foreground/90 flex items-start gap-2">
                              <Star className="h-3 w-3 text-green-400 mt-1 shrink-0" />
                              {pro}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {cons.length > 0 && (
                      <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/20">
                        <h4 className="font-semibold text-red-400 mb-3 flex items-center gap-2">
                          <XCircle className="h-4 w-4" />
                          Risks
                        </h4>
                        <ul className="space-y-2">
                          {cons.map((con: string, i: number) => (
                            <li key={i} className="text-sm text-foreground/90 flex items-start gap-2">
                              <AlertTriangle className="h-3 w-3 text-red-400 mt-1 shrink-0" />
                              {con}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Right Column - Contact / Notes */}
          <div className="space-y-6">
            {/* Quick Facts */}
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="text-white">Quick Facts</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-3 text-sm">
                  <Building2 className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">Property Type:</span>
                  <span className="text-white capitalize ml-auto">
                    {deal.property_type?.replace('_', ' ')}
                  </span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">Date Added:</span>
                  <span className="text-white ml-auto">
                    {new Date(deal.created_at).toLocaleDateString()}
                  </span>
                </div>
                {deal.tags && deal.tags.length > 0 && (
                  <div className="pt-2">
                    <p className="text-sm text-muted-foreground mb-2">Tags</p>
                    <div className="flex flex-wrap gap-2">
                      {deal.tags.map((tag: string, i: number) => (
                        <Badge key={i} variant="outline" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Notes */}
            {deal.notes && (
              <Card className="bg-card border-border">
                <CardHeader>
                  <CardTitle className="text-white">Notes</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-foreground/90 text-sm whitespace-pre-wrap">
                    {deal.notes}
                  </p>
                </CardContent>
              </Card>
            )}

            {/* CTA */}
            <Card className="bg-primary border-0">
              <CardContent className="p-6 text-center">
                <h3 className="font-semibold text-white text-lg mb-2">
                  Interested in this deal?
                </h3>
                <p className="text-emerald-100 text-sm mb-4">
                  Contact the deal owner for more information and next steps.
                </p>
                <Badge className="bg-white/20 text-white hover:bg-white/30">
                  Shared via DealFlow
                </Badge>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border mt-16 py-8">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <p className="text-muted-foreground text-sm">
            This deal analysis was shared via{' '}
            <span className="text-emerald-400">DealFlow</span> — 
            The Real Estate Deal Management Platform
          </p>
        </div>
      </footer>
    </div>
  );
}
