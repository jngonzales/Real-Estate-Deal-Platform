// Script to generate PWA icons from SVG
// Run with: node scripts/generate-icons.js

const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const sizes = [72, 96, 128, 144, 152, 192, 384, 512];
const svgPath = path.join(__dirname, '../public/icons/icon.svg');
const outputDir = path.join(__dirname, '../public/icons');

// Simple SVG for the icon (inline since sharp works better with buffers)
const svgContent = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#1e40af"/>
      <stop offset="100%" style="stop-color:#3b82f6"/>
    </linearGradient>
  </defs>
  <rect width="512" height="512" rx="96" fill="url(#bg)"/>
  <g transform="translate(96, 80)">
    <path d="M160 40 L300 160 L20 160 Z" fill="white" opacity="0.95"/>
    <rect x="60" y="160" width="200" height="180" fill="white" opacity="0.95" rx="8"/>
    <rect x="130" y="240" width="60" height="100" fill="#1e40af" rx="4"/>
    <rect x="80" y="200" width="40" height="40" fill="#1e40af" rx="4"/>
    <rect x="200" y="200" width="40" height="40" fill="#1e40af" rx="4"/>
  </g>
  <text x="256" y="460" font-family="Arial, sans-serif" font-size="64" font-weight="bold" fill="white" text-anchor="middle" opacity="0.9">DF</text>
</svg>`;

async function generateIcons() {
  console.log('Generating PWA icons...');
  
  for (const size of sizes) {
    const outputPath = path.join(outputDir, `icon-${size}x${size}.png`);
    
    await sharp(Buffer.from(svgContent))
      .resize(size, size)
      .png()
      .toFile(outputPath);
    
    console.log(`✓ Generated ${size}x${size}`);
  }
  
  // Also generate apple-touch-icon
  await sharp(Buffer.from(svgContent))
    .resize(180, 180)
    .png()
    .toFile(path.join(outputDir, 'apple-touch-icon.png'));
  
  console.log('✓ Generated apple-touch-icon (180x180)');
  
  // Generate favicon
  await sharp(Buffer.from(svgContent))
    .resize(32, 32)
    .png()
    .toFile(path.join(__dirname, '../public/favicon.png'));
  
  console.log('✓ Generated favicon.png (32x32)');
  
  console.log('\n✅ All icons generated successfully!');
}

generateIcons().catch(console.error);
