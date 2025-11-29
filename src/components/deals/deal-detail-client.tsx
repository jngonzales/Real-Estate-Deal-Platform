"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { DealWithProperty, DealStatus, updateDealStatus } from "@/lib/actions/deal-actions";
import { format } from "date-fns";
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
} from "lucide-react";

const statusColors: Record<string, string> = {
  submitted: "bg-blue-100 text-blue-800 border-blue-200",
  underwriting: "bg-yellow-100 text-yellow-800 border-yellow-200",
  approved: "bg-green-100 text-green-800 border-green-200",
  rejected: "bg-red-100 text-red-800 border-red-200",
  closed: "bg-slate-100 text-slate-800 border-slate-200",
};

const statusLabels: Record<string, string> = {
  submitted: "Submitted",
  underwriting: "Underwriting",
  approved: "Approved",
  rejected: "Rejected",
  closed: "Closed",
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

interface DealDetailClientProps {
  deal: DealWithProperty;
  attachments: Attachment[];
}

export function DealDetailClient({ deal, attachments }: DealDetailClientProps) {
  const router = useRouter();
  const [isUpdating, setIsUpdating] = useState(false);
  const [showStatusDropdown, setShowStatusDropdown] = useState(false);

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
    } else {
      router.refresh();
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <Link
            href="/dashboard/deals"
            className="mb-2 inline-flex items-center text-sm text-slate-600 hover:text-slate-900"
          >
            <ArrowLeft className="mr-1 h-4 w-4" />
            Back to Deals
          </Link>
          <h2 className="text-2xl font-bold text-slate-900">
            {deal.property.address}
          </h2>
          <p className="flex items-center text-slate-600">
            <MapPin className="mr-1 h-4 w-4" />
            {deal.property.city}, {deal.property.state} {deal.property.zip}
          </p>
        </div>

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
            <div className="absolute right-0 z-10 mt-2 w-48 rounded-lg border border-slate-200 bg-white py-1 shadow-lg">
              {(["submitted", "underwriting", "approved", "rejected", "closed"] as DealStatus[]).map(
                (status) => (
                  <button
                    key={status}
                    onClick={() => handleStatusChange(status)}
                    className={`block w-full px-4 py-2 text-left text-sm hover:bg-slate-50 ${
                      status === deal.status ? "bg-slate-50 font-medium" : ""
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

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left Column - Main Info */}
        <div className="space-y-6 lg:col-span-2">
          {/* Property Details */}
          <div className="rounded-lg border border-slate-200 bg-white">
            <div className="border-b border-slate-200 px-6 py-4">
              <h3 className="flex items-center font-semibold text-slate-900">
                <Home className="mr-2 h-5 w-5 text-slate-400" />
                Property Details
              </h3>
            </div>
            <div className="p-6">
              <dl className="grid gap-4 sm:grid-cols-2">
                <div>
                  <dt className="text-sm text-slate-500">Property Type</dt>
                  <dd className="mt-1 flex items-center font-medium text-slate-900">
                    <Building className="mr-2 h-4 w-4 text-slate-400" />
                    {propertyTypeLabels[deal.property.property_type] ||
                      deal.property.property_type}
                  </dd>
                </div>
                <div>
                  <dt className="text-sm text-slate-500">County</dt>
                  <dd className="mt-1 font-medium text-slate-900">
                    {deal.property.county || "—"}
                  </dd>
                </div>
                {deal.property.bedrooms && (
                  <div>
                    <dt className="text-sm text-slate-500">Bedrooms</dt>
                    <dd className="mt-1 flex items-center font-medium text-slate-900">
                      <Bed className="mr-2 h-4 w-4 text-slate-400" />
                      {deal.property.bedrooms}
                    </dd>
                  </div>
                )}
                {deal.property.bathrooms && (
                  <div>
                    <dt className="text-sm text-slate-500">Bathrooms</dt>
                    <dd className="mt-1 flex items-center font-medium text-slate-900">
                      <Bath className="mr-2 h-4 w-4 text-slate-400" />
                      {deal.property.bathrooms}
                    </dd>
                  </div>
                )}
                {deal.property.sqft && (
                  <div>
                    <dt className="text-sm text-slate-500">Square Feet</dt>
                    <dd className="mt-1 flex items-center font-medium text-slate-900">
                      <Square className="mr-2 h-4 w-4 text-slate-400" />
                      {deal.property.sqft.toLocaleString()} sqft
                    </dd>
                  </div>
                )}
                {deal.property.year_built && (
                  <div>
                    <dt className="text-sm text-slate-500">Year Built</dt>
                    <dd className="mt-1 flex items-center font-medium text-slate-900">
                      <Calendar className="mr-2 h-4 w-4 text-slate-400" />
                      {deal.property.year_built}
                    </dd>
                  </div>
                )}
              </dl>
            </div>
          </div>

          {/* Seller Information */}
          <div className="rounded-lg border border-slate-200 bg-white">
            <div className="border-b border-slate-200 px-6 py-4">
              <h3 className="flex items-center font-semibold text-slate-900">
                <User className="mr-2 h-5 w-5 text-slate-400" />
                Seller Information
              </h3>
            </div>
            <div className="p-6">
              <dl className="grid gap-4 sm:grid-cols-2">
                <div>
                  <dt className="text-sm text-slate-500">Contact Name</dt>
                  <dd className="mt-1 font-medium text-slate-900">
                    {deal.seller_name}
                  </dd>
                </div>
                <div>
                  <dt className="text-sm text-slate-500">Motivation</dt>
                  <dd className="mt-1 font-medium text-slate-900">
                    {deal.seller_motivation
                      ? motivationLabels[deal.seller_motivation] ||
                        deal.seller_motivation
                      : "—"}
                  </dd>
                </div>
                {deal.seller_phone && (
                  <div>
                    <dt className="text-sm text-slate-500">Phone</dt>
                    <dd className="mt-1 flex items-center font-medium text-slate-900">
                      <Phone className="mr-2 h-4 w-4 text-slate-400" />
                      <a
                        href={`tel:${deal.seller_phone}`}
                        className="text-blue-600 hover:underline"
                      >
                        {deal.seller_phone}
                      </a>
                    </dd>
                  </div>
                )}
                {deal.seller_email && (
                  <div>
                    <dt className="text-sm text-slate-500">Email</dt>
                    <dd className="mt-1 flex items-center font-medium text-slate-900">
                      <Mail className="mr-2 h-4 w-4 text-slate-400" />
                      <a
                        href={`mailto:${deal.seller_email}`}
                        className="text-blue-600 hover:underline"
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
            <div className="rounded-lg border border-slate-200 bg-white">
              <div className="border-b border-slate-200 px-6 py-4">
                <h3 className="flex items-center font-semibold text-slate-900">
                  <FileText className="mr-2 h-5 w-5 text-slate-400" />
                  Notes
                </h3>
              </div>
              <div className="p-6">
                <p className="whitespace-pre-wrap text-slate-700">{deal.notes}</p>
              </div>
            </div>
          )}

          {/* Photos */}
          {attachments.length > 0 && (
            <div className="rounded-lg border border-slate-200 bg-white">
              <div className="border-b border-slate-200 px-6 py-4">
                <h3 className="flex items-center font-semibold text-slate-900">
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
                      className="group relative aspect-video overflow-hidden rounded-lg border border-slate-200"
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
        </div>

        {/* Right Column - Summary */}
        <div className="space-y-6">
          {/* Price Card */}
          <div className="rounded-lg border border-slate-200 bg-white p-6">
            <div className="text-center">
              <p className="text-sm text-slate-500">Asking Price</p>
              <p className="mt-1 flex items-center justify-center text-3xl font-bold text-slate-900">
                <DollarSign className="h-6 w-6 text-slate-400" />
                {formatCurrency(deal.asking_price).replace("$", "")}
              </p>
              {deal.offer_price && (
                <>
                  <p className="mt-4 text-sm text-slate-500">Offer Price</p>
                  <p className="mt-1 text-2xl font-bold text-green-600">
                    {formatCurrency(deal.offer_price)}
                  </p>
                </>
              )}
            </div>
          </div>

          {/* Timeline */}
          <div className="rounded-lg border border-slate-200 bg-white p-6">
            <h3 className="font-semibold text-slate-900">Timeline</h3>
            <div className="mt-4 space-y-4">
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-500">Submitted</span>
                <span className="font-medium text-slate-900">
                  {format(new Date(deal.submitted_at), "MMM d, yyyy")}
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-500">Last Updated</span>
                <span className="font-medium text-slate-900">
                  {format(new Date(deal.updated_at), "MMM d, yyyy")}
                </span>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="rounded-lg border border-slate-200 bg-white p-6">
            <h3 className="font-semibold text-slate-900">Actions</h3>
            <div className="mt-4 space-y-3">
              <Link
                href={`/dashboard/deals/${deal.id}/underwriting`}
                className="block w-full rounded-lg border border-slate-200 px-4 py-2 text-center text-sm font-medium text-slate-700 hover:bg-slate-50"
              >
                View Underwriting
              </Link>
              <button className="block w-full rounded-lg border border-slate-200 px-4 py-2 text-center text-sm font-medium text-slate-700 hover:bg-slate-50">
                Download Report
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
