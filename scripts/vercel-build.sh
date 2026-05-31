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

# Gate the deploy on unit tests: a failing test fails the build, so nothing
# ships. (next build already gates TypeScript type errors.) Lint/format and a
# duplicate test run also happen in CI (.github/workflows/ci.yml); Playwright
# E2E runs in a separate CI job against the Preview URL (e2e:vercel).
echo "🧪 Running unit tests (vitest) — deploy is blocked if these fail..."
NODE_ENV=test npm run test:run

# Run Next.js build
echo "🔨 Running Next.js build..."
next build
