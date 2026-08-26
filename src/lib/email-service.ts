// Resend Email Service - 100 emails/day free tier
// Sign up at https://resend.com for free API key

import {
  getDealUpdateEmailHtml,
  getNewDealAlertEmailHtml,
  getWeeklyDigestEmailHtml,
} from './email-templates';

interface SendEmailOptions {
  to: string | string[];
  subject: string;
  html: string;
  from?: string;
  replyTo?: string;
}

interface EmailResult {
  success: boolean;
  id?: string;
  error?: string;
}

// Check if Resend is configured
const RESEND_API_KEY = process.env.RESEND_API_KEY;
const FROM_EMAIL = process.env.FROM_EMAIL || 'onboarding@resend.dev';

export async function sendEmail(options: SendEmailOptions): Promise<EmailResult> {
  if (!RESEND_API_KEY) {
    console.warn('RESEND_API_KEY not configured. Email not sent.');
    return { success: false, error: 'Email service not configured' };
  }

  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: options.from || FROM_EMAIL,
        to: Array.isArray(options.to) ? options.to : [options.to],
        subject: options.subject,
        html: options.html,
        reply_to: options.replyTo,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('Resend API error:', error);
      return { success: false, error };
    }

    const data = await response.json();
    return { success: true, id: data.id };
  } catch (error) {
    console.error('Email send error:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    };
  }
}

// Pre-built email functions

export async function sendDealUpdateEmail(
  to: string,
  dealData: {
    dealName: string;
    aiScore: number;
    propertyAddress: string;
    askingPrice: number;
    estimatedARV: number;
    potentialProfit: number;
    updatedBy: string;
  }
): Promise<EmailResult> {
  const dashboardUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  
  const html = getDealUpdateEmailHtml({
    ...dealData,
    dashboardUrl: `${dashboardUrl}/dashboard`,
  });

  return sendEmail({
    to,
    subject: `Deal Update: ${dealData.dealName}`,
    html,
  });
}

export async function sendNewDealAlertEmail(
  to: string | string[],
  dealData: {
    dealName: string;
    aiScore: number;
    propertyAddress: string;
    propertyType: string;
    askingPrice: number;
    createdBy: string;
  }
): Promise<EmailResult> {
  const dashboardUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  
  const html = getNewDealAlertEmailHtml({
    ...dealData,
    dashboardUrl: `${dashboardUrl}/dashboard`,
  });

  return sendEmail({
    to,
    subject: `🎉 New Deal: ${dealData.dealName}`,
    html,
  });
}

export async function sendWeeklyDigestEmail(
  to: string,
  digestData: {
    userName: string;
    periodStart: string;
    periodEnd: string;
    totalDeals: number;
    newDeals: number;
    closedDeals: number;
    totalValue: number;
    topDeals: Array<{
      name: string;
      score: number;
      value: number;
    }>;
  }
): Promise<EmailResult> {
  const dashboardUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  
  const html = getWeeklyDigestEmailHtml({
    ...digestData,
    dashboardUrl: `${dashboardUrl}/dashboard`,
  });

  return sendEmail({
    to,
    subject: `📊 Your Weekly Deal Digest (${digestData.periodStart} - ${digestData.periodEnd})`,
    html,
  });
}

// Simple notification emails

export async function sendSimpleNotification(
  to: string,
  subject: string,
  message: string
): Promise<EmailResult> {
  const html = `<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 0; padding: 20px; background: #f9fafb; }
    .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 8px; padding: 24px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
    .footer { margin-top: 24px; padding-top: 16px; border-top: 1px solid #e5e7eb; text-align: center; font-size: 12px; color: #6b7280; }
  </style>
</head>
<body>
  <div class="container">
    <h2 style="margin: 0 0 16px; color: #111827;">${subject}</h2>
    <p style="color: #374151; line-height: 1.6;">${message}</p>
    <div class="footer">
      <p>DealFlow - Real Estate Deal Management</p>
    </div>
  </div>
</body>
</html>`;

  return sendEmail({
    to,
    subject,
    html,
  });
}

// Password reset email
export async function sendPasswordResetEmail(
  to: string,
  resetUrl: string
): Promise<EmailResult> {
  const html = `<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 0; padding: 20px; background: #f9fafb; }
    .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 8px; padding: 24px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
    .button { display: inline-block; background: #22A06B; color: white; padding: 12px 24px; border-radius: 6px; text-decoration: none; }
    .footer { margin-top: 24px; padding-top: 16px; border-top: 1px solid #e5e7eb; text-align: center; font-size: 12px; color: #6b7280; }
  </style>
</head>
<body>
  <div class="container">
    <h2 style="margin: 0 0 16px; color: #111827;">Reset Your Password</h2>
    <p style="color: #374151; line-height: 1.6;">
      You requested a password reset for your DealFlow account. Click the button below to create a new password.
    </p>
    <p style="text-align: center; margin: 24px 0;">
      <a href="${resetUrl}" class="button">Reset Password</a>
    </p>
    <p style="color: #6b7280; font-size: 14px;">
      If you didn't request this reset, you can safely ignore this email. This link will expire in 1 hour.
    </p>
    <div class="footer">
      <p>DealFlow - Real Estate Deal Management</p>
    </div>
  </div>
</body>
</html>`;

  return sendEmail({
    to,
    subject: 'Reset your DealFlow password',
    html,
  });
}

// Welcome email
export async function sendWelcomeEmail(
  to: string,
  userName: string
): Promise<EmailResult> {
  const dashboardUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  
  const html = `<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 0; padding: 20px; background: #f9fafb; }
    .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
    .header { background: linear-gradient(135deg, #22A06B, #1d4ed8); padding: 32px; color: white; text-align: center; }
    .content { padding: 24px; }
    .feature { display: flex; align-items: center; gap: 12px; padding: 12px 0; border-bottom: 1px solid #e5e7eb; }
    .feature:last-child { border-bottom: none; }
    .feature-icon { width: 40px; height: 40px; background: #dbeafe; border-radius: 8px; display: flex; align-items: center; justify-content: center; font-size: 20px; }
    .button { display: inline-block; background: #22A06B; color: white; padding: 12px 24px; border-radius: 6px; text-decoration: none; }
    .footer { background: #f9fafb; padding: 16px 24px; text-align: center; font-size: 12px; color: #6b7280; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1 style="margin: 0; font-size: 28px;">Welcome to DealFlow! 🎉</h1>
    </div>
    <div class="content">
      <p style="font-size: 18px; color: #374151;">Hi ${userName},</p>
      <p style="color: #6b7280; line-height: 1.6;">
        Thanks for joining DealFlow! We're excited to help you manage your real estate deals more efficiently.
      </p>
      
      <h3 style="margin: 24px 0 16px; color: #111827;">Here's what you can do:</h3>
      
      <div class="feature">
        <div class="feature-icon">🤖</div>
        <div>
          <strong>AI Deal Scoring</strong>
          <p style="margin: 0; color: #6b7280; font-size: 14px;">Get instant AI-powered analysis of your deals</p>
        </div>
      </div>
      
      <div class="feature">
        <div class="feature-icon">📊</div>
        <div>
          <strong>Custom Formulas</strong>
          <p style="margin: 0; color: #6b7280; font-size: 14px;">Build your own evaluation formulas</p>
        </div>
      </div>
      
      <div class="feature">
        <div class="feature-icon">🗺️</div>
        <div>
          <strong>Property Maps</strong>
          <p style="margin: 0; color: #6b7280; font-size: 14px;">Visualize deals with interactive maps</p>
        </div>
      </div>
      
      <div class="feature">
        <div class="feature-icon">📈</div>
        <div>
          <strong>Analytics Dashboard</strong>
          <p style="margin: 0; color: #6b7280; font-size: 14px;">Track your pipeline performance</p>
        </div>
      </div>
      
      <p style="text-align: center; margin: 24px 0;">
        <a href="${dashboardUrl}/dashboard" class="button">Go to Dashboard</a>
      </p>
    </div>
    <div class="footer">
      <p>DealFlow - Real Estate Deal Management</p>
      <p>Questions? Reply to this email and we'll help you out!</p>
    </div>
  </div>
</body>
</html>`;

  return sendEmail({
    to,
    subject: 'Welcome to DealFlow! 🏠',
    html,
  });
}
