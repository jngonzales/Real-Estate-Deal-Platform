"use server";

import { createClient } from "@/utils/supabase/server";

export type NotificationType = "status_change" | "assignment" | "comment" | "new_deal";

// Status label formatter
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

function formatStatus(status: string): string {
  return statusLabels[status] || status;
}

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
    .select("id, email, full_name, phone")
    .eq("id", deal.agent_id)
    .single();

  if (!agent) return;

  const dealAddress = `${deal.properties?.address}, ${deal.properties?.city}, ${deal.properties?.state}`;

  // Create in-app notification for agent
  await createInAppNotification({
    userId: agent.id,
    type: "status_change",
    title: "Deal Status Updated",
    message: `Your deal at ${deal.properties?.address} has been updated from ${formatStatus(oldStatus)} to ${formatStatus(newStatus)}.`,
    dealId,
    actionUrl: `/dashboard/deals/${dealId}`,
  });

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
    .select("id, email, full_name")
    .eq("id", assigneeId)
    .single();

  if (!assignee) return;

  const dealAddress = `${deal.properties?.address}, ${deal.properties?.city}, ${deal.properties?.state}`;

  // Create in-app notification for assignee
  await createInAppNotification({
    userId: assignee.id,
    type: "assignment",
    title: "New Deal Assigned",
    message: `A deal at ${deal.properties?.address} has been assigned to you for review.`,
    dealId,
    actionUrl: `/dashboard/deals/${dealId}`,
  });

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

  // Notify all underwriters/admins with in-app notification
  const { data: underwriters } = await supabase
    .from("profiles")
    .select("id, email, full_name")
    .in("role", ["admin", "underwriter"]);

  if (underwriters) {
    for (const underwriter of underwriters) {
      // Create in-app notification
      await createInAppNotification({
        userId: underwriter.id,
        type: "new_deal",
        title: "New Deal Submitted",
        message: `New deal at ${deal.properties?.address} submitted by ${agent?.full_name || "Agent"}. Asking price: $${deal.asking_price.toLocaleString()}.`,
        dealId,
        actionUrl: `/dashboard/deals/${dealId}`,
      });

      // Send email
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

// Send notifications for new comment
export async function notifyComment(
  dealId: string,
  commenterId: string,
  commentPreview: string
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

  // Get commenter info
  const { data: commenter } = await supabase
    .from("profiles")
    .select("id, email, full_name")
    .eq("id", commenterId)
    .single();

  // Find users to notify (deal agent + assignee, but not the commenter)
  const usersToNotify: string[] = [];
  
  // Add agent if they're not the commenter
  if (deal.agent_id && deal.agent_id !== commenterId) {
    usersToNotify.push(deal.agent_id);
  }
  
  // Add assignee if they're not the commenter
  if (deal.assigned_to && deal.assigned_to !== commenterId) {
    usersToNotify.push(deal.assigned_to);
  }

  // Create in-app notifications
  for (const userId of usersToNotify) {
    await createInAppNotification({
      userId,
      type: "comment",
      title: "New Comment on Deal",
      message: `${commenter?.full_name || "Someone"} commented on ${deal.properties?.address}: "${commentPreview.slice(0, 100)}${commentPreview.length > 100 ? "..." : ""}"`,
      dealId,
      actionUrl: `/dashboard/deals/${dealId}`,
    });
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

// ============================================
// IN-APP NOTIFICATIONS
// ============================================

export interface InAppNotification {
  id: string;
  user_id: string;
  type: string;
  title: string;
  message: string;
  deal_id: string | null;
  action_url: string | null;
  is_read: boolean;
  read_at: string | null;
  created_at: string;
}

export async function getNotifications(): Promise<{
  notifications: InAppNotification[];
  unreadCount: number;
  error: string | null;
}> {
  const supabase = await createClient();

  const { data: { user }, error: userError } = await supabase.auth.getUser();

  if (userError || !user) {
    return { notifications: [], unreadCount: 0, error: "Not authenticated" };
  }

  const { data, error } = await supabase
    .from("notifications")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(20);

  if (error) {
    // Table might not exist yet
    console.error("Error fetching notifications:", error);
    return { notifications: [], unreadCount: 0, error: null };
  }

  const unreadCount = data?.filter((n: InAppNotification) => !n.is_read).length || 0;

  return {
    notifications: data || [],
    unreadCount,
    error: null,
  };
}

export async function markNotificationAsRead(notificationId: string): Promise<{
  success: boolean;
  error: string | null;
}> {
  const supabase = await createClient();

  const { data: { user }, error: userError } = await supabase.auth.getUser();

  if (userError || !user) {
    return { success: false, error: "Not authenticated" };
  }

  const { error } = await supabase
    .from("notifications")
    .update({ is_read: true, read_at: new Date().toISOString() })
    .eq("id", notificationId)
    .eq("user_id", user.id);

  if (error) {
    console.error("Error marking notification as read:", error);
    return { success: false, error: error.message };
  }

  return { success: true, error: null };
}

export async function markAllNotificationsAsRead(): Promise<{
  success: boolean;
  error: string | null;
}> {
  const supabase = await createClient();

  const { data: { user }, error: userError } = await supabase.auth.getUser();

  if (userError || !user) {
    return { success: false, error: "Not authenticated" };
  }

  const { error } = await supabase
    .from("notifications")
    .update({ is_read: true, read_at: new Date().toISOString() })
    .eq("user_id", user.id)
    .eq("is_read", false);

  if (error) {
    console.error("Error marking all notifications as read:", error);
    return { success: false, error: error.message };
  }

  return { success: true, error: null };
}

export async function createInAppNotification(data: {
  userId: string;
  type: string;
  title: string;
  message: string;
  dealId?: string;
  actionUrl?: string;
}): Promise<{ success: boolean; error: string | null }> {
  const supabase = await createClient();

  const { error } = await supabase.from("notifications").insert({
    user_id: data.userId,
    type: data.type,
    title: data.title,
    message: data.message,
    deal_id: data.dealId || null,
    action_url: data.actionUrl || null,
  });

  if (error) {
    console.error("Error creating notification:", error);
    return { success: false, error: error.message };
  }

  return { success: true, error: null };
}

export async function deleteNotification(notificationId: string): Promise<{
  success: boolean;
  error: string | null;
}> {
  const supabase = await createClient();

  const { data: { user }, error: userError } = await supabase.auth.getUser();

  if (userError || !user) {
    return { success: false, error: "Not authenticated" };
  }

  const { error } = await supabase
    .from("notifications")
    .delete()
    .eq("id", notificationId)
    .eq("user_id", user.id);

  if (error) {
    console.error("Error deleting notification:", error);
    return { success: false, error: error.message };
  }

  return { success: true, error: null };
}

export async function updateNotificationPreferences(preferences: {
  email: boolean;
  sms: boolean;
  push: boolean;
  digest: "none" | "daily" | "weekly";
  statusChanges: boolean;
  newAssignments: boolean;
  comments: boolean;
  fundingUpdates: boolean;
}): Promise<{ success: boolean; error: string | null }> {
  const supabase = await createClient();

  const { data: { user }, error: userError } = await supabase.auth.getUser();

  if (userError || !user) {
    return { success: false, error: "Not authenticated" };
  }

  const { error } = await supabase
    .from("profiles")
    .update({ notification_preferences: preferences })
    .eq("id", user.id);

  if (error) {
    console.error("Error updating notification preferences:", error);
    return { success: false, error: error.message };
  }

  return { success: true, error: null };
}
