"use client";
import Link from 'next/link';
import { ArrowIcon } from '../components/arrow-icon';
import { Icon } from '../../components/icon';
import { usePrefetchOnView } from '../hooks/use-prefetch-on-view';
import { CV_VERSION } from '../../lib/version';
import { resumeData } from '../../data/resume';

function ExperienceCard({ name, dates, post, description, iconId, url, technologies = [] }: {
  name: string;
  dates: string; 
  post: string;
  description?: string[];
  iconId: string;
  url: string;
  technologies?: string[];
}) {
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
          <a href={url} target="_blank" rel="noopener noreferrer" className="h-12 w-12 self-end">
            <Icon id={iconId} size={48} className="h-12 w-12" />
          </a>
        ) : (
          <Icon id={iconId} size={48} className="h-12 w-12 self-end" />
        )}
      </div>
      {description && (
        <div className="col-span-2">
          {description.map((desc, index) => (
            <Paragraph key={index} str={desc} />
          ))}
          {technologies && technologies.length > 0 && (
            <div className="mt-4 pt-2 border-t border-neutral-200 dark:border-neutral-700">
              <p className="prose-sm text-neutral-600 dark:text-neutral-400 italic">
                {technologies.join(' • ')}
              </p>  
            </div>
          )}
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

function SkillCloud({ skills }: { skills: string[] }) {
  // Color variations for visual interest
  const colorVariants = [
    "bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800",
    "bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300 border-green-200 dark:border-green-800", 
    "bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-800",
    "bg-orange-50 dark:bg-orange-900/20 text-orange-700 dark:text-orange-300 border-orange-200 dark:border-orange-800",
    "bg-pink-50 dark:bg-pink-900/20 text-pink-700 dark:text-pink-300 border-pink-200 dark:border-pink-800",
    "bg-gray-50 dark:bg-gray-900/20 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-800"
  ];

  return (
    <div className="flex flex-wrap gap-3 p-2">
      {skills.map((skill, index) => {
        const colorClass = colorVariants[index % colorVariants.length];
        return (
          <span
            key={index}
            className={`
              px-3 py-1.5 
              rounded-full 
              text-sm 
              font-medium
              border
              transition-all 
              hover:shadow-sm
              ${colorClass}
            `}
            style={{ whiteSpace: 'nowrap' }}
          >
            {skill}
          </span>
        );
      })}
    </div>
  );
}

export default function Page() {
  const cvUrl = `/files/cv-${CV_VERSION}.pdf`;
  const cvLinkRef = usePrefetchOnView(cvUrl);
  
  // Combine all skills for word cloud
  const allSkills = resumeData.skillCategories.flatMap(category => category.skills);
  
  return (
    <section>
      {/* Skills Cloud Section */}
      <div className="mb-12">
        <h1 className="font-medium text-2xl mb-8 tracking-tighter">skills & technologies 💻</h1>
        <SkillCloud skills={allSkills} />
      </div>

      <div className="mt-12">
        <h1 className="font-medium text-2xl mb-8 tracking-tighter">work 👨‍💻</h1>
        <ul>
          {resumeData.experience.map((job, index) => (
            <li key={index} className="group py-2">
            <ExperienceCard
              key={index}
              name={job.company}
              dates={job.dates}
              post={job.position}
              description={job.description}
              iconId={job.iconId}
              url={job.url}
              technologies={job.technologies}
            />
            </li>
          ))}
        </ul>
      </div>
      <div>
        <h1 className="font-medium text-2xl mb-8 mt-12 tracking-tighter">education 👨‍🎓</h1>
        <ul>
          {resumeData.education.map((school, index) => (
            <li key={index} className="group py-2">
            <ExperienceCard
              key={index}
              name={school.institution}
              dates={school.dates}
              post={school.degree}
              description={school.description}
              iconId={school.iconId}
              url={school.url}
            />
            </li>
          ))}
        </ul>
      </div>

      <div className="mt-12">
        <h1 className="font-medium text-2xl mb-8 tracking-tighter">non-technical skills 🤝</h1>
        <div className="border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900 rounded px-3 py-4 mb-8">
          <ul className="space-y-2">
            {resumeData.nonTechnicalSkills.map((skill, index) => (
              <li key={index} className="text-sm text-neutral-600 dark:text-neutral-400">
                {skill}
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="mt-12">
        <h1 className="font-medium text-2xl mb-8 tracking-tighter">hobbies 🎨</h1>
        <div className="border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900 rounded px-3 py-4">
          <div className="space-y-2">
            {resumeData.hobbies.map((hobby, index) => (
              <p key={index} className="text-sm text-neutral-600 dark:text-neutral-400">
                {hobby}
              </p>
            ))}
          </div>
        </div>
      </div>

      <ul className="flex flex-col md:flex-row mt-8 space-x-0 md:space-x-4 space-y-2 md:space-y-0 font-sm text-neutral-600 dark:text-neutral-300">
        <li ref={cvLinkRef}>
          <a
            className="flex items-center hover:text-neutral-800 dark:hover:text-neutral-100 transition-all"
            rel="noopener noreferrer"
            target="_blank"
            href={cvUrl}
          >
            <ArrowIcon />
            <p className="h-7 ml-2">Open PDF Version</p>
          </a>
        </li>
      </ul>
    </section>
  );
}

