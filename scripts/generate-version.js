const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

// Generate random 8-character hashes for cache busting
const spriteVersion = crypto.randomBytes(4).toString('hex');
const cvVersion = crypto.randomBytes(4).toString('hex');

// Ensure lib directory exists
const libDir = path.join(__dirname, '..', 'lib');
if (!fs.existsSync(libDir)) {
  fs.mkdirSync(libDir, { recursive: true });
}

// Write version file
const versionFile = path.join(libDir, 'version.js');
fs.writeFileSync(versionFile, `export const SPRITE_VERSION = '${spriteVersion}';
export const CV_VERSION = '${cvVersion}';
`);

console.log(`Generated sprite version: ${spriteVersion}`);
console.log(`Generated CV version: ${cvVersion}`);