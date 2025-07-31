#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const latex = require('node-latex');

console.log('📄 Building CV from LaTeX source using node-latex...');

// Ensure output directory exists
const outputDir = path.join(__dirname, '..', 'public', 'files');
if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
}

// Read the LaTeX source file
const texFilePath = path.join(__dirname, '..', 'cv-source', 'main.tex');
const texContent = fs.readFileSync(texFilePath, 'utf8');

// Configure LaTeX options
const options = {
    inputs: path.join(__dirname, '..', 'cv-source'), // Include path for custom class files
    cmd: 'pdflatex', // Use pdflatex engine
    passes: 2, // Run twice for proper cross-references
    errorLogs: path.join(__dirname, '..', 'latex-error.log')
};

console.log('🔨 Compiling LaTeX to PDF...');

// Compile LaTeX to PDF
const pdf = latex(texContent, options);
const outputPath = path.join(outputDir, 'cv.pdf');
const output = fs.createWriteStream(outputPath);

pdf.pipe(output);

pdf.on('error', (err) => {
    console.error('❌ LaTeX compilation failed:', err);
    process.exit(1);
});

pdf.on('finish', () => {
    console.log('✅ CV build complete! Generated public/files/cv.pdf');
});

output.on('error', (err) => {
    console.error('❌ Failed to write PDF file:', err);
    process.exit(1);
});

output.on('close', () => {
    console.log('📁 PDF file saved successfully');
});