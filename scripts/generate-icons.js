// Generates the PWA icon set from the LotMerit brand mark.
// Run with: node scripts/generate-icons.js
//
// The glyph matches <BrandMark> in src/components/brand/brand-mark.tsx:
// a quartered compass circle with three ascending bars breaking into
// the bottom-right quadrant, drawn in white on a solid emerald tile.
// No gradients — the tile is the same flat #22A06B as --primary.

import sharp from "sharp";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const here = path.dirname(fileURLToPath(import.meta.url));

const sizes = [72, 96, 128, 144, 152, 192, 384, 512];

// 24-unit glyph scaled onto a 512 tile; strokes stay round-capped.
const GLYPH = `
  <g transform="translate(76,76) scale(15)" fill="none" stroke="#FFFFFF"
     stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round">
    <circle cx="12" cy="12" r="9" />
    <path d="M12 3v3" />
    <path d="M12 18v3" />
    <path d="M3 12h3" />
    <path d="M18 12h3" />
    <path d="M7 17v-3" />
    <path d="M11 17v-5" />
    <path d="M15 17v-7" />
  </g>`;

const iconSvg = (size) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
  <rect width="512" height="512" rx="${Math.round(size * 0.19)}" fill="#22A06B"/>
  ${GLYPH}
</svg>`;

async function generateIcons() {
  console.log("Generating PWA icons (emerald brand mark)...");

  for (const size of sizes) {
    const outputPath = path.join(here, `../public/icons/icon-${size}x${size}.png`);
    await sharp(Buffer.from(iconSvg(size))).resize(size, size).png().toFile(outputPath);
    console.log(`  icon-${size}x${size}.png`);
  }

  await sharp(Buffer.from(iconSvg(180)))
    .resize(180, 180)
    .png()
    .toFile(path.join(here, "../public/icons/apple-touch-icon.png"));
  console.log("  apple-touch-icon.png");

  await sharp(Buffer.from(iconSvg(32)))
    .resize(32, 32)
    .png()
    .toFile(path.join(here, "../public/favicon.png"));
  console.log("  favicon.png");

  fs.writeFileSync(path.join(here, "../public/icons/icon.svg"), iconSvg(512));
  console.log("  icon.svg");

  console.log("Done.");
}

generateIcons().catch((err) => {
  console.error(err);
  process.exit(1);
});
