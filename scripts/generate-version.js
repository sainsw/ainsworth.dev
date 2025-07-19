const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

// Generate a random 8-character hash for cache busting
const version = crypto.randomBytes(4).toString('hex');

// Ensure lib directory exists
const libDir = path.join(__dirname, '..', 'lib');
if (!fs.existsSync(libDir)) {
  fs.mkdirSync(libDir, { recursive: true });
}

// Write version file
const versionFile = path.join(libDir, 'version.js');
fs.writeFileSync(versionFile, `export const SPRITE_VERSION = '${version}';\n`);

console.log(`Generated sprite version: ${version}`);