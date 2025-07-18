#!/usr/bin/env node

const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

async function createRotatedCropPreview() {
  const originalPath = "/Users/sam/Downloads/IMG_2062.jpeg";
  const outputDir = path.join(__dirname, '..', 'temp_preview_rotated');
  
  // Create output directory
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  try {
    // Get image metadata
    const metadata = await sharp(originalPath).metadata();
    console.log(`Original image: ${metadata.width}x${metadata.height}`);

    // Create a larger preview to see the cropping clearly (400x400) with rotation
    await sharp(originalPath)
      .rotate(90) // 90 degrees clockwise
      .resize(400, 400, {
        fit: 'cover',
        position: 'center'
      })
      .jpeg({ quality: 90 })
      .toFile(path.join(outputDir, 'rotated-crop-preview-center.jpg'));

    // Also create one with different positioning options for comparison
    await sharp(originalPath)
      .rotate(90) // 90 degrees clockwise
      .resize(400, 400, {
        fit: 'cover',
        position: 'top'
      })
      .jpeg({ quality: 90 })
      .toFile(path.join(outputDir, 'rotated-crop-preview-top.jpg'));

    await sharp(originalPath)
      .rotate(90) // 90 degrees clockwise
      .resize(400, 400, {
        fit: 'cover',
        position: 'attention'  // Uses smart cropping to focus on important areas
      })
      .jpeg({ quality: 90 })
      .toFile(path.join(outputDir, 'rotated-crop-preview-smart.jpg'));

    // Create the actual size version (160x160) for the exact result
    await sharp(originalPath)
      .rotate(90) // 90 degrees clockwise
      .resize(160, 160, {
        fit: 'cover',
        position: 'center'
      })
      .jpeg({ quality: 90 })
      .toFile(path.join(outputDir, 'rotated-actual-size-center.jpg'));

    console.log('✅ Rotated preview files created:');
    console.log('📁 temp_preview_rotated/rotated-crop-preview-center.jpg - Center crop (400x400, rotated)');
    console.log('📁 temp_preview_rotated/rotated-crop-preview-top.jpg - Top crop (400x400, rotated)');
    console.log('📁 temp_preview_rotated/rotated-crop-preview-smart.jpg - Smart crop (400x400, rotated)');
    console.log('📁 temp_preview_rotated/rotated-actual-size-center.jpg - Actual size (160x160, rotated)');
    
  } catch (error) {
    console.error('❌ Error creating preview:', error);
    process.exit(1);
  }
}

createRotatedCropPreview();