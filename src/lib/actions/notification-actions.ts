"use server";

import { createClient } from "@/utils/supabase/server";

export type NotificationType = "status_change" | "assignment" | "comment" | "new_deal";

export interface NotificationPayload {
  type: NotificationType;
  dealId: string;
  dealAddress: string;
  recipientEmail: string;
  recipientName?: string;
  data: Record<string, string>;
}

// Email notification using Resend (or any email service)
export async function sendEmailNotification(payload: NotificationPayload): Promise<{ success: boolean; error: string | null }> {
  // Check if email is configured
  const resendApiKey = process.env.RESEND_API_KEY;
  
  if (!resendApiKey) {
    console.log("Email notification skipped - RESEND_API_KEY not configured");
    return { success: true, error: null }; // Silent fail if not configured
  }

  try {
    const subject = getEmailSubject(payload);
    const body = getEmailBody(payload);

    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${resendApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: process.env.EMAIL_FROM || "deals@yourcompany.com",
        to: payload.recipientEmail,
        subject,
        html: body,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error("Failed to send email:", error);
      return { success: false, error: "Failed to send email" };
    }

    return { success: true, error: null };
  } catch (error) {
    console.error("Email notification error:", error);
    return { success: false, error: "Email notification failed" };
  }
}

// SMS notification using Twilio
export async function sendSMSNotification(
  phone: string,
  message: string
): Promise<{ success: boolean; error: string | null }> {
  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  const fromPhone = process.env.TWILIO_PHONE_NUMBER;

  if (!accountSid || !authToken || !fromPhone) {
    console.log("SMS notification skipped - Twilio not configured");
    return { success: true, error: null }; // Silent fail if not configured
  }

  try {
    const response = await fetch(
      `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`,
      {
        method: "POST",
        headers: {
          "Authorization": `Basic ${Buffer.from(`${accountSid}:${authToken}`).toString("base64")}`,
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
          To: phone,
          From: fromPhone,
          Body: message,
        }),
      }
    );

    if (!response.ok) {
      const error = await response.text();
      console.error("Failed to send SMS:", error);
      return { success: false, error: "Failed to send SMS" };
    }

    return { success: true, error: null };
  } catch (error) {
    console.error("SMS notification error:", error);
    return { success: false, error: "SMS notification failed" };
  }
}

// Slack notification using webhook
export async function sendSlackNotification(
  message: string,
  channel?: string
): Promise<{ success: boolean; error: string | null }> {
  const webhookUrl = process.env.SLACK_WEBHOOK_URL;

  if (!webhookUrl) {
    console.log("Slack notification skipped - webhook not configured");
    return { success: true, error: null }; // Silent fail if not configured
  }

  try {
    const response = await fetch(webhookUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        text: message,
        channel: channel || undefined,
      }),
    });

    if (!response.ok) {
      console.error("Failed to send Slack notification");
      return { success: false, error: "Failed to send Slack notification" };
    }

    return { success: true, error: null };
  } catch (error) {
    console.error("Slack notification error:", error);
    return { success: false, error: "Slack notification failed" };
  }
}

// Send notifications for deal status change
export async function notifyStatusChange(
  dealId: string,
  oldStatus: string,
  newStatus: string
): Promise<void> {
  const supabase = await createClient();

  // Get deal info
  const { data: deal } = await supabase
    .from("deals")
    .select(`
      *,
      properties(address, city, state)
    `)
    .eq("id", dealId)
    .single();

  if (!deal) return;

  // Get agent info
  const { data: agent } = await supabase
    .from("profiles")
    .select("email, full_name, phone")
    .eq("id", deal.agent_id)
    .single();

  if (!agent) return;

  const dealAddress = `${deal.properties?.address}, ${deal.properties?.city}, ${deal.properties?.state}`;

  // Send email to agent
  await sendEmailNotification({
    type: "status_change",
    dealId,
    dealAddress,
    recipientEmail: agent.email,
    recipientName: agent.full_name || undefined,
    data: {
      oldStatus,
      newStatus,
    },
  });

  // Send Slack notification
  const statusMessage = `🏠 *Deal Status Update*\n` +
    `Property: ${dealAddress}\n` +
    `Status: ${oldStatus} → *${newStatus}*\n` +
    `Agent: ${agent.full_name || agent.email}`;
  
  await sendSlackNotification(statusMessage);
}

// Send notifications for deal assignment
export async function notifyAssignment(
  dealId: string,
  assigneeId: string
): Promise<void> {
  const supabase = await createClient();

  // Get deal info
  const { data: deal } = await supabase
    .from("deals")
    .select(`
      *,
      properties(address, city, state)
    `)
    .eq("id", dealId)
    .single();

  if (!deal) return;

  // Get assignee info
  const { data: assignee } = await supabase
    .from("profiles")
    .select("email, full_name")
    .eq("id", assigneeId)
    .single();

  if (!assignee) return;

  const dealAddress = `${deal.properties?.address}, ${deal.properties?.city}, ${deal.properties?.state}`;

  // Send email to assignee
  await sendEmailNotification({
    type: "assignment",
    dealId,
    dealAddress,
    recipientEmail: assignee.email,
    recipientName: assignee.full_name || undefined,
    data: {},
  });

  // Send Slack notification
  const assignmentMessage = `📋 *Deal Assigned*\n` +
    `Property: ${dealAddress}\n` +
    `Assigned to: ${assignee.full_name || assignee.email}`;
  
  await sendSlackNotification(assignmentMessage);
}

// Send notifications for new deal submission
export async function notifyNewDeal(dealId: string): Promise<void> {
  const supabase = await createClient();

  // Get deal info
  const { data: deal } = await supabase
    .from("deals")
    .select(`
      *,
      properties(address, city, state)
    `)
    .eq("id", dealId)
    .single();

  if (!deal) return;

  // Get agent info
  const { data: agent } = await supabase
    .from("profiles")
    .select("email, full_name")
    .eq("id", deal.agent_id)
    .single();

  const dealAddress = `${deal.properties?.address}, ${deal.properties?.city}, ${deal.properties?.state}`;

  // Send Slack notification for new deal
  const newDealMessage = `🆕 *New Deal Submitted*\n` +
    `Property: ${dealAddress}\n` +
    `Asking Price: $${deal.asking_price.toLocaleString()}\n` +
    `Submitted by: ${agent?.full_name || agent?.email || "Unknown"}`;
  
  await sendSlackNotification(newDealMessage);

  // Optionally notify all underwriters
  const { data: underwriters } = await supabase
    .from("profiles")
    .select("email, full_name")
    .in("role", ["admin", "underwriter"]);

  if (underwriters) {
    for (const underwriter of underwriters) {
      await sendEmailNotification({
        type: "new_deal",
        dealId,
        dealAddress,
        recipientEmail: underwriter.email,
        recipientName: underwriter.full_name || undefined,
        data: {
          askingPrice: deal.asking_price.toString(),
          agentName: agent?.full_name || agent?.email || "Unknown",
        },
      });
    }
  }
}

// Helper functions for email content
function getEmailSubject(payload: NotificationPayload): string {
  switch (payload.type) {
    case "status_change":
      return `Deal Status Updated: ${payload.dealAddress}`;
    case "assignment":
      return `Deal Assigned to You: ${payload.dealAddress}`;
    case "comment":
      return `New Comment on Deal: ${payload.dealAddress}`;
    case "new_deal":
      return `New Deal Submitted: ${payload.dealAddress}`;
    default:
      return `Deal Update: ${payload.dealAddress}`;
  }
}

function getEmailBody(payload: NotificationPayload): string {
  const greeting = payload.recipientName ? `Hi ${payload.recipientName},` : "Hi,";
  
  switch (payload.type) {
    case "status_change":
      return `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #1f2937;">Deal Status Updated</h2>
          <p>${greeting}</p>
          <p>The status of your deal has been updated:</p>
          <div style="background: #f3f4f6; padding: 16px; border-radius: 8px; margin: 16px 0;">
            <p style="margin: 0;"><strong>Property:</strong> ${payload.dealAddress}</p>
            <p style="margin: 8px 0 0;"><strong>Status:</strong> ${payload.data.oldStatus} → <span style="color: #2563eb; font-weight: bold;">${payload.data.newStatus}</span></p>
          </div>
          <p><a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard/deals/${payload.dealId}" style="color: #2563eb;">View Deal Details</a></p>
        </div>
      `;
    case "assignment":
      return `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #1f2937;">Deal Assigned to You</h2>
          <p>${greeting}</p>
          <p>A deal has been assigned to you for review:</p>
          <div style="background: #f3f4f6; padding: 16px; border-radius: 8px; margin: 16px 0;">
            <p style="margin: 0;"><strong>Property:</strong> ${payload.dealAddress}</p>
          </div>
          <p><a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard/deals/${payload.dealId}" style="color: #2563eb;">View Deal Details</a></p>
        </div>
      `;
    case "new_deal":
      return `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #1f2937;">New Deal Submitted</h2>
          <p>${greeting}</p>
          <p>A new deal has been submitted and is ready for review:</p>
          <div style="background: #f3f4f6; padding: 16px; border-radius: 8px; margin: 16px 0;">
            <p style="margin: 0;"><strong>Property:</strong> ${payload.dealAddress}</p>
            <p style="margin: 8px 0 0;"><strong>Asking Price:</strong> $${parseInt(payload.data.askingPrice).toLocaleString()}</p>
            <p style="margin: 8px 0 0;"><strong>Submitted by:</strong> ${payload.data.agentName}</p>
          </div>
          <p><a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard/deals/${payload.dealId}" style="color: #2563eb;">View Deal Details</a></p>
        </div>
      `;
    default:
      return `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #1f2937;">Deal Update</h2>
          <p>${greeting}</p>
          <p>There's an update on a deal:</p>
          <div style="background: #f3f4f6; padding: 16px; border-radius: 8px; margin: 16px 0;">
            <p style="margin: 0;"><strong>Property:</strong> ${payload.dealAddress}</p>
          </div>
          <p><a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard/deals/${payload.dealId}" style="color: #2563eb;">View Deal Details</a></p>
        </div>
      `;
  }
}
