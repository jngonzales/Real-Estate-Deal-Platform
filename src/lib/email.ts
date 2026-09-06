import { Resend } from "resend";

// Initialize Resend lazily: the client throws at construction when the key is missing,
// which would break the build for anyone without RESEND_API_KEY set.
const resend = process.env.RESEND_API_KEY
  ? new Resend(process.env.RESEND_API_KEY)
  : null;

interface SendInvitationEmailParams {
  to: string;
  inviterName: string;
  organizationName: string;
  role: string;
  inviteLink: string;
}

export async function sendInvitationEmail({
  to,
  inviterName,
  organizationName,
  role,
  inviteLink,
}: SendInvitationEmailParams) {
  if (!resend) {
    console.warn("RESEND_API_KEY not configured; skipping invitation email");
    return { error: "Email service not configured" };
  }
  try {
    const { data, error } = await resend.emails.send({
      from: "DealFlow <onboarding@resend.dev>", // Use your verified domain in production
      to: [to],
      subject: `You're invited to join ${organizationName} on DealFlow`,
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
          </head>
          <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #0f172a; margin: 0; padding: 40px 20px;">
            <div style="max-width: 600px; margin: 0 auto; background-color: #1e293b; border-radius: 16px; overflow: hidden; border: 1px solid #334155;">
              <!-- Header -->
              <div style="background: #22A06B; padding: 32px; text-align: center;">
                <h1 style="color: white; margin: 0; font-size: 24px; font-weight: bold;">DealFlow</h1>
                <p style="color: rgba(255,255,255,0.8); margin: 8px 0 0 0; font-size: 14px;">Real Estate Deal Analysis Platform</p>
              </div>
              
              <!-- Content -->
              <div style="padding: 32px;">
                <h2 style="color: #f8fafc; margin: 0 0 16px 0; font-size: 20px;">You're Invited</h2>
                
                <p style="color: #94a3b8; margin: 0 0 24px 0; line-height: 1.6;">
                  <strong style="color: #f8fafc;">${inviterName}</strong> has invited you to join 
                  <strong style="color: #f8fafc;">${organizationName}</strong> as a 
                  <strong style="color: #22A06B;">${role}</strong>.
                </p>
                
                <p style="color: #94a3b8; margin: 0 0 24px 0; line-height: 1.6;">
                  DealFlow helps real estate teams analyze deals faster with professional-grade calculators, 
                  AI-powered insights, and streamlined workflows.
                </p>
                
                <!-- CTA Button -->
                <div style="text-align: center; margin: 32px 0;">
                  <a href="${inviteLink}" style="display: inline-block; background: #22A06B; color: white; text-decoration: none; padding: 16px 32px; border-radius: 8px; font-weight: 600; font-size: 16px;">
                    Accept Invitation
                  </a>
                </div>
                
                <p style="color: #64748b; font-size: 14px; margin: 24px 0 0 0;">
                  This invitation expires in 7 days. If you didn't expect this email, you can safely ignore it.
                </p>
              </div>
              
              <!-- Footer -->
              <div style="padding: 24px 32px; border-top: 1px solid #334155; text-align: center;">
                <p style="color: #64748b; font-size: 12px; margin: 0;">
                  © 2026 DealFlow. All rights reserved.
                </p>
              </div>
            </div>
          </body>
        </html>
      `,
    });

    if (error) {
      console.error("Error sending invitation email:", error);
      return { success: false, error: error.message };
    }

    return { success: true, data };
  } catch (error) {
    console.error("Error sending invitation email:", error);
    return { success: false, error: "Failed to send email" };
  }
}

// For password reset, welcome emails, etc.
export async function sendWelcomeEmail(to: string, name: string) {
  if (!resend) {
    console.warn("RESEND_API_KEY not configured; skipping welcome email");
    return { error: "Email service not configured" };
  }
  try {
    const { data, error } = await resend.emails.send({
      from: "DealFlow <onboarding@resend.dev>",
      to: [to],
      subject: "Welcome to DealFlow",
      html: `
        <!DOCTYPE html>
        <html>
          <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #0f172a; padding: 40px 20px;">
            <div style="max-width: 600px; margin: 0 auto; background-color: #1e293b; border-radius: 16px; padding: 32px; border: 1px solid #334155;">
              <h1 style="color: #f8fafc; margin: 0 0 16px 0;">Welcome, ${name}</h1>
              <p style="color: #94a3b8; line-height: 1.6;">
                Thanks for joining DealFlow! You now have access to professional-grade real estate 
                analysis tools to evaluate deals faster and smarter.
              </p>
              <div style="margin: 24px 0;">
                <a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/dashboard" 
                   style="display: inline-block; background: #22A06B; color: white; text-decoration: none; padding: 12px 24px; border-radius: 8px; font-weight: 600;">
                  Go to Dashboard
                </a>
              </div>
              <p style="color: #64748b; font-size: 14px; margin-top: 24px;">
                — The DealFlow Team
              </p>
            </div>
          </body>
        </html>
      `,
    });

    if (error) {
      console.error("Error sending welcome email:", error);
      return { success: false, error: error.message };
    }

    return { success: true, data };
  } catch (error) {
    console.error("Error sending welcome email:", error);
    return { success: false, error: "Failed to send email" };
  }
}
