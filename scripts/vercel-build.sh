#!/bin/bash
set -e

echo "🚀 Starting Vercel build with LaTeX CV generation..."

# Install node-latex package for LaTeX compilation
echo "📦 Installing node-latex..."
npm install --no-save node-latex

echo "✅ node-latex installation complete"

# Run standard build process (which includes CV build)
echo "🔨 Running application build..."
npm run build-only