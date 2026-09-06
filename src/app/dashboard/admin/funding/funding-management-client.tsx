"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "sonner";
import { updateFundingStatus, type FundingStatus } from "@/lib/actions/investor-actions";

interface FundingRequest {
  id: string;
  deal_id: string;
  investor_id: string;
  requested_amount: number;
  approved_amount: number | null;
  funded_amount: number | null;
  status: string;
  notes: string | null;
  requested_at: string;
  approved_at: string | null;
  funded_at: string | null;
  deals?: {
    id: string;
    status: string;
    asking_price: number;
    offer_price: number | null;
    properties: { address: string; city: string; state: string } | null;
  };
  profiles?: { full_name: string; email: string };
}

const usd = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});

const statusLabels: Record<FundingStatus, string> = {
  pending: "Pending",
  under_review: "Under review",
  approved: "Approved",
  funded: "Funded",
  declined: "Declined",
  withdrawn: "Withdrawn",
};
const allStatuses = Object.keys(statusLabels) as FundingStatus[];
const actionStatuses = allStatuses.filter((status) => status !== "withdrawn");
const successStatus = "border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-800 dark:bg-emerald-900/20 dark:text-emerald-300";
const statusColors: Partial<Record<FundingStatus, string>> = {
  pending: "border-amber-200 bg-amber-50 text-amber-800 dark:border-amber-800 dark:bg-amber-900/20 dark:text-amber-300",
  approved: successStatus,
  funded: successStatus,
  declined: "border-destructive/30 bg-destructive/10 text-destructive",
};
const selectClass = "min-h-11 w-full rounded-md border border-input bg-card px-3 text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring sm:text-sm";

export function FundingManagementClient({ requests }: { requests: FundingRequest[] }) {
  const router = useRouter();
  const [selectedRequest, setSelectedRequest] = useState<FundingRequest | null>(null);
  const [newStatus, setNewStatus] = useState<FundingStatus>("pending");
  const [approvedAmount, setApprovedAmount] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [filterStatus, setFilterStatus] = useState("all");
  const filterRef = useRef<HTMLSelectElement>(null);
  const updateTrigger = useRef<HTMLButtonElement>(null);

  const filteredRequests = filterStatus === "all"
    ? requests
    : requests.filter((request) => request.status === filterStatus);
  const pendingReview = requests.filter((request) => ["pending", "under_review"].includes(request.status)).length;
  const approved = requests.filter((request) => request.status === "approved").length;
  const totalRequested = requests.reduce((sum, request) => sum + request.requested_amount, 0);
  const totalFunded = requests
    .filter((request) => request.status === "funded")
    .reduce((sum, request) => sum + (request.funded_amount ?? 0), 0);
  const metrics = [
    { label: "Pending review", value: pendingReview },
    { label: "Approved requests", value: approved },
    { label: "Total requested (USD)", value: usd.format(totalRequested) },
    { label: "Total funded (USD)", value: usd.format(totalFunded) },
  ];

  const handleUpdateStatus = async () => {
    if (!selectedRequest || isSubmitting) return;

    setIsSubmitting(true);
    const amount = approvedAmount ? parseFloat(approvedAmount.replace(/[^0-9.]/g, "")) : undefined;
    try {
      const result = await updateFundingStatus(
        selectedRequest.id,
        newStatus,
        newStatus === "approved" ? amount : undefined,
        newStatus === "funded" ? amount : undefined,
      );

      if (result.error) {
        toast.error("Couldn’t update funding request", { description: result.error });
      } else {
        toast.success("Funding request updated");
        if ((filterStatus !== "all" && filterStatus !== newStatus) || ["funded", "declined"].includes(newStatus)) {
          updateTrigger.current = null;
        }
        setSelectedRequest(null);
        setApprovedAmount("");
        router.refresh();
      }
    } catch {
      toast.error("Couldn’t update funding request. Try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const openUpdateDialog = (request: FundingRequest, trigger: HTMLButtonElement) => {
    updateTrigger.current = trigger;
    setSelectedRequest(request);
    setNewStatus(request.status as FundingStatus);
    setApprovedAmount("$" + (request.approved_amount ?? request.requested_amount).toLocaleString());
  };

  return (
    <div className="min-w-0 space-y-6">
      <dl aria-label="Funding totals" className="grid grid-cols-2 gap-px overflow-hidden rounded-lg border border-border bg-border xl:grid-cols-4">
        {metrics.map(({ label, value }) => (
          <div key={label} className="min-w-0 bg-card p-4 [overflow-wrap:anywhere]">
            <dt className="text-sm text-muted-foreground">{label}</dt>
            <dd className="mt-1 text-xl font-semibold tabular-nums sm:text-2xl">{value}</dd>
          </div>
        ))}
      </dl>

      <section aria-labelledby="funding-list" className="min-w-0 rounded-lg border border-border bg-card">
        <header className="flex flex-wrap items-end justify-between gap-4 p-4">
          <div>
            <h2 id="funding-list" className="text-lg font-semibold tracking-tight">Requests</h2>
            <p role="status" className="text-sm text-muted-foreground tabular-nums">
              {filteredRequests.length} of {requests.length} requests
            </p>
          </div>
          <div className="w-full space-y-1 sm:w-44">
            <label htmlFor="funding-status-filter" className="text-sm font-medium">Status</label>
            <select id="funding-status-filter" ref={filterRef} value={filterStatus} onChange={(event) => setFilterStatus(event.target.value)} className={selectClass}>
              <option value="all">All statuses</option>
              {allStatuses.map((status) => <option key={status} value={status}>{statusLabels[status]}</option>)}
            </select>
          </div>
        </header>
        {filteredRequests.length > 0 ? (
          <ul className="divide-y divide-border border-t border-border">
            {filteredRequests.map((request) => {
              const property = request.deals?.properties;
              const address = property?.address || "Address unavailable";
              const location = [property?.city, property?.state].filter(Boolean).join(", ");
              const status = request.status as FundingStatus;

              return (
                <li key={request.id} className="grid min-w-0 gap-3 p-4 [overflow-wrap:anywhere] xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_minmax(0,1fr)_auto] xl:items-start">
                  <div className="min-w-0 space-y-1">
                    <h3 className="font-semibold">{address}</h3>
                    {location && <p className="text-sm text-muted-foreground">{location}</p>}
                    <Badge variant="outline" className={statusColors[status] ?? "bg-muted text-muted-foreground"}>
                      {statusLabels[status] ?? request.status}
                    </Badge>
                  </div>
                  <div className="min-w-0 text-sm">
                    <p className="text-xs text-muted-foreground">Investor</p>
                    <p className="font-medium">{request.profiles?.full_name || "Name unavailable"}</p>
                    {request.profiles?.email && <p className="text-muted-foreground">{request.profiles.email}</p>}
                    <p className="mt-1 text-xs text-muted-foreground">Requested {new Date(request.requested_at).toLocaleDateString("en-US")}</p>
                  </div>
                  <dl className="grid grid-cols-2 gap-x-3 gap-y-2 text-end xl:grid-cols-1">
                    <div>
                      <dt className="text-xs text-muted-foreground">Requested (USD)</dt>
                      <dd className="font-semibold tabular-nums">{usd.format(request.requested_amount)}</dd>
                    </div>
                    {request.approved_amount != null && (
                      <div>
                        <dt className="text-xs text-muted-foreground">Approved (USD)</dt>
                        <dd className="font-medium tabular-nums">{usd.format(request.approved_amount)}</dd>
                      </div>
                    )}
                  </dl>
                  {!["funded", "declined", "withdrawn"].includes(status) && (
                    <Button
                      variant="outline"
                      className="min-h-11 justify-self-start"
                      onClick={(event) => openUpdateDialog(request, event.currentTarget)}
                    >
                      Update request<span className="sr-only"> for {address}</span>
                    </Button>
                  )}
                </li>
              );
            })}
          </ul>
        ) : (
          <p className="border-t border-border p-4 text-sm text-muted-foreground">
            {requests.length ? "No requests match this status." : "No funding requests yet."}
          </p>
        )}
      </section>

      <Dialog open={!!selectedRequest} onOpenChange={(open) => { if (!open) setSelectedRequest(null); }}>
        <DialogContent
          className="max-h-[calc(100dvh-2rem)] overflow-y-auto rounded-lg border-border bg-card"
          onCloseAutoFocus={(event) => {
            event.preventDefault();
            (updateTrigger.current?.isConnected ? updateTrigger.current : filterRef.current)?.focus();
          }}
        >
          <DialogHeader>
            <DialogTitle>Update funding request</DialogTitle>
            <DialogDescription>Choose the request status and enter an amount if required.</DialogDescription>
          </DialogHeader>

          {selectedRequest && (
            <div className="space-y-4">
              <div className="space-y-1 border-b border-border pb-4 [overflow-wrap:anywhere]">
                <p className="font-semibold">{selectedRequest.deals?.properties?.address || "Address unavailable"}</p>
                <p className="text-sm text-muted-foreground">{selectedRequest.profiles?.full_name || "Investor name unavailable"}</p>
                <p className="text-sm tabular-nums">Requested (USD) {usd.format(selectedRequest.requested_amount)}</p>
                {selectedRequest.notes && <p className="text-sm text-muted-foreground">{selectedRequest.notes}</p>}
              </div>
              <div className="space-y-1">
                <label htmlFor="funding-next-status" className="text-sm font-medium">New status</label>
                <select id="funding-next-status" value={newStatus} onChange={(event) => setNewStatus(event.target.value as FundingStatus)} className={selectClass}>
                  {actionStatuses.map((status) => <option key={status} value={status}>{statusLabels[status]}</option>)}
                </select>
              </div>
              {(newStatus === "approved" || newStatus === "funded") && (
                <div className="space-y-1">
                  <label htmlFor="funding-next-amount" className="text-sm font-medium">
                    {newStatus === "approved" ? "Approved amount (USD)" : "Funded amount (USD)"}
                  </label>
                  <Input
                    id="funding-next-amount"
                    type="text"
                    inputMode="numeric"
                    value={approvedAmount}
                    onChange={(event) => {
                      const value = event.target.value.replace(/[^0-9]/g, "");
                      setApprovedAmount(value ? "$" + parseInt(value).toLocaleString() : "");
                    }}
                    className="min-h-11"
                  />
                </div>
              )}
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" className="min-h-11" onClick={() => setSelectedRequest(null)}>Cancel</Button>
            <Button className="min-h-11" onClick={handleUpdateStatus} disabled={isSubmitting}>
              {isSubmitting ? "Updating…" : "Update status"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
