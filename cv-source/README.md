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
- **GitHub Actions**: Every push to main branch creates a new release
- **Vercel deployment**: Downloads latest CV from GitHub releases as fallback

The generated PDF is placed at `public/files/cv.pdf` and served at `/files/cv.pdf`.

### Fallback System

- **No static PDF** is stored in the repo
- **GitHub releases** store the latest built CV as `cv-latest` 
- **Build process** downloads previous CV as fallback if LaTeX fails
- **90-day artifacts** provide additional backup in GitHub Actions

## Editing

1. Edit `main.tex` with your CV content
2. Commit and push changes
3. The PDF will be automatically regenerated and deployed

## Template

This CV uses the Developer CV template from LaTeXTemplates.com under the MIT License.