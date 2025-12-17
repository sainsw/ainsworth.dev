import { Suspense } from 'react';
import type { Metadata } from 'next';
import { unstable_noStore as noStore } from 'next/cache';
import Link from 'next/link';
import { ArrowIcon } from './components/arrow-icon';
import { HomePreloads } from './home-preloads';
import { Icon } from '../components/icon';
import { PersonalProjects } from '../components/personal-projects';

// Inline tech badge - more spacious for use within prose
function TechBadge({ href, children, ...props }: { href: string; children: React.ReactNode } & React.AnchorHTMLAttributes<HTMLAnchorElement>) {
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

export default function Page() {
  return (
    <section>
      <HomePreloads />
      <h1 className="font-medium text-2xl mb-8 tracking-tighter">hello, I'm Sam 👋</h1>
      <div className="prose dark:prose-invert">
        <p>
          I like to keep things simple and practical.
        </p>
      </div>
      <p className="prose dark:prose-invert">
        {`I'm a Senior Full Stack Engineer with 8+ years of experience in full-stack development and cloud solutions. I currently `}
        <Link href="/work" prefetch={true}>work</Link>
        {` at `}
        <span className="not-prose">
          <TechBadge href="https://www.ibm.com" aria-label="IBM">
            <Icon id="ibm" height={14} className="shrink-0" decorative={true} />
          </TechBadge>
        </span>
        {` in Manchester, where I focus on enterprise software development and cloud architecture with `}
        <span className="not-prose">
          <TechBadge href="https://react.dev">
            <Icon id="react" size={14} className="shrink-0" decorative={true} />
            React
          </TechBadge>
        </span>
        {`, `}
        <span className="not-prose">
          <TechBadge href="https://dotnet.microsoft.com">
            <Icon id="dotnet" size={14} className="shrink-0" decorative={true} />
            .NET
          </TechBadge>
        </span>
        {`, and `}
        <span className="not-prose">
          <TechBadge href="https://azure.microsoft.com/en-gb">
            <Icon id="azure" size={14} className="shrink-0" decorative={true} />
            Azure
          </TechBadge>
        </span>
        .
      </p>
      <div className="prose dark:prose-invert">
        <p>
          I'm passionate about enterprise design thinking and building scalable, reliable software solutions. 
          On my <Link href="/blog" prefetch={true}>blog</Link>, I share insights about software development, cloud technologies, .NET, Azure, and the latest in enterprise software architecture.
          You'll find content that reflects my experience in leading development teams and implementing modern software practices.
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
    canonical: 'https://ainsworth.dev',
  },
};
