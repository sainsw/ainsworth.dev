#!/usr/bin/env node

const sharp = require("sharp");
const fs = require("fs");
const path = require("path");

async function optimizeAvatar() {
  const inputPath = path.join(
    __dirname,
    "..",
    "temp_processing",
    "original.jpeg",
  );
  const outputDir = path.join(__dirname, "..", "public", "images", "home");

  // Ensure output directory exists
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  try {
    // Get image metadata
    const metadata = await sharp(inputPath).metadata();
    console.log(
      `Original image: ${metadata.width}x${metadata.height}, ${Math.round(metadata.size / 1024)}KB`,
    );

    // Create optimised WebP version (primary)
    await sharp(inputPath)
      .resize(160, 160, {
        fit: "cover",
        position: "center",
      })
      .webp({
        quality: 85,
        effort: 6,
      })
      .toFile(path.join(outputDir, "avatar.webp"));

    // Create fallback JPEG version
    await sharp(inputPath)
      .resize(160, 160, {
        fit: "cover",
        position: "center",
      })
      .jpeg({
        quality: 90,
        progressive: true,
        mozjpeg: true,
      })
      .toFile(path.join(outputDir, "avatar.jpg"));

    // Get file sizes
    const webpStats = fs.statSync(path.join(outputDir, "avatar.webp"));
    const jpegStats = fs.statSync(path.join(outputDir, "avatar.jpg"));

    console.log(`✅ WebP: ${Math.round(webpStats.size / 1024)}KB`);
    console.log(`✅ JPEG fallback: ${Math.round(jpegStats.size / 1024)}KB`);
    console.log(
      `📊 Size reduction: ${Math.round((1 - webpStats.size / metadata.size) * 100)}%`,
    );
  } catch (error) {
    console.error("❌ Error optimising image:", error);
    process.exit(1);
  }
}

optimizeAvatar();
