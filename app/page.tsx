import { Suspense } from 'react';
import { unstable_noStore as noStore } from 'next/cache';
import Link from 'next/link';
import Image from 'next/image';
import ViewCounter from 'app/blog/view-counter';
import { PreloadResources } from 'app/preload';
import { ArrowIcon } from './components/arrow-icon';

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
        <Link href="/work">work</Link>
        {` at `}
        <span className="not-prose">
          <Badge href="https://www.ibm.com">
            <svg
              width="14"
              height="14"
              role="img"
              aria-label="IBM logo"
              className="!mr-1"
              viewBox="0 0 24 24"
              fill="currentColor"
            >
              <path d="M0 9.036h4.15v1.428H0v-1.428zm0 2.857h4.15v1.429H0v-1.43zm5.679-2.857h2.143v1.428H5.679v-1.428zm0 2.857h2.143v1.429H5.679v-1.43zm3.571-2.857h2.143v1.428H9.25v-1.428zm0 2.857h2.143v1.429H9.25v-1.43zm3.572-2.857h4.142v1.428h-4.142v-1.428zm0 2.857h4.142v1.429h-4.142v-1.43zm5.678-2.857H24v1.428h-1.5v-1.428zm0 2.857H24v1.429h-1.5v-1.43z"/>
            </svg>
            IBM
          </Badge>
        </span>
        {` in Manchester, where I focus on enterprise software development and cloud architecture with `}
        <span className="not-prose">
          <Badge href="https://react.dev">
            <svg
              width="14"
              height="14"
              role="img"
              aria-label="React logo"
              className="!mr-1"
            >
              <use href="/sprite.svg#react" />
            </svg>
            React
          </Badge>
        </span>
        {`, `}
        <span className="not-prose">
          <Badge href="https://dotnet.microsoft.com">
            <img
              alt="dot net logomark"
              src="/dotnet-logo.jpg"
              className="!mr-1"
              width="14"
              height="14"
            />
            .NET
          </Badge>
        </span>
        {`, and `}
        <span className="not-prose">
          <Badge href="https://azure.microsoft.com">
            <img
              alt="Azure logomark"
              src="/azure-logo.ico"
              className="!mr-1"
              width="14"
              height="14"
            />
            Azure
          </Badge>
        </span>
        .
      </p>
      <div className="prose prose-neutral dark:prose-invert">
        <p>
          I'm passionate about enterprise design thinking and building scalable, reliable software solutions. 
          On my <Link href="/blog">blog</Link>, I share insights about software development, cloud technologies, .NET, Azure, and the latest in enterprise software architecture.
          You'll find content that reflects my experience in leading development teams and implementing modern software practices.
        </p>
      </div>
      <ul className="flex flex-col md:flex-row mt-8 space-x-0 md:space-x-4 space-y-2 md:space-y-0 font-sm text-neutral-600 dark:text-neutral-300">
        <li>
          <a
            className="flex items-center hover:text-neutral-800 dark:hover:text-neutral-100 transition-all"
            rel="noopener noreferrer"
            target="_blank"
            href="https://www.linkedin.com/in/samainsworth/"
          >
            <ArrowIcon />
            <p className="h-7 ml-2">linkedin</p>
          </a>
        </li>
        <li>
          <a
            className="flex items-center hover:text-neutral-800 dark:hover:text-neutral-100 transition-all"
            rel="noopener noreferrer"
            href="/contact"
          >
            <ArrowIcon />
            <p className="h-7 ml-2">get in touch</p>
          </a>
        </li>
      </ul>
      <div className="container px-4 mx-auto">
        <div className="pt-24 pb-11 mx-auto max-w-4xl">
          <a className="block md:mx-auto mb-5 max-w-max" aria-label="find me on linkedin" href="https://www.linkedin.com/in/samainsworth/">
            <div>
              <img className="bg-left-bottom h-20 w-20 rounded-full ring-2 ring-black dark:ring-white" src="images/home/avatar.jpg" alt="my face" />
            </div>
          </a>
        </div>
      </div>
    </section>
  );
}
