"use client";
import Link from 'next/link';
import { ArrowIcon } from '../components/arrow-icon';
import { Icon } from '../../components/icon';
import { usePrefetchOnView } from '../hooks/use-prefetch-on-view';
import { CV_VERSION } from '../../lib/version';
import resumeData from '../../data/resume.json';

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
    <div className="border border-gray-200 dark:border-gray-900 bg-white dark:bg-[#141414] rounded px-3 py-4 w-full grid grid-cols-[auto,1fr] gap-4">
      <div className="flex flex-col">
        <p className="prose-medium text-gray-900 dark:text-gray-100">
          {name}
        </p>
        <p className="prose-sm mt-2 italic text-gray-900 dark:text-gray-100">
          {post}
        </p>
        <p className="prose-sm text-gray-900 dark:text-gray-100">
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
      {description && description.length > 0 && (
        <div className="col-span-2">
          {description.map((desc, index) => (
            <Paragraph key={index} str={desc} />
          ))}
          {technologies && technologies.length > 0 && (
            <div className="mt-2 pt-2 border-t border-gray-200 dark:border-gray-900">
              <p className="prose-sm text-gray-600 dark:text-gray-400 italic">
                {technologies.join(' • ')}
              </p>  
            </div>
          )}
        </div>
      )}
    </div>
  );
}


function Paragraph({ str }) {
  return (
    <p className="prose-sm mt-2 text-gray-900 dark:text-gray-100">
      {str}
    </p>
  );
}

function SkillCloud({ skills }: { skills: string[] }) {
  return (
    <div className="flex flex-wrap gap-4 p-2">
      {skills.map((skill, index) => (
        <span
          key={index}
          className="border border-gray-200 dark:border-gray-900 bg-gray-50 dark:bg-gray-800 rounded px-2 py-1 text-sm text-gray-900 dark:text-gray-100"
          style={{ whiteSpace: 'nowrap' }}
        >
          {skill}
        </span>
      ))}
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
        <div className="border border-gray-200 dark:border-gray-900 bg-white dark:bg-[#141414] rounded px-3 py-4 mb-8">
          <ul className="space-y-2">
            {resumeData.nonTechnicalSkills.map((skill, index) => (
              <li key={index} className="text-sm text-gray-600 dark:text-gray-400">
                {skill}
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="mt-12">
        <h1 className="font-medium text-2xl mb-8 tracking-tighter">hobbies 🎨</h1>
        <div className="border border-gray-200 dark:border-gray-900 bg-white dark:bg-[#141414] rounded px-3 py-4">
          <div className="space-y-2">
            {resumeData.hobbies.map((hobby, index) => (
              <p key={index} className="text-sm text-gray-600 dark:text-gray-400">
                {hobby}
              </p>
            ))}
          </div>
        </div>
      </div>

      <ul className="flex flex-col md:flex-row mt-8 space-x-0 md:space-x-4 space-y-2 md:space-y-0 font-sm text-gray-600 dark:text-gray-300">
        <li ref={cvLinkRef}>
          <a
            className="flex items-center hover:text-gray-800 dark:text-gray-300 dark:hover:text-white transition-colors"
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
