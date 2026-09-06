"use client";

import { useCallback, useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { getDealEmailQueue, cancelScheduledEmail } from "@/lib/actions/email-actions";
import { format } from "date-fns";
import { Mail, Clock, CheckCircle, XCircle, Ban, Loader2 } from "@/components/ui/icons";
import { toast } from "sonner";

interface EmailQueueItem {
  id: string;
  template_name: string;
  subject: string;
  scheduled_for: string;
  sent_at: string | null;
  status: string;
  error_message: string | null;
  recipient_email: string;
}

export function EmailSequenceManager({ dealId }: { dealId: string }) {
  return <EmailSequenceList key={dealId} dealId={dealId} />;
}

function EmailSequenceList({ dealId }: { dealId: string }) {
  const [emails, setEmails] = useState<EmailQueueItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState<string | null>(null);

  const loadEmails = useCallback(() => {
    return getDealEmailQueue(dealId).then((result) => {
      if (result.success && result.data) {
        setEmails(result.data);
      }
    }).catch((error) => {
      console.error("Email queue could not be loaded:", error);
    }).finally(() => {
      setLoading(false);
    });
  }, [dealId]);

  useEffect(() => {
    void loadEmails();
  }, [loadEmails]);

  const handleCancelEmail = async (emailId: string) => {
    setCancelling(emailId);
    const result = await cancelScheduledEmail(emailId);
    
    if (result.success) {
      toast.success("Email cancelled successfully");
      setLoading(true);
      void loadEmails();
    } else {
      toast.error(`Failed to cancel email: ${result.error}`);
    }
    
    setCancelling(null);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "sent":
        return <CheckCircle className="h-4 w-4 text-emerald-500" />;
      case "failed":
        return <XCircle className="h-4 w-4 text-red-500" />;
      case "cancelled":
        return <Ban className="h-4 w-4 text-gray-500" />;
      default:
        return <Clock className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "sent":
        return "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950 dark:text-emerald-400 dark:border-emerald-900";
      case "failed":
        return "bg-red-50 text-red-700 border-red-200 dark:bg-red-950 dark:text-red-400 dark:border-red-900";
      case "cancelled":
        return "bg-gray-50 text-gray-700 border-gray-200 dark:bg-gray-950 dark:text-gray-400 dark:border-gray-900";
      default:
        return "bg-gray-50 text-gray-700 border-gray-200 dark:bg-gray-950 dark:text-gray-400 dark:border-gray-900";
    }
  };

  const formatTemplateName = (name: string) => {
    return name
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            Email Sequences
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Mail className="h-5 w-5" />
          Email Sequences
        </CardTitle>
        <CardDescription>
          Automated emails scheduled for this deal
        </CardDescription>
      </CardHeader>
      <CardContent>
        {emails.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Mail className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <p>No emails scheduled for this deal</p>
          </div>
        ) : (
          <div className="space-y-3">
            {emails.map((email) => (
              <div
                key={email.id}
                className="border rounded-lg p-4 bg-card hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 space-y-2">
                    {/* Header */}
                    <div className="flex items-center gap-2">
                      {getStatusIcon(email.status)}
                      <span className="font-medium text-sm">
                        {formatTemplateName(email.template_name)}
                      </span>
                      <span
                        className={`ml-auto px-2 py-0.5 text-xs font-medium rounded-full border ${getStatusColor(
                          email.status
                        )}`}
                      >
                        {email.status.charAt(0).toUpperCase() +
                          email.status.slice(1)}
                      </span>
                    </div>

                    {/* Subject */}
                    <p className="text-sm text-muted-foreground">
                      {email.subject}
                    </p>

                    {/* Timing */}
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      {email.status === "pending" && (
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          Scheduled:{" "}
                          {format(new Date(email.scheduled_for), "MMM d, yyyy 'at' h:mm a")}
                        </span>
                      )}
                      {email.sent_at && (
                        <span className="flex items-center gap-1">
                          <CheckCircle className="h-3 w-3" />
                          Sent: {format(new Date(email.sent_at), "MMM d, yyyy 'at' h:mm a")}
                        </span>
                      )}
                      <span className="text-xs">To: {email.recipient_email}</span>
                    </div>

                    {/* Error message */}
                    {email.error_message && (
                      <p className="text-xs text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950 p-2 rounded">
                        Error: {email.error_message}
                      </p>
                    )}
                  </div>

                  {/* Actions */}
                  {email.status === "pending" && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleCancelEmail(email.id)}
                      disabled={cancelling === email.id}
                    >
                      {cancelling === email.id ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <>
                          <Ban className="h-4 w-4 mr-1" />
                          Cancel
                        </>
                      )}
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Stats */}
        {emails.length > 0 && (
          <div className="mt-4 pt-4 border-t grid grid-cols-4 gap-2 text-center text-sm">
            <div>
              <p className="text-muted-foreground text-xs">Pending</p>
              <p className="font-semibold text-emerald-600 dark:text-emerald-400">
                {emails.filter((e) => e.status === "pending").length}
              </p>
            </div>
            <div>
              <p className="text-muted-foreground text-xs">Sent</p>
              <p className="font-semibold text-green-600 dark:text-green-400">
                {emails.filter((e) => e.status === "sent").length}
              </p>
            </div>
            <div>
              <p className="text-muted-foreground text-xs">Failed</p>
              <p className="font-semibold text-red-600 dark:text-red-400">
                {emails.filter((e) => e.status === "failed").length}
              </p>
            </div>
            <div>
              <p className="text-muted-foreground text-xs">Cancelled</p>
              <p className="font-semibold text-gray-600 dark:text-gray-400">
                {emails.filter((e) => e.status === "cancelled").length}
              </p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
