#!/bin/bash
set -e

echo "🚀 Starting Vercel build with LaTeX CV generation..."

# Install LaTeX packages (Vercel uses Ubuntu)
echo "📦 Installing LaTeX packages..."
apt-get update -qq
apt-get install -y -qq texlive-latex-base texlive-fonts-recommended texlive-latex-extra texlive-fonts-extra

echo "✅ LaTeX installation complete"

# Run standard build process (which includes CV build)
echo "🔨 Running application build..."
npm run build-only