const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

// Generate random 8-character hash for sprite cache busting
const spriteVersion = crypto.randomBytes(4).toString('hex');

// Generate CV version based on CV source content
function generateCVVersion() {
  const cvSourceDir = path.join(__dirname, '..', 'cv-source');
  const mainTexPath = path.join(cvSourceDir, 'main.tex');
  const developercvPath = path.join(cvSourceDir, 'developercv.cls');
  
  if (!fs.existsSync(mainTexPath)) {
    console.warn('⚠️ CV source not found, using random version');
    return crypto.randomBytes(4).toString('hex');
  }
  
  // Create hash based on CV source files content
  const hash = crypto.createHash('sha256');
  
  // Hash main.tex content
  const mainTexContent = fs.readFileSync(mainTexPath, 'utf8');
  hash.update(mainTexContent);
  
  // Hash developercv.cls if it exists
  if (fs.existsSync(developercvPath)) {
    const clsContent = fs.readFileSync(developercvPath, 'utf8');
    hash.update(clsContent);
  }
  
  // Return first 8 characters of hash
  return hash.digest('hex').substring(0, 8);
}

const cvVersion = generateCVVersion();

// Ensure lib directory exists
const libDir = path.join(__dirname, '..', 'lib');
if (!fs.existsSync(libDir)) {
  fs.mkdirSync(libDir, { recursive: true });
}

// Write version file (preserve existing AVATAR_VERSION if it exists)
const versionFile = path.join(libDir, 'version.js');
let avatarVersion = '';

// Check if version file exists and extract AVATAR_VERSION
if (fs.existsSync(versionFile)) {
  const existingContent = fs.readFileSync(versionFile, 'utf8');
  const avatarMatch = existingContent.match(/export const AVATAR_VERSION = '([^']+)';/);
  if (avatarMatch) {
    avatarVersion = `export const AVATAR_VERSION = '${avatarMatch[1]}';\n`;
  }
}

fs.writeFileSync(versionFile, `export const SPRITE_VERSION = '${spriteVersion}';
export const CV_VERSION = '${cvVersion}';
${avatarVersion}`);

console.log(`Generated sprite version: ${spriteVersion}`);
console.log(`Generated CV version: ${cvVersion} (based on CV source content)`);