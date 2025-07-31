# CV Source Files

This directory contains the LaTeX source files for generating the CV PDF.

## Files

- `main.tex` - Main LaTeX document
- `developercv.cls` - Custom LaTeX class for developer CV styling

## Building Locally

To build the CV locally, you need LaTeX installed:

```bash
# Install LaTeX on macOS
brew install --cask mactex

# Build the CV
npm run build-cv
```

## Automatic Building

The CV is automatically built during:
- **Local builds**: `npm run build` (if LaTeX is available)
- **Vercel deployment**: Installs LaTeX and builds fresh PDF on every deploy

The generated PDF is placed at `public/files/cv.pdf` and served at `/files/cv.pdf`.

### Vercel-Only Pipeline

**Simplified approach:**
- **LaTeX installed** in Vercel build environment via `vercel-build.sh`
- **Always fresh builds** from source on every deployment  
- **No artifacts or fallbacks** - single source of truth
- **Fast builds** - ~1 minute vs 5+ minutes with GitHub Actions
- **Single pipeline** to maintain and debug

## Editing

1. Edit `main.tex` with your CV content
2. Commit and push changes
3. The PDF will be automatically regenerated and deployed

## Template

This CV uses the Developer CV template from LaTeXTemplates.com under the MIT License.