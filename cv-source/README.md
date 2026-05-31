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
- **Vercel deployment**: Uses the committed PDF fallback

The generated PDF is placed at `public/files/cv.pdf` and served at `/files/cv.pdf`.

### Deployment Pipeline

- LaTeX is not installed in the Vercel build environment.
- Update the committed PDF locally with `npm run update-cv`.
- `vercel-build.sh` skips LaTeX compilation and deploys the committed PDF.

## Editing

1. Edit `data/resume.json`.
2. Run `npm run update-cv`.
3. Commit the generated LaTeX and PDF files.

## Template

This CV uses the Developer CV template from LaTeXTemplates.com under the MIT License.
