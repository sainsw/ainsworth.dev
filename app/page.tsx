import type { Metadata } from 'next';
import Link from 'next/link';
import { preload } from 'react-dom';
import { ArrowIcon } from '@/components/arrow-icon';
import { Icon } from '@/components/icon';
import { PersonalProjects } from '@/components/personal-projects';
import { AVATAR_SRC } from '@/lib/avatar';
import { getYearsOfExperience } from '@/lib/bio';
import { currentDate } from '@/lib/current-date';
import { SITE_URL } from '@/lib/site';

// Inline tech badge - more spacious for use within prose
function TechBadge({
  href,
  children,
  ...props
}: {
  href: string;
  children: React.ReactNode;
} & React.AnchorHTMLAttributes<HTMLAnchorElement>) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center gap-1.5 border border-border bg-card ring-1 ring-foreground/10 px-2 py-1 min-h-[28px] text-sm text-foreground no-underline transition-colors hover:bg-accent"
      {...props}
    >
      {children}
    </a>
  );
}

export default async function Page() {
  // Warms the footer avatar. preload() dedupes by href, unlike a JSX
  // <link rel="preload">, which React hoists into <head> while also leaving the
  // authored copy behind. The original useServerInsertedHTML version was worse
  // still: it re-emitted the tag on every stream flush, ~22 copies per page.
  preload(AVATAR_SRC.webp, { as: 'image', type: 'image/webp' });

  // Cached, not read straight from the clock: see lib/current-date.ts.
  const yearsOfExperience = getYearsOfExperience(await currentDate());

  return (
    <section>
      <h1 className="font-medium text-2xl mb-8 tracking-tighter">
        hello, I'm Sam 👋
      </h1>
      <div className="prose dark:prose-invert">
        <p>I like to keep things simple and practical.</p>
      </div>
      <p className="prose dark:prose-invert">
        {`I'm a Senior Full Stack Engineer with ${yearsOfExperience}+ years of experience. I currently `}
        <Link href="/work" prefetch={true}>
          work
        </Link>
        {` at `}
        <span className="not-prose">
          <TechBadge href="https://www.ibm.com" aria-label="IBM">
            <Icon id="ibm" height={14} className="shrink-0" decorative={true} />
          </TechBadge>
        </span>
        {` in Manchester, working on enterprise software and cloud architecture with `}
        <span className="not-prose">
          <TechBadge href="https://react.dev">
            <Icon id="react" size={14} className="shrink-0" decorative={true} />
            React
          </TechBadge>
        </span>
        {`, `}
        <span className="not-prose">
          <TechBadge href="https://www.python.org">
            <Icon
              id="python"
              size={14}
              className="shrink-0"
              decorative={true}
            />
            Python
          </TechBadge>
        </span>
        {`, and `}
        <span className="not-prose">
          <TechBadge href="https://aws.amazon.com" aria-label="AWS">
            <Icon id="aws" height={14} className="shrink-0" decorative={true} />
          </TechBadge>
        </span>
        .
      </p>
      <div className="prose dark:prose-invert">
        <p>
          Most of what I do is enterprise design thinking and getting software
          to hold up once real traffic hits it. My{' '}
          <Link href="/blog" prefetch={true}>
            blog
          </Link>{' '}
          is write-ups of things I've built and problems I've run into along the
          way: .NET, Azure, front-end work, and whatever side project currently
          has my attention.
        </p>
      </div>

      <h2 className="font-medium text-2xl mt-8 mb-2 tracking-tighter text-foreground">
        personal projects 👨‍💻
      </h2>
      <PersonalProjects />

      <ul className="flex flex-col md:flex-row mt-8 space-x-0 md:space-x-4 space-y-2 md:space-y-0 font-sm text-muted-foreground">
        <li>
          <a
            className="flex items-center hover:text-foreground transition-colors"
            rel="noopener noreferrer"
            target="_blank"
            href="https://linkedin.com/in/samainsworth"
          >
            <ArrowIcon />
            <p className="h-7 ml-2">linkedin</p>
          </a>
        </li>
        <li>
          <a
            className="flex items-center hover:text-foreground transition-colors"
            rel="noopener noreferrer"
            target="_blank"
            href="https://github.com/sainsw"
          >
            <ArrowIcon />
            <p className="h-7 ml-2">github</p>
          </a>
        </li>
        <li>
          <Link
            className="flex items-center hover:text-foreground transition-colors"
            href="/contact"
            prefetch={true}
          >
            <ArrowIcon />
            <p className="h-7 ml-2">get in touch</p>
          </Link>
        </li>
      </ul>
    </section>
  );
}

export const metadata: Metadata = {
  alternates: {
    canonical: SITE_URL,
  },
};
