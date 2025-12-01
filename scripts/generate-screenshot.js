const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const screenshotsDir = path.join(__dirname, '../public/screenshots');

// Create a placeholder dashboard screenshot
async function generateScreenshot() {
  // Create a simple placeholder SVG that represents a dashboard
  const svg = `
    <svg width="1280" height="720" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:#0f172a"/>
          <stop offset="100%" style="stop-color:#1e293b"/>
        </linearGradient>
      </defs>
      <rect width="100%" height="100%" fill="url(#bg)"/>
      
      <!-- Sidebar -->
      <rect x="0" y="0" width="240" height="720" fill="#1e293b"/>
      <rect x="20" y="20" width="200" height="48" rx="8" fill="#3b82f6"/>
      <text x="120" y="52" font-family="system-ui" font-size="20" font-weight="bold" fill="white" text-anchor="middle">DealFlow</text>
      
      <!-- Header -->
      <rect x="240" y="0" width="1040" height="64" fill="#1e293b"/>
      <text x="280" y="40" font-family="system-ui" font-size="24" font-weight="bold" fill="white">Dashboard</text>
      
      <!-- Stats Cards -->
      <rect x="280" y="100" width="220" height="100" rx="12" fill="#1e293b"/>
      <rect x="520" y="100" width="220" height="100" rx="12" fill="#1e293b"/>
      <rect x="760" y="100" width="220" height="100" rx="12" fill="#1e293b"/>
      <rect x="1000" y="100" width="220" height="100" rx="12" fill="#1e293b"/>
      
      <text x="300" y="140" font-family="system-ui" font-size="14" fill="#94a3b8">Total Deals</text>
      <text x="300" y="175" font-family="system-ui" font-size="28" font-weight="bold" fill="white">24</text>
      
      <text x="540" y="140" font-family="system-ui" font-size="14" fill="#94a3b8">Properties</text>
      <text x="540" y="175" font-family="system-ui" font-size="28" font-weight="bold" fill="white">18</text>
      
      <text x="780" y="140" font-family="system-ui" font-size="14" fill="#94a3b8">Pending</text>
      <text x="780" y="175" font-family="system-ui" font-size="28" font-weight="bold" fill="white">7</text>
      
      <text x="1020" y="140" font-family="system-ui" font-size="14" fill="#94a3b8">Closed</text>
      <text x="1020" y="175" font-family="system-ui" font-size="28" font-weight="bold" fill="white">12</text>
      
      <!-- Chart area -->
      <rect x="280" y="240" width="480" height="300" rx="12" fill="#1e293b"/>
      <text x="300" y="280" font-family="system-ui" font-size="16" font-weight="600" fill="white">Deal Pipeline</text>
      
      <!-- Recent Deals -->
      <rect x="780" y="240" width="440" height="300" rx="12" fill="#1e293b"/>
      <text x="800" y="280" font-family="system-ui" font-size="16" font-weight="600" fill="white">Recent Deals</text>
      
      <!-- Deal rows -->
      <rect x="800" y="300" width="400" height="50" rx="8" fill="#334155"/>
      <rect x="800" y="360" width="400" height="50" rx="8" fill="#334155"/>
      <rect x="800" y="420" width="400" height="50" rx="8" fill="#334155"/>
      <rect x="800" y="480" width="400" height="50" rx="8" fill="#334155"/>
      
      <!-- Activity Section -->
      <rect x="280" y="560" width="940" height="140" rx="12" fill="#1e293b"/>
      <text x="300" y="600" font-family="system-ui" font-size="16" font-weight="600" fill="white">Recent Activity</text>
    </svg>
  `;

  await sharp(Buffer.from(svg))
    .png()
    .toFile(path.join(screenshotsDir, 'dashboard.png'));

  console.log('✅ Screenshot generated successfully!');
}

generateScreenshot().catch(console.error);
