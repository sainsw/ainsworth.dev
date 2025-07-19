"use client";
import Link from 'next/link';
import { ArrowIcon } from '../components/arrow-icon';


const education = [
  {
    index: 1,
    name: 'University of Liverpool, UK',
    dates: '2013 - 2016',
    qual: 'Computer Science BSc - 2:1',
    description: ['For my undergraduate dissertation, ’Accelerometer Games for the iOS Platform’, I created a physics–based game for iPhone and iPad. This was a great opportunity to learn Swift and SpriteKit, along with the App Store submission process. ',
      'The project was well–received, with the University choosing to use my game as a learning tool and as an example of an exceptional final project during open days.'],
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
    name: 'IBM',
    dates: '2025 - Present',
    position: 'Senior Full Stack Engineer',
    description: ['In my current role at IBM, I focus on enterprise software development and cloud architecture solutions. I work with cutting-edge technologies to build scalable, reliable software systems that serve enterprise clients globally.',
                  'My responsibilities include applying enterprise design thinking principles, developing cloud-native applications, and implementing modern software architecture patterns. I leverage Azure cloud services, .NET Core, and various enterprise technologies to deliver robust solutions.',
                  'I hold multiple certifications including Enterprise Design Thinking Practitioner and Azure Fundamentals, reflecting my commitment to staying current with industry best practices and emerging technologies.'],
    imageLight: "/images/logos/ibm_blue.svg",
    imageDark: "/images/logos/ibm_white.svg",
    url: "https://www.ibm.com/"
  },
  {
    name: 'musicMagpie',
    dates: '2020 - 2025',
    position: 'Senior Software Engineer',
    description: ['In this role, I evolved from a mid-level software engineer to a senior developer and team lead. I went from helping to rebuild and improve the company\'s website, to leading a team of front and back-end developers. I leveraged Azure, Terraform, ASP.NET, and more, and helped to orchestrate the integration of IdentityServer4, driving measurable improvements in load times and customer conversion.',
                  'As a senior developer, I guided a team of five through Scrum methodology while continuously researching and implementing cutting-edge technologies to optimise workflows and elevate performance. I worked hard to foster a collaborative environment in which everyone could demonstrate their strengths. Through this, my team successfully overhauled multi-national customer facing applications in React and Typescript, and moved to .Net Core RESTful APIs, Service Bus architecture and NoSQL data warehousing.',
                  'This role expanded not only my technical expertise but also essential leadership, communication, and problem-solving skills, driving the company\'s overall success and customer satisfaction.'],
    imageLight: "/images/logos/mm_colour.svg",
    imageDark: "/images/logos/mm_white.svg",
    url: "https://www.musicmagpie.co.uk/"
  },
  {
    name: 'Bott & Company Solicitors',
    dates: '2016 - 2020',
    position: 'C# Software Developer',
    description: ['At this consumer-focused firm of solicitors, efficient, user-friendly software played a crucial role in day-to-day operations. My role was to replace system components with best practices and MVC3 under C#, to design and maintain ASP.Net Web Apps and APIs with MSSQL back-end, to implement SSRS reports and TSQL Stored Procedures, and to oversee and expand legal-specific case management systems.',
                  'Through my guidance and expertise, the business adopted industry-standard tools including Git and Jira. I also led exploratory research projects into Azure, and contributed to upgrading data warehouse security to the ISO-27001 standard.'],
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
  const [currentImageWebP, setCurrentImageWebP] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const imageRef = useRef(null); // Declare imageRef here

  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
          const selectedImage = mediaQuery.matches ? imageDark : imageLight;
          setCurrentImage(selectedImage);
          // Set WebP version only for PNG files (SVG files don't have WebP versions)
          if (selectedImage.endsWith('.png')) {
            setCurrentImageWebP(selectedImage.replace('.png', '.webp'));
          } else {
            setCurrentImageWebP(''); // No WebP version for SVG files
          }
          observer.unobserve(entry.target);
        }
      });
    });
  
    if (imageRef.current) {
      observer.observe(imageRef.current);
    }
  
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = () => {
      const selectedImage = mediaQuery.matches ? imageDark : imageLight;
      setCurrentImage(selectedImage);
      // Set WebP version only for PNG files (SVG files don't have WebP versions)
      if (selectedImage.endsWith('.png')) {
        setCurrentImageWebP(selectedImage.replace('.png', '.webp'));
      } else {
        setCurrentImageWebP(''); // No WebP version for SVG files
      }
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

  const handleImageError = () => {
    // Fallback to a simple colored div with company initials when image fails to load
    setCurrentImage('');
  };

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
          {isLoading ? (
            <div className="h-12 w-12 bg-neutral-200 dark:bg-neutral-800 animate-pulse self-end"></div>
          ) : (
              <React.Fragment>
                {currentImage ? (
                  url ? (
                    <a href={url} target="_blank" rel="noopener noreferrer" className="h-12 w-12 self-end">
                      <picture>
                        {currentImageWebP && <source srcSet={currentImageWebP} type="image/webp" />}
                        <img
                          ref={imageRef}
                          src={currentImage}
                          alt={`${name} logo`}
                          className="h-12 w-12 object-contain self-end"
                          width={48}
                          height={48}
                          onLoad={handleImageLoad}
                          onError={handleImageError}
                        />
                      </picture>
                    </a>
                  ) : (
                    <picture>
                      {currentImageWebP && <source srcSet={currentImageWebP} type="image/webp" />}
                      <img
                        ref={imageRef}
                        src={currentImage}
                        alt={`${name} logo`}
                        className="h-12 w-12 object-contain self-end"
                        width={48}
                        height={48}
                        onLoad={handleImageLoad}
                        onError={handleImageError}
                      />
                    </picture>
                  )
                ) : (
                  // Fallback when image fails to load - show company initials
                  <div className="h-12 w-12 bg-neutral-300 dark:bg-neutral-600 rounded-lg flex items-center justify-center self-end">
                    <span className="text-neutral-700 dark:text-neutral-300 text-xs font-bold">
                      {name.split(' ').map(word => word[0]).join('').slice(0, 3)}
                    </span>
                  </div>
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
              description={school.description}
              imageLight={school.imageLight}
              imageDark={school.imageDark}
              url={school.url}
            />
            </li>
          ))}
        </ul>
      </div>
      <ul className="flex flex-col md:flex-row mt-8 space-x-0 md:space-x-4 space-y-2 md:space-y-0 font-sm text-neutral-600 dark:text-neutral-300">
        <li>
          <a
            className="flex items-center hover:text-neutral-800 dark:hover:text-neutral-100 transition-all"
            rel="noopener noreferrer"
            target="_blank"
            href="/files/cv.pdf"
          >
            <ArrowIcon />
            <p className="h-7 ml-2">Open PDF Version</p>
          </a>
        </li>
      </ul>
    </section>
  );
}

