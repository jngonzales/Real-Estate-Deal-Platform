// Email templates for the Real Estate Deal Platform

export type EmailTemplateType = 
  | "status_change"
  | "assignment"
  | "new_deal"
  | "comment"
  | "funding_request"
  | "funding_approved"
  | "offer_ready"
  | "welcome"
  | "password_reset"
  | "digest";

interface EmailTemplateData {
  recipientName?: string;
  dealAddress?: string;
  dealId?: string;
  oldStatus?: string;
  newStatus?: string;
  assigneeName?: string;
  agentName?: string;
  commenterName?: string;
  commentText?: string;
  fundingAmount?: string;
  offerAmount?: string;
  actionUrl?: string;
  deals?: Array<{ address: string; status: string; id: string }>;
  companyName?: string;
}

const baseStyles = `
  body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, sans-serif; line-height: 1.6; color: #333; }
  .container { max-width: 600px; margin: 0 auto; padding: 20px; }
  .header { background: linear-gradient(135deg, #1e40af 0%, #3b82f6 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
  .header h1 { margin: 0; font-size: 24px; }
  .content { background: #ffffff; padding: 30px; border: 1px solid #e5e7eb; }
  .footer { background: #f9fafb; padding: 20px; text-align: center; font-size: 12px; color: #6b7280; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 8px 8px; }
  .button { display: inline-block; padding: 12px 24px; background: #2563eb; color: white !important; text-decoration: none; border-radius: 6px; font-weight: 500; }
  .button:hover { background: #1d4ed8; }
  .badge { display: inline-block; padding: 4px 12px; border-radius: 9999px; font-size: 12px; font-weight: 500; }
  .badge-blue { background: #dbeafe; color: #1e40af; }
  .badge-green { background: #dcfce7; color: #166534; }
  .badge-yellow { background: #fef3c7; color: #92400e; }
  .badge-red { background: #fee2e2; color: #991b1b; }
  .card { background: #f9fafb; padding: 16px; border-radius: 8px; margin: 16px 0; }
  .divider { height: 1px; background: #e5e7eb; margin: 24px 0; }
`;

export function generateEmailTemplate(type: EmailTemplateType, data: EmailTemplateData): string {
  const companyName = data.companyName || "Real Estate Deals";
  
  switch (type) {
    case "status_change":
      return `
        <!DOCTYPE html>
        <html>
        <head><style>${baseStyles}</style></head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🏠 Deal Status Updated</h1>
            </div>
            <div class="content">
              <p>Hi ${data.recipientName || "there"},</p>
              <p>Your deal has been updated with a new status:</p>
              
              <div class="card">
                <p style="margin: 0; color: #6b7280; font-size: 14px;">Property</p>
                <p style="margin: 4px 0 16px 0; font-weight: 600; font-size: 18px;">${data.dealAddress}</p>
                
                <div style="display: flex; align-items: center; gap: 8px;">
                  <span class="badge badge-red">${formatStatusLabel(data.oldStatus || "")}</span>
                  <span style="color: #6b7280;">→</span>
                  <span class="badge badge-green">${formatStatusLabel(data.newStatus || "")}</span>
                </div>
              </div>
              
              <p>Click below to view the full deal details:</p>
              <p style="text-align: center; margin: 24px 0;">
                <a href="${data.actionUrl}" class="button">View Deal</a>
              </p>
            </div>
            <div class="footer">
              <p>© ${new Date().getFullYear()} ${companyName}. All rights reserved.</p>
              <p>You're receiving this because you're an agent on this deal.</p>
            </div>
          </div>
        </body>
        </html>
      `;

    case "assignment":
      return `
        <!DOCTYPE html>
        <html>
        <head><style>${baseStyles}</style></head>
        <body>
          <div class="container">
            <div class="header">
              <h1>📋 New Deal Assigned</h1>
            </div>
            <div class="content">
              <p>Hi ${data.recipientName || "there"},</p>
              <p>A deal has been assigned to you for review:</p>
              
              <div class="card">
                <p style="margin: 0; color: #6b7280; font-size: 14px;">Property Address</p>
                <p style="margin: 4px 0 0 0; font-weight: 600; font-size: 18px;">${data.dealAddress}</p>
              </div>
              
              <p>Please review this deal at your earliest convenience.</p>
              <p style="text-align: center; margin: 24px 0;">
                <a href="${data.actionUrl}" class="button">Review Deal</a>
              </p>
            </div>
            <div class="footer">
              <p>© ${new Date().getFullYear()} ${companyName}. All rights reserved.</p>
            </div>
          </div>
        </body>
        </html>
      `;

    case "new_deal":
      return `
        <!DOCTYPE html>
        <html>
        <head><style>${baseStyles}</style></head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🎉 New Deal Submitted</h1>
            </div>
            <div class="content">
              <p>Hi ${data.recipientName || "there"},</p>
              <p>A new deal has been submitted and is ready for review:</p>
              
              <div class="card">
                <p style="margin: 0; color: #6b7280; font-size: 14px;">Property</p>
                <p style="margin: 4px 0 8px 0; font-weight: 600; font-size: 18px;">${data.dealAddress}</p>
                <p style="margin: 0; color: #6b7280; font-size: 14px;">Submitted by</p>
                <p style="margin: 4px 0 0 0; font-weight: 500;">${data.agentName || "Agent"}</p>
              </div>
              
              <p style="text-align: center; margin: 24px 0;">
                <a href="${data.actionUrl}" class="button">View Deal</a>
              </p>
            </div>
            <div class="footer">
              <p>© ${new Date().getFullYear()} ${companyName}. All rights reserved.</p>
            </div>
          </div>
        </body>
        </html>
      `;

    case "comment":
      return `
        <!DOCTYPE html>
        <html>
        <head><style>${baseStyles}</style></head>
        <body>
          <div class="container">
            <div class="header">
              <h1>💬 New Comment</h1>
            </div>
            <div class="content">
              <p>Hi ${data.recipientName || "there"},</p>
              <p>A new comment was added to a deal you're following:</p>
              
              <div class="card">
                <p style="margin: 0; color: #6b7280; font-size: 14px;">Property</p>
                <p style="margin: 4px 0 16px 0; font-weight: 600;">${data.dealAddress}</p>
                
                <p style="margin: 0; color: #6b7280; font-size: 14px;">${data.commenterName || "Someone"} wrote:</p>
                <p style="margin: 8px 0 0 0; padding: 12px; background: white; border-radius: 6px; border-left: 3px solid #2563eb;">
                  "${data.commentText}"
                </p>
              </div>
              
              <p style="text-align: center; margin: 24px 0;">
                <a href="${data.actionUrl}" class="button">View Conversation</a>
              </p>
            </div>
            <div class="footer">
              <p>© ${new Date().getFullYear()} ${companyName}. All rights reserved.</p>
            </div>
          </div>
        </body>
        </html>
      `;

    case "funding_request":
      return `
        <!DOCTYPE html>
        <html>
        <head><style>${baseStyles}</style></head>
        <body>
          <div class="container">
            <div class="header">
              <h1>💰 Funding Request</h1>
            </div>
            <div class="content">
              <p>Hi ${data.recipientName || "there"},</p>
              <p>A new funding request has been submitted:</p>
              
              <div class="card">
                <p style="margin: 0; color: #6b7280; font-size: 14px;">Property</p>
                <p style="margin: 4px 0 16px 0; font-weight: 600; font-size: 18px;">${data.dealAddress}</p>
                
                <p style="margin: 0; color: #6b7280; font-size: 14px;">Requested Amount</p>
                <p style="margin: 4px 0 0 0; font-weight: 600; font-size: 24px; color: #059669;">${data.fundingAmount}</p>
              </div>
              
              <p style="text-align: center; margin: 24px 0;">
                <a href="${data.actionUrl}" class="button">Review Request</a>
              </p>
            </div>
            <div class="footer">
              <p>© ${new Date().getFullYear()} ${companyName}. All rights reserved.</p>
            </div>
          </div>
        </body>
        </html>
      `;

    case "funding_approved":
      return `
        <!DOCTYPE html>
        <html>
        <head><style>${baseStyles}</style></head>
        <body>
          <div class="container">
            <div class="header" style="background: linear-gradient(135deg, #059669 0%, #10b981 100%);">
              <h1>✅ Funding Approved!</h1>
            </div>
            <div class="content">
              <p>Hi ${data.recipientName || "there"},</p>
              <p>Great news! Your funding request has been approved:</p>
              
              <div class="card">
                <p style="margin: 0; color: #6b7280; font-size: 14px;">Property</p>
                <p style="margin: 4px 0 16px 0; font-weight: 600; font-size: 18px;">${data.dealAddress}</p>
                
                <p style="margin: 0; color: #6b7280; font-size: 14px;">Approved Amount</p>
                <p style="margin: 4px 0 0 0; font-weight: 600; font-size: 24px; color: #059669;">${data.fundingAmount}</p>
              </div>
              
              <p style="text-align: center; margin: 24px 0;">
                <a href="${data.actionUrl}" class="button">View Details</a>
              </p>
            </div>
            <div class="footer">
              <p>© ${new Date().getFullYear()} ${companyName}. All rights reserved.</p>
            </div>
          </div>
        </body>
        </html>
      `;

    case "offer_ready":
      return `
        <!DOCTYPE html>
        <html>
        <head><style>${baseStyles}</style></head>
        <body>
          <div class="container">
            <div class="header">
              <h1>📄 Offer Ready</h1>
            </div>
            <div class="content">
              <p>Hi ${data.recipientName || "there"},</p>
              <p>An offer has been prepared for your deal:</p>
              
              <div class="card">
                <p style="margin: 0; color: #6b7280; font-size: 14px;">Property</p>
                <p style="margin: 4px 0 16px 0; font-weight: 600; font-size: 18px;">${data.dealAddress}</p>
                
                <p style="margin: 0; color: #6b7280; font-size: 14px;">Offer Amount</p>
                <p style="margin: 4px 0 0 0; font-weight: 600; font-size: 24px; color: #2563eb;">${data.offerAmount}</p>
              </div>
              
              <p>Review the offer and download the PDF from your dashboard.</p>
              <p style="text-align: center; margin: 24px 0;">
                <a href="${data.actionUrl}" class="button">View Offer</a>
              </p>
            </div>
            <div class="footer">
              <p>© ${new Date().getFullYear()} ${companyName}. All rights reserved.</p>
            </div>
          </div>
        </body>
        </html>
      `;

    case "welcome":
      return `
        <!DOCTYPE html>
        <html>
        <head><style>${baseStyles}</style></head>
        <body>
          <div class="container">
            <div class="header">
              <h1>👋 Welcome to ${companyName}!</h1>
            </div>
            <div class="content">
              <p>Hi ${data.recipientName || "there"},</p>
              <p>Welcome to ${companyName}! We're excited to have you on board.</p>
              
              <p>Here's what you can do:</p>
              <ul style="padding-left: 20px;">
                <li>Submit new deals for review</li>
                <li>Track your deals through the pipeline</li>
                <li>Communicate with underwriters</li>
                <li>Generate professional offer PDFs</li>
              </ul>
              
              <p style="text-align: center; margin: 24px 0;">
                <a href="${data.actionUrl}" class="button">Get Started</a>
              </p>
            </div>
            <div class="footer">
              <p>© ${new Date().getFullYear()} ${companyName}. All rights reserved.</p>
            </div>
          </div>
        </body>
        </html>
      `;

    case "digest":
      return `
        <!DOCTYPE html>
        <html>
        <head><style>${baseStyles}</style></head>
        <body>
          <div class="container">
            <div class="header">
              <h1>📊 Your Daily Digest</h1>
            </div>
            <div class="content">
              <p>Hi ${data.recipientName || "there"},</p>
              <p>Here's a summary of your deals:</p>
              
              ${data.deals?.map(deal => `
                <div class="card" style="display: flex; justify-content: space-between; align-items: center;">
                  <div>
                    <p style="margin: 0; font-weight: 600;">${deal.address}</p>
                    <span class="badge badge-blue">${formatStatusLabel(deal.status)}</span>
                  </div>
                  <a href="${data.actionUrl}/${deal.id}" style="color: #2563eb; text-decoration: none;">View →</a>
                </div>
              `).join("") || ""}
              
              <p style="text-align: center; margin: 24px 0;">
                <a href="${data.actionUrl}" class="button">View All Deals</a>
              </p>
            </div>
            <div class="footer">
              <p>© ${new Date().getFullYear()} ${companyName}. All rights reserved.</p>
              <p><a href="#" style="color: #6b7280;">Unsubscribe from digest emails</a></p>
            </div>
          </div>
        </body>
        </html>
      `;

    default:
      return `
        <!DOCTYPE html>
        <html>
        <head><style>${baseStyles}</style></head>
        <body>
          <div class="container">
            <div class="header">
              <h1>${companyName}</h1>
            </div>
            <div class="content">
              <p>Hi ${data.recipientName || "there"},</p>
              <p>You have a new notification.</p>
              <p style="text-align: center; margin: 24px 0;">
                <a href="${data.actionUrl}" class="button">View Details</a>
              </p>
            </div>
            <div class="footer">
              <p>© ${new Date().getFullYear()} ${companyName}. All rights reserved.</p>
            </div>
          </div>
        </body>
        </html>
      `;
  }
}

function formatStatusLabel(status: string): string {
  const labels: Record<string, string> = {
    submitted: "Submitted",
    needs_info: "Needs Info",
    underwriting: "Underwriting",
    offer_prepared: "Offer Ready",
    offer_sent: "Offer Sent",
    in_contract: "In Contract",
    funding: "Funding",
    closed: "Closed",
    rejected: "Rejected",
  };
  return labels[status] || status;
}

export function generateEmailSubject(type: EmailTemplateType, data: EmailTemplateData): string {
  switch (type) {
    case "status_change":
      return `Deal Update: ${data.dealAddress} - Now ${formatStatusLabel(data.newStatus || "")}`;
    case "assignment":
      return `New Deal Assigned: ${data.dealAddress}`;
    case "new_deal":
      return `New Deal Submitted: ${data.dealAddress}`;
    case "comment":
      return `New Comment on ${data.dealAddress}`;
    case "funding_request":
      return `Funding Request: ${data.dealAddress} - ${data.fundingAmount}`;
    case "funding_approved":
      return `✅ Funding Approved: ${data.dealAddress}`;
    case "offer_ready":
      return `Offer Ready: ${data.dealAddress} - ${data.offerAmount}`;
    case "welcome":
      return `Welcome to ${data.companyName || "Real Estate Deals"}!`;
    case "digest":
      return `Your Daily Deal Digest - ${new Date().toLocaleDateString()}`;
    default:
      return "Notification from Real Estate Deals";
  }
}
