#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const https = require('https');
const crypto = require('crypto');

console.log('🖼️  Fetching GitHub avatar...');

const GITHUB_USERNAME = 'sainsw';
const AVATAR_SIZE = 400; // High quality for better WebP conversion
const OUTPUT_DIR = path.join(__dirname, '..', 'public', 'images', 'home');
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

async function generateContentHash(filePath) {
  const content = fs.readFileSync(filePath);
  return crypto.createHash('sha256').update(content).digest('hex').substring(0, 8);
}

async function updateVersionFile(avatarHash) {
  const libDir = path.join(__dirname, '..', 'lib');
  const versionFilePath = path.join(libDir, 'version.js');
  
  try {
    // Ensure lib directory exists
    if (!fs.existsSync(libDir)) {
      fs.mkdirSync(libDir, { recursive: true });
    }
    
    let versionContent = '';
    if (fs.existsSync(versionFilePath)) {
      versionContent = fs.readFileSync(versionFilePath, 'utf8');
    }
    
    // Update or add AVATAR_VERSION
    if (versionContent.includes('AVATAR_VERSION')) {
      versionContent = versionContent.replace(
        /export const AVATAR_VERSION = '[^']*';/,
        `export const AVATAR_VERSION = '${avatarHash}';`
      );
    } else {
      // Add AVATAR_VERSION to existing file
      const lines = versionContent.split('\n');
      const lastExportIndex = lines.findLastIndex(line => line.startsWith('export const'));
      if (lastExportIndex !== -1) {
        lines.splice(lastExportIndex + 1, 0, `export const AVATAR_VERSION = '${avatarHash}';`);
      } else {
        lines.push(`export const AVATAR_VERSION = '${avatarHash}';`);
      }
      versionContent = lines.join('\n');
    }
    
    fs.writeFileSync(versionFilePath, versionContent);
    console.log(`✅ Avatar version updated: ${avatarHash}`);
    
  } catch (error) {
    console.log(`⚠️  Failed to update version file: ${error.message}`);
  }
}

async function getExistingAvatarHash() {
  // Check for existing avatar files (both versioned and unversioned) and return their hash
  const files = fs.readdirSync(OUTPUT_DIR);
  const avatarFiles = files.filter(file => 
    file.startsWith('avatar') && (file.endsWith('.jpg') || file.endsWith('.webp'))
  );
  
  if (avatarFiles.length > 0) {
    // Sort to get most recent and prefer JPG for consistency
    const sortedFiles = avatarFiles.sort();
    const preferredFile = sortedFiles.find(f => f.endsWith('.jpg')) || sortedFiles[0];
    const filePath = path.join(OUTPUT_DIR, preferredFile);
    console.log(`🔍 Found existing avatar: ${preferredFile}`);
    return await generateContentHash(filePath);
  }
  
  return 'fallback';
}

async function createVersionedFromExisting(hash) {
  // Find the source file to copy from
  const files = fs.readdirSync(OUTPUT_DIR);
  const avatarFiles = files.filter(file => 
    file.startsWith('avatar') && (file.endsWith('.jpg') || file.endsWith('.webp'))
  );
  
  const sourceJpg = avatarFiles.find(f => f.endsWith('.jpg'));
  const sourceWebp = avatarFiles.find(f => f.endsWith('.webp'));
  
  const versionedJpg = path.join(OUTPUT_DIR, `avatar-${hash}.jpg`);
  const versionedWebp = path.join(OUTPUT_DIR, `avatar-${hash}.webp`);
  
  if (sourceJpg && !fs.existsSync(versionedJpg)) {
    fs.copyFileSync(path.join(OUTPUT_DIR, sourceJpg), versionedJpg);
    console.log(`📋 Created versioned JPG: avatar-${hash}.jpg`);
  }
  
  if (sourceWebp && !fs.existsSync(versionedWebp)) {
    fs.copyFileSync(path.join(OUTPUT_DIR, sourceWebp), versionedWebp);
    console.log(`📋 Created versioned WebP: avatar-${hash}.webp`);
  }
}

async function convertWithSharp(inputPath) {
  try {
    const sharp = require('sharp');
    
    // Generate initial hash from input to create temp filenames
    const tempHash = await generateContentHash(inputPath);
    const TEMP_WEBP_PATH = path.join(OUTPUT_DIR, `avatar-temp-${tempHash}.webp`);
    const TEMP_JPG_PATH = path.join(OUTPUT_DIR, `avatar-temp-${tempHash}.jpg`);
    
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
      .toFile(TEMP_WEBP_PATH);
    
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
      .toFile(TEMP_JPG_PATH);
    
    // Generate final hash from optimized JPG (most stable format)
    const finalHash = await generateContentHash(TEMP_JPG_PATH);
    const FINAL_WEBP_PATH = path.join(OUTPUT_DIR, `avatar-${finalHash}.webp`);
    const FINAL_JPG_PATH = path.join(OUTPUT_DIR, `avatar-${finalHash}.jpg`);
    
    // Rename to final filenames
    fs.renameSync(TEMP_WEBP_PATH, FINAL_WEBP_PATH);
    fs.renameSync(TEMP_JPG_PATH, FINAL_JPG_PATH);
    
    console.log('✅ WebP and JPG optimization complete');
    return { success: true, hash: finalHash, webpPath: FINAL_WEBP_PATH, jpgPath: FINAL_JPG_PATH };
    
  } catch (error) {
    console.log(`ℹ️  Sharp not available (${error.message}), using original format`);
    
    // Generate hash and create fallback paths
    const contentHash = await generateContentHash(inputPath);
    const JPG_PATH = path.join(OUTPUT_DIR, `avatar-${contentHash}.jpg`);
    
    // Fallback: just copy the downloaded file as JPG
    fs.copyFileSync(inputPath, JPG_PATH);
    console.log('✅ JPG fallback saved (WebP will use existing file)');
    return { success: false, hash: contentHash, jpgPath: JPG_PATH };
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
    const result = await convertWithSharp(TEMP_PATH);
    
    // Clean up temp file
    fs.unlinkSync(TEMP_PATH);
    
    console.log('🎉 Avatar updated successfully!');
    if (result.success) {
      console.log(`📁 WebP: ${path.relative(process.cwd(), result.webpPath)} (optimized)`);
      console.log(`📁 JPG: ${path.relative(process.cwd(), result.jpgPath)} (fallback)`);
      
      // Debug: Check actual file sizes
      const webpStats = fs.statSync(result.webpPath);
      const jpgStats = fs.statSync(result.jpgPath);
      console.log(`🔍 WebP size: ${webpStats.size} bytes, modified: ${webpStats.mtime}`);
      console.log(`🔍 JPG size: ${jpgStats.size} bytes, modified: ${jpgStats.mtime}`);
    } else {
      console.log(`📁 JPG: ${path.relative(process.cwd(), result.jpgPath)} (updated)`);
      
      // Debug: Check actual file sizes
      const jpgStats = fs.statSync(result.jpgPath);
      console.log(`🔍 JPG size: ${jpgStats.size} bytes, modified: ${jpgStats.mtime}`);
    }
    
    console.log(`🔑 Avatar hash: ${result.hash}`);
    
    // Update version file
    await updateVersionFile(result.hash);
    
  } catch (error) {
    console.log('ℹ️  Avatar fetch failed, using existing files');
    console.log(`   Reason: ${error.message}`);
    
    // Clean up any temp files
    if (fs.existsSync(TEMP_PATH)) {
      fs.unlinkSync(TEMP_PATH);
    }
    
    // Check for any existing avatar files and ensure versioned files exist
    const existingHash = await getExistingAvatarHash();
    
    if (existingHash !== 'fallback') {
      console.log(`📁 Using existing avatar files in: ${path.relative(process.cwd(), OUTPUT_DIR)}`);
      console.log(`🔑 Existing avatar hash: ${existingHash}`);
      
      // Ensure versioned files exist for this hash
      const versionedWebp = path.join(OUTPUT_DIR, `avatar-${existingHash}.webp`);
      const versionedJpg = path.join(OUTPUT_DIR, `avatar-${existingHash}.jpg`);
      
      if (!fs.existsSync(versionedWebp) || !fs.existsSync(versionedJpg)) {
        console.log('🔄 Creating versioned files from existing avatars...');
        await createVersionedFromExisting(existingHash);
      }
      
      await updateVersionFile(existingHash);
    } else {
      console.error('💥 No avatar files found! Please ensure avatar files exist in public/images/home/');
      process.exit(1);
    }
  }
}

fetchGitHubAvatar();