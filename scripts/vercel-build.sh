#!/bin/bash
set -e

echo "🚀 Starting Vercel build with LaTeX CV generation..."

# Install LaTeX.js, JSDOM (for DOM environment), and Puppeteer for HTML to PDF conversion
echo "📦 Installing LaTeX.js, JSDOM, and Puppeteer..."
npm install --no-save latex.js jsdom puppeteer

echo "✅ LaTeX tools installation complete"

# Run standard build process (which includes CV build)
echo "🔨 Running application build..."
npm run build-only