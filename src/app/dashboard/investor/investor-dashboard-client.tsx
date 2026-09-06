"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { StatusBadge } from "@/components/ui/status-badge";
import { toast } from "sonner";
import { requestFunding, withdrawFundingRequest } from "@/lib/actions/investor-actions";

interface Deal {
  id: string;
  status: string;
  asking_price: number;
  offer_price: number | null;
  final_price?: number | null;
  priority: string;
  submitted_at: string;
  property: {
    address: string;
    city: string;
    state: string;
    property_type: string;
    bedrooms: number | null;
    bathrooms: number | null;
    sqft: number | null;
  } | null;
  underwriting: {
    arv: number;
    max_offer: number;
    risk_score: number | null;
  } | null;
}

interface FundingRequest {
  id: string;
  deal_id: string;
  requested_amount: number;
  approved_amount: number | null;
  funded_amount: number | null;
  status: string;
  requested_at: string;
  deals?: {
    id: string;
    status: string;
    asking_price: number;
    offer_price: number | null;
    properties: { address: string; city: string; state: string } | null;
  };
}

interface Stats {
  totalFunded: number;
  pendingFunding: number;
  activeDeals: number;
  closedDeals: number;
  totalInvested: number;
  totalReturns: number;
  roi: number;
}

interface InvestorDashboardClientProps {
  availableDeals: Deal[];
  myDeals: Deal[];
  fundingRequests: FundingRequest[];
  stats: Stats;
}

const usd = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});

const statusColors: Record<string, string> = {
  pending: "border-amber-200 bg-amber-50 text-amber-800 dark:border-amber-800 dark:bg-amber-900/20 dark:text-amber-300",
  approved: "border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-800 dark:bg-emerald-900/20 dark:text-emerald-300",
  funded: "border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-800 dark:bg-emerald-900/20 dark:text-emerald-300",
  declined: "border-destructive/30 bg-destructive/10 text-destructive",
};

const surfaceClass = "min-w-0 rounded-lg border border-border bg-card";
const panelClass = "space-y-4 rounded-lg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring";
const tabClass = "h-auto min-h-11 min-w-0 whitespace-normal text-center";
const emptyClass = surfaceClass + " p-5 text-sm text-muted-foreground";

function formatCurrency(amount: number | null | undefined) {
  return amount == null ? "Not recorded" : usd.format(amount);
}

function Address({ property }: { property?: { address: string; city: string; state: string } | null }) {
  const location = [property?.city, property?.state].filter(Boolean).join(", ");
  return (
    <div className="min-w-0 [overflow-wrap:anywhere]">
      <p className="font-semibold">{property?.address || "Address unavailable"}</p>
      {location && <p className="text-sm text-muted-foreground">{location}</p>}
    </div>
  );
}

function Amount({ label, value }: { label: string; value: number | null | undefined }) {
  return (
    <div className="min-w-0 text-end [overflow-wrap:anywhere]">
      <dt className="text-xs text-muted-foreground">{label} (USD)</dt>
      <dd className="mt-0.5 text-sm font-semibold tabular-nums">{formatCurrency(value)}</dd>
    </div>
  );
}

export function InvestorDashboardClient({ availableDeals, myDeals, fundingRequests, stats }: InvestorDashboardClientProps) {
  const router = useRouter();
  const [selectedDeal, setSelectedDeal] = useState<Deal | null>(null);
  const [fundingAmount, setFundingAmount] = useState("");
  const [fundingNotes, setFundingNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [withdrawingId, setWithdrawingId] = useState<string | null>(null);
  const requestTrigger = useRef<HTMLButtonElement>(null);
  const availableTrigger = useRef<HTMLButtonElement>(null);
  const requestsTrigger = useRef<HTMLButtonElement>(null);

  const handleRequestFunding = async () => {
    if (!selectedDeal || !fundingAmount || isSubmitting) return;

    setIsSubmitting(true);
    const amount = parseFloat(fundingAmount.replace(/[^0-9.]/g, ""));

    try {
      const result = await requestFunding(selectedDeal.id, amount, fundingNotes);
      if (result.error) {
        toast.error("Couldn’t submit funding request", { description: result.error });
      } else {
        toast.success("Funding request submitted", { description: "Your request is pending review." });
        setSelectedDeal(null);
        setFundingAmount("");
        setFundingNotes("");
        router.refresh();
      }
    } catch {
      toast.error("Couldn’t submit funding request. Try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleWithdraw = async (fundingId: string, trigger: HTMLButtonElement) => {
    if (withdrawingId) return;
    setWithdrawingId(fundingId);

    try {
      const result = await withdrawFundingRequest(fundingId);
      if (result.error) {
        toast.error("Couldn’t withdraw request", { description: result.error });
      } else {
        toast.success("Request withdrawn");
        if (document.activeElement === trigger) requestsTrigger.current?.focus();
        router.refresh();
      }
    } catch {
      toast.error("Couldn’t withdraw request. Try again.");
    } finally {
      setWithdrawingId(null);
    }
  };

  const metrics = [
    { label: "Total invested (USD)", value: formatCurrency(stats.totalInvested), hint: "Across " + (stats.closedDeals + stats.activeDeals) + " deals" },
    { label: "Pending funding (USD)", value: formatCurrency(stats.pendingFunding) },
    { label: "Active deals", value: stats.activeDeals },
    { label: "ROI", value: (stats.roi > 0 ? "+" : "") + stats.roi + "%", hint: stats.closedDeals + " closed deals" },
  ];

  return (
    <div className="min-w-0 space-y-6">
      <dl aria-label="Investment totals" className="grid grid-cols-2 gap-px overflow-hidden rounded-lg border border-border bg-border xl:grid-cols-4">
        {metrics.map(({ label, value, hint }) => (
          <div key={label} className="min-w-0 bg-card p-4 [overflow-wrap:anywhere]">
            <dt className="text-sm text-muted-foreground">{label}</dt>
            <dd className="mt-1 text-xl font-semibold tabular-nums sm:text-2xl">{value}</dd>
            {hint && <dd className="mt-1 text-xs text-muted-foreground">{hint}</dd>}
          </div>
        ))}
      </dl>

      <Tabs defaultValue="available" className="min-w-0 gap-4">
        <TabsList aria-label="Investor workspace" className="grid h-auto w-full max-w-lg grid-cols-3">
          <TabsTrigger ref={availableTrigger} value="available" className={tabClass}>Available deals ({availableDeals.length})</TabsTrigger>
          <TabsTrigger value="my-deals" className={tabClass}>Portfolio ({myDeals.length})</TabsTrigger>
          <TabsTrigger ref={requestsTrigger} value="requests" className={tabClass}>Funding requests ({fundingRequests.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="available" className={panelClass}>
          {availableDeals.length === 0 ? (
            <p className={emptyClass}>No deals are available for funding.</p>
          ) : (
            <ul className="grid grid-cols-1 gap-3 xl:grid-cols-2 2xl:grid-cols-3">
              {availableDeals.map((deal) => (
                <li key={deal.id} className={surfaceClass + " flex flex-col gap-3 p-4"}>
                  <Address property={deal.property} />
                  <div className="flex flex-wrap items-center gap-2">
                    <StatusBadge status={deal.status} />
                    {deal.underwriting?.risk_score != null && (
                      <span className="text-xs text-muted-foreground tabular-nums">Risk score {deal.underwriting.risk_score}/10</span>
                    )}
                  </div>
                  <dl className="grid grid-cols-2 gap-3 border-t border-border pt-3">
                    <Amount label="Asking price" value={deal.asking_price} />
                    <Amount label="Maximum offer" value={deal.underwriting?.max_offer} />
                    {deal.underwriting?.arv != null && <Amount label="After-repair value" value={deal.underwriting.arv} />}
                  </dl>
                  {deal.property && (
                    <p className="text-sm text-muted-foreground capitalize [overflow-wrap:anywhere]">
                      {deal.property.property_type.replaceAll("_", " ")}
                      {deal.property.sqft != null && " · " + deal.property.sqft.toLocaleString("en-US") + " sq ft"}
                    </p>
                  )}
                  <Button
                    className="mt-auto min-h-11 self-start"
                    onClick={(event) => {
                      requestTrigger.current = event.currentTarget;
                      setSelectedDeal(deal);
                    }}
                  >
                    Request funding
                    <span className="sr-only"> for {deal.property?.address || "this deal"}</span>
                  </Button>
                </li>
              ))}
            </ul>
          )}
        </TabsContent>

        <TabsContent value="my-deals" className={panelClass}>
          {myDeals.length === 0 ? (
            <p className={emptyClass}>Your portfolio is empty. Browse available deals to request funding.</p>
          ) : (
            <ul className={surfaceClass + " divide-y divide-border"}>
              {myDeals.map((deal) => (
                <li key={deal.id} className="grid gap-3 p-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_auto] lg:items-center">
                  <div className="min-w-0 space-y-2">
                    <Address property={deal.property} />
                    <StatusBadge status={deal.status} />
                  </div>
                  <dl className="grid min-w-0 grid-cols-2 gap-3">
                    <Amount label="Offer or asking price" value={deal.offer_price ?? deal.asking_price} />
                    <Amount label="Final deal value" value={deal.status === "closed" ? deal.final_price : null} />
                  </dl>
                  <Button asChild variant="outline" className="min-h-11 justify-self-start">
                    <Link href={"/dashboard/deals/" + deal.id}>
                      View deal<span className="sr-only"> for {deal.property?.address || "this property"}</span>
                    </Link>
                  </Button>
                </li>
              ))}
            </ul>
          )}
        </TabsContent>

        <TabsContent value="requests" className={panelClass}>
          {fundingRequests.length === 0 ? (
            <p className={emptyClass}>No funding requests yet.</p>
          ) : (
            <ul className={surfaceClass + " divide-y divide-border"}>
              {fundingRequests.map((request) => (
                <li key={request.id} className="grid gap-3 p-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_auto] lg:items-center">
                  <div className="min-w-0 space-y-2">
                    <Address property={request.deals?.properties} />
                    <Badge variant="outline" className={"capitalize " + (statusColors[request.status] ?? "bg-muted text-muted-foreground")}>
                      {request.status.replaceAll("_", " ")}
                    </Badge>
                    <p className="text-xs text-muted-foreground">Requested {new Date(request.requested_at).toLocaleDateString("en-US")}</p>
                  </div>
                  <dl className="grid min-w-0 grid-cols-2 gap-3">
                    <Amount label="Requested" value={request.requested_amount} />
                    {request.approved_amount != null && request.approved_amount !== request.requested_amount && (
                      <Amount label="Approved" value={request.approved_amount} />
                    )}
                  </dl>
                  {(request.status === "pending" || request.status === "under_review") && (
                    <Button
                      variant="outline"
                      className="min-h-11 justify-self-start aria-disabled:cursor-wait"
                      onClick={(event) => handleWithdraw(request.id, event.currentTarget)}
                      aria-disabled={withdrawingId !== null || undefined}
                    >
                      {withdrawingId === request.id ? "Withdrawing…" : "Withdraw request"}
                      <span className="sr-only"> for {request.deals?.properties?.address || "this property"}</span>
                    </Button>
                  )}
                </li>
              ))}
            </ul>
          )}
        </TabsContent>
      </Tabs>

      <Dialog open={!!selectedDeal} onOpenChange={(open) => { if (!open) setSelectedDeal(null); }}>
        <DialogContent
          className="max-h-[calc(100dvh-2rem)] overflow-y-auto rounded-lg border-border bg-card"
          onCloseAutoFocus={(event) => {
            event.preventDefault();
            (requestTrigger.current?.isConnected ? requestTrigger.current : availableTrigger.current)?.focus();
          }}
        >
          <DialogHeader>
            <DialogTitle>Request funding</DialogTitle>
            <DialogDescription>Choose how much you want to request for this property.</DialogDescription>
          </DialogHeader>
          {selectedDeal && (
            <div className="space-y-4">
              <div className="space-y-3 border-b border-border pb-4">
                <Address property={selectedDeal.property} />
                <dl className="grid grid-cols-2 gap-3">
                  <Amount label="Asking price" value={selectedDeal.asking_price} />
                  <Amount label="Maximum offer" value={selectedDeal.underwriting?.max_offer} />
                </dl>
              </div>
              <div className="space-y-2">
                <label htmlFor="investor-funding-amount" className="text-sm font-medium">Funding amount (USD)</label>
                <Input
                  id="investor-funding-amount"
                  type="text"
                  inputMode="numeric"
                  placeholder="$0"
                  value={fundingAmount}
                  onChange={(event) => {
                    const value = event.target.value.replace(/[^0-9]/g, "");
                    setFundingAmount(value ? "$" + parseInt(value).toLocaleString() : "");
                  }}
                  className="min-h-11"
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="investor-funding-notes" className="text-sm font-medium">Notes (optional)</label>
                <Textarea id="investor-funding-notes" value={fundingNotes} onChange={(event) => setFundingNotes(event.target.value)} />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" className="min-h-11" onClick={() => setSelectedDeal(null)}>Cancel</Button>
            <Button className="min-h-11" onClick={handleRequestFunding} disabled={!fundingAmount || isSubmitting}>
              {isSubmitting ? "Submitting…" : "Submit request"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
