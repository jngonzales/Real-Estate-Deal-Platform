"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { DealWithProperty, DealStatus, updateDealStatus } from "@/lib/actions/deal-actions";
import { bulkDelete } from "@/lib/actions/bulk-actions";
import { format } from "date-fns";
import { toast } from "sonner";
import {
  Home,
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
import { DropdownMenu, DropdownMenuContent, DropdownMenuRadioGroup, DropdownMenuRadioItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { DealWorkspaceHeading, formatDealCurrency } from "./deal-workspace-heading";

const statusLabels: Record<DealStatus, string> = {
  submitted: "Submitted",
  needs_info: "Needs info",
  underwriting: "Underwriting",
  offer_prepared: "Offer prepared",
  offer_sent: "Offer sent",
  in_contract: "In contract",
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
  attachmentsUnavailable?: boolean;
  isAdmin?: boolean;
  canDeleteDeal?: boolean;
  timelineData?: TimelineData;
}

export function DealDetailClient({ deal, attachments, attachmentsUnavailable, isAdmin = false, canDeleteDeal = false, timelineData }: DealDetailClientProps) {
  const router = useRouter();
  const [isUpdating, setIsUpdating] = useState(false);
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
    if (isUpdating || newStatus === deal.status) return;
    setIsUpdating(true);
    try {
      const result = await updateDealStatus(deal.id, newStatus);
      if (result.error) {
        toast.error("Could not change the deal stage", { description: result.error });
      } else {
        toast.success(`Stage changed to ${statusLabels[newStatus]}`);
        router.refresh();
      }
    } catch {
      toast.error("Could not change the deal stage. Try again.");
    } finally {
      setIsUpdating(false);
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
      <DealWorkspaceHeading
        address={deal.property?.address}
        location={[[deal.property?.city, [deal.property?.state, deal.property?.zip].filter(Boolean).join(" ")].filter(Boolean).join(", "), deal.property?.country !== "US" ? deal.property?.country : undefined].filter(Boolean).join(", ")}
        status={deal.status}
        backHref="/dashboard/deals"
        backLabel="Back to deals"
        actions={(
          <>
            {isAdmin && (
              <AssignDeal dealId={deal.id} currentAssigneeId={deal.assigned_to} currentAssigneeName={deal.assignee?.full_name} />
            )}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="min-h-11" aria-disabled={isUpdating}>
                  {isUpdating ? "Changing stage…" : "Change stage"}
                  <ChevronDown aria-hidden="true" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuRadioGroup value={deal.status} onValueChange={(status) => handleStatusChange(status as DealStatus)}>
                  {Object.entries(statusLabels).map(([status, label]) => (
                    <DropdownMenuRadioItem key={status} value={status} disabled={isUpdating} className="min-h-11">
                      {label}
                    </DropdownMenuRadioItem>
                  ))}
                </DropdownMenuRadioGroup>
              </DropdownMenuContent>
            </DropdownMenu>
            {currentUserId && <DealCollaboration dealId={deal.id} currentUserId={currentUserId} />}
          </>
        )}
      />
      <dl aria-label="Deal amounts" className="grid gap-x-6 gap-y-4 border-y border-border py-4 sm:grid-cols-3">
        <div>
          <dt className="text-sm text-muted-foreground">Asking price</dt>
          <dd className="text-2xl font-semibold tabular-nums [overflow-wrap:anywhere]">{formatDealCurrency(deal.asking_price)}</dd>
        </div>
        <div>
          <dt className="text-sm text-muted-foreground">Offer price</dt>
          <dd className="text-lg font-semibold tabular-nums [overflow-wrap:anywhere]">{formatDealCurrency(deal.offer_price)}</dd>
        </div>
        <div>
          <dt className="text-sm text-muted-foreground">Underwriting maximum offer</dt>
          <dd className="text-lg font-semibold tabular-nums [overflow-wrap:anywhere]">{formatDealCurrency(timelineData?.underwriting?.max_offer)}</dd>
        </div>
      </dl>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left Column - Main Info */}
        <div className="min-w-0 space-y-6 lg:col-span-2">
          {/* Property details */}
          <div className="min-w-0 rounded-lg border border-border bg-card">
            <div className="border-b border-border px-4 py-4 sm:px-6">
              <h2 className="flex items-center font-semibold text-foreground">
                <Home className="mr-2 h-5 w-5 text-muted-foreground" />
                Property details
              </h2>
            </div>
            <div className="p-4 sm:p-6">
              <dl className="grid gap-4 sm:grid-cols-2">
                <div>
                  <dt className="text-sm text-muted-foreground">Property type</dt>
                  <dd className="mt-1 flex items-center font-medium text-foreground">
                    <Building className="mr-2 h-4 w-4 text-muted-foreground" />
                    {deal.property ? (propertyTypeLabels[deal.property.property_type] ||
                      deal.property.property_type) : "Not recorded"}
                  </dd>
                </div>
                <div>
                  <dt className="text-sm text-muted-foreground">County</dt>
                  <dd className="mt-1 font-medium text-foreground">
                    {deal.property?.county || "Not recorded"}
                  </dd>
                </div>
                {deal.property?.bedrooms != null && (
                  <div>
                    <dt className="text-sm text-muted-foreground">Bedrooms</dt>
                    <dd className="mt-1 flex items-center font-medium text-foreground">
                      <Bed className="mr-2 h-4 w-4 text-muted-foreground" />
                      {deal.property.bedrooms}
                    </dd>
                  </div>
                )}
                {deal.property?.bathrooms != null && (
                  <div>
                    <dt className="text-sm text-muted-foreground">Bathrooms</dt>
                    <dd className="mt-1 flex items-center font-medium text-foreground">
                      <Bath className="mr-2 h-4 w-4 text-muted-foreground" />
                      {deal.property.bathrooms}
                    </dd>
                  </div>
                )}
                {deal.property?.sqft != null && (
                  <div>
                    <dt className="text-sm text-muted-foreground">Floor area</dt>
                    <dd className="mt-1 flex items-center font-medium text-foreground">
                      <Square className="mr-2 h-4 w-4 text-muted-foreground" />
                      {deal.property.sqft.toLocaleString()} sqft
                    </dd>
                  </div>
                )}
                {deal.property?.year_built != null && (
                  <div>
                    <dt className="text-sm text-muted-foreground">Year built</dt>
                    <dd className="mt-1 flex items-center font-medium text-foreground">
                      <Calendar className="mr-2 h-4 w-4 text-muted-foreground" />
                      {deal.property.year_built}
                    </dd>
                  </div>
                )}
              </dl>
            </div>
          </div>

          {/* Seller information */}
          <div className="min-w-0 rounded-lg border border-border bg-card">
            <div className="border-b border-border px-4 py-4 sm:px-6">
              <h2 className="flex items-center font-semibold text-foreground">
                <User className="mr-2 h-5 w-5 text-muted-foreground" />
                Seller information
              </h2>
            </div>
            <div className="p-4 sm:p-6">
              <dl className="grid gap-4 sm:grid-cols-2">
                <div>
                  <dt className="text-sm text-muted-foreground">Contact name</dt>
                  <dd className="mt-1 font-medium text-foreground">
                    {deal.seller_name}
                  </dd>
                </div>
                <div>
                  <dt className="text-sm text-muted-foreground">Motivation</dt>
                  <dd className="mt-1 font-medium text-foreground">
                    {deal.seller_motivation
                      ? motivationLabels[deal.seller_motivation] ||
                        deal.seller_motivation
                      : "Not recorded"}
                  </dd>
                </div>
                {deal.seller_phone && (
                  <div>
                    <dt className="text-sm text-muted-foreground">Phone</dt>
                    <dd className="mt-1 flex items-center font-medium text-foreground">
                      <Phone className="mr-2 h-4 w-4 text-muted-foreground" />
                      <a
                        href={`tel:${deal.seller_phone}`}
                        className="text-primary underline-offset-2 hover:underline [overflow-wrap:anywhere]"
                      >
                        {deal.seller_phone}
                      </a>
                    </dd>
                  </div>
                )}
                {deal.seller_email && (
                  <div>
                    <dt className="text-sm text-muted-foreground">Email</dt>
                    <dd className="mt-1 flex items-center font-medium text-foreground">
                      <Mail className="mr-2 h-4 w-4 text-muted-foreground" />
                      <a
                        href={`mailto:${deal.seller_email}`}
                        className="text-primary underline-offset-2 hover:underline [overflow-wrap:anywhere]"
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
            <div className="min-w-0 rounded-lg border border-border bg-card">
              <div className="border-b border-border px-4 py-4 sm:px-6">
                <h2 className="flex items-center font-semibold text-foreground">
                  <FileText className="mr-2 h-5 w-5 text-muted-foreground" />
                  Notes
                </h2>
              </div>
              <div className="p-4 sm:p-6">
                <p className="whitespace-pre-wrap text-foreground [overflow-wrap:anywhere]">{deal.notes}</p>
              </div>
            </div>
          )}

          {attachmentsUnavailable && <p role="alert" className="text-sm text-muted-foreground">Attachments could not be loaded.</p>}

          {/* Attachments */}
          {attachments.length > 0 && (
            <div className="min-w-0 rounded-lg border border-border bg-card">
              <div className="border-b border-border px-4 py-4 sm:px-6">
                <h2 className="flex items-center font-semibold text-foreground">
                  <ImageIcon className="mr-2 h-5 w-5 text-muted-foreground" />
                  Attachments ({attachments.length})
                </h2>
              </div>
              <div className="p-4 sm:p-6">
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
                  {attachments.map((attachment) => (
                    <a
                      key={attachment.id}
                      href={attachment.file_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="relative block min-w-0 overflow-hidden rounded-lg border border-border focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
                    >
                      {(attachment.file_type === "photo" || attachment.file_type?.startsWith("image/")) && (
                        /* eslint-disable-next-line @next/next/no-img-element */
                        <img src={attachment.file_url} alt="" className="aspect-video w-full object-cover" />
                      )}
                      <span className="block p-2 text-sm [overflow-wrap:anywhere]">{attachment.file_name}</span>
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
            <div className="rounded-lg border border-border bg-card p-4 sm:p-6">
              <h2 className="font-semibold text-foreground">Timeline</h2>
              <div className="mt-4 space-y-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Submitted</span>
                  <span className="font-medium text-foreground">
                    {format(new Date(deal.submitted_at), "MMM d, yyyy")}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Last updated</span>
                  <span className="font-medium text-foreground">
                    {format(new Date(deal.updated_at), "MMM d, yyyy")}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Actions */}
          <div id="deal-actions" className="scroll-mt-20 rounded-lg border border-border bg-card p-4 sm:p-6">
            <h2 className="font-semibold text-foreground">Actions</h2>
            <div className="mt-4 grid gap-2">
              {isAdmin && (
                <Button className="min-h-11 w-full justify-start whitespace-normal" asChild>
                  <Link href={`/dashboard/deals/${deal.id}/approval`}>Review deal</Link>
                </Button>
              )}
              <Button variant={isAdmin ? "outline" : "default"} className="min-h-11 w-full justify-start whitespace-normal" asChild>
                <Link href={`/dashboard/deals/${deal.id}/underwriting`}>View underwriting</Link>
              </Button>
              <Button variant="outline" className="min-h-11 w-full justify-start whitespace-normal" asChild>
                <Link href={`/dashboard/deals/${deal.id}/documents`}>Manage documents</Link>
              </Button>
              <Button variant="outline" className="min-h-11 w-full justify-start whitespace-normal" onClick={handleDownloadPdf} disabled={isGeneratingPdf}>
                {isGeneratingPdf ? <Loader2 className="motion-safe:animate-spin" aria-hidden="true" /> : <Download aria-hidden="true" />}
                {isGeneratingPdf ? "Generating offer PDF…" : "Download offer PDF"}
              </Button>
              <Button variant="outline" className="min-h-11 w-full justify-start whitespace-normal" onClick={handleDownloadAnalysisReport} disabled={isGeneratingReport}>
                {isGeneratingReport ? <Loader2 className="motion-safe:animate-spin" aria-hidden="true" /> : <BarChart3 aria-hidden="true" />}
                {isGeneratingReport ? "Generating analysis report…" : "Download analysis report"}
              </Button>
              {canDeleteDeal && (
                <AlertDialog open={deleteDialogOpen} onOpenChange={(open) => {
                  if (isDeleting) return;
                  setDeleteDialogOpen(open);
                  if (open) setDeleteError(null);
                }}>
                  <AlertDialogTrigger asChild>
                    <Button type="button" variant="outline" className="min-h-11 w-full justify-start text-destructive hover:text-destructive">
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
                      <AlertDialogCancel aria-disabled={isDeleting}>Cancel</AlertDialogCancel>
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
