#!/bin/bash
set -e

echo "📄 Building CV from LaTeX source..."

# Check if latex.js and puppeteer are available (Vercel environment)
if npm list latex.js &> /dev/null && npm list puppeteer &> /dev/null; then
    echo "🟢 Using LaTeX.js + Puppeteer for compilation..."
    node ./scripts/build-cv-node.js
    exit 0
fi

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
    
    # Move the generated PDF to the public files directory
    echo "📁 Moving CV to public directory..."
    mv main.pdf ../public/files/cv.pdf
    
    # Clean up auxiliary files
    echo "🧹 Cleaning up auxiliary files..."
    rm -f *.aux *.log *.out *.fdb_latexmk *.fls *.synctex.gz
    
    cd ..
    
    echo "✅ CV build complete! Generated public/files/cv.pdf"
    exit 0
fi

echo "❌ No LaTeX compiler found."
echo "💡 To build locally, install LaTeX: brew install --cask mactex"
echo "🔧 For Vercel, node-latex should be installed via vercel-build.sh"
exit 1