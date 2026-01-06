"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
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
  Send,
  Building2,
  DollarSign,
  TrendingUp,
  ArrowLeft,
  User,
  ChevronRight,
  FileText,
  History,
  Loader2,
} from "lucide-react";
import Link from "next/link";

// Status configuration
const statusConfig = {
  submitted: { label: "Submitted", color: "bg-blue-500", icon: Clock },
  under_review: { label: "Under Review", color: "bg-yellow-500", icon: AlertCircle },
  changes_requested: { label: "Changes Requested", color: "bg-orange-500", icon: AlertCircle },
  approved: { label: "Approved", color: "bg-emerald-500", icon: CheckCircle2 },
  rejected: { label: "Rejected", color: "bg-red-500", icon: XCircle },
};

// Mock deal data - in production this comes from Supabase
const mockDeal = {
  id: "deal-123",
  status: "under_review",
  property: {
    address: "123 Oak Street",
    city: "Austin",
    state: "TX",
    zip: "78701",
    type: "single_family",
    bedrooms: 3,
    bathrooms: 2,
    sqft: 1850,
  },
  agent: {
    id: "agent-1",
    name: "John Smith",
    email: "john@example.com",
  },
  financials: {
    askingPrice: 285000,
    arv: 385000,
    repairCost: 45000,
    closingCosts: 8550,
    holdingCosts: 3000,
    sellingCosts: 30800,
    totalInvestment: 341550,
    profit: 43450,
    roi: 12.7,
    mao70: 224500,
  },
  submittedAt: "2025-01-18T10:30:00Z",
  lastUpdated: "2025-01-19T14:20:00Z",
  notes: "Seller is motivated. Property needs kitchen and bathroom updates.",
};

const mockHistory = [
  { id: 1, action: "Submitted for Review", user: "John Smith", timestamp: "2025-01-18T10:30:00Z", type: "submit" },
  { id: 2, action: "Assigned for Review", user: "Sarah Wilson", timestamp: "2025-01-18T11:15:00Z", type: "assign" },
  { id: 3, action: "Under Review", user: "Sarah Wilson", timestamp: "2025-01-19T09:00:00Z", type: "review" },
  { id: 4, action: "Comment Added", user: "Sarah Wilson", timestamp: "2025-01-19T14:20:00Z", type: "comment", comment: "ARV looks reasonable based on comps. Need to verify repair estimates." },
];

const mockComments = [
  { id: 1, user: "Sarah Wilson", role: "Underwriter", timestamp: "2025-01-19T14:20:00Z", content: "ARV looks reasonable based on comps. Need to verify repair estimates." },
  { id: 2, user: "John Smith", role: "Agent", timestamp: "2025-01-19T15:00:00Z", content: "I've attached updated contractor quotes for the kitchen renovation." },
];

export default function DealApprovalPage() {
  const params = useParams();
  const [deal, setDeal] = useState(mockDeal);
  const [submitting, setSubmitting] = useState(false);
  const [newComment, setNewComment] = useState("");
  const [comments, setComments] = useState(mockComments);
  const [rejectionReason, setRejectionReason] = useState("");
  const [changesRequested, setChangesRequested] = useState("");
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [showChangesDialog, setShowChangesDialog] = useState(false);

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
    // In production, call API to update deal status
    await new Promise(resolve => setTimeout(resolve, 1000));
    setDeal(prev => ({ ...prev, status: "approved" }));
    toast.success("Deal Approved!", {
      description: "The deal has been approved and moved to the pipeline.",
    });
    setSubmitting(false);
  };

  const handleReject = async () => {
    if (!rejectionReason.trim()) {
      toast.error("Please provide a reason for rejection");
      return;
    }
    setSubmitting(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    setDeal(prev => ({ ...prev, status: "rejected" }));
    setShowRejectDialog(false);
    toast.error("Deal Rejected", {
      description: "The agent has been notified.",
    });
    setSubmitting(false);
  };

  const handleRequestChanges = async () => {
    if (!changesRequested.trim()) {
      toast.error("Please specify what changes are needed");
      return;
    }
    setSubmitting(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    setDeal(prev => ({ ...prev, status: "changes_requested" }));
    setShowChangesDialog(false);
    toast.warning("Changes Requested", {
      description: "The agent has been notified to update the submission.",
    });
    setSubmitting(false);
  };

  const handleAddComment = async () => {
    if (!newComment.trim()) return;
    const comment = {
      id: comments.length + 1,
      user: "Current User", // Would come from auth
      role: "Underwriter",
      timestamp: new Date().toISOString(),
      content: newComment,
    };
    setComments(prev => [...prev, comment]);
    setNewComment("");
    toast.success("Comment added");
  };

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
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
                {deal.property.address}
              </h2>
              <Badge className={`${statusConfig[deal.status as keyof typeof statusConfig]?.color} text-white`}>
                {statusConfig[deal.status as keyof typeof statusConfig]?.label}
              </Badge>
            </div>
            <p className="text-slate-600 dark:text-slate-400">
              {deal.property.city}, {deal.property.state} {deal.property.zip}
            </p>
          </div>
        </div>
        
        {/* Action Buttons */}
        {deal.status !== "approved" && deal.status !== "rejected" && (
          <div className="flex gap-2">
            <Dialog open={showChangesDialog} onOpenChange={setShowChangesDialog}>
              <DialogTrigger asChild>
                <Button variant="outline" className="border-orange-500 text-orange-500 hover:bg-orange-500/10">
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
                  <Button onClick={handleRequestChanges} disabled={submitting} className="bg-orange-500 hover:bg-orange-600">
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
            deal.financials.roi >= 25 ? "border-emerald-500 bg-emerald-500/5" :
            deal.financials.roi >= 15 ? "border-blue-500 bg-blue-500/5" :
            deal.financials.roi >= 5 ? "border-yellow-500 bg-yellow-500/5" :
            "border-red-500 bg-red-500/5"
          } dark:bg-opacity-10`}>
            <CardContent className="py-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  {deal.financials.roi >= 25 ? (
                    <CheckCircle2 className="h-12 w-12 text-emerald-500" />
                  ) : deal.financials.roi >= 15 ? (
                    <TrendingUp className="h-12 w-12 text-blue-500" />
                  ) : deal.financials.roi >= 5 ? (
                    <AlertCircle className="h-12 w-12 text-yellow-500" />
                  ) : (
                    <XCircle className="h-12 w-12 text-red-500" />
                  )}
                  <div>
                    <p className="text-sm text-muted-foreground">Deal Score</p>
                    <p className={`text-3xl font-bold ${
                      deal.financials.roi >= 25 ? "text-emerald-500" :
                      deal.financials.roi >= 15 ? "text-blue-500" :
                      deal.financials.roi >= 5 ? "text-yellow-500" :
                      "text-red-500"
                    }`}>
                      {deal.financials.roi >= 25 ? "Great" : deal.financials.roi >= 15 ? "Good" : deal.financials.roi >= 5 ? "Marginal" : "Pass"} Deal
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm text-muted-foreground">Estimated ROI</p>
                  <p className={`text-3xl font-bold ${
                    deal.financials.roi >= 25 ? "text-emerald-500" :
                    deal.financials.roi >= 15 ? "text-blue-500" :
                    deal.financials.roi >= 5 ? "text-yellow-500" :
                    "text-red-500"
                  }`}>
                    {deal.financials.roi.toFixed(1)}%
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Financial Analysis */}
          <div className="grid gap-4 md:grid-cols-2">
            <Card className="dark:bg-slate-900/50 dark:border-slate-800">
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-base">
                  <DollarSign className="h-4 w-4" />
                  Investment Summary
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Asking Price</span>
                  <span className="font-medium">{formatCurrency(deal.financials.askingPrice)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Repair Cost</span>
                  <span className="font-medium">{formatCurrency(deal.financials.repairCost)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Closing Costs</span>
                  <span className="font-medium">{formatCurrency(deal.financials.closingCosts)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Holding Costs</span>
                  <span className="font-medium">{formatCurrency(deal.financials.holdingCosts)}</span>
                </div>
                <div className="flex justify-between border-t pt-2 font-medium">
                  <span>Total Investment</span>
                  <span>{formatCurrency(deal.financials.totalInvestment)}</span>
                </div>
              </CardContent>
            </Card>

            <Card className="dark:bg-slate-900/50 dark:border-slate-800">
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-base">
                  <TrendingUp className="h-4 w-4" />
                  Profit Analysis
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">ARV</span>
                  <span className="font-medium">{formatCurrency(deal.financials.arv)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">70% MAO</span>
                  <span className="font-medium">{formatCurrency(deal.financials.mao70)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Selling Costs (8%)</span>
                  <span className="font-medium">-{formatCurrency(deal.financials.sellingCosts)}</span>
                </div>
                <div className="flex justify-between border-t pt-2">
                  <span className="font-medium">Net Profit</span>
                  <span className={`font-bold ${deal.financials.profit >= 0 ? "text-emerald-500" : "text-red-500"}`}>
                    {formatCurrency(deal.financials.profit)}
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Property Details */}
          <Card className="dark:bg-slate-900/50 dark:border-slate-800">
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
                  <p className="font-medium capitalize">{deal.property.type.replace("_", " ")}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Bedrooms</span>
                  <p className="font-medium">{deal.property.bedrooms}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Bathrooms</span>
                  <p className="font-medium">{deal.property.bathrooms}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Square Feet</span>
                  <p className="font-medium">{deal.property.sqft.toLocaleString()}</p>
                </div>
                <div className="sm:col-span-2">
                  <span className="text-muted-foreground">Notes</span>
                  <p className="font-medium">{deal.notes}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Comments Section */}
          <Card className="dark:bg-slate-900/50 dark:border-slate-800">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <MessageSquare className="h-4 w-4" />
                Comments & Discussion
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {comments.map((comment) => (
                <div key={comment.id} className="flex gap-3 rounded-lg border p-3 dark:border-slate-700">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                    <User className="h-4 w-4" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{comment.user}</span>
                      <Badge variant="secondary" className="text-xs">{comment.role}</Badge>
                      <span className="text-xs text-muted-foreground">{formatDate(comment.timestamp)}</span>
                    </div>
                    <p className="mt-1 text-sm text-muted-foreground">{comment.content}</p>
                  </div>
                </div>
              ))}

              {/* Add Comment */}
              <div className="flex gap-2">
                <Textarea
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Add a comment..."
                  className="dark:bg-slate-800 dark:border-slate-700"
                />
                <Button onClick={handleAddComment} size="icon" className="shrink-0">
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Sidebar */}
        <div className="space-y-6">
          {/* Agent Info */}
          <Card className="dark:bg-slate-900/50 dark:border-slate-800">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-base">
                <User className="h-4 w-4" />
                Submitted By
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary font-medium">
                  {deal.agent.name.split(' ').map(n => n[0]).join('')}
                </div>
                <div>
                  <p className="font-medium">{deal.agent.name}</p>
                  <p className="text-sm text-muted-foreground">{deal.agent.email}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Timeline */}
          <Card className="dark:bg-slate-900/50 dark:border-slate-800">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-base">
                <History className="h-4 w-4" />
                Activity History
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {mockHistory.map((item, index) => (
                  <div key={item.id} className="flex gap-3">
                    <div className="relative">
                      <div className={`flex h-6 w-6 items-center justify-center rounded-full ${
                        item.type === "submit" ? "bg-blue-500/20 text-blue-500" :
                        item.type === "assign" ? "bg-purple-500/20 text-purple-500" :
                        item.type === "review" ? "bg-yellow-500/20 text-yellow-500" :
                        "bg-slate-500/20 text-slate-500"
                      }`}>
                        {item.type === "submit" ? <FileText className="h-3 w-3" /> :
                         item.type === "assign" ? <User className="h-3 w-3" /> :
                         item.type === "review" ? <Clock className="h-3 w-3" /> :
                         <MessageSquare className="h-3 w-3" />}
                      </div>
                      {index < mockHistory.length - 1 && (
                        <div className="absolute left-3 top-6 h-full w-px bg-slate-200 dark:bg-slate-700" />
                      )}
                    </div>
                    <div className="flex-1 pb-4">
                      <p className="text-sm font-medium">{item.action}</p>
                      <p className="text-xs text-muted-foreground">{item.user} • {formatDate(item.timestamp)}</p>
                      {item.comment && (
                        <p className="mt-1 text-xs text-muted-foreground italic">&quot;{item.comment}&quot;</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card className="dark:bg-slate-900/50 dark:border-slate-800">
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button variant="outline" className="w-full justify-between" asChild>
                <Link href={`/dashboard/deals/${params.id}/underwriting`}>
                  View Full Underwriting
                  <ChevronRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button variant="outline" className="w-full justify-between" asChild>
                <Link href={`/dashboard/deals/${params.id}/documents`}>
                  View Documents
                  <ChevronRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button variant="outline" className="w-full justify-between" asChild>
                <Link href={`/dashboard/analysis/mao?arv=${deal.financials.arv}&repairs=${deal.financials.repairCost}`}>
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
