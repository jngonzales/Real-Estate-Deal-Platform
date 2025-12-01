"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { DealWithProperty, DealStatus, updateDealStatus } from "@/lib/actions/deal-actions";
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
} from "lucide-react";
import { Comments } from "./comments";
import { AssignDeal } from "./assign-deal";
import { DealTimeline } from "./deal-timeline";

const statusColors: Record<string, string> = {
  submitted: "bg-blue-100 text-blue-800 border-blue-200",
  needs_info: "bg-orange-100 text-orange-800 border-orange-200",
  underwriting: "bg-yellow-100 text-yellow-800 border-yellow-200",
  offer_prepared: "bg-purple-100 text-purple-800 border-purple-200",
  offer_sent: "bg-indigo-100 text-indigo-800 border-indigo-200",
  in_contract: "bg-cyan-100 text-cyan-800 border-cyan-200",
  funding: "bg-emerald-100 text-emerald-800 border-emerald-200",
  closed: "bg-green-100 text-green-800 border-green-200",
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
}

interface DealDetailClientProps {
  deal: DealWithProperty;
  attachments: Attachment[];
  isAdmin?: boolean;
  timelineData?: TimelineData;
}

export function DealDetailClient({ deal, attachments, isAdmin = false, timelineData }: DealDetailClientProps) {
  const router = useRouter();
  const [isUpdating, setIsUpdating] = useState(false);
  const [showStatusDropdown, setShowStatusDropdown] = useState(false);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);

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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <Link
            href="/dashboard/deals"
            className="mb-2 inline-flex items-center text-sm text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200"
          >
            <ArrowLeft className="mr-1 h-4 w-4" />
            Back to Deals
          </Link>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
            {deal.property?.address ?? 'N/A'}
          </h2>
          <p className="flex items-center text-slate-600 dark:text-slate-400">
            <MapPin className="mr-1 h-4 w-4" />
            {deal.property?.city ?? ''}, {deal.property?.state ?? ''} {deal.property?.zip ?? ''}
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
              <div className="absolute right-0 z-10 mt-2 w-48 rounded-lg border border-slate-200 bg-white py-1 shadow-lg max-h-80 overflow-y-auto dark:border-slate-700 dark:bg-slate-800">
                {(["submitted", "needs_info", "underwriting", "offer_prepared", "offer_sent", "in_contract", "funding", "closed", "rejected"] as DealStatus[]).map(
                  (status) => (
                    <button
                      key={status}
                      onClick={() => handleStatusChange(status)}
                      className={`block w-full px-4 py-2 text-left text-sm hover:bg-slate-50 dark:hover:bg-slate-700 ${
                        status === deal.status ? "bg-slate-50 dark:bg-slate-700 font-medium" : ""
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
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left Column - Main Info */}
        <div className="space-y-6 lg:col-span-2">
          {/* Property Details */}
          <div className="rounded-lg border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-800">
            <div className="border-b border-slate-200 px-6 py-4 dark:border-slate-700">
              <h3 className="flex items-center font-semibold text-slate-900 dark:text-white">
                <Home className="mr-2 h-5 w-5 text-slate-400" />
                Property Details
              </h3>
            </div>
            <div className="p-6">
              <dl className="grid gap-4 sm:grid-cols-2">
                <div>
                  <dt className="text-sm text-slate-500 dark:text-slate-400">Property Type</dt>
                  <dd className="mt-1 flex items-center font-medium text-slate-900 dark:text-white">
                    <Building className="mr-2 h-4 w-4 text-slate-400" />
                    {deal.property ? (propertyTypeLabels[deal.property.property_type] ||
                      deal.property.property_type) : 'N/A'}
                  </dd>
                </div>
                <div>
                  <dt className="text-sm text-slate-500 dark:text-slate-400">County</dt>
                  <dd className="mt-1 font-medium text-slate-900 dark:text-white">
                    {deal.property?.county || "—"}
                  </dd>
                </div>
                {deal.property?.bedrooms && (
                  <div>
                    <dt className="text-sm text-slate-500 dark:text-slate-400">Bedrooms</dt>
                    <dd className="mt-1 flex items-center font-medium text-slate-900 dark:text-white">
                      <Bed className="mr-2 h-4 w-4 text-slate-400" />
                      {deal.property.bedrooms}
                    </dd>
                  </div>
                )}
                {deal.property?.bathrooms && (
                  <div>
                    <dt className="text-sm text-slate-500 dark:text-slate-400">Bathrooms</dt>
                    <dd className="mt-1 flex items-center font-medium text-slate-900 dark:text-white">
                      <Bath className="mr-2 h-4 w-4 text-slate-400" />
                      {deal.property.bathrooms}
                    </dd>
                  </div>
                )}
                {deal.property?.sqft && (
                  <div>
                    <dt className="text-sm text-slate-500 dark:text-slate-400">Square Feet</dt>
                    <dd className="mt-1 flex items-center font-medium text-slate-900 dark:text-white">
                      <Square className="mr-2 h-4 w-4 text-slate-400" />
                      {deal.property.sqft.toLocaleString()} sqft
                    </dd>
                  </div>
                )}
                {deal.property?.year_built && (
                  <div>
                    <dt className="text-sm text-slate-500 dark:text-slate-400">Year Built</dt>
                    <dd className="mt-1 flex items-center font-medium text-slate-900 dark:text-white">
                      <Calendar className="mr-2 h-4 w-4 text-slate-400" />
                      {deal.property.year_built}
                    </dd>
                  </div>
                )}
              </dl>
            </div>
          </div>

          {/* Seller Information */}
          <div className="rounded-lg border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-800">
            <div className="border-b border-slate-200 px-6 py-4 dark:border-slate-700">
              <h3 className="flex items-center font-semibold text-slate-900 dark:text-white">
                <User className="mr-2 h-5 w-5 text-slate-400" />
                Seller Information
              </h3>
            </div>
            <div className="p-6">
              <dl className="grid gap-4 sm:grid-cols-2">
                <div>
                  <dt className="text-sm text-slate-500 dark:text-slate-400">Contact Name</dt>
                  <dd className="mt-1 font-medium text-slate-900 dark:text-white">
                    {deal.seller_name}
                  </dd>
                </div>
                <div>
                  <dt className="text-sm text-slate-500 dark:text-slate-400">Motivation</dt>
                  <dd className="mt-1 font-medium text-slate-900 dark:text-white">
                    {deal.seller_motivation
                      ? motivationLabels[deal.seller_motivation] ||
                        deal.seller_motivation
                      : "—"}
                  </dd>
                </div>
                {deal.seller_phone && (
                  <div>
                    <dt className="text-sm text-slate-500 dark:text-slate-400">Phone</dt>
                    <dd className="mt-1 flex items-center font-medium text-slate-900 dark:text-white">
                      <Phone className="mr-2 h-4 w-4 text-slate-400" />
                      <a
                        href={`tel:${deal.seller_phone}`}
                        className="text-blue-600 hover:underline dark:text-blue-400"
                      >
                        {deal.seller_phone}
                      </a>
                    </dd>
                  </div>
                )}
                {deal.seller_email && (
                  <div>
                    <dt className="text-sm text-slate-500 dark:text-slate-400">Email</dt>
                    <dd className="mt-1 flex items-center font-medium text-slate-900 dark:text-white">
                      <Mail className="mr-2 h-4 w-4 text-slate-400" />
                      <a
                        href={`mailto:${deal.seller_email}`}
                        className="text-blue-600 hover:underline dark:text-blue-400"
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
            <div className="rounded-lg border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-800">
              <div className="border-b border-slate-200 px-6 py-4 dark:border-slate-700">
                <h3 className="flex items-center font-semibold text-slate-900 dark:text-white">
                  <FileText className="mr-2 h-5 w-5 text-slate-400" />
                  Notes
                </h3>
              </div>
              <div className="p-6">
                <p className="whitespace-pre-wrap text-slate-700 dark:text-slate-300">{deal.notes}</p>
              </div>
            </div>
          )}

          {/* Photos */}
          {attachments.length > 0 && (
            <div className="rounded-lg border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-800">
              <div className="border-b border-slate-200 px-6 py-4 dark:border-slate-700">
                <h3 className="flex items-center font-semibold text-slate-900 dark:text-white">
                  <ImageIcon className="mr-2 h-5 w-5 text-slate-400" />
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
                      className="group relative aspect-video overflow-hidden rounded-lg border border-slate-200 dark:border-slate-700"
                    >
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
        </div>

        {/* Right Column - Summary */}
        <div className="space-y-6">
          {/* Price Card */}
          <div className="rounded-lg border border-slate-200 bg-white p-6 dark:border-slate-700 dark:bg-slate-800">
            <div className="text-center">
              <p className="text-sm text-slate-500 dark:text-slate-400">Asking Price</p>
              <p className="mt-1 flex items-center justify-center text-3xl font-bold text-slate-900 dark:text-white">
                <DollarSign className="h-6 w-6 text-slate-400" />
                {formatCurrency(deal.asking_price).replace("$", "")}
              </p>
              {deal.offer_price && (
                <>
                  <p className="mt-4 text-sm text-slate-500 dark:text-slate-400">Offer Price</p>
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
              underwritingRecord={timelineData.underwriting}
              commentsCount={timelineData.commentsCount}
              photosCount={timelineData.photosCount}
            />
          )}
          {!timelineData && (
            <div className="rounded-lg border border-slate-200 bg-white p-6 dark:border-slate-700 dark:bg-slate-800">
              <h3 className="font-semibold text-slate-900 dark:text-white">Timeline</h3>
              <div className="mt-4 space-y-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-500 dark:text-slate-400">Submitted</span>
                  <span className="font-medium text-slate-900 dark:text-white">
                    {format(new Date(deal.submitted_at), "MMM d, yyyy")}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-500 dark:text-slate-400">Last Updated</span>
                  <span className="font-medium text-slate-900 dark:text-white">
                    {format(new Date(deal.updated_at), "MMM d, yyyy")}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="rounded-lg border border-slate-200 bg-white p-6 dark:border-slate-700 dark:bg-slate-800">
            <h3 className="font-semibold text-slate-900 dark:text-white">Actions</h3>
            <div className="mt-4 space-y-3">
              <Link
                href={`/dashboard/deals/${deal.id}/underwriting`}
                className="block w-full rounded-lg border border-slate-200 px-4 py-2 text-center text-sm font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-700"
              >
                View Underwriting
              </Link>
              <Link
                href={`/dashboard/deals/${deal.id}/documents`}
                className="block w-full rounded-lg border border-slate-200 px-4 py-2 text-center text-sm font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-700"
              >
                Manage Documents
              </Link>
              <button
                onClick={handleDownloadPdf}
                disabled={isGeneratingPdf}
                className="flex w-full items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
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
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
