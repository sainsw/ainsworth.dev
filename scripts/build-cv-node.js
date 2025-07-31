#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('📄 Building CV from LaTeX source using LaTeX.js...');

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
const texContent = fs.readFileSync(texFilePath, 'utf8');

// Also read the class file
const clsFilePath = path.join(__dirname, '..', 'cv-source', 'developercv.cls');
const clsContent = fs.readFileSync(clsFilePath, 'utf8');

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