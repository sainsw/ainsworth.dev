"use client";

const education = [
  {
    index: 1,
    name: 'University of Liverpool, UK',
    dates: '2013 - 2016',
    qual: 'Computer Science BSc - 2:1',
    imageLight: "/images/logos/uol_colour.svg",
    imageDark: "/images/logos/uol_white.svg",
    url: "https://www.liverpool.ac.uk/"
  },
  {
    index: 2,
    name: 'Ashton Sixth Form College, UK',
    dates: '2011 - 2013',
    qual: 'Computing, Physics, Maths A-Levels',
    imageLight: "/images/logos/asfc_black.png",
    imageDark: "/images/logos/asfc_white.png",
    url: "https://www.asfc.ac.uk/"
  },
  {
    index: 3,
    name: 'West Hill High School, UK',
    dates: '2006 - 2011',
    imageLight: "/images/logos/wh.png",
    imageDark: "/images/logos/wh.png",
    url: "https://www.westhillschool.co.uk/"
  },
]

const work = [
  {
    name: 'musicMagpie',
    dates: '2020 - Present',
    position: 'Senior Software Engineer',
    description: ['During my time here, I evolved from a mid-level software engineer to a senior developer, contributing to the rebuilding of our website and then leading a team of front and back-end developers. To start I leveraged Azure, Terraform, ASP.NET, and more, and I helped orchestrate the integration of IdentityServer4 - driving measurable improvements in load times and customer conversion.',
                  'As a senior developer, I fostered a collaborative environment, guiding a team of five through a Scrum methodology while continuously researching and implementing cutting-edge technologies to optimize workflows and elevate performance. With myself, the team has worked to overhaul multi-national customer facing applications in React and Typescript, whilst also moving to .Net Core RESTful APIs and NoSQL data warehousing.',
                  'My role expanded not only technical expertise but also essential soft skills in leadership, communication, and problem-solving, contributing to the company\'s overall success and customer satisfaction.'],
    imageLight: "/images/logos/mm_colour.svg",
    imageDark: "/images/logos/mm_white.svg",
    url: "https://www.musicmagpie.co.uk/"
  },
  {
    name: 'Bott & Company Solicitors',
    dates: '2016 - 2020',
    position: 'C# Software Developer',
    description: ['A consumer-focused firm of solicitors with a specialisation in leveraging technology for efficiency. This role involved replacing system components with best practices and MVC3 under C# - designing and maintaining ASP.Net Web Apps and APIs with MSSQL back-end, implementing SSRS reports and TSQL Stored Procedures, as well as maintaining and expanding legal-specific case management systems.',
                  'With my suggestion the business adopted industry-standard tools like Git and Jira. I also led exploratory research projects into Azure, and contributed to maintaining data warehouse security to ISO-27001 standard.'],
    imageLight: "/images/logos/bott_blue.svg",
    imageDark: "/images/logos/bott_white.svg",
    url: "https://www.bottonline.co.uk/"
  },
  {
    name: 'WHSmith',
    dates: '2012 - 2016',
    position: 'Sales Assistant',
    imageLight: "/images/logos/whs.png",
    imageDark: "/images/logos/whs.png",
    url: "https://www.whsmith.co.uk/"
  }
]

import React from 'react';
import { useEffect, useRef, useState } from 'react';

function ExperienceCard({ name, dates, post, description, imageLight, imageDark, url }) {
  const [currentImage, setCurrentImage] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const imageRef = useRef(null); // Declare imageRef here

  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
          setCurrentImage(mediaQuery.matches ? imageDark : imageLight);
          observer.unobserve(entry.target);
        }
      });
    });
  
    if (imageRef.current) {
      observer.observe(imageRef.current);
    }
  
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = () => {
      setCurrentImage(mediaQuery.matches ? imageDark : imageLight);
    };
  
    handleChange(); // Set initial image based on current preference
    mediaQuery.addEventListener('change', handleChange);
  
    return () => {
      if (imageRef.current) {
        observer.unobserve(imageRef.current);
      }
      mediaQuery.removeEventListener('change', handleChange);
    };
  }, [imageLight, imageDark]);

  useEffect(() => {
      const timeoutId = setTimeout(() => {
        setIsLoading(false);
      }, 0); // 5 seconds timeout

      return () => clearTimeout(timeoutId);
    }, []);

    const handleImageLoad = () => {
      setIsLoading(false);
    };

  return (
      <div className="border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900 rounded px-3 py-4 w-full grid grid-cols-[auto,1fr] gap-4">
        <div className="flex flex-col">
          <p className="prose-medium text-neutral-900 dark:text-neutral-100">
            {name}
          </p>
          <p className="prose-sm mt-2 italic text-neutral-900 dark:text-neutral-100">
            {post}
          </p>
          <p className="prose-sm text-neutral-900 dark:text-neutral-100">
            {dates}
          </p>
        </div>
        <div className="flex flex-col">
        {url ? (
            <a href={url} target="_blank" rel="noopener noreferrer" className="flex flex-col">
              {isLoading ? (
                <div className="h-12 w-12 bg-neutral-200 dark:bg-neutral-800 animate-pulse self-end"></div>
              ) : (
                <img
                  ref={imageRef}
                  src={currentImage}
                  alt={`${name} logo`}
                  className="h-12 w-12 object-contain self-end"
                  onLoad={handleImageLoad}
                />
              )}
            </a>
          ) : (
            <React.Fragment>
              {isLoading ? (
                <div className="h-12 w-12 bg-neutral-200 dark:bg-neutral-800 animate-pulse self-end"></div>
              ) : (
                <img
                  ref={imageRef}
                  src={currentImage}
                  alt={`${name} logo`}
                  className="h-12 w-12 object-contain self-end"
                  onLoad={handleImageLoad}
                />
              )}
            </React.Fragment>
          )}
        </div>
        {description && (
          <div className="col-span-2">
              {description.map((desc, index) => (
                <Paragraph key={index} str={desc} />
              ))}
          </div>
        )}
      </div>
  );
}


function Paragraph({ key, str }) {
  return (
    <p key={key} className="prose-sm mt-2 text-neutral-900 dark:text-neutral-100">
      {str}
    </p>
  );
}

export default function Page() {
  return (
    <section>
      <div>
        <h1 className="font-medium text-2xl mb-8 tracking-tighter">work 👨‍💻</h1>
        <ul>
          {work.map((job, index) => (
            <li key={index} className="group py-2">
            <ExperienceCard
              key={index}
              name={job.name}
              dates={job.dates}
              post={job.position}
              description={job.description}
              imageLight={job.imageLight}
              imageDark={job.imageDark}
              url={job.url}
            />
            </li>
          ))}
        </ul>
      </div>
      <div>
        <h1 className="font-medium text-2xl mb-8 mt-12 tracking-tighter">education 👨‍🎓</h1>
        <ul>
          {education.map((school, index) => (
            <li key={index} className="group py-2">
            <ExperienceCard
              key={index}
              name={school.name}
              dates={school.dates}
              post={school.qual}
              description={null}
              imageLight={school.imageLight}
              imageDark={school.imageDark}
              url={school.url}
            />
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

