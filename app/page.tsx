import { Suspense } from 'react';
import { unstable_noStore as noStore } from 'next/cache';
import Link from 'next/link';
import Image from 'next/image';
import ViewCounter from 'app/blog/view-counter';
import { PreloadResources } from 'app/preload';
import { ArrowIcon } from './components/arrow-icon';
import { PrideAvatar } from './components/pride-avatar';
import { Icon } from '../components/icon';
import { AVATAR_VERSION } from '../lib/version';

function Badge(props) {
  return (
    <a
      {...props}
      target="_blank"
      className="border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 rounded p-1 text-sm inline-flex items-center leading-4 text-neutral-900 dark:text-neutral-100 no-underline"
    />
  );
}



export default function Page() {
  return (
    <section>
      <h1 className="font-medium text-2xl mb-8 tracking-tighter">hello, I'm Sam 👋</h1>
      <div className="prose prose-neutral dark:prose-invert">
        <p>
          I like to keep things simple and practical.
        </p>
      </div>
      <p className="prose prose-neutral dark:prose-invert">
        {`I'm a Senior Full Stack Engineer with 8+ years of experience in full-stack development and cloud solutions. I currently `}
        <Link href="/work" prefetch={true}>work</Link>
        {` at `}
        <span className="not-prose">
          <Badge href="https://www.ibm.com" aria-label="IBM">
            <Icon id="ibm" size={16} className="!mr-0" decorative={true} />
          </Badge>
        </span>
        {` in Manchester, where I focus on enterprise software development and cloud architecture with `}
        <span className="not-prose">
          <Badge href="https://react.dev">
            <Icon id="react" size={14} className="!mr-1" decorative={true} />
            React
          </Badge>
        </span>
        {`, `}
        <span className="not-prose">
          <Badge href="https://dotnet.microsoft.com">
            <Icon id="dotnet" size={14} className="!mr-1" decorative={true} />
            .NET
          </Badge>
        </span>
        {`, and `}
        <span className="not-prose">
          <Badge href="https://azure.microsoft.com/en-gb">
            <Icon id="azure" size={14} className="!mr-1" decorative={true} />
            Azure
          </Badge>
        </span>
        .
      </p>
      <div className="prose prose-neutral dark:prose-invert">
        <p>
          I'm passionate about enterprise design thinking and building scalable, reliable software solutions. 
          On my <Link href="/blog" prefetch={true}>blog</Link>, I share insights about software development, cloud technologies, .NET, Azure, and the latest in enterprise software architecture.
          You'll find content that reflects my experience in leading development teams and implementing modern software practices.
        </p>
      </div>
      <ul className="flex flex-col md:flex-row mt-8 space-x-0 md:space-x-4 space-y-2 md:space-y-0 font-sm text-neutral-600 dark:text-neutral-300">
        <li>
          <a
            className="flex items-center hover:text-neutral-800 dark:hover:text-neutral-100 transition-colors"
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
            className="flex items-center hover:text-neutral-800 dark:hover:text-neutral-100 transition-colors"
            href="/contact"
            prefetch={true}
          >
            <ArrowIcon />
            <p className="h-7 ml-2">get in touch</p>
          </Link>
        </li>
      </ul>
      <div className="container px-4 mx-auto">
        <div className="pt-24 pb-11 mx-auto max-w-4xl">
          <a className="block md:mx-auto mb-5 max-w-max" aria-label="find me on linkedin" href="https://linkedin.com/in/samainsworth">
            <PrideAvatar>
              <picture>
                <source srcSet={`/images/home/avatar-${AVATAR_VERSION}.webp`} type="image/webp" />
                <img 
                  className="bg-left-bottom h-20 w-20 rounded-full" 
                  src={`/images/home/avatar-${AVATAR_VERSION}.jpg`} 
                  alt="my face"
                  width={80}
                  height={80}
                  loading="eager"
                />
              </picture>
            </PrideAvatar>
          </a>
        </div>
      </div>
    </section>
  );
}
