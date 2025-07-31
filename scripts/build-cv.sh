#!/bin/bash
set -e

echo "📄 Building CV from LaTeX source..."

# Check if pdflatex is available
if ! command -v pdflatex &> /dev/null; then
    echo "❌ pdflatex not found. LaTeX is required for CV generation."
    echo "💡 To build locally, install LaTeX: brew install --cask mactex"
    echo "🔧 For Vercel, LaTeX should be installed via vercel-build.sh"
    exit 1
fi

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