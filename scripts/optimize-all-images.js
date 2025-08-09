#!/usr/bin/env node

const sharp = require("sharp");
const fs = require("fs");
const path = require("path");

const logoDir = path.join(__dirname, "..", "public", "images", "logos");
const targetSize = 100; // Standard logo size for work page (displayed at 48px, so 100px for retina)

async function optimizeAllImages() {
  console.log("🚀 Starting comprehensive image optimization...\n");

  // Step 1: Delete unused old avatar
  console.log("🗑️  Step 1: Cleaning up unused files");
  const oldAvatar = path.join(__dirname, "..", "app", "avatar.jpg");
  if (fs.existsSync(oldAvatar)) {
    const oldSize = fs.statSync(oldAvatar).size;
    fs.unlinkSync(oldAvatar);
    console.log(`✅ Deleted old avatar: ${Math.round(oldSize / 1024)}KB saved`);
  }

  // Step 2: Optimize the massive ASFC PNG logos
  console.log("\n📐 Step 2: Optimizing oversized ASFC logos");
  const asfc_files = ["asfc_black.png", "asfc_grey.png", "asfc_white.png"];

  for (const filename of asfc_files) {
    const inputPath = path.join(logoDir, filename);
    if (fs.existsSync(inputPath)) {
      const originalSize = fs.statSync(inputPath).size;

      // Create optimised WebP version
      await sharp(inputPath)
        .resize(targetSize, targetSize, {
          fit: "contain",
          background: { r: 0, g: 0, b: 0, alpha: 0 }, // Transparent background
        })
        .webp({
          quality: 85,
          effort: 6,
          nearLossless: true, // Better for logos
        })
        .toFile(path.join(logoDir, filename.replace(".png", ".webp")));

      // Create optimised PNG fallback (much smaller)
      await sharp(inputPath)
        .resize(targetSize, targetSize, {
          fit: "contain",
          background: { r: 0, g: 0, b: 0, alpha: 0 },
        })
        .png({
          compressionLevel: 9,
          palette: true, // Use palette mode for smaller file size
        })
        .toFile(path.join(logoDir, filename.replace(".png", "_optimized.png")));

      // Replace original with optimised version
      fs.renameSync(
        path.join(logoDir, filename.replace(".png", "_optimised.png")),
        path.join(logoDir, filename),
      );

      const newSize = fs.statSync(inputPath).size;
      const webpSize = fs.statSync(
        path.join(logoDir, filename.replace(".png", ".webp")),
      ).size;

      console.log(
        `✅ ${filename}: ${Math.round(originalSize / 1024)}KB → ${Math.round(newSize / 1024)}KB PNG + ${Math.round(webpSize / 1024)}KB WebP`,
      );
      console.log(
        `   📊 Savings: ${Math.round((1 - newSize / originalSize) * 100)}%`,
      );
    }
  }

  // Step 3: Optimize other PNG logos
  console.log("\n🎨 Step 3: Optimizing other PNG logos");
  const otherPngs = ["wh.png", "whs.png"];

  for (const filename of otherPngs) {
    const inputPath = path.join(logoDir, filename);
    if (fs.existsSync(inputPath)) {
      const originalSize = fs.statSync(inputPath).size;

      // Create WebP version
      await sharp(inputPath)
        .resize(targetSize, targetSize, {
          fit: "contain",
          background: { r: 0, g: 0, b: 0, alpha: 0 },
        })
        .webp({
          quality: 85,
          effort: 6,
          nearLossless: true,
        })
        .toFile(path.join(logoDir, filename.replace(".png", ".webp")));

      // Optimize existing PNG
      await sharp(inputPath)
        .resize(targetSize, targetSize, {
          fit: "contain",
          background: { r: 0, g: 0, b: 0, alpha: 0 },
        })
        .png({
          compressionLevel: 9,
          palette: true,
        })
        .toFile(path.join(logoDir, filename.replace(".png", "_optimized.png")));

      fs.renameSync(
        path.join(logoDir, filename.replace(".png", "_optimized.png")),
        path.join(logoDir, filename),
      );

      const newSize = fs.statSync(inputPath).size;
      const webpSize = fs.statSync(
        path.join(logoDir, filename.replace(".png", ".webp")),
      ).size;

      console.log(
        `✅ ${filename}: ${Math.round(originalSize / 1024)}KB → ${Math.round(newSize / 1024)}KB PNG + ${Math.round(webpSize / 1024)}KB WebP`,
      );
    }
  }

  // Step 4: Generate a summary
  console.log("\n📊 Final Summary:");
  const totalSize = await getFolderSize(logoDir);
  console.log(`📁 Total logos directory: ${Math.round(totalSize / 1024)}KB`);

  console.log("\n✨ Optimization complete! Next steps:");
  console.log("   1. Update work page to use WebP + PNG fallbacks");
  console.log("   2. Test all logos display correctly");
  console.log("   3. Commit optimized images");
}

async function getFolderSize(folderPath) {
  let totalSize = 0;
  const files = fs.readdirSync(folderPath);

  for (const file of files) {
    const filePath = path.join(folderPath, file);
    const stats = fs.statSync(filePath);
    if (stats.isFile()) {
      totalSize += stats.size;
    }
  }

  return totalSize;
}

optimizeAllImages().catch(console.error);
