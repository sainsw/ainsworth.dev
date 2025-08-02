#!/bin/bash
set -e

echo "🚀 Starting Vercel build..."

# Skip LaTeX compilation in Vercel - use committed PDF instead
echo "📄 LaTeX compilation will be skipped in Vercel"
echo "💡 CV should be built locally and committed when source changes"

# Fetch latest avatar from GitHub
echo "🖼️  Fetching GitHub avatar..."
npm run fetch-avatar

# Run standard build process (will use committed CV if available)
echo "🔨 Running application build..."
npm run build-only