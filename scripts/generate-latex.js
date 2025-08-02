#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Import the resume data by requiring the compiled JS version
// Since we're in a Node.js script, we need to compile the TypeScript first or use a different approach
// For now, let's create a simple approach that reads and evaluates the TypeScript

console.log('📄 Generating LaTeX from resume data...');

// Read the resume data file
const resumeDataPath = path.join(__dirname, '..', 'data', 'resume.ts');
let resumeDataContent = fs.readFileSync(resumeDataPath, 'utf8');

// Extract the resumeData object (this is a simple approach - in production you might want to use TypeScript compiler)
// For now, let's create the object directly to avoid compilation complexity
const resumeData = {
  personalInfo: {
    name: { first: "Sam", last: "Ainsworth" },
    title: "Senior Software Developer",
    location: "Didsbury, Greater Manchester",
    phone: "+44 7507 140 959",
    email: "s@ainsworth.dev",
    linkedin: "samainsworth",
    website: "ainsworth.dev"
  },
  summary: "I am an experienced software engineer and mentor looking for a role that offers new challenges and expands my skill set, particularly within cloud services. I have 8 years of hands-on experience in software development and a BSc in Computer Science.",
  experience: [
    {
      company: "IBM",
      position: "Senior Full Stack Engineer", 
      dates: "2025 - Present",
      description: [
        "In my current role at IBM, I focus on enterprise software development and cloud architecture solutions. I work with cutting-edge technologies to build scalable, reliable software systems that serve enterprise clients globally.",
        "My responsibilities include applying enterprise design thinking principles, developing cloud-native applications, and implementing modern software architecture patterns. I leverage Azure cloud services, .NET Core, and various enterprise technologies to deliver robust solutions.",
        "I hold multiple certifications including Enterprise Design Thinking Practitioner and Azure Fundamentals, reflecting my commitment to staying current with industry best practices and emerging technologies."
      ],
      technologies: ["Azure", ".NET Core", "Enterprise Design Thinking", "Cloud Architecture"]
    },
    {
      company: "musicMagpie",
      position: "Senior Software Engineer",
      dates: "2020 - 2025", 
      location: "Stockport",
      description: [
        "In this role, I evolved from a mid-level software engineer to a senior developer and team lead. I went from helping to rebuild and improve the company's website, to leading a team of front and back-end developers. I leveraged Azure, Terraform, ASP.NET, and more, and helped to orchestrate the integration of IdentityServer4, driving measurable improvements in load times and customer conversion.",
        "As a senior developer, I guided a team of five through Scrum methodology while continuously researching and implementing cutting-edge technologies to optimise workflows and elevate performance. I worked hard to foster a collaborative environment in which everyone could demonstrate their strengths. Through this, my team successfully overhauled multi-national customer facing applications in React and Typescript, and moved to .Net Core RESTful APIs, Service Bus architecture and NoSQL data warehousing.",
        "This role expanded not only my technical expertise but also essential leadership, communication, and problem-solving skills, driving the company's overall success and customer satisfaction."
      ],
      technologies: [".Net Core", "CI/CD", "Azure", "Service Bus", "TDD", "Agile & Scrum", "React", "TypeScript", "Terraform", "IdentityServer4"]
    },
    {
      company: "Bott & Company Solicitors",
      position: "C# Software Developer",
      dates: "2016 - 2020",
      location: "Wilmslow", 
      description: [
        "At this consumer-focused firm of solicitors, efficient, user-friendly software played a crucial role in day-to-day operations. My role was to replace system components with best practices and MVC3 under C#, to design and maintain ASP.Net Web Apps and APIs with MSSQL back-end, to implement SSRS reports and TSQL Stored Procedures, and to oversee and expand legal-specific case management systems.",
        "Through my guidance and expertise, the business adopted industry-standard tools including Git and Jira. I also led exploratory research projects into Azure, and contributed to upgrading data warehouse security to the ISO-27001 standard."
      ],
      technologies: ["C# ASP.Net", "MSSQL", "Azure", "Git", "SSRS", "TSQL"]
    },
    {
      company: "WHSmith",
      position: "Sales Assistant",
      dates: "2012 - 2016",
      description: [],
      technologies: []
    }
  ],
  education: [
    {
      institution: "University of Liverpool",
      degree: "Computer Science BSc - 2:1", 
      dates: "2013 - 2016",
      location: "UK",
      description: [
        "For my undergraduate dissertation, 'Accelerometer Games for the iOS Platform', I created a physics-based game for iPhone and iPad. This was a great opportunity to learn Swift and SpriteKit, along with the App Store submission process.",
        "The project was well-received, with the University choosing to use my game as a learning tool and as an example of an exceptional final project during open days."
      ]
    },
    {
      institution: "Ashton Sixth Form College",
      degree: "Computing, Physics, Maths A-Levels",
      dates: "2011 - 2013",
      location: "UK"
    },
    {
      institution: "West Hill High School", 
      degree: "",
      dates: "2006 - 2011",
      location: "UK"
    }
  ],
  skillCategories: [
    {
      title: "Core Technologies",
      skills: ["Azure", "C# .Net Core", "ASP.Net", "Entity Framework", "MySQL, MSSQL, NoSQL", "OAuth2 / Identity Server", "React / Vue"]
    },
    {
      title: "Development Tools",
      skills: ["Visual Studio Code", "Azure DevOps Pipelines", "Terraform", "Service Bus", "Git (Github/Azure DevOps)", "Agile / Scrum", "Python/Go/Swift"]
    }
  ],
  nonTechnicalSkills: [
    "Excellent communication skills with customer- and stakeholder-facing experience.",
    "Strong experience with Agile & Scrum methodologies as a senior engineer of a product team.",
    "Methodic and meticulous attention to detail and a drive towards perfection."
  ],
  hobbies: [
    "I have a keen interest in portrait and still-life photography, as it allows me to express my creativity and enjoy cutting-edge (and retro!) tech.",
    "I'm also passionate about timeless and innovative design, which inspires both my professional and personal projects."
  ]
};

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
      // Add extra space after IBM (first entry) for better visual separation
      const spacing = index === 0 ? '\\vspace{1.0cm}' : '\\vspace{0.6cm}';
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