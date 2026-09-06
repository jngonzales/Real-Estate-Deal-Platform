// Generate the install icons, favicons and social preview from the LotMerit mark.
// Run with: node scripts/generate-icons.js

import sharp from "sharp";
import { readFile, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";

const projectPath = (relativePath) => fileURLToPath(new URL("../" + relativePath, import.meta.url));
const tileColor = "#0C120E";
const markColor = "#22A06B";
const faviconSizes = [16, 32, 48, 256];

async function loadMarkAlpha() {
  const master = sharp(projectPath("public/brand/lotmerit-mark.png"));
  const { hasAlpha } = await master.metadata();
  if (!hasAlpha) throw new Error("The LotMerit mark must have a transparent background.");

  const alpha = await master.extractChannel("alpha").png().toBuffer();
  const { channels: [opacity] } = await sharp(alpha).stats();
  if (opacity.min !== 0 || opacity.max === 0) {
    throw new Error("The LotMerit mark must contain visible artwork and transparent pixels.");
  }

  return sharp(alpha).trim({ background: "#000000", threshold: 4 }).png().toBuffer();
}

async function renderIcon(markAlpha, size, maskable = false) {
  // Keep even the corners of the mark inside the maskable safe circle (40% radius).
  const markSize = Math.round(size * (maskable ? 0.54 : 0.72));
  const { data: alpha, info: { width, height } } = await sharp(markAlpha)
    .resize(markSize, markSize, { fit: "inside" })
    .extractChannel(0)
    .raw()
    .toBuffer({ resolveWithObject: true });

  const mark = await sharp({ create: { width, height, channels: 3, background: markColor } })
    .joinChannel(alpha, { raw: { width, height, channels: 1 } })
    .png()
    .toBuffer();

  const radius = maskable ? 0 : Math.round(size * 0.21);
  const tile = Buffer.from(
    '<svg xmlns="http://www.w3.org/2000/svg" width="' + size + '" height="' + size + '">' +
    '<rect width="100%" height="100%" rx="' + radius + '" fill="' + tileColor + '"/></svg>',
  );
  const icon = sharp(tile).composite([{ input: mark, gravity: "centre" }]);
  return (maskable ? icon.removeAlpha() : icon).png().toBuffer();
}

function encodeFavicon(pngs) {
  const header = Buffer.alloc(6 + pngs.length * 16);
  header.writeUInt16LE(1, 2); // ICO image type.
  header.writeUInt16LE(pngs.length, 4);

  let imageOffset = header.length;
  pngs.forEach((png, index) => {
    const entry = 6 + index * 16;
    const size = faviconSizes[index] % 256; // The directory stores 256 pixels as 0.
    header.writeUInt8(size, entry);
    header.writeUInt8(size, entry + 1);
    header.writeUInt16LE(1, entry + 4);
    header.writeUInt16LE(32, entry + 6);
    header.writeUInt32LE(png.length, entry + 8);
    header.writeUInt32LE(imageOffset, entry + 12);
    imageOffset += png.length;
  });

  return Buffer.concat([header, ...pngs]);
}

async function renderSocialPreview(markAlpha) {
  const width = 1200;
  const height = 630;
  const photoHeight = 490;
  const photo = await sharp(projectPath("public/example-property.webp"))
    .resize(width, photoHeight, { fit: "cover", position: "north" })
    .toBuffer();
  const logo = await renderIcon(markAlpha, 76);
  const caption = Buffer.from(
    '<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="140">' +
    '<g font-family="Arial, sans-serif">' +
    '<text x="152" y="66" fill="#0C120E" font-size="48" font-weight="700" letter-spacing="-1">LotMerit</text>' +
    '<text x="154" y="104" fill="#3D5548" font-size="28">Real estate deal analysis</text>' +
    '</g></svg>',
  );

  return sharp({ create: { width, height, channels: 3, background: "#F7F9F8" } })
    .composite([
      { input: photo, left: 0, top: 0 },
      { input: caption, left: 0, top: photoHeight },
      { input: logo, left: 52, top: photoHeight + 32 },
    ])
    .jpeg({ quality: 88, mozjpeg: true })
    .toBuffer();
}

async function generateIcons() {
  const markAlpha = await loadMarkAlpha();
  const { icons } = JSON.parse(await readFile(projectPath("public/manifest.json"), "utf8"));
  const manifestIcons = await Promise.all(icons.map(async ({ src, sizes }) => {
    const size = Number.parseInt(sizes, 10);
    return ["public" + src, await renderIcon(markAlpha, size, true)];
  }));
  const [appleTouch, svgTile, faviconPngs, socialPreview] = await Promise.all([
    renderIcon(markAlpha, 180, true),
    renderIcon(markAlpha, 512),
    Promise.all(faviconSizes.map((size) => renderIcon(markAlpha, size))),
    renderSocialPreview(markAlpha),
  ]);

  await Promise.all([
    ...manifestIcons,
    ["public/icons/apple-touch-icon.png", appleTouch],
    ["public/favicon.png", faviconPngs[faviconSizes.indexOf(32)]],
    ["src/app/favicon.ico", encodeFavicon(faviconPngs)],
    ["public/icons/icon.svg",
      '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><title>LotMerit</title>' +
      '<image width="512" height="512" href="data:image/png;base64,' + svgTile.toString("base64") + '"/></svg>\n'],
    ["src/app/opengraph-image.jpg", socialPreview],
  ].map(async ([file, image]) => {
    await writeFile(projectPath(file), image);
    console.log(file);
  }));
}

generateIcons().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
