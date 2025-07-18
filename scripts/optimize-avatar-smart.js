#!/usr/bin/env node

const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

async function optimizeAvatar() {
  const originalPath = "/Users/sam/Downloads/IMG_2062.jpeg";
  const outputDir = path.join(__dirname, '..', 'public', 'images', 'home');
  
  // Ensure output directory exists
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  try {
    // Get image metadata
    const metadata = await sharp(originalPath).metadata();
    console.log(`Original image: ${metadata.width}x${metadata.height}, ${Math.round(metadata.size / 1024)}KB`);

    // Create optimized WebP version (primary) with smart cropping
    await sharp(originalPath)
      .rotate(90) // 90 degrees clockwise
      .resize(160, 160, {
        fit: 'cover',
        position: 'attention'  // Smart crop using AI attention detection
      })
      .webp({ 
        quality: 85,
        effort: 6 
      })
      .toFile(path.join(outputDir, 'avatar.webp'));

    // Create fallback JPEG version with same smart cropping
    await sharp(originalPath)
      .rotate(90) // 90 degrees clockwise
      .resize(160, 160, {
        fit: 'cover',
        position: 'attention'  // Smart crop using AI attention detection
      })
      .jpeg({ 
        quality: 90,
        progressive: true,
        mozjpeg: true 
      })
      .toFile(path.join(outputDir, 'avatar.jpg'));

    // Get file sizes
    const webpStats = fs.statSync(path.join(outputDir, 'avatar.webp'));
    const jpegStats = fs.statSync(path.join(outputDir, 'avatar.jpg'));
    
    console.log(`✅ WebP: ${Math.round(webpStats.size / 1024)}KB (smart crop, rotated 90°)`);
    console.log(`✅ JPEG fallback: ${Math.round(jpegStats.size / 1024)}KB (smart crop, rotated 90°)`);
    console.log(`📊 Size reduction: ${Math.round((1 - webpStats.size / metadata.size) * 100)}%`);
    
  } catch (error) {
    console.error('❌ Error optimizing image:', error);
    process.exit(1);
  }
}

optimizeAvatar();