// Email templates for notifications using Resend (100 emails/day free)
// These are string templates to avoid Next.js head/html element restrictions

interface DealUpdateEmailProps {
  dealName: string;
  aiScore: number;
  propertyAddress: string;
  askingPrice: number;
  estimatedARV: number;
  potentialProfit: number;
  updatedBy: string;
  dashboardUrl: string;
}

export function getDealUpdateEmailHtml({
  dealName,
  aiScore,
  propertyAddress,
  askingPrice,
  estimatedARV,
  potentialProfit,
  updatedBy,
  dashboardUrl,
}: DealUpdateEmailProps): string {
  const scoreColor = aiScore >= 70 ? '#22c55e' : aiScore >= 50 ? '#f59e0b' : '#ef4444';
  
  return `<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 0; padding: 20px; background: #f9fafb; }
    .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
    .header { background: linear-gradient(135deg, #22A06B, #1d4ed8); padding: 24px; color: white; }
    .content { padding: 24px; }
    .score-badge { display: inline-block; padding: 8px 16px; border-radius: 20px; font-weight: bold; color: white; }
    .metrics { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin: 20px 0; }
    .metric { background: #f3f4f6; padding: 16px; border-radius: 8px; }
    .metric-label { font-size: 12px; color: #6b7280; text-transform: uppercase; }
    .metric-value { font-size: 24px; font-weight: bold; color: #111827; }
    .button { display: inline-block; background: #22A06B; color: white; padding: 12px 24px; border-radius: 6px; text-decoration: none; }
    .footer { background: #f9fafb; padding: 16px 24px; text-align: center; font-size: 12px; color: #6b7280; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1 style="margin: 0; font-size: 24px;">Deal Update</h1>
      <p style="margin: 8px 0 0; opacity: 0.9;">Your deal has been updated</p>
    </div>
    <div class="content">
      <h2 style="margin: 0 0 8px;">${dealName}</h2>
      <p style="color: #6b7280; margin: 0 0 16px;">${propertyAddress}</p>
      
      <div style="margin-bottom: 20px;">
        <span class="score-badge" style="background: ${scoreColor};">
          AI Score: ${aiScore}/100
        </span>
      </div>
      
      <div class="metrics">
        <div class="metric">
          <div class="metric-label">Asking Price</div>
          <div class="metric-value">$${askingPrice.toLocaleString()}</div>
        </div>
        <div class="metric">
          <div class="metric-label">Estimated ARV</div>
          <div class="metric-value">$${estimatedARV.toLocaleString()}</div>
        </div>
        <div class="metric">
          <div class="metric-label">Potential Profit</div>
          <div class="metric-value" style="color: ${potentialProfit >= 0 ? '#22c55e' : '#ef4444'};">
            $${potentialProfit.toLocaleString()}
          </div>
        </div>
        <div class="metric">
          <div class="metric-label">Updated By</div>
          <div class="metric-value" style="font-size: 16px;">${updatedBy}</div>
        </div>
      </div>
      
      <a href="${dashboardUrl}" class="button">
        View Deal in Dashboard
      </a>
    </div>
    <div class="footer">
      <p>You received this because you're subscribed to deal updates.</p>
      <p>DealFlow - Real Estate Deal Management</p>
    </div>
  </div>
</body>
</html>`;
}

interface NewDealAlertEmailProps {
  dealName: string;
  aiScore: number;
  propertyAddress: string;
  propertyType: string;
  askingPrice: number;
  createdBy: string;
  dashboardUrl: string;
}

export function getNewDealAlertEmailHtml({
  dealName,
  aiScore,
  propertyAddress,
  propertyType,
  askingPrice,
  createdBy,
  dashboardUrl,
}: NewDealAlertEmailProps): string {
  return `<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 0; padding: 20px; background: #f9fafb; }
    .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
    .header { background: linear-gradient(135deg, #22c55e, #16a34a); padding: 24px; color: white; }
    .content { padding: 24px; }
    .badge { display: inline-block; padding: 4px 12px; background: #dbeafe; color: #1d4ed8; border-radius: 12px; font-size: 12px; font-weight: 500; }
    .button { display: inline-block; background: #22c55e; color: white; padding: 12px 24px; border-radius: 6px; text-decoration: none; }
    .footer { background: #f9fafb; padding: 16px 24px; text-align: center; font-size: 12px; color: #6b7280; }
    .score-box { background: #f0fdf4; padding: 16px; border-radius: 8px; margin-bottom: 20px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1 style="margin: 0; font-size: 24px;">🎉 New Deal Alert</h1>
      <p style="margin: 8px 0 0; opacity: 0.9;">A new opportunity has been added</p>
    </div>
    <div class="content">
      <span class="badge">${propertyType}</span>
      <h2 style="margin: 12px 0 8px;">${dealName}</h2>
      <p style="color: #6b7280; margin: 0 0 16px;">${propertyAddress}</p>
      
      <div class="score-box">
        <div style="font-size: 14px; color: #166534;">AI Score</div>
        <div style="font-size: 32px; font-weight: bold; color: #15803d;">${aiScore}/100</div>
      </div>
      
      <p style="color: #374151;">
        <strong>Asking Price:</strong> $${askingPrice.toLocaleString()}<br />
        <strong>Created By:</strong> ${createdBy}
      </p>
      
      <a href="${dashboardUrl}" class="button">
        View Deal Details
      </a>
    </div>
    <div class="footer">
      <p>DealFlow - Real Estate Deal Management</p>
    </div>
  </div>
</body>
</html>`;
}

interface WeeklyDigestEmailProps {
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
  dashboardUrl: string;
}

export function getWeeklyDigestEmailHtml({
  userName,
  periodStart,
  periodEnd,
  totalDeals,
  newDeals,
  closedDeals,
  totalValue,
  topDeals,
  dashboardUrl,
}: WeeklyDigestEmailProps): string {
  const topDealsHtml = topDeals.map(deal => `
    <div class="deal-row">
      <span style="color: #374151;">${deal.name}</span>
      <span>
        <span style="color: #22c55e; font-weight: bold;">${deal.score}</span>
        <span style="color: #9ca3af; margin-left: 12px;">$${deal.value.toLocaleString()}</span>
      </span>
    </div>
  `).join('');

  return `<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 0; padding: 20px; background: #f9fafb; }
    .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
    .header { background: #22A06B; padding: 24px; color: white; }
    .content { padding: 24px; }
    .stats { display: grid; grid-template-columns: repeat(2, 1fr); gap: 12px; margin: 20px 0; }
    .stat { background: #f3f4f6; padding: 16px; border-radius: 8px; text-align: center; }
    .stat-value { font-size: 28px; font-weight: bold; color: #111827; }
    .stat-label { font-size: 12px; color: #6b7280; text-transform: uppercase; margin-top: 4px; }
    .deal-row { display: flex; justify-content: space-between; padding: 12px; border-bottom: 1px solid #e5e7eb; }
    .button { display: inline-block; background: #22A06B; color: white; padding: 12px 24px; border-radius: 6px; text-decoration: none; }
    .footer { background: #f9fafb; padding: 16px 24px; text-align: center; font-size: 12px; color: #6b7280; }
    .deals-list { border: 1px solid #e5e7eb; border-radius: 8px; overflow: hidden; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1 style="margin: 0; font-size: 24px;">📊 Weekly Digest</h1>
      <p style="margin: 8px 0 0; opacity: 0.9;">${periodStart} - ${periodEnd}</p>
    </div>
    <div class="content">
      <p style="font-size: 18px; color: #374151;">Hi ${userName},</p>
      <p style="color: #6b7280;">Here's your weekly summary:</p>
      
      <div class="stats">
        <div class="stat">
          <div class="stat-value">${totalDeals}</div>
          <div class="stat-label">Active Deals</div>
        </div>
        <div class="stat">
          <div class="stat-value" style="color: #22c55e;">+${newDeals}</div>
          <div class="stat-label">New Deals</div>
        </div>
        <div class="stat">
          <div class="stat-value" style="color: #22A06B;">${closedDeals}</div>
          <div class="stat-label">Closed Deals</div>
        </div>
        <div class="stat">
          <div class="stat-value">$${(totalValue / 1000000).toFixed(1)}M</div>
          <div class="stat-label">Pipeline Value</div>
        </div>
      </div>
      
      ${topDeals.length > 0 ? `
        <h3 style="margin: 24px 0 12px; color: #111827;">Top Scoring Deals</h3>
        <div class="deals-list">
          ${topDealsHtml}
        </div>
      ` : ''}
      
      <div style="text-align: center; margin-top: 24px;">
        <a href="${dashboardUrl}" class="button">
          View Full Dashboard
        </a>
      </div>
    </div>
    <div class="footer">
      <p>You received this because you're subscribed to weekly digests.</p>
      <p>DealFlow - Real Estate Deal Management</p>
    </div>
  </div>
</body>
</html>`;
}
