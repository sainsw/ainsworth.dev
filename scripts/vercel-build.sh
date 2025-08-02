#!/bin/bash
set -e

echo "🚀 Starting Vercel build..."

# Skip LaTeX compilation in Vercel - use committed PDF instead
echo "📄 LaTeX compilation will be skipped in Vercel"
echo "💡 CV should be built locally and committed when source changes"

# Fetch latest avatar from GitHub
echo "🖼️  Fetching GitHub avatar..."
npm run fetch-avatar

# Generate version file (must run after avatar fetch)
echo "🔢 Generating version information..."
npm run generate-version

# Build CV if possible
echo "📄 Building CV..."
npm run build-cv

# Run Next.js build
echo "🔨 Running Next.js build..."
next build