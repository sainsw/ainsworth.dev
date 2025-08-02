#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const https = require('https');

console.log('🖼️  Fetching GitHub avatar...');

const GITHUB_USERNAME = 'sainsw';
const AVATAR_SIZE = 400; // High quality for better WebP conversion
const OUTPUT_DIR = path.join(__dirname, '..', 'public', 'images', 'home');
const JPG_PATH = path.join(OUTPUT_DIR, 'avatar.jpg');
const WEBP_PATH = path.join(OUTPUT_DIR, 'avatar.webp');
const TEMP_PATH = path.join(OUTPUT_DIR, 'avatar-temp.png');

async function downloadImage(url, filepath) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(filepath);
    https.get(url, (response) => {
      if (response.statusCode !== 200) {
        reject(new Error(`HTTP ${response.statusCode}`));
        return;
      }
      
      response.pipe(file);
      file.on('finish', () => {
        file.close();
        resolve();
      });
    }).on('error', (err) => {
      fs.unlink(filepath, () => {});
      reject(err);
    });
  });
}

async function convertWithSharp(inputPath) {
  try {
    const sharp = require('sharp');
    
    // Create optimized WebP (priority format)
    await sharp(inputPath)
      .resize(200, 200, { 
        fit: 'cover',
        position: 'center'
      })
      .webp({ 
        quality: 85,
        effort: 6 // Maximum compression effort
      })
      .toFile(WEBP_PATH);
    
    // Create JPG fallback
    await sharp(inputPath)
      .resize(200, 200, { 
        fit: 'cover',
        position: 'center'
      })
      .jpeg({ 
        quality: 90,
        progressive: true
      })
      .toFile(JPG_PATH);
    
    console.log('✅ WebP and JPG optimization complete');
    return true;
    
  } catch (error) {
    console.log(`ℹ️  Sharp not available (${error.message}), using original format`);
    
    // Fallback: just copy the downloaded file as JPG
    fs.copyFileSync(inputPath, JPG_PATH);
    console.log('✅ JPG fallback saved (WebP will use existing file)');
    return false;
  }
}

async function fetchGitHubAvatar() {
  try {
    console.log(`📡 Fetching GitHub user data for: ${GITHUB_USERNAME}`);
    
    // Fetch user data from GitHub API
    const userData = await new Promise((resolve, reject) => {
      const options = {
        hostname: 'api.github.com',
        path: `/users/${GITHUB_USERNAME}`,
        headers: {
          'User-Agent': 'ainsworth.dev-avatar-fetcher'
        }
      };
      
      https.get(options, (res) => {
        if (res.statusCode !== 200) {
          reject(new Error(`GitHub API returned ${res.statusCode}`));
          return;
        }
        
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => {
          try {
            resolve(JSON.parse(data));
          } catch (e) {
            reject(new Error('Invalid JSON response'));
          }
        });
      }).on('error', reject);
    });
    
    if (!userData.avatar_url) {
      throw new Error('No avatar_url in response');
    }
    
    const avatarUrl = `${userData.avatar_url}&s=${AVATAR_SIZE}`;
    console.log(`📥 Downloading from: ${avatarUrl}`);
    
    // Download to temp file
    await downloadImage(avatarUrl, TEMP_PATH);
    
    // Convert and optimize (prioritizing WebP)
    const optimized = await convertWithSharp(TEMP_PATH);
    
    // Clean up temp file
    fs.unlinkSync(TEMP_PATH);
    
    console.log('🎉 Avatar updated successfully!');
    if (optimized) {
      console.log(`📁 WebP: ${path.relative(process.cwd(), WEBP_PATH)} (optimized)`);
      console.log(`📁 JPG: ${path.relative(process.cwd(), JPG_PATH)} (fallback)`);
    } else {
      console.log(`📁 JPG: ${path.relative(process.cwd(), JPG_PATH)} (updated)`);
      console.log(`📁 WebP: ${path.relative(process.cwd(), WEBP_PATH)} (existing fallback)`);
    }
    
    // Debug: Check actual file sizes
    const webpStats = fs.statSync(WEBP_PATH);
    const jpgStats = fs.statSync(JPG_PATH);
    console.log(`🔍 WebP size: ${webpStats.size} bytes, modified: ${webpStats.mtime}`);
    console.log(`🔍 JPG size: ${jpgStats.size} bytes, modified: ${jpgStats.mtime}`);
    
  } catch (error) {
    console.log('ℹ️  Avatar fetch failed, using existing files');
    console.log(`   Reason: ${error.message}`);
    
    // Clean up any temp files
    if (fs.existsSync(TEMP_PATH)) {
      fs.unlinkSync(TEMP_PATH);
    }
    
    // Verify fallbacks exist
    const hasWebP = fs.existsSync(WEBP_PATH);
    const hasJPG = fs.existsSync(JPG_PATH);
    
    if (hasWebP && hasJPG) {
      console.log(`📁 Using existing WebP: ${path.relative(process.cwd(), WEBP_PATH)}`);
      console.log(`📁 Using existing JPG: ${path.relative(process.cwd(), JPG_PATH)}`);
    } else {
      console.error('💥 Missing fallback files! Please ensure both avatar.webp and avatar.jpg exist.');
      process.exit(1);
    }
  }
}

fetchGitHubAvatar();