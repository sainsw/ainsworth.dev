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

# Note: unit tests (Vitest), lint, and typecheck run in CI (.github/workflows/ci.yml),
# not in the Vercel build, to keep deploys fast and focused on building.
# Playwright E2E runs in a separate CI job against the Preview URL (e2e:vercel).

# Run Next.js build
echo "🔨 Running Next.js build..."
next build
