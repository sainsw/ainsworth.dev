const fs = require('fs');
const path = require('path');

// Extract CSS version from Next.js build output
function extractCSSVersion() {
  const cssDir = path.join(__dirname, '..', '.next', 'static', 'css');
  let cssHash = '';
  
  try {
    if (fs.existsSync(cssDir)) {
      const files = fs.readdirSync(cssDir);
      const cssFile = files.find(f => f.endsWith('.css') && !f.includes('app/'));
      if (cssFile) {
        // Extract hash from filename like "8dad980adf443c8a.css"
        const hashMatch = cssFile.match(/^([a-f0-9]+)\.css$/);
        if (hashMatch) {
          cssHash = hashMatch[1];
          console.log(`Found CSS file: ${cssFile}, extracted hash: ${cssHash}`);
        }
      }
    }
  } catch (error) {
    console.warn(`Warning: Could not find CSS hash: ${error.message}`);
  }
  
  return cssHash || 'fallback';
}

// Update version file with CSS hash
function updateVersionFile() {
  const cssVersion = extractCSSVersion();
  const versionFile = path.join(__dirname, '..', 'lib', 'version.js');
  
  if (fs.existsSync(versionFile)) {
    let content = fs.readFileSync(versionFile, 'utf8');
    
    // Add or update CSS_VERSION
    if (content.includes('CSS_VERSION')) {
      content = content.replace(/export const CSS_VERSION = '[^']*';/, `export const CSS_VERSION = '${cssVersion}';`);
    } else {
      content += `export const CSS_VERSION = '${cssVersion}';\n`;
    }
    
    fs.writeFileSync(versionFile, content);
    console.log(`Updated CSS version: ${cssVersion}`);
  } else {
    console.warn('Version file not found');
  }
}

updateVersionFile();