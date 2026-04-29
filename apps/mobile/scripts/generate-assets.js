#!/usr/bin/env node
/**
 * Converts SVG source assets → PNG files required by Expo.
 *
 * Requirements: `npm i -g sharp-cli` or `pnpm add -D sharp`
 *
 * Usage:
 *   node scripts/generate-assets.js
 */
const path = require('path');
const fs = require('fs');

let sharp;
try {
  sharp = require('sharp');
} catch {
  console.error('sharp not found. Run: pnpm add -D sharp  (inside apps/mobile)');
  process.exit(1);
}

const ASSETS = path.resolve(__dirname, '../assets');

const JOBS = [
  // Expo app icon (1024×1024)
  { src: 'icon.svg',          dest: 'icon.png',          width: 1024, height: 1024 },
  // Android adaptive icon foreground (1024×1024, transparent BG)
  { src: 'adaptive-icon.svg', dest: 'adaptive-icon.png', width: 1024, height: 1024 },
  // Splash screen — iPhone 14 Pro Max native res
  { src: 'splash.svg',        dest: 'splash.png',        width: 1284, height: 2778 },
  // Favicon for Expo Web
  { src: 'icon.svg',          dest: 'favicon.png',       width: 48,   height: 48   },
  // Android notification icon (96×96, white on transparent)
  { src: 'notification-icon.svg', dest: 'notification-icon.png', width: 96, height: 96 },
];

(async () => {
  for (const { src, dest, width, height } of JOBS) {
    const srcPath  = path.join(ASSETS, src);
    const destPath = path.join(ASSETS, dest);

    if (!fs.existsSync(srcPath)) {
      console.warn(`⚠  Missing ${src} — skipping`);
      continue;
    }

    await sharp(srcPath)
      .resize(width, height)
      .png()
      .toFile(destPath);

    console.log(`✓  ${dest}  (${width}×${height})`);
  }
  console.log('\nAll assets generated.');
})();
