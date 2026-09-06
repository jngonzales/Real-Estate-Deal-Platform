"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { DealWithProperty, DealStatus, updateDealStatus } from "@/lib/actions/deal-actions";
import { bulkDelete } from "@/lib/actions/bulk-actions";
import { format } from "date-fns";
import { toast } from "sonner";
import {
  ArrowLeft,
  Home,
  MapPin,
  DollarSign,
  User,
  Phone,
  Mail,
  Calendar,
  Building,
  Bed,
  Bath,
  Square,
  FileText,
  Image as ImageIcon,
  ChevronDown,
  Download,
  Loader2,
  BarChart3,
} from "@/components/ui/icons";
import { Comments } from "./comments";
import { AssignDeal } from "./assign-deal";
import { DealTimeline } from "./deal-timeline";
import { DealRecommendations } from "./deal-recommendations";
import { DealCollaboration } from "./deal-collaboration";
import { EmailSequenceManager } from "./email-sequence-manager";
import { DealScoreDisplay } from "./deal-score-display";
import { CompsAnalysis } from "./comps-analysis";
import { createClient } from "@/utils/supabase/client";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";

const statusColors: Record<string, string> = {
  submitted: "bg-muted text-muted-foreground border-border",
  needs_info: "bg-amber-100 text-amber-800 border-amber-200",
  underwriting: "bg-emerald-100 text-emerald-800 border-emerald-200",
  offer_prepared: "bg-muted text-muted-foreground border-border",
  offer_sent: "bg-muted text-muted-foreground border-border",
  in_contract: "bg-amber-100 text-amber-800 border-amber-200",
  funding: "bg-amber-100 text-amber-800 border-amber-200",
  closed: "bg-emerald-100 text-emerald-800 border-emerald-200",
  rejected: "bg-red-100 text-red-800 border-red-200",
};

const statusLabels: Record<string, string> = {
  submitted: "Submitted",
  needs_info: "Needs Info",
  underwriting: "Underwriting",
  offer_prepared: "Offer Prepared",
  offer_sent: "Offer Sent",
  in_contract: "In Contract",
  funding: "Funding",
  closed: "Closed",
  rejected: "Rejected",
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

const motivationLabels: Record<string, string> = {
  high: "High - Motivated to sell quickly",
  medium: "Medium - Flexible on timeline",
  low: "Low - Not in a hurry",
};

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(amount);
}

interface Attachment {
  id: string;
  deal_id: string;
  file_name: string;
  file_url: string;
  file_type: string;
  created_at: string;
}

interface TimelineData {
  underwriting: {
    created_at: string;
    max_offer: number;
    underwriter?: { full_name?: string };
  } | null;
  commentsCount: number;
  photosCount: number;
  submittedBy?: string;
  assignedTo?: string;
  assignedAt?: string | null;
}

interface DealDetailClientProps {
  deal: DealWithProperty;
  attachments: Attachment[];
  isAdmin?: boolean;
  canDeleteDeal?: boolean;
  timelineData?: TimelineData;
}

export function DealDetailClient({ deal, attachments, isAdmin = false, canDeleteDeal = false, timelineData }: DealDetailClientProps) {
  const router = useRouter();
  const [isUpdating, setIsUpdating] = useState(false);
  const [showStatusDropdown, setShowStatusDropdown] = useState(false);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const [isGeneratingReport, setIsGeneratingReport] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  // Get current user for collaboration
  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => {
      setCurrentUserId(data.user?.id || null);
    });
  }, []);

  const handleStatusChange = async (newStatus: DealStatus) => {
    if (newStatus === deal.status) {
      setShowStatusDropdown(false);
      return;
    }

    setIsUpdating(true);
    const result = await updateDealStatus(deal.id, newStatus);
    setIsUpdating(false);
    setShowStatusDropdown(false);

    if (result.error) {
      console.error("Failed to update status:", result.error);
      toast.error("Failed to update status", { description: result.error });
    } else {
      toast.success(`Status updated to ${statusLabels[newStatus]}`);
      router.refresh();
    }
  };

  const handleDeleteDeal = async () => {
    if (isDeleting) return;
    setIsDeleting(true);
    setDeleteError(null);

    try {
      const result = await bulkDelete([deal.id]);
      if (result.error || result.deleted !== 1) {
        setDeleteError(result.error ?? "Deal was not deleted.");
        setIsDeleting(false);
        return;
      }
    } catch {
      setDeleteError("Could not delete the deal. Try again.");
      setIsDeleting(false);
      return;
    }

    toast.success("Deal deleted");
    router.replace("/dashboard/deals");
  };

  const handleDownloadPdf = async () => {
    setIsGeneratingPdf(true);
    try {
      const response = await fetch(`/api/deals/${deal.id}/pdf`);
      if (!response.ok) {
        throw new Error("Failed to generate PDF");
      }
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `offer-${deal.property?.address?.replace(/\s+/g, "-").toLowerCase() || deal.id}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      toast.success("PDF downloaded successfully");
    } catch (error) {
      console.error("Error downloading PDF:", error);
      toast.error("Failed to generate PDF");
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  const handleDownloadAnalysisReport = async () => {
    setIsGeneratingReport(true);
    try {
      // Build report data from deal (use asking price as baseline)
      const askingPrice = deal.asking_price || 0;
      const estimatedArv = askingPrice * 1.3; // Estimate ARV as 30% above asking
      const estimatedRepairs = askingPrice * 0.15; // Estimate repairs at 15%
      const estimatedProfit = estimatedArv - askingPrice - estimatedRepairs;
      const estimatedRoi = askingPrice > 0 ? Math.round((estimatedProfit / askingPrice) * 100) : 0;

      const reportData = {
        property: {
          address: deal.property?.address || "",
          city: deal.property?.city || "",
          state: deal.property?.state || "",
          zip: deal.property?.zip || "",
          propertyType: deal.property?.property_type || "",
          bedrooms: deal.property?.bedrooms || 0,
          bathrooms: deal.property?.bathrooms || 0,
          sqft: deal.property?.sqft || 0,
          yearBuilt: deal.property?.year_built || undefined,
        },
        financials: {
          askingPrice: askingPrice,
          arv: estimatedArv,
          repairCost: estimatedRepairs,
          mao: askingPrice * 0.7, // 70% rule
          potentialProfit: estimatedProfit,
          roi: estimatedRoi,
        },
        repairScope: {
          kitchen: { cost: estimatedRepairs * 0.2, condition: "Average" as const },
          bathrooms: { cost: estimatedRepairs * 0.15, condition: "Average" as const },
          flooring: { cost: estimatedRepairs * 0.1, condition: "Average" as const },
          roof: { cost: estimatedRepairs * 0.15, condition: "Average" as const },
          hvac: { cost: estimatedRepairs * 0.1, condition: "Average" as const },
          electrical: { cost: estimatedRepairs * 0.05, condition: "Average" as const },
          plumbing: { cost: estimatedRepairs * 0.05, condition: "Average" as const },
          exterior: { cost: estimatedRepairs * 0.1, condition: "Average" as const },
          contingency: estimatedRepairs * 0.1,
          total: estimatedRepairs,
        },
        dealScore: estimatedRoi >= 25 ? "Great" as const : estimatedRoi >= 15 ? "Good" as const : estimatedRoi >= 5 ? "Marginal" as const : "Pass" as const,
        recommendation: estimatedProfit > 0
          ? `Based on initial analysis, this property at ${deal.property?.address || "the listed address"} presents a ${estimatedRoi >= 15 ? "promising" : "moderate"} investment opportunity with an estimated ROI of ${estimatedRoi}%.`
          : "Additional analysis recommended before proceeding with this investment.",
        generatedAt: new Date().toLocaleDateString("en-US", {
          year: "numeric",
          month: "long",
          day: "numeric",
        }),
      };

      const response = await fetch("/api/deals/report", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(reportData),
      });

      if (!response.ok) {
        throw new Error("Failed to generate analysis report");
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `deal-analysis-${deal.property?.address?.replace(/\s+/g, "-").toLowerCase() || deal.id}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      toast.success("Analysis report downloaded successfully");
    } catch (error) {
      console.error("Error downloading analysis report:", error);
      toast.error("Failed to generate analysis report");
    } finally {
      setIsGeneratingReport(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <Link
            href="/dashboard/deals"
            className="mb-2 inline-flex items-center text-sm text-muted-foreground hover:text-foreground dark:text-muted-foreground dark:hover:text-foreground"
          >
            <ArrowLeft className="mr-1 h-4 w-4" />
            Back to Deals
          </Link>
          <h2 className="text-2xl font-bold text-foreground dark:text-white">
            {deal.property?.address ?? 'N/A'}
          </h2>
          <p className="flex items-center text-muted-foreground dark:text-muted-foreground">
            <MapPin className="mr-1 h-4 w-4" />
            {deal.property?.city ?? ''}, {deal.property?.state ?? ''} {deal.property?.zip ?? ''}
            {deal.property?.country && deal.property.country !== 'US' && `, ${deal.property.country}`}
          </p>
        </div>

        {/* Status and Assignment */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Assignment Dropdown - Only for admins/underwriters */}
          {isAdmin && (
            <AssignDeal
              dealId={deal.id}
              currentAssigneeId={deal.assigned_to}
              currentAssigneeName={deal.assignee?.full_name}
            />
          )}

          {/* Status Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowStatusDropdown(!showStatusDropdown)}
              disabled={isUpdating}
              className={`inline-flex items-center rounded-lg border px-4 py-2 text-sm font-semibold ${
                statusColors[deal.status]
              } ${isUpdating ? "opacity-50" : ""}`}
            >
              {isUpdating ? "Updating..." : statusLabels[deal.status]}
              <ChevronDown className="ml-2 h-4 w-4" />
            </button>
            {showStatusDropdown && (
              <div className="absolute right-0 z-10 mt-2 w-48 rounded-lg border border-border bg-white py-1 shadow-lg max-h-80 overflow-y-auto dark:border-border dark:bg-secondary">
                {(["submitted", "needs_info", "underwriting", "offer_prepared", "offer_sent", "in_contract", "funding", "closed", "rejected"] as DealStatus[]).map(
                  (status) => (
                    <button
                      key={status}
                      onClick={() => handleStatusChange(status)}
                      className={`block w-full px-4 py-2 text-left text-sm hover:bg-muted dark:hover:bg-secondary/80 ${
                        status === deal.status ? "bg-muted dark:bg-secondary font-medium" : ""
                      }`}
                    >
                      <span
                        className={`inline-block rounded px-2 py-0.5 ${statusColors[status]}`}
                      >
                        {statusLabels[status]}
                      </span>
                    </button>
                  )
                )}
              </div>
            )}
          </div>

          {/* Real-time Collaboration */}
          {currentUserId && (
            <DealCollaboration dealId={deal.id} currentUserId={currentUserId} />
          )}
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left Column - Main Info */}
        <div className="space-y-6 lg:col-span-2">
          {/* Property Details */}
          <div className="rounded-lg border border-border bg-white dark:border-border dark:bg-secondary">
            <div className="border-b border-border px-6 py-4 dark:border-border">
              <h3 className="flex items-center font-semibold text-foreground dark:text-white">
                <Home className="mr-2 h-5 w-5 text-muted-foreground" />
                Property Details
              </h3>
            </div>
            <div className="p-6">
              <dl className="grid gap-4 sm:grid-cols-2">
                <div>
                  <dt className="text-sm text-muted-foreground dark:text-muted-foreground">Property Type</dt>
                  <dd className="mt-1 flex items-center font-medium text-foreground dark:text-white">
                    <Building className="mr-2 h-4 w-4 text-muted-foreground" />
                    {deal.property ? (propertyTypeLabels[deal.property.property_type] ||
                      deal.property.property_type) : 'N/A'}
                  </dd>
                </div>
                <div>
                  <dt className="text-sm text-muted-foreground dark:text-muted-foreground">County</dt>
                  <dd className="mt-1 font-medium text-foreground dark:text-white">
                    {deal.property?.county || "—"}
                  </dd>
                </div>
                {deal.property?.bedrooms && (
                  <div>
                    <dt className="text-sm text-muted-foreground dark:text-muted-foreground">Bedrooms</dt>
                    <dd className="mt-1 flex items-center font-medium text-foreground dark:text-white">
                      <Bed className="mr-2 h-4 w-4 text-muted-foreground" />
                      {deal.property.bedrooms}
                    </dd>
                  </div>
                )}
                {deal.property?.bathrooms && (
                  <div>
                    <dt className="text-sm text-muted-foreground dark:text-muted-foreground">Bathrooms</dt>
                    <dd className="mt-1 flex items-center font-medium text-foreground dark:text-white">
                      <Bath className="mr-2 h-4 w-4 text-muted-foreground" />
                      {deal.property.bathrooms}
                    </dd>
                  </div>
                )}
                {deal.property?.sqft && (
                  <div>
                    <dt className="text-sm text-muted-foreground dark:text-muted-foreground">Square Feet</dt>
                    <dd className="mt-1 flex items-center font-medium text-foreground dark:text-white">
                      <Square className="mr-2 h-4 w-4 text-muted-foreground" />
                      {deal.property.sqft.toLocaleString()} sqft
                    </dd>
                  </div>
                )}
                {deal.property?.year_built && (
                  <div>
                    <dt className="text-sm text-muted-foreground dark:text-muted-foreground">Year Built</dt>
                    <dd className="mt-1 flex items-center font-medium text-foreground dark:text-white">
                      <Calendar className="mr-2 h-4 w-4 text-muted-foreground" />
                      {deal.property.year_built}
                    </dd>
                  </div>
                )}
              </dl>
            </div>
          </div>

          {/* Seller Information */}
          <div className="rounded-lg border border-border bg-white dark:border-border dark:bg-secondary">
            <div className="border-b border-border px-6 py-4 dark:border-border">
              <h3 className="flex items-center font-semibold text-foreground dark:text-white">
                <User className="mr-2 h-5 w-5 text-muted-foreground" />
                Seller Information
              </h3>
            </div>
            <div className="p-6">
              <dl className="grid gap-4 sm:grid-cols-2">
                <div>
                  <dt className="text-sm text-muted-foreground dark:text-muted-foreground">Contact Name</dt>
                  <dd className="mt-1 font-medium text-foreground dark:text-white">
                    {deal.seller_name}
                  </dd>
                </div>
                <div>
                  <dt className="text-sm text-muted-foreground dark:text-muted-foreground">Motivation</dt>
                  <dd className="mt-1 font-medium text-foreground dark:text-white">
                    {deal.seller_motivation
                      ? motivationLabels[deal.seller_motivation] ||
                        deal.seller_motivation
                      : "—"}
                  </dd>
                </div>
                {deal.seller_phone && (
                  <div>
                    <dt className="text-sm text-muted-foreground dark:text-muted-foreground">Phone</dt>
                    <dd className="mt-1 flex items-center font-medium text-foreground dark:text-white">
                      <Phone className="mr-2 h-4 w-4 text-muted-foreground" />
                      <a
                        href={`tel:${deal.seller_phone}`}
                        className="text-emerald-600 hover:underline dark:text-emerald-400"
                      >
                        {deal.seller_phone}
                      </a>
                    </dd>
                  </div>
                )}
                {deal.seller_email && (
                  <div>
                    <dt className="text-sm text-muted-foreground dark:text-muted-foreground">Email</dt>
                    <dd className="mt-1 flex items-center font-medium text-foreground dark:text-white">
                      <Mail className="mr-2 h-4 w-4 text-muted-foreground" />
                      <a
                        href={`mailto:${deal.seller_email}`}
                        className="text-emerald-600 hover:underline dark:text-emerald-400"
                      >
                        {deal.seller_email}
                      </a>
                    </dd>
                  </div>
                )}
              </dl>
            </div>
          </div>

          {/* Notes */}
          {deal.notes && (
            <div className="rounded-lg border border-border bg-white dark:border-border dark:bg-secondary">
              <div className="border-b border-border px-6 py-4 dark:border-border">
                <h3 className="flex items-center font-semibold text-foreground dark:text-white">
                  <FileText className="mr-2 h-5 w-5 text-muted-foreground" />
                  Notes
                </h3>
              </div>
              <div className="p-6">
                <p className="whitespace-pre-wrap text-foreground/90 dark:text-foreground/90">{deal.notes}</p>
              </div>
            </div>
          )}

          {/* Photos */}
          {attachments.length > 0 && (
            <div className="rounded-lg border border-border bg-white dark:border-border dark:bg-secondary">
              <div className="border-b border-border px-6 py-4 dark:border-border">
                <h3 className="flex items-center font-semibold text-foreground dark:text-white">
                  <ImageIcon className="mr-2 h-5 w-5 text-muted-foreground" />
                  Photos ({attachments.length})
                </h3>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
                  {attachments.map((attachment) => (
                    <a
                      key={attachment.id}
                      href={attachment.file_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group relative aspect-video overflow-hidden rounded-lg border border-border dark:border-border"
                    >
                      {/* Attachment URLs come from Supabase storage; using
                          next/image would require a remotePatterns entry. */}
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={attachment.file_url}
                        alt={attachment.file_name}
                        className="h-full w-full object-cover transition-transform group-hover:scale-105"
                      />
                    </a>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Comments */}
          <Comments dealId={deal.id} isAdmin={isAdmin} />

          {/* Comparable Properties Analysis */}
          <CompsAnalysis
            subjectProperty={{
              address: deal.property?.address,
              sqft: deal.property?.sqft,
              bedrooms: deal.property?.bedrooms,
              bathrooms: deal.property?.bathrooms,
              propertyType: deal.property?.property_type,
            }}
          />
        </div>

        {/* Right Column - Summary */}
        <div className="space-y-6">
          {/* Price Card */}
          <div className="rounded-lg border border-border bg-white p-6 dark:border-border dark:bg-secondary">
            <div className="text-center">
              <p className="text-sm text-muted-foreground dark:text-muted-foreground">Asking Price</p>
              <p className="mt-1 flex items-center justify-center text-3xl font-bold text-foreground dark:text-white">
                <DollarSign className="h-6 w-6 text-muted-foreground" />
                {formatCurrency(deal.asking_price).replace("$", "")}
              </p>
              {deal.offer_price && (
                <>
                  <p className="mt-4 text-sm text-muted-foreground dark:text-muted-foreground">Offer Price</p>
                  <p className="mt-1 text-2xl font-bold text-green-600 dark:text-green-400">
                    {formatCurrency(deal.offer_price)}
                  </p>
                </>
              )}
            </div>
          </div>

          {/* Timeline */}
          {timelineData && (
            <DealTimeline
              createdAt={deal.submitted_at}
              status={deal.status}
              submittedBy={timelineData.submittedBy}
              assignedTo={timelineData.assignedTo}
              assignedAt={timelineData.assignedAt || undefined}
              underwritingRecord={timelineData.underwriting}
              commentsCount={timelineData.commentsCount}
              photosCount={timelineData.photosCount}
            />
          )}
          {!timelineData && (
            <div className="rounded-lg border border-border bg-white p-6 dark:border-border dark:bg-secondary">
              <h3 className="font-semibold text-foreground dark:text-white">Timeline</h3>
              <div className="mt-4 space-y-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground dark:text-muted-foreground">Submitted</span>
                  <span className="font-medium text-foreground dark:text-white">
                    {format(new Date(deal.submitted_at), "MMM d, yyyy")}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground dark:text-muted-foreground">Last Updated</span>
                  <span className="font-medium text-foreground dark:text-white">
                    {format(new Date(deal.updated_at), "MMM d, yyyy")}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="rounded-lg border border-border bg-white p-6 dark:border-border dark:bg-secondary">
            <h3 className="font-semibold text-foreground dark:text-white">Actions</h3>
            <div className="mt-4 space-y-3">
              {isAdmin && (
                <Link
                  href={`/dashboard/deals/${deal.id}/approval`}
                  className="block w-full rounded-lg bg-primary px-4 py-2 text-center text-sm font-medium text-white hover:opacity-90"
                >
                  Review & Approve
                </Link>
              )}
              <Link
                href={`/dashboard/deals/${deal.id}/underwriting`}
                className="block w-full rounded-lg border border-border px-4 py-2 text-center text-sm font-medium text-foreground/90 hover:bg-muted dark:border-border dark:text-foreground/90 dark:hover:bg-secondary/80"
              >
                View Underwriting
              </Link>
              <Link
                href={`/dashboard/deals/${deal.id}/documents`}
                className="block w-full rounded-lg border border-border px-4 py-2 text-center text-sm font-medium text-foreground/90 hover:bg-muted dark:border-border dark:text-foreground/90 dark:hover:bg-secondary/80"
              >
                Manage Documents
              </Link>
              <button
                onClick={handleDownloadPdf}
                disabled={isGeneratingPdf}
                className="flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary/90 disabled:opacity-50"
              >
                {isGeneratingPdf ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Generating PDF...
                  </>
                ) : (
                  <>
                    <Download className="h-4 w-4" />
                    Download Offer PDF
                  </>
                )}
              </button>
              <button
                onClick={handleDownloadAnalysisReport}
                disabled={isGeneratingReport}
                className="flex w-full items-center justify-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700 disabled:opacity-50"
              >
                {isGeneratingReport ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Generating Report...
                  </>
                ) : (
                  <>
                    <BarChart3 className="h-4 w-4" />
                    Download Analysis Report
                  </>
                )}
              </button>
              {canDeleteDeal && (
                <AlertDialog open={deleteDialogOpen} onOpenChange={(open) => {
                  if (isDeleting) return;
                  setDeleteDialogOpen(open);
                  if (open) setDeleteError(null);
                }}>
                  <AlertDialogTrigger asChild>
                    <Button type="button" variant="outline" className="min-h-11 w-full rounded-lg text-destructive hover:text-destructive">
                      Delete deal
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Delete deal?</AlertDialogTitle>
                      <AlertDialogDescription>
                        {deal.property?.address && <span className="mb-1 block font-medium text-foreground">{deal.property.address}</span>}
                        This permanently deletes the deal, including its underwriting and comments.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <p role="alert" className={deleteError ? "text-sm text-destructive" : "sr-only"}>{deleteError}</p>
                    <AlertDialogFooter>
                      <AlertDialogCancel className="min-h-11" aria-disabled={isDeleting}>Cancel</AlertDialogCancel>
                      <Button type="button" variant="destructive" className="min-h-11" aria-disabled={isDeleting} onClick={handleDeleteDeal}>
                        {isDeleting ? "Deleting deal…" : "Delete deal"}
                      </Button>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              )}
            </div>
          </div>

          {/* AI Deal Score */}
          <DealScoreDisplay 
            dealData={{
              propertyType: deal.property?.property_type,
              bedrooms: deal.property?.bedrooms,
              bathrooms: deal.property?.bathrooms,
              sqft: deal.property?.sqft,
              yearBuilt: deal.property?.year_built,
              askingPrice: deal.asking_price,
              sellerMotivation: deal.seller_motivation,
            }}
            compact
          />

          {/* AI Recommendations */}
          <DealRecommendations dealId={deal.id} />

          {/* Email Sequences */}
          <EmailSequenceManager dealId={deal.id} />
        </div>
      </div>
    </div>
  );
}
