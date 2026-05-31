#!/bin/bash
set -e

echo "🚀 Starting Vercel build..."

# Skip LaTeX compilation in Vercel - use committed PDF instead
echo "📄 LaTeX compilation will be skipped in Vercel"
echo "💡 CV should be built locally and committed when source changes"

# Use the committed avatar fallback. Refresh it explicitly with `npm run
# fetch-avatar` and commit the new files so deploys do not depend on GitHub.
echo "🖼️  Using committed avatar fallback..."

# Generate version file from committed assets
echo "🔢 Generating version information..."
npm run generate-version

# Keep deployment independent of a LaTeX toolchain.
echo "📄 Skipping CV compilation; using committed fallback..."
SKIP_CV=1 npm run build-cv

# Gate the deploy on unit tests: a failing test fails the build, so nothing
# ships. (next build already gates TypeScript type errors.) Lint/format and a
# duplicate test run also happen in CI (.github/workflows/ci.yml); Playwright
# E2E runs in a separate CI job against the Preview URL (e2e:vercel).
echo "🧪 Running unit tests (vitest) — deploy is blocked if these fail..."
NODE_ENV=test npm run test:run

# Run Next.js build
echo "🔨 Running Next.js build..."
npx --no-install next build
