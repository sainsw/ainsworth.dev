#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('📄 Generating LaTeX from resume data...');

// For now, let's use a direct require approach by creating a temporary JS file
const resumeDataPath = path.join(__dirname, '..', 'data', 'resume.ts');
let resumeDataContent = fs.readFileSync(resumeDataPath, 'utf8');

// Convert TypeScript to JavaScript by removing types and interfaces
const jsContent = resumeDataContent
  .replace(/^export interface[\s\S]*?^}/gm, '') // Remove interface definitions
  .replace(/export const resumeData: ResumeData = /, 'module.exports = ') // Change export syntax
  .replace(/:\s*\w+(\[\])?\s*[,;]/g, ',') // Remove type annotations but preserve content like "2:1"
  .replace(/:\s*\w+(\[\])?\s*}/g, '}') // Remove type annotations at end of objects
  .replace(/as \w+/g, ''); // Remove type assertions

// Write temporary JS file
const tempJsPath = path.join(__dirname, '..', 'temp-resume.js');
fs.writeFileSync(tempJsPath, jsContent);

// Require the data
const resumeData = require(tempJsPath);

// Clean up temp file
fs.unlinkSync(tempJsPath);

// Helper functions to generate LaTeX
function escapeLatex(text) {
  return text
    .replace(/\\/g, '\\textbackslash{}') // Must be first
    .replace(/&/g, '\\&')
    .replace(/%/g, '\\%')
    .replace(/\$/g, '\\$')
    .replace(/#/g, '\\#')  
    .replace(/_/g, '\\_')
    .replace(/\{/g, '\\{')
    .replace(/\}/g, '\\}')
    .replace(/~/g, '\\~{}')
    .replace(/\^/g, '\\^{}');
}

function generatePersonalInfoSection(personalInfo) {
  const { name, title, location, phone, email, linkedin, website } = personalInfo;
  
  return `%----------------------------------------------------------------------------------------
%	TITLE AND CONTACT INFORMATION
%----------------------------------------------------------------------------------------

\\begin{minipage}[t]{0.6\\textwidth} % 45% of the page width for name
	\\vspace{-\\baselineskip} % Required for vertically aligning minipages
	
	% If your name is very short, use just one of the lines below
	% If your name is very long, reduce the font size or make the minipage wider and reduce the others proportionately
	\\colorbox{black}{{\\HUGE\\textcolor{white}{\\textbf{\\MakeUppercase{${escapeLatex(name.first)}}}}}} % First name
	
	\\colorbox{black}{{\\HUGE\\textcolor{white}{\\textbf{\\MakeUppercase{${escapeLatex(name.last)}}}}}} % Last name
	
	\\vspace{6pt}
	
	{\\huge ${escapeLatex(title)}} % Career or current job title
\\end{minipage}
\\begin{minipage}[t]{0.3\\textwidth} % 27.5% of the page width for the first row of icons
	\\vspace{-\\baselineskip} % Required for vertically aligning minipages
	
	% The first parameter is the FontAwesome icon name, the second is the box size and the third is the text
	% Other icons can be found by referring to fontawesome.pdf (supplied with the template) and using the word after \\fa in the command for the icon you want
	\\icon{MapMarker}{10}{${escapeLatex(location)}}\\\\
	\\icon{Phone}{10}{${escapeLatex(phone)}}\\\\
	\\icon{At}{10}{\\href{mailto:${email}}{${escapeLatex(email)}}}\\\\
	\\icon{Linkedin}{10}{\\href{https://www.linkedin.com/in/${linkedin}/}{${escapeLatex(linkedin)}}}\\\\
    \\icon{Link}{10}{\\href{https://${website}}{${escapeLatex(website)}}}\\\\
\\end{minipage}

\\vspace{0.1cm}`;
}

function generateSummarySection(summary, skillCategories) {
  let skillsLatex = '';
  
  skillCategories.forEach((category, index) => {
    const colWidth = index === 0 ? '0.25\\textwidth' : '0.3\\textwidth';
    const chartOffset = index === 0 ? '0' : '5';
    
    skillsLatex += `\\begin{minipage}[t]{${colWidth}} % Skills column
	\\vspace{-\\baselineskip} % Required for vertically aligning minipages
	\\begin{barchart}{${chartOffset}}
`;
    
    category.skills.forEach(skill => {
      skillsLatex += `        \\baritem{\\texttt{${escapeLatex(skill)}}}{0}\n`;
    });
    
    skillsLatex += `	\\end{barchart}
\\end{minipage}`;
    
    if (index < skillCategories.length - 1) {
      skillsLatex += '\n\\hfill % Whitespace between\n';  
    }
  });

  return `%----------------------------------------------------------------------------------------
%	INTRODUCTION, SKILLS AND TECHNOLOGIES
%----------------------------------------------------------------------------------------

\\cvsect{Who Am I?}

\\begin{minipage}[t]{0.4\\textwidth} % 40% of the page width for the introduction text
	\\vspace{-\\baselineskip} % Required for vertically aligning minipages
	\\raggedright
	${escapeLatex(summary)}
\\end{minipage}
\\hfill % Whitespace between
${skillsLatex}`;
}

function generateExperienceSection(experience) {
  let experienceLatex = `%----------------------------------------------------------------------------------------
%	EXPERIENCE
%----------------------------------------------------------------------------------------

\\cvsect{Experience}

\\begin{entrylist}`;

  experience.forEach((job, index) => {
    const location = job.location ? `, ${job.location}` : '';
    let techStack = '';
    
    if (job.technologies.length > 0) {
      const techItems = job.technologies.map(tech => `\\texttt{${escapeLatex(tech)}}`);
      techStack = `\\\\\\vspace{0.1cm}${techItems.join('\\slashsep')}`;
    }
    
    const descriptions = job.description.map(desc => escapeLatex(desc)).join('\\\\\\vspace{0.1cm}');
    
    experienceLatex += `
    \\entry
		{${escapeLatex(job.dates)}}
		{${escapeLatex(job.position)}}
		{${escapeLatex(job.company)}${escapeLatex(location)}}
		{\\raggedright ${descriptions}${techStack}}`;
    
    if (index < experience.length - 1) {
      // IBM (first entry) needs extra spacing to match visual spacing of other entries  
      const spacing = index === 0 ? '\\vspace{1.2cm}' : '\\vspace{0.6cm}';
      experienceLatex += `\n\n${spacing}`;
    }
  });

  experienceLatex += '\n\\end{entrylist}';
  return experienceLatex;
}

function generateEducationSection(education) {
  let educationLatex = `%----------------------------------------------------------------------------------------
%	EDUCATION
%----------------------------------------------------------------------------------------

\\cvsect{Education}

\\begin{entrylist}`;

  education.forEach(school => {
    const degree = school.degree || '';
    const descriptions = school.description || [];
    const descText = descriptions.length > 0 ? descriptions.map(desc => escapeLatex(desc)).join(' ') : '';
    
    educationLatex += `
	\\entry
		{${escapeLatex(school.dates)}}
		{${escapeLatex(degree)}}
		{${escapeLatex(school.institution)}}
		{${descText}}`;
  });

  educationLatex += '\n\\end{entrylist}';
  return educationLatex;
}

function generateAdditionalInfoSection(nonTechnicalSkills, hobbies) {
  return `%----------------------------------------------------------------------------------------
%	ADDITIONAL INFORMATION
%----------------------------------------------------------------------------------------
\\vspace{0.5cm}
\\begin{minipage}[t]{0.45\\textwidth}
	\\vspace{-\\baselineskip} % Required for vertically aligning minipages

	\\cvsect{Non-Technical Skills}\\\\
	${nonTechnicalSkills.map(skill => escapeLatex(skill)).join('\\\\\\\\')}
\\end{minipage}
\\hfill
\\begin{minipage}[t]{0.45\\textwidth}
	\\vspace{-\\baselineskip} % Required for vertically aligning minipages
	
	\\cvsect{Hobbies}\\\\
	 ${hobbies.map(hobby => escapeLatex(hobby)).join('\\\\\\\\')}
\\end{minipage}`;
}

// Generate the complete LaTeX document
function generateLatexDocument(data) {
  return `%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
% Developer CV
% LaTeX Template
% Version 1.0 (28/1/19)
%
% This template originates from:
% http://www.LaTeXTemplates.com
%
% Authors:
% Jan Vorisek (jan@vorisek.me)
% Based on a template by Jan Küster (info@jankuester.com)
% Modified for LaTeX Templates by Vel (vel@LaTeXTemplates.com)
%
% License:
% The MIT License (see included LICENSE file)
%
%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%

%----------------------------------------------------------------------------------------
%	PACKAGES AND OTHER DOCUMENT CONFIGURATIONS
%----------------------------------------------------------------------------------------

\\documentclass[8pt]{developercv} % Default font size, values from 8-12pt are recommended

%----------------------------------------------------------------------------------------

\\begin{document}

${generatePersonalInfoSection(data.personalInfo)}

${generateSummarySection(data.summary, data.skillCategories)}


${generateExperienceSection(data.experience)}

${generateEducationSection(data.education)}

${generateAdditionalInfoSection(data.nonTechnicalSkills, data.hobbies)}


%----------------------------------------------------------------------------------------

\\end{document}
`;
}

// Generate and write the LaTeX file
const latexContent = generateLatexDocument(resumeData);
const outputPath = path.join(__dirname, '..', 'cv-source', 'main.tex');

fs.writeFileSync(outputPath, latexContent);

console.log('✅ LaTeX generated successfully!');
console.log(`📁 Output: ${outputPath}`);