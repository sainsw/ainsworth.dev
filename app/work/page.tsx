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
            <div className="mt-3 pt-2 border-t border-neutral-200 dark:border-neutral-700">
              <p className="prose-sm text-neutral-600 dark:text-neutral-400">
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

export default function Page() {
  const cvUrl = `/files/cv-${CV_VERSION}.pdf`;
  const cvLinkRef = usePrefetchOnView(cvUrl);
  
  return (
    <section>
      {/* Summary Section */}
      <div className="mb-12">
        <h1 className="font-medium text-2xl mb-8 tracking-tighter">Who Am I? 🤔</h1>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1">
            <p className="prose prose-neutral dark:prose-invert">
              {resumeData.summary}
            </p>
          </div>
          <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
            {resumeData.skillCategories.map((category, index) => (
              <div key={index} className="space-y-3">
                <h3 className="font-medium text-lg text-neutral-900 dark:text-neutral-100">
                  {category.title}
                </h3>
                <ul className="space-y-2">
                  {category.skills.map((skill, skillIndex) => (
                    <li key={skillIndex} className="text-sm text-neutral-600 dark:text-neutral-400 font-mono">
                      {skill}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div>
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

      {/* Additional Information Section */}
      <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-8">
        <div>
          <h2 className="font-medium text-xl mb-4 tracking-tighter">Non-Technical Skills</h2>
          <ul className="space-y-3">
            {resumeData.nonTechnicalSkills.map((skill, index) => (
              <li key={index} className="text-sm text-neutral-600 dark:text-neutral-400">
                {skill}
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h2 className="font-medium text-xl mb-4 tracking-tighter">Hobbies</h2>
          <div className="space-y-3">
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

