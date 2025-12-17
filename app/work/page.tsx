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
    <div className="border border-border bg-card ring-1 ring-foreground/10 px-4 py-5 w-full flex flex-col gap-4">
      <div className="flex items-start justify-between gap-4">
        <div className="flex flex-col gap-1">
          <p className="text-sm font-medium text-foreground">
            {name}
          </p>
          <p className="text-sm italic text-muted-foreground">
            {post}
          </p>
          <p className="text-xs text-muted-foreground">
            {dates}
          </p>
        </div>
        <div className="flex-shrink-0">
          {url ? (
            <a
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className="block h-12 w-12"
              aria-label={`Visit ${name}`}
            >
              <Icon id={iconId} size={48} className="h-12 w-12" decorative />
            </a>
          ) : (
            <Icon id={iconId} size={48} className="h-12 w-12" />
          )}
        </div>
      </div>

      {(description && description.length > 0) && (
        <div className="space-y-2">
          {description.map((desc, index) => (
            <p key={index} className="text-sm text-foreground leading-relaxed">{desc}</p>
          ))}
          {technologies && technologies.length > 0 && (
            <div className="mt-3 pt-3 border-t border-border">
              <p className="text-xs text-muted-foreground italic">
                {technologies.join(' • ')}
              </p>  
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function SkillTag({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex border border-border bg-card ring-1 ring-foreground/10 px-2.5 py-1 text-sm text-foreground whitespace-nowrap">
      {children}
    </span>
  );
}

function SkillCloud({ skills }: { skills: string[] }) {
  return (
    <div className="flex flex-wrap gap-2">
      {skills.map((skill, index) => (
        <SkillTag key={index}>{skill}</SkillTag>
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
        <h2 className="font-medium text-2xl mb-6 tracking-tighter">skills & technologies 💻</h2>
        <SkillCloud skills={allSkills} />
      </div>

      <div className="mt-12">
        <h2 className="font-medium text-2xl mb-6 tracking-tighter">work 👨‍💻</h2>
        <div className="flex flex-col gap-4">
          {resumeData.experience.map((job, index) => (
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
          ))}
        </div>
      </div>

      <div className="mt-12">
        <h2 className="font-medium text-2xl mb-6 tracking-tighter">education 👨‍🎓</h2>
        <div className="flex flex-col gap-4">
          {resumeData.education.map((school, index) => (
            <ExperienceCard
              key={index}
              name={school.institution}
              dates={school.dates}
              post={school.degree}
              description={school.description}
              iconId={school.iconId}
              url={school.url}
            />
          ))}
        </div>
      </div>

      <div className="mt-12">
        <h2 className="font-medium text-2xl mb-6 tracking-tighter">non-technical skills 🤝</h2>
        <div className="border border-border bg-card ring-1 ring-foreground/10 px-4 py-5">
          <ul className="space-y-2">
            {resumeData.nonTechnicalSkills.map((skill, index) => (
              <li key={index} className="text-sm text-muted-foreground">
                {skill}
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="mt-12">
        <h2 className="font-medium text-2xl mb-6 tracking-tighter">hobbies 🎨</h2>
        <div className="border border-border bg-card ring-1 ring-foreground/10 px-4 py-5">
          <div className="space-y-2">
            {resumeData.hobbies.map((hobby, index) => (
              <p key={index} className="text-sm text-muted-foreground">
                {hobby}
              </p>
            ))}
          </div>
        </div>
      </div>

      <ul className="flex flex-col md:flex-row mt-8 space-x-0 md:space-x-4 space-y-2 md:space-y-0 font-sm text-muted-foreground">
        <li ref={cvLinkRef}>
          <a
            className="flex items-center hover:text-foreground transition-colors"
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
