"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { DealWorkspaceHeading, formatDealCurrency } from "@/components/deals/deal-workspace-heading";
import { WorkspaceHeading } from "@/components/layout/workspace-heading";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { Loader2 } from "@/components/ui/icons";
import Link from "next/link";
import { getDeal, updateDealStatus, DealWithProperty } from "@/lib/actions/deal-actions";
import { getComments, addComment, Comment } from "@/lib/actions/comment-actions";

const propertyTypeLabels: Record<string, string> = {
  single_family: "Single family",
  multi_family: "Multi-family",
  condo: "Condo",
  townhouse: "Townhouse",
  land: "Land",
  commercial: "Commercial",
  other: "Other",
};

export default function DealApprovalPage() {
  const { id } = useParams<{ id: string }>();
  return <DealApprovalReview key={id} dealId={id} />;
}

function DealApprovalReview({ dealId }: { dealId: string }) {
  const router = useRouter();
  
  const [deal, setDeal] = useState<DealWithProperty | null>(null);
  const [loading, setLoading] = useState(true);
  const [commentsLoading, setCommentsLoading] = useState(true);
  const [commentsUnavailable, setCommentsUnavailable] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [newComment, setNewComment] = useState("");
  const [comments, setComments] = useState<Comment[]>([]);
  const [rejectionReason, setRejectionReason] = useState("");
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [showChangesDialog, setShowChangesDialog] = useState(false);
  const [changesRequested, setChangesRequested] = useState("");

  const loadDeal = useCallback(async () => {
    try {
      const result = await getDeal(dealId);
      setDeal(result.error ? null : result.deal);
    } catch {
      setDeal(null);
    } finally {
      setLoading(false);
    }
  }, [dealId]);

  const loadComments = useCallback(async () => {
    try {
      const result = await getComments(dealId);
      setCommentsUnavailable(Boolean(result.error));
      if (!result.error && result.comments) setComments(result.comments);
    } catch {
      setCommentsUnavailable(true);
    } finally {
      setCommentsLoading(false);
    }
  }, [dealId]);

  // Fetch the deal and its comments on mount and whenever the deal id changes.
  // We schedule the work via queueMicrotask so the initial render commits
  // first; this matches the "subscribe to an external system" pattern and
  // avoids cascading-render warnings from react-hooks/set-state-in-effect.
  useEffect(() => {
    queueMicrotask(() => {
      loadDeal();
      loadComments();
    });
  }, [loadDeal, loadComments]);

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const handleApprove = async () => {
    if (submitting) return;
    setSubmitting(true);
    try {
      const { success, error } = await updateDealStatus(dealId, "offer_prepared");
      if (error) {
        toast.error("Failed to approve deal", { description: error });
      } else if (success) {
        toast.success("Offer prepared");
        router.refresh();
        await loadDeal();
      }
    } catch {
      toast.error("Could not approve the deal. Try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleReject = async () => {
    if (!rejectionReason.trim()) {
      toast.error("Please provide a reason for rejection");
      return;
    }
    setSubmitting(true);
    
    // Add rejection reason as a comment
    await addComment(dealId, `[REJECTED] ${rejectionReason}`);
    
    const { success, error } = await updateDealStatus(dealId, "rejected");
    if (error) {
      toast.error("Failed to reject deal", { description: error });
    } else if (success) {
      setShowRejectDialog(false);
      toast.error("Deal rejected", {
        description: "The deal moved to Rejected.",
      });
      router.refresh();
      loadDeal();
      loadComments();
    }
    setSubmitting(false);
  };

  const handleRequestChanges = async () => {
    if (!changesRequested.trim()) {
      toast.error("Please specify what changes are needed");
      return;
    }
    setSubmitting(true);
    
    // Add change request as a comment
    await addComment(dealId, `[CHANGES REQUESTED] ${changesRequested}`);
    
    const { success, error } = await updateDealStatus(dealId, "needs_info");
    if (error) {
      toast.error("Failed to request changes", { description: error });
    } else if (success) {
      setShowChangesDialog(false);
      toast.warning("Changes requested", {
        description: "The deal moved to Needs info.",
      });
      router.refresh();
      loadDeal();
      loadComments();
    }
    setSubmitting(false);
  };

  const handleAddComment = async () => {
    if (!newComment.trim()) return;
    setSubmitting(true);
    
    const { success, error } = await addComment(dealId, newComment.trim());
    if (error) {
      toast.error("Failed to add comment", { description: error });
    } else if (success) {
      setNewComment("");
      toast.success("Comment added");
      loadComments();
    }
    setSubmitting(false);
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <WorkspaceHeading title="Deal review" />
        <p role="status" className="flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="size-4 motion-safe:animate-spin" aria-hidden="true" />
          Loading deal…
        </p>
      </div>
    );
  }

  if (!deal) {
    return (
      <div className="space-y-4">
        <WorkspaceHeading title="Deal unavailable" />
        <p role="alert" className="text-muted-foreground">This deal could not be opened for review.</p>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" asChild className="min-h-11">
            <Link href="/dashboard/deals">Back to deals</Link>
          </Button>
          <Button className="min-h-11" onClick={() => {
            setLoading(true);
            void loadDeal();
            void loadComments();
          }}>Try again</Button>
        </div>
      </div>
    );
  }

  const askingPrice = deal.asking_price ?? 0;
  const estimatedROI = askingPrice > 0 ? ((askingPrice * 0.15) / askingPrice) * 100 : 0;
  const status = deal.status || "submitted";
  const dealHref = "/dashboard/deals/" + dealId;

  return (
    <div className="space-y-6">
      <DealWorkspaceHeading
        address={deal.property?.address}
        location={[deal.property?.city, [deal.property?.state, deal.property?.zip].filter(Boolean).join(" ")].filter(Boolean).join(", ")}
        section="Deal review"
        status={status}
        backHref={dealHref}
        backLabel="Back to deal"
      />

      {["submitted", "underwriting", "needs_info"].includes(status) && (
        <div className="flex flex-wrap gap-2 border-b border-border pb-4">
            <Button onClick={handleApprove} disabled={submitting} className="min-h-11">
              Approve and prepare offer
            </Button>
            <Dialog open={showChangesDialog} onOpenChange={setShowChangesDialog}>
              <DialogTrigger asChild>
                <Button variant="outline" className="min-h-11">
                  Request changes
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Request changes</DialogTitle>
                  <DialogDescription>
                    Specify what changes the agent needs to make before resubmitting.
                  </DialogDescription>
                </DialogHeader>
                <div className="py-4">
                  <Label htmlFor="changes">Required changes</Label>
                  <Textarea
                    id="changes"
                    value={changesRequested}
                    onChange={(e) => setChangesRequested(e.target.value)}
                    placeholder="Please update the repair estimates with contractor quotes..."
                    rows={4}
                    className="mt-2"
                  />
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setShowChangesDialog(false)}>Cancel</Button>
                  <Button onClick={handleRequestChanges} disabled={submitting} className="min-h-11">
                    {submitting ? <Loader2 className="mr-2 h-4 w-4 motion-safe:animate-spin" /> : null}
                    Request changes
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            <Dialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
              <DialogTrigger asChild>
                <Button variant="outline" className="min-h-11 text-destructive">
                  Reject
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Reject deal</DialogTitle>
                  <DialogDescription>
                    This action cannot be undone. Please provide a reason for rejection.
                  </DialogDescription>
                </DialogHeader>
                <div className="py-4">
                  <Label htmlFor="reason">Rejection reason</Label>
                  <Textarea
                    id="reason"
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                    placeholder="The numbers don't work for this deal because..."
                    rows={4}
                    className="mt-2"
                  />
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setShowRejectDialog(false)}>Cancel</Button>
                  <Button onClick={handleReject} disabled={submitting} variant="destructive">
                    {submitting ? <Loader2 className="mr-2 h-4 w-4 motion-safe:animate-spin" /> : null}
                    Reject deal
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

        </div>
      )}

      <dl className="grid gap-x-6 gap-y-4 border-y border-border py-4 sm:grid-cols-3">
        <div>
          <dt className="text-sm text-muted-foreground">Asking price</dt>
          <dd className="text-2xl font-semibold tabular-nums [overflow-wrap:anywhere]">{formatDealCurrency(deal.asking_price)}</dd>
        </div>
        <div>
          <dt className="text-sm text-muted-foreground">Offer price</dt>
          <dd className="font-semibold tabular-nums [overflow-wrap:anywhere]">{formatDealCurrency(deal.offer_price)}</dd>
        </div>
        <div>
          <dt className="text-sm text-muted-foreground">Illustrative return</dt>
          <dd className="font-semibold tabular-nums">{askingPrice > 0 ? estimatedROI.toFixed(1) + "%" : "Unavailable"}</dd>
          {askingPrice > 0 && <dd className="text-sm text-muted-foreground">Assumes profit of 15% of asking price.</dd>}
        </div>
      </dl>

      <div className="grid items-start gap-6 xl:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
        <div className="min-w-0 space-y-6">
          <section className="rounded-lg border border-border bg-card p-4 sm:p-6">
            <h2 className="text-lg font-semibold">Property and seller</h2>
            <dl className="mt-4 grid gap-4 text-sm sm:grid-cols-2 [&_dd]:font-medium [&_dd]:[overflow-wrap:anywhere] [&_dt]:text-muted-foreground">
              <div><dt>Type</dt><dd>{deal.property?.property_type ? propertyTypeLabels[deal.property.property_type] || deal.property.property_type : "Not recorded"}</dd></div>
              <div><dt>Floor area</dt><dd className="tabular-nums">{deal.property?.sqft == null ? "Not recorded" : deal.property.sqft.toLocaleString() + " sq ft"}</dd></div>
              <div><dt>Bedrooms</dt><dd className="tabular-nums">{deal.property?.bedrooms ?? "Not recorded"}</dd></div>
              <div><dt>Bathrooms</dt><dd className="tabular-nums">{deal.property?.bathrooms ?? "Not recorded"}</dd></div>
              <div><dt>Year built</dt><dd className="tabular-nums">{deal.property?.year_built ?? "Not recorded"}</dd></div>
              <div><dt>Seller</dt><dd>{deal.seller_name || "Not recorded"}</dd></div>
              <div><dt>Seller phone</dt><dd>{deal.seller_phone || "Not recorded"}</dd></div>
              <div><dt>Motivation</dt><dd>{deal.seller_motivation || "Not recorded"}</dd></div>
              {deal.notes && <div className="sm:col-span-2"><dt>Notes</dt><dd className="whitespace-pre-wrap">{deal.notes}</dd></div>}
            </dl>
          </section>

          <section className="rounded-lg border border-border bg-card p-4 sm:p-6">
            <h2 className="text-lg font-semibold">Comments</h2>
            {commentsUnavailable && <p className="mt-2 text-sm text-destructive" role="alert">Comments could not be loaded.</p>}
            {comments.length > 0 ? (
              <ul className="mt-2 divide-y divide-border">
                {comments.map((comment) => (
                  <li key={comment.id} className="py-3 [overflow-wrap:anywhere]">
                    <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm">
                      <span className="font-medium">{comment.user?.full_name || comment.user?.email || "Unknown user"}</span>
                      {comment.user?.role && <Badge variant="secondary">{comment.user.role}</Badge>}
                      <time className="text-muted-foreground" dateTime={comment.created_at}>{formatDate(comment.created_at)}</time>
                    </div>
                    <p className="mt-1 whitespace-pre-wrap">{comment.content}</p>
                  </li>
                ))}
              </ul>
            ) : !commentsUnavailable && <p className="mt-2 text-sm text-muted-foreground" role="status">{commentsLoading ? "Loading comments…" : "No comments yet."}</p>}
            <form className="mt-4 space-y-2 border-t border-border pt-4" onSubmit={(event) => {
              event.preventDefault();
              if (!submitting) void handleAddComment();
            }}>
              <Label htmlFor="approval-comment">Add a comment</Label>
              <Textarea id="approval-comment" value={newComment} onChange={(event) => setNewComment(event.target.value)} rows={3} required className="text-base" />
              <Button type="submit" variant="outline" className="min-h-11" aria-disabled={submitting}>Post comment</Button>
            </form>
          </section>
        </div>

        <div className="min-w-0 space-y-6">
          <section className="rounded-lg border border-border bg-card p-4 sm:p-6">
            <h2 className="text-lg font-semibold">Activity</h2>
            <ol className="mt-2 divide-y divide-border text-sm [overflow-wrap:anywhere]">
              <li className="py-3">
                <p className="font-medium">Deal submitted</p>
                <p className="text-muted-foreground">
                  {deal.agent?.full_name || deal.agent?.email || "Agent"} · <time dateTime={deal.submitted_at}>{formatDate(deal.submitted_at)}</time>
                </p>
              </li>
              {comments.slice(0, 3).map((comment) => (
                <li key={comment.id} className="py-3">
                  <p className="font-medium">
                    {comment.content.startsWith("[REJECTED]") ? "Deal rejected" : comment.content.startsWith("[CHANGES REQUESTED]") ? "Changes requested" : "Comment added"}
                  </p>
                  <p className="text-muted-foreground">{comment.user?.full_name || "User"} · <time dateTime={comment.created_at}>{formatDate(comment.created_at)}</time></p>
                </li>
              ))}
            </ol>
          </section>

          <section className="rounded-lg border border-border bg-card p-4 sm:p-6">
            <h2 className="text-lg font-semibold">Deal tools</h2>
            <div className="mt-3 grid gap-2">
              <Button variant="outline" className="min-h-11 justify-start whitespace-normal" asChild>
                <Link href={dealHref + "/underwriting"}>View underwriting</Link>
              </Button>
              <Button variant="outline" className="min-h-11 justify-start whitespace-normal" asChild>
                <Link href={dealHref + "/documents"}>View documents</Link>
              </Button>
              <Button variant="outline" className="min-h-11 justify-start whitespace-normal" asChild>
                <Link href={"/dashboard/analysis/mao?arv=" + (deal.asking_price || 0) + "&repairs=0"}>Open maximum offer calculator</Link>
              </Button>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
