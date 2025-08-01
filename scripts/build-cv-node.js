#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { JSDOM } = require('jsdom');

console.log('📄 Building CV from LaTeX source using LaTeX.js...');

// Create a DOM environment for LaTeX.js (it expects browser globals)
const dom = new JSDOM('<!DOCTYPE html><html><body></body></html>');
global.document = dom.window.document;
global.window = dom.window;
global.HTMLElement = dom.window.HTMLElement;

// Check if latex.js is available
let LaTeX;
try {
    LaTeX = require('latex.js');
    console.log('🟢 LaTeX.js loaded successfully');
    console.log('📋 Available methods:', Object.keys(LaTeX));
} catch (err) {
    console.error('❌ LaTeX.js not available:', err.message);
    process.exit(1);
}

// Ensure output directory exists
const outputDir = path.join(__dirname, '..', 'public', 'files');
if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
}

// Read the LaTeX source file
const texFilePath = path.join(__dirname, '..', 'cv-source', 'main.tex');
let texContent = fs.readFileSync(texFilePath, 'utf8');

// Convert custom developercv class to standard article class for LaTeX.js
console.log('🔄 Converting custom document class to LaTeX.js compatible format...');
texContent = texContent.replace(
    /\\documentclass\[.*?\]\{developercv\}/,
    '\\documentclass[10pt]{article}'
);

// Add only packages that LaTeX.js definitely supports
const latexjsHeader = `
\\usepackage{graphicx}
\\usepackage{xcolor}
`;

// Insert after documentclass
texContent = texContent.replace(
    /\\documentclass\[10pt\]\{article\}/,
    `\\documentclass[10pt]{article}${latexjsHeader}`
);

// Remove or replace commands that LaTeX.js doesn't support
// LaTeX.js has very limited command support, so we need to be aggressive
texContent = texContent
    .replace(/\\cvsect\{([^}]+)\}/g, '\\section{$1}') // Convert custom sections
    .replace(/\\begin{minipage}[^{]*{[^}]+}/g, '\\begin{minipage}{0.5\\textwidth}') // Simplify minipage
    .replace(/\\vspace\{[^}]*\}/g, '') // Remove spacing
    .replace(/\\hspace\{[^}]*\}/g, '') // Remove spacing  
    .replace(/\\setlength\{[^}]*\}\{[^}]*\}/g, '') // Remove setlength commands
    .replace(/\\usepackage\[[^\]]*\]\{[^}]*\}/g, '') // Remove packages with options
    .replace(/\\usepackage\{geometry\}/g, '') // Remove geometry package
    .replace(/\\usepackage\{enumitem\}/g, '') // Remove enumitem package
    .replace(/\\renewcommand[^}]*\}[^}]*\}/g, '') // Remove renewcommand
    .replace(/\\RequirePackage[^}]*\}/g, '') // Remove RequirePackage
    .replace(/\\fontsize\{[^}]*\}\{[^}]*\}/g, '') // Remove fontsize
    .replace(/\\selectfont/g, '') // Remove selectfont
    .replace(/\\\\$/gm, '\\\\') // Clean up line endings

console.log('✅ LaTeX source converted for LaTeX.js compatibility');

// Save converted LaTeX for debugging
const debugPath = path.join(outputDir, 'converted.tex');
fs.writeFileSync(debugPath, texContent);
console.log('🐛 Converted LaTeX saved to:', debugPath);

console.log('🔨 Compiling LaTeX with LaTeX.js...');

async function buildCV() {
try {
    // Use the correct LaTeX.js API with HtmlGenerator
    console.log('🔄 Using HtmlGenerator API...');
    
    const generator = new LaTeX.HtmlGenerator({ 
        hyphenate: false,
        CustomMacros: function() {
            // Add basic support for custom commands that might be in developercv.cls
            // LaTeX.js may not fully support custom document classes, so we'll do basic parsing
        }
    });
    
    // LaTeX.js may not support custom document classes like developercv
    // Let's try to parse anyway and see what happens
    console.log('⚠️ Note: LaTeX.js may not fully support custom document classes');
    
    const doc = LaTeX.parse(texContent, { generator: generator });
    const html = doc.render();
    
    console.log('🟢 LaTeX.js compilation successful - generated HTML');
    
    // Now convert HTML to PDF using Puppeteer
    console.log('🔄 Converting HTML to PDF...');
    
    const puppeteer = require('puppeteer');
    const browser = await puppeteer.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox'] // Vercel compatibility
    });
    
    const page = await browser.newPage();
    
    // Create full HTML document with CSS styling
    const fullHtml = `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <style>
            body { font-family: 'Times New Roman', serif; margin: 0; padding: 20px; }
            .page { max-width: 210mm; margin: 0 auto; }
        </style>
    </head>
    <body>
        <div class="page">
            ${html}
        </div>
    </body>
    </html>`;
    
    await page.setContent(fullHtml, { waitUntil: 'networkidle0' });
    
    const outputPath = path.join(outputDir, 'cv.pdf');
    await page.pdf({
        path: outputPath,
        format: 'A4',
        margin: {
            top: '20mm',
            right: '20mm',
            bottom: '20mm',
            left: '20mm'
        }
    });
    
    await browser.close();
    
    console.log('✅ CV build complete! Generated public/files/cv.pdf');
    
} catch (err) {
    console.error('❌ LaTeX.js compilation failed:', err);
    console.log('📋 Error details:', err.message);
    process.exit(1);
}
}

// Run the build
buildCV();