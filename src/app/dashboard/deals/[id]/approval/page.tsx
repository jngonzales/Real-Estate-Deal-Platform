"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import {
  CheckCircle2,
  XCircle,
  AlertCircle,
  Clock,
  MessageSquare,
  Building2,
  DollarSign,
  TrendingUp,
  ArrowLeft,
  User,
  ChevronRight,
  Loader2,
} from "lucide-react";
import Link from "next/link";
import { getDeal, updateDealStatus, DealWithProperty } from "@/lib/actions/deal-actions";
import { getComments, addComment, Comment } from "@/lib/actions/comment-actions";

// Status configuration
const statusConfig: Record<string, { label: string; color: string; icon: React.ElementType }> = {
  submitted: { label: "Submitted", color: "bg-gray-500", icon: Clock },
  needs_info: { label: "Needs Info", color: "bg-amber-500", icon: AlertCircle },
  underwriting: { label: "Under Review", color: "bg-emerald-600", icon: AlertCircle },
  offer_prepared: { label: "Offer Prepared", color: "bg-gray-500", icon: CheckCircle2 },
  offer_sent: { label: "Offer Sent", color: "bg-gray-500", icon: CheckCircle2 },
  in_contract: { label: "In Contract", color: "bg-amber-500", icon: CheckCircle2 },
  funding: { label: "Funding", color: "bg-amber-500", icon: CheckCircle2 },
  closed: { label: "Closed", color: "bg-emerald-600", icon: CheckCircle2 },
  rejected: { label: "Rejected", color: "bg-red-500", icon: XCircle },
};

const propertyTypeLabels: Record<string, string> = {
  single_family: "Single Family",
  multi_family: "Multi-Family",
  condo: "Condo",
  townhouse: "Townhouse",
  land: "Land",
  commercial: "Commercial",
  other: "Other",
};

export default function DealApprovalPage() {
  const params = useParams();
  const router = useRouter();
  const dealId = params.id as string;
  
  const [deal, setDeal] = useState<DealWithProperty | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [newComment, setNewComment] = useState("");
  const [comments, setComments] = useState<Comment[]>([]);
  const [rejectionReason, setRejectionReason] = useState("");
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [showChangesDialog, setShowChangesDialog] = useState(false);
  const [changesRequested, setChangesRequested] = useState("");

  const loadDeal = useCallback(async () => {
    const { deal: fetchedDeal, error } = await getDeal(dealId);
    if (error) {
      toast.error("Failed to load deal", { description: error });
      return;
    }
    setDeal(fetchedDeal);
    setLoading(false);
  }, [dealId]);

  const loadComments = useCallback(async () => {
    const { comments: fetchedComments, error } = await getComments(dealId);
    if (!error && fetchedComments) {
      setComments(fetchedComments);
    }
  }, [dealId]);

  useEffect(() => {
    loadDeal();
    loadComments();
  }, [loadDeal, loadComments]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0,
    }).format(value);
  };

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
    setSubmitting(true);
    const { success, error } = await updateDealStatus(dealId, "offer_prepared");
    if (error) {
      toast.error("Failed to approve deal", { description: error });
    } else if (success) {
      toast.success("Deal Approved!", {
        description: "The deal has been approved and moved to the pipeline.",
      });
      router.refresh();
      loadDeal();
    }
    setSubmitting(false);
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
      toast.error("Deal Rejected", {
        description: "The agent has been notified.",
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
      toast.warning("Changes Requested", {
        description: "The agent has been notified to update the submission.",
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
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!deal) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <p className="text-muted-foreground">Deal not found</p>
        <Button asChild>
          <Link href="/dashboard/deals">Back to Deals</Link>
        </Button>
      </div>
    );
  }

  // Calculate estimated financials (simplified)
  const askingPrice = deal.asking_price || 0;
  const estimatedROI = askingPrice > 0 ? ((askingPrice * 0.15) / askingPrice) * 100 : 0;
  const status = deal.status || "submitted";
  const statusInfo = statusConfig[status] || statusConfig.submitted;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/dashboard/deals">
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
          <div>
            <div className="flex items-center gap-3">
              <h2 className="text-2xl font-bold text-foreground dark:text-white">
                {deal.property?.address || "Unknown Address"}
              </h2>
              <Badge className={`${statusInfo.color} text-white`}>
                {statusInfo.label}
              </Badge>
            </div>
            <p className="text-muted-foreground dark:text-muted-foreground">
              {deal.property?.city}, {deal.property?.state} {deal.property?.zip}
            </p>
          </div>
        </div>
        
        {/* Action Buttons - Only show for reviewable statuses */}
        {["submitted", "underwriting", "needs_info"].includes(status) && (
          <div className="flex gap-2">
            <Dialog open={showChangesDialog} onOpenChange={setShowChangesDialog}>
              <DialogTrigger asChild>
                <Button variant="outline" className="border-amber-500 text-amber-500 hover:bg-amber-500/10">
                  <AlertCircle className="mr-2 h-4 w-4" />
                  Request Changes
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Request Changes</DialogTitle>
                  <DialogDescription>
                    Specify what changes the agent needs to make before resubmitting.
                  </DialogDescription>
                </DialogHeader>
                <div className="py-4">
                  <Label htmlFor="changes">Required Changes</Label>
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
                  <Button onClick={handleRequestChanges} disabled={submitting} className="bg-amber-500 hover:bg-amber-600">
                    {submitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                    Request Changes
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            <Dialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
              <DialogTrigger asChild>
                <Button variant="outline" className="border-red-500 text-red-500 hover:bg-red-500/10">
                  <XCircle className="mr-2 h-4 w-4" />
                  Reject
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Reject Deal</DialogTitle>
                  <DialogDescription>
                    This action cannot be undone. Please provide a reason for rejection.
                  </DialogDescription>
                </DialogHeader>
                <div className="py-4">
                  <Label htmlFor="reason">Rejection Reason</Label>
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
                    {submitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                    Reject Deal
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            <Button onClick={handleApprove} disabled={submitting} className="bg-emerald-500 hover:bg-emerald-600">
              {submitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <CheckCircle2 className="mr-2 h-4 w-4" />}
              Approve Deal
            </Button>
          </div>
        )}
      </div>

      {/* Main Content */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left Column - Deal Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Deal Score */}
          <Card className={`border-2 ${
            estimatedROI >= 25 ? "border-primary bg-primary/5" :
            estimatedROI >= 15 ? "border-primary bg-primary/5" :
            estimatedROI >= 5 ? "border-yellow-500 bg-yellow-500/5" :
            "border-red-500 bg-red-500/5"
          } dark:bg-opacity-10`}>
            <CardContent className="py-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  {estimatedROI >= 25 ? (
                    <CheckCircle2 className="h-12 w-12 text-primary" />
                  ) : estimatedROI >= 15 ? (
                    <TrendingUp className="h-12 w-12 text-primary" />
                  ) : estimatedROI >= 5 ? (
                    <AlertCircle className="h-12 w-12 text-yellow-500" />
                  ) : (
                    <XCircle className="h-12 w-12 text-red-500" />
                  )}
                  <div>
                    <p className="text-sm text-muted-foreground">Deal Score</p>
                    <p className={`text-3xl font-bold ${
                      estimatedROI >= 25 ? "text-primary" :
                      estimatedROI >= 15 ? "text-primary" :
                      estimatedROI >= 5 ? "text-yellow-500" :
                      "text-red-500"
                    }`}>
                      {estimatedROI >= 25 ? "Great" : estimatedROI >= 15 ? "Good" : estimatedROI >= 5 ? "Marginal" : "Pass"} Deal
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm text-muted-foreground">Asking Price</p>
                  <p className="text-3xl font-bold text-foreground">
                    {formatCurrency(askingPrice)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Financial Analysis */}
          <div className="grid gap-4 md:grid-cols-2">
            <Card className="dark:bg-card/50 dark:border-border">
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-base">
                  <DollarSign className="h-4 w-4" />
                  Investment Summary
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Asking Price</span>
                  <span className="font-medium">{formatCurrency(askingPrice)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Seller</span>
                  <span className="font-medium">{deal.seller_name || "N/A"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Seller Phone</span>
                  <span className="font-medium">{deal.seller_phone || "N/A"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Motivation</span>
                  <span className="font-medium">{deal.seller_motivation || "N/A"}</span>
                </div>
              </CardContent>
            </Card>

            <Card className="dark:bg-card/50 dark:border-border">
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-base">
                  <TrendingUp className="h-4 w-4" />
                  Deal Info
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Status</span>
                  <span className="font-medium">{statusInfo.label}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Submitted</span>
                  <span className="font-medium">{formatDate(deal.submitted_at)}</span>
                </div>
                {deal.notes && (
                  <div className="pt-2 border-t">
                    <span className="text-muted-foreground">Notes:</span>
                    <p className="font-medium mt-1">{deal.notes}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Property Details */}
          <Card className="dark:bg-card/50 dark:border-border">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-base">
                <Building2 className="h-4 w-4" />
                Property Details
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 text-sm sm:grid-cols-3">
                <div>
                  <span className="text-muted-foreground">Type</span>
                  <p className="font-medium">{deal.property?.property_type ? propertyTypeLabels[deal.property.property_type] || deal.property.property_type : "N/A"}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Bedrooms</span>
                  <p className="font-medium">{deal.property?.bedrooms || "N/A"}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Bathrooms</span>
                  <p className="font-medium">{deal.property?.bathrooms || "N/A"}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Square Feet</span>
                  <p className="font-medium">{deal.property?.sqft?.toLocaleString() || "N/A"}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Year Built</span>
                  <p className="font-medium">{deal.property?.year_built || "N/A"}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Address</span>
                  <p className="font-medium">{deal.property?.address || "N/A"}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Comments Section */}
          <Card className="dark:bg-card/50 dark:border-border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <MessageSquare className="h-4 w-4" />
                Comments & Discussion
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {comments.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">No comments yet. Be the first to add one!</p>
              ) : (
                comments.map((comment) => (
                  <div key={comment.id} className="flex gap-3 rounded-lg border p-3 dark:border-border">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                      <User className="h-4 w-4" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{comment.user?.full_name || comment.user?.email || "Unknown"}</span>
                        <Badge variant="secondary" className="text-xs">
                          {comment.user?.role || "User"}
                        </Badge>
                        <span className="text-xs text-muted-foreground">{formatDate(comment.created_at)}</span>
                      </div>
                      <p className="mt-1 text-sm">{comment.content}</p>
                    </div>
                  </div>
                ))
              )}
              
              {/* Add Comment */}
              <div className="flex gap-3 pt-4 border-t dark:border-border">
                <Textarea
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Add a comment..."
                  className="flex-1"
                  rows={2}
                />
                <Button onClick={handleAddComment} disabled={submitting || !newComment.trim()}>
                  {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : "Post"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Sidebar */}
        <div className="space-y-6">
          {/* Agent Info */}
          <Card className="dark:bg-card/50 dark:border-border">
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Submitted By</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground font-semibold">
                  {(deal.agent?.full_name || deal.agent?.email || "U").charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="font-medium">{deal.agent?.full_name || "Unknown"}</p>
                  <p className="text-sm text-muted-foreground">{deal.agent?.email || "No email"}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Timeline - Based on Comments */}
          <Card className="dark:bg-card/50 dark:border-border">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-base">
                <Clock className="h-4 w-4" />
                Activity History
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Deal Submission */}
                <div className="flex gap-3">
                  <div className="relative">
                    <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/20 text-emerald-500">
                      <Clock className="h-3 w-3" />
                    </div>
                    {comments.length > 0 && (
                      <div className="absolute left-3 top-6 h-full w-px bg-muted dark:bg-secondary" />
                    )}
                  </div>
                  <div className="flex-1 pb-4">
                    <p className="text-sm font-medium">Deal Submitted</p>
                    <p className="text-xs text-muted-foreground">{deal.agent?.full_name || "Agent"} • {formatDate(deal.submitted_at)}</p>
                  </div>
                </div>
                
                {/* Show recent comments as activity */}
                {comments.slice(0, 3).map((comment, index) => (
                  <div key={comment.id} className="flex gap-3">
                    <div className="relative">
                      <div className={`flex h-6 w-6 items-center justify-center rounded-full ${
                        comment.content.startsWith("[REJECTED]") ? "bg-red-500/20 text-red-500" :
                        comment.content.startsWith("[CHANGES REQUESTED]") ? "bg-amber-500/20 text-amber-500" :
                        "bg-muted text-muted-foreground"
                      }`}>
                        <MessageSquare className="h-3 w-3" />
                      </div>
                      {index < Math.min(comments.length, 3) - 1 && (
                        <div className="absolute left-3 top-6 h-full w-px bg-muted dark:bg-secondary" />
                      )}
                    </div>
                    <div className="flex-1 pb-4">
                      <p className="text-sm font-medium">
                        {comment.content.startsWith("[REJECTED]") ? "Deal Rejected" :
                         comment.content.startsWith("[CHANGES REQUESTED]") ? "Changes Requested" :
                         "Comment Added"}
                      </p>
                      <p className="text-xs text-muted-foreground">{comment.user?.full_name || "User"} • {formatDate(comment.created_at)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card className="dark:bg-card/50 dark:border-border">
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button variant="outline" className="w-full justify-between" asChild>
                <Link href={`/dashboard/deals/${dealId}/underwriting`}>
                  View Full Underwriting
                  <ChevronRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button variant="outline" className="w-full justify-between" asChild>
                <Link href={`/dashboard/deals/${dealId}/documents`}>
                  View Documents
                  <ChevronRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button variant="outline" className="w-full justify-between" asChild>
                <Link href={`/dashboard/analysis/mao?arv=${deal.asking_price || 0}&repairs=0`}>
                  Run MAO Calculator
                  <ChevronRight className="h-4 w-4" />
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
