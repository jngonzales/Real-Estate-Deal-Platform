"use server";

import { Resend } from "resend";
import { createClient } from "@/utils/supabase/server";

// Lazy-init: Resend throws at construction without a key, which breaks the build.
const resend = process.env.RESEND_API_KEY
  ? new Resend(process.env.RESEND_API_KEY)
  : null;

interface EmailQueueItem {
  id: string;
  deal_id: string;
  recipient_email: string;
  recipient_name: string | null;
  template_name: string;
  subject: string;
  scheduled_for: string;
  metadata: Record<string, unknown>;
}

interface Deal {
  id: string;
  seller_email: string | null;
  seller_name: string | null;
  property: {
    address: string;
    city: string;
    state: string;
  } | null;
  status: string;
  asking_price: number;
  offer_price: number | null;
  submitted_at: string;
}

/**
 * Process pending emails that are scheduled to be sent
 * This should be called by a cron job every 5-15 minutes
 */
export async function processPendingEmails() {
  const supabase = await createClient();

  if (!resend) {
    console.warn("RESEND_API_KEY not configured; skipping email queue processing");
    return { success: true, message: "Email service not configured", count: 0 };
  }

  try {
    // Fetch emails that are due to be sent
    const { data: pendingEmails, error: fetchError } = await supabase
      .from("email_queue")
      .select("*")
      .eq("status", "pending")
      .lte("scheduled_for", new Date().toISOString())
      .order("scheduled_for", { ascending: true })
      .limit(50); // Process 50 at a time

    if (fetchError) {
      console.error("Error fetching pending emails:", fetchError);
      return { success: false, error: fetchError.message };
    }

    if (!pendingEmails || pendingEmails.length === 0) {
      return { success: true, message: "No pending emails to send", count: 0 };
    }

    let successCount = 0;
    let errorCount = 0;

    // Process each email
    for (const email of pendingEmails as EmailQueueItem[]) {
      try {
        // Fetch deal details for template variables
        const { data: deal } = await supabase
          .from("deals")
          .select(
            `
            *,
            property:properties(address, city, state, zip)
          `
          )
          .eq("id", email.deal_id)
          .single();

        if (!deal) {
          // Mark as failed if deal not found
          await supabase
            .from("email_queue")
            .update({
              status: "failed",
              error_message: "Deal not found",
            })
            .eq("id", email.id);
          errorCount++;
          continue;
        }

        // Get template
        const { data: template } = await supabase
          .from("email_templates")
          .select("body")
          .eq("name", email.template_name)
          .single();

        if (!template) {
          await supabase
            .from("email_queue")
            .update({
              status: "failed",
              error_message: "Template not found",
            })
            .eq("id", email.id);
          errorCount++;
          continue;
        }

        // Replace template variables
        const subject = replaceTemplateVariables(email.subject, deal as Deal);
        const body = replaceTemplateVariables(template.body, deal as Deal);

        // Send email using Resend
        const { error: sendError } = await resend.emails.send(
          {
            from: process.env.RESEND_FROM_EMAIL || "DealFlow <noreply@dealflow.com>",
            to: email.recipient_email,
            subject: subject,
            text: body,
            // Optional: Add HTML version
            // html: `<pre>${body}</pre>`,
          }
        );

        if (sendError) {
          // Mark as failed
          await supabase
            .from("email_queue")
            .update({
              status: "failed",
              error_message: sendError.message,
            })
            .eq("id", email.id);
          errorCount++;
        } else {
          // Mark as sent
          await supabase
            .from("email_queue")
            .update({
              status: "sent",
              sent_at: new Date().toISOString(),
            })
            .eq("id", email.id);
          successCount++;
        }
      } catch (error) {
        console.error(`Error processing email ${email.id}:`, error);
        await supabase
          .from("email_queue")
          .update({
            status: "failed",
            error_message: error instanceof Error ? error.message : "Unknown error",
          })
          .eq("id", email.id);
        errorCount++;
      }
    }

    return {
      success: true,
      message: `Processed ${successCount + errorCount} emails`,
      successCount,
      errorCount,
    };
  } catch (error) {
    console.error("Error in processPendingEmails:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Replace template variables with actual values
 */
function replaceTemplateVariables(template: string, deal: Deal): string {
  const address = deal.property?.address || "your property";
  const city = deal.property?.city || "";
  const state = deal.property?.state || "";
  const fullAddress = `${address}${city ? `, ${city}` : ""}${state ? `, ${state}` : ""}`;

  const variables: Record<string, string> = {
    "{owner_name}": deal.seller_name || "there",
    "{address}": address,
    "{full_address}": fullAddress,
    "{status}": formatStatus(deal.status),
    "{asking_price}": formatCurrency(deal.asking_price),
    "{offer_price}": deal.offer_price ? formatCurrency(deal.offer_price) : "TBD",
    "{submitted_date}": formatDate(deal.submitted_at),
    "{deal_link}": `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/deals/${deal.id}`,
    "{closing_date}": "TBD", // You can add this to your deals table
    "{closing_location}": "TBD",
    "{estimated_closing}": "30-45 days",
    "{expiration_date}": formatDate(
      new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
    ),
  };

  let result = template;
  for (const [key, value] of Object.entries(variables)) {
    result = result.replace(new RegExp(key, "g"), value);
  }

  return result;
}

function formatStatus(status: string): string {
  const statusMap: Record<string, string> = {
    submitted: "Submitted",
    needs_info: "Needs Info",
    underwriting: "Under Review",
    offer_prepared: "Offer Being Prepared",
    offer_sent: "Offer Sent",
    in_contract: "In Contract",
    funding: "Funding",
    closed: "Closed",
    rejected: "Rejected",
  };
  return statusMap[status] || status;
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(amount);
}

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

/**
 * Get email queue for a specific deal
 */
export async function getDealEmailQueue(dealId: string) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("email_queue")
    .select("*")
    .eq("deal_id", dealId)
    .order("scheduled_for", { ascending: false });

  if (error) {
    return { success: false, error: error.message };
  }

  return { success: true, data };
}

/**
 * Cancel a scheduled email
 */
export async function cancelScheduledEmail(emailId: string) {
  const supabase = await createClient();

  const { error } = await supabase
    .from("email_queue")
    .update({ status: "cancelled" })
    .eq("id", emailId)
    .eq("status", "pending"); // Only cancel if still pending

  if (error) {
    return { success: false, error: error.message };
  }

  return { success: true };
}

/**
 * Manually schedule an email
 */
export async function scheduleEmail(
  dealId: string,
  templateName: string,
  scheduledFor?: Date
) {
  const supabase = await createClient();

  // Fetch deal and template
  const { data: deal } = await supabase
    .from("deals")
    .select("*, property:properties(*)")
    .eq("id", dealId)
    .single();

  const { data: template } = await supabase
    .from("email_templates")
    .select("*")
    .eq("name", templateName)
    .single();

  if (!deal || !template) {
    return { success: false, error: "Deal or template not found" };
  }

  const { error } = await supabase.from("email_queue").insert({
    deal_id: dealId,
    recipient_email: deal.seller_email,
    recipient_name: deal.seller_name,
    template_name: templateName,
    subject: template.subject,
    scheduled_for: (scheduledFor || new Date()).toISOString(),
  });

  if (error) {
    return { success: false, error: error.message };
  }

  return { success: true };
}
