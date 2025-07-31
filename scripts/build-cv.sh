#!/bin/bash
set -e

echo "Building CV from LaTeX source..."

# Check if pdflatex is available
if ! command -v pdflatex &> /dev/null; then
    echo "Warning: pdflatex not found. Skipping CV build."
    echo "To build CV locally, install LaTeX: brew install --cask mactex"
    
    # Check if CV already exists (from previous build or fallback)
    if [ -f "public/files/cv.pdf" ]; then
        echo "Using existing CV file."
        exit 0
    fi
    
    # Try to download fallback from GitHub releases (for Vercel deployments)
    echo "No existing CV found. Attempting to download from GitHub releases..."
    mkdir -p public/files
    
    if [ -n "$GITHUB_REPOSITORY" ]; then
        REPO_URL="https://github.com/$GITHUB_REPOSITORY/releases/latest/download/cv.pdf"
    else
        # Fallback to hardcoded repo if env var not available
        REPO_URL="https://github.com/sainsw/ainsworth.dev/releases/latest/download/cv.pdf"
    fi
    
    if curl -L -f -o public/files/cv.pdf "$REPO_URL"; then
        echo "Successfully downloaded CV from GitHub releases."
        exit 0
    else
        echo "Error: Could not download CV fallback. LaTeX is required for initial build."
        echo "GitHub release URL attempted: $REPO_URL"
        exit 1
    fi
fi

# Create output directory
mkdir -p public/files

# Build the PDF from LaTeX source
cd cv-source

# Run pdflatex twice to ensure proper cross-references
echo "Running pdflatex (first pass)..."
pdflatex -interaction=nonstopmode main.tex

echo "Running pdflatex (second pass)..."
pdflatex -interaction=nonstopmode main.tex

# Move the generated PDF to the public files directory
echo "Moving CV to public directory..."
mv main.pdf ../public/files/cv.pdf

# Clean up auxiliary files
echo "Cleaning up auxiliary files..."
rm -f *.aux *.log *.out *.fdb_latexmk *.fls *.synctex.gz

cd ..

echo "CV build complete! Generated public/files/cv.pdf"