#!/bin/bash
set -e

echo "📄 Building CV from LaTeX source..."

# Check if pdflatex is available (local environment)
if command -v pdflatex &> /dev/null; then
    echo "🟢 Using system pdflatex for compilation..."
    
    # Create output directory
    mkdir -p public/files
    
    # Build the PDF from LaTeX source
    cd cv-source
    
    echo "🔨 Running pdflatex (first pass)..."
    pdflatex -interaction=nonstopmode main.tex > /dev/null
    
    echo "🔨 Running pdflatex (second pass)..."
    pdflatex -interaction=nonstopmode main.tex > /dev/null
    
    # Read CV version for cache busting
    if [ -f "../lib/version.js" ]; then
        CV_VERSION=$(node -e "const {CV_VERSION} = require('../lib/version.js'); console.log(CV_VERSION);")
        echo "📋 Using CV version: $CV_VERSION"
        VERSIONED_FILENAME="cv-${CV_VERSION}.pdf"
    else
        echo "⚠️ No version file found, using default filename"
        VERSIONED_FILENAME="cv.pdf"
    fi
    
    # Move the generated PDF to the public files directory with versioned name
    echo "📁 Moving CV to public directory as $VERSIONED_FILENAME..."
    mv main.pdf "../public/files/$VERSIONED_FILENAME"
    
    # Also create a symlink for backwards compatibility
    cd ../public/files
    ln -sf "$VERSIONED_FILENAME" cv.pdf
    cd ../../cv-source
    
    # Clean up auxiliary files
    echo "🧹 Cleaning up auxiliary files..."
    rm -f *.aux *.log *.out *.fdb_latexmk *.fls *.synctex.gz
    
    cd ..
    
    echo "✅ CV build complete! Generated public/files/cv.pdf"
    exit 0
fi

echo "❌ No LaTeX compiler found."
echo "💡 To build locally, install LaTeX: brew install --cask mactex"
echo "🔧 For deployment, build locally and commit the PDF"

# Check if a pre-built CV exists (committed to repo)
if [ -f "public/files/cv.pdf" ]; then
    echo "✅ Using committed pre-built CV"
    echo "📄 To update: run 'npm run build-cv' locally and commit the PDF"
    exit 0
else
    echo "❌ No pre-built CV found and no LaTeX compiler available"
    echo "🚨 Build the CV locally first: npm run build-cv"
    exit 1
fi