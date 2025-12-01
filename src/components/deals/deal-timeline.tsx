"use client";

import { format, formatDistanceToNow } from "date-fns";
import {
  Clock,
  FileText,
  MessageSquare,
  User,
  DollarSign,
  CheckCircle,
  XCircle,
  ArrowRight,
  Calculator,
  Image as ImageIcon,
  UserPlus,
} from "lucide-react";

interface TimelineEvent {
  id: string;
  type: "status_change" | "comment" | "underwriting" | "photo_upload" | "assignment" | "created";
  title: string;
  description?: string;
  user?: string;
  timestamp: string;
  metadata?: {
    from_status?: string;
    to_status?: string;
    mao?: number;
    photo_count?: number;
    assignee_name?: string;
  };
}

interface DealTimelineProps {
  dealId: string;
  createdAt: string;
  status: string;
  submittedBy?: string;
  assignedTo?: string;
  underwritingRecord?: {
    created_at: string;
    max_offer: number;
    underwriter?: { full_name?: string };
  } | null;
  commentsCount?: number;
  photosCount?: number;
}

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

const statusIcons: Record<string, React.ReactNode> = {
  submitted: <FileText className="h-4 w-4" />,
  needs_info: <MessageSquare className="h-4 w-4" />,
  underwriting: <Calculator className="h-4 w-4" />,
  offer_prepared: <DollarSign className="h-4 w-4" />,
  offer_sent: <ArrowRight className="h-4 w-4" />,
  in_contract: <FileText className="h-4 w-4" />,
  funding: <DollarSign className="h-4 w-4" />,
  closed: <CheckCircle className="h-4 w-4" />,
  rejected: <XCircle className="h-4 w-4" />,
};

const statusColors: Record<string, string> = {
  submitted: "bg-blue-500",
  needs_info: "bg-orange-500",
  underwriting: "bg-yellow-500",
  offer_prepared: "bg-purple-500",
  offer_sent: "bg-indigo-500",
  in_contract: "bg-cyan-500",
  funding: "bg-emerald-500",
  closed: "bg-green-500",
  rejected: "bg-red-500",
};

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(amount);
}

export function DealTimeline({
  createdAt,
  status,
  submittedBy,
  assignedTo,
  underwritingRecord,
  commentsCount = 0,
  photosCount = 0,
}: Omit<DealTimelineProps, "dealId">) {
  // Build timeline events from deal data
  const events: TimelineEvent[] = [];

  // Deal created
  events.push({
    id: "created",
    type: "created",
    title: "Deal submitted",
    description: submittedBy ? `Submitted by ${submittedBy}` : "Deal was submitted to the pipeline",
    timestamp: createdAt,
  });

  // Photos uploaded
  if (photosCount > 0) {
    events.push({
      id: "photos",
      type: "photo_upload",
      title: `${photosCount} photo${photosCount > 1 ? "s" : ""} uploaded`,
      timestamp: createdAt, // Approximate
    });
  }

  // Assignment
  if (assignedTo) {
    events.push({
      id: "assignment",
      type: "assignment",
      title: "Deal assigned",
      description: `Assigned to ${assignedTo}`,
      timestamp: createdAt, // Approximate - would need actual timestamp
    });
  }

  // Underwriting completed
  if (underwritingRecord) {
    events.push({
      id: "underwriting",
      type: "underwriting",
      title: "Underwriting completed",
      description: `MAO: ${formatCurrency(underwritingRecord.max_offer)}`,
      user: underwritingRecord.underwriter?.full_name,
      timestamp: underwritingRecord.created_at,
    });
  }

  // Comments activity
  if (commentsCount > 0) {
    events.push({
      id: "comments",
      type: "comment",
      title: `${commentsCount} comment${commentsCount > 1 ? "s" : ""}`,
      description: "Discussion on this deal",
      timestamp: createdAt, // Approximate
    });
  }

  // Current status
  if (status !== "submitted") {
    events.push({
      id: "status",
      type: "status_change",
      title: `Status: ${statusLabels[status] || status}`,
      description: "Current deal status",
      timestamp: new Date().toISOString(), // Would need actual timestamp
      metadata: { to_status: status },
    });
  }

  // Sort by timestamp descending (most recent first)
  events.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

  const getEventIcon = (event: TimelineEvent) => {
    switch (event.type) {
      case "created":
        return <FileText className="h-4 w-4" />;
      case "comment":
        return <MessageSquare className="h-4 w-4" />;
      case "underwriting":
        return <Calculator className="h-4 w-4" />;
      case "photo_upload":
        return <ImageIcon className="h-4 w-4" />;
      case "assignment":
        return <UserPlus className="h-4 w-4" />;
      case "status_change":
        return event.metadata?.to_status
          ? statusIcons[event.metadata.to_status]
          : <ArrowRight className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  const getEventColor = (event: TimelineEvent) => {
    switch (event.type) {
      case "created":
        return "bg-blue-500";
      case "comment":
        return "bg-slate-500";
      case "underwriting":
        return "bg-yellow-500";
      case "photo_upload":
        return "bg-purple-500";
      case "assignment":
        return "bg-indigo-500";
      case "status_change":
        return event.metadata?.to_status
          ? statusColors[event.metadata.to_status]
          : "bg-slate-500";
      default:
        return "bg-slate-500";
    }
  };

  return (
    <div className="rounded-lg border border-border bg-card">
      <div className="border-b border-border p-4">
        <h3 className="flex items-center gap-2 font-semibold text-foreground">
          <Clock className="h-5 w-5" />
          Activity Timeline
        </h3>
      </div>
      <div className="p-4">
        <div className="relative">
          {/* Timeline line */}
          <div className="absolute left-4 top-0 bottom-0 w-px bg-border" />

          {/* Events */}
          <div className="space-y-6">
            {events.map((event) => (
              <div key={event.id} className="relative flex gap-4">
                {/* Icon */}
                <div
                  className={`relative z-10 flex h-8 w-8 items-center justify-center rounded-full text-white ${getEventColor(event)}`}
                >
                  {getEventIcon(event)}
                </div>

                {/* Content */}
                <div className="flex-1 pt-0.5">
                  <p className="font-medium text-foreground">{event.title}</p>
                  {event.description && (
                    <p className="text-sm text-muted-foreground">{event.description}</p>
                  )}
                  {event.user && (
                    <p className="mt-1 flex items-center text-xs text-muted-foreground">
                      <User className="mr-1 h-3 w-3" />
                      {event.user}
                    </p>
                  )}
                  <p className="mt-1 text-xs text-muted-foreground">
                    {formatDistanceToNow(new Date(event.timestamp), { addSuffix: true })}
                    <span className="mx-1">•</span>
                    {format(new Date(event.timestamp), "MMM d, yyyy h:mm a")}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {events.length === 0 && (
          <p className="text-center text-sm text-muted-foreground py-4">
            No activity recorded yet
          </p>
        )}
      </div>
    </div>
  );
}
