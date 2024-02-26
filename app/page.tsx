import { Suspense } from 'react';
import { unstable_noStore as noStore } from 'next/cache';
import Link from 'next/link';
import Image from 'next/image';
import ViewCounter from 'app/blog/view-counter';
import { PreloadResources } from 'app/preload';

function Badge(props) {
  return (
    <a
      {...props}
      target="_blank"
      className="border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 rounded p-1 text-sm inline-flex items-center leading-4 text-neutral-900 dark:text-neutral-100 no-underline"
    />
  );
}

function ArrowIcon() {
  return (
    <svg
      width="12"
      height="12"
      viewBox="0 0 12 12"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M2.07102 11.3494L0.963068 10.2415L9.2017 1.98864H2.83807L2.85227 0.454545H11.8438V9.46023H10.2955L10.3097 3.09659L2.07102 11.3494Z"
        fill="currentColor"
      />
    </svg>
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
        {`I'm a full stack developer, and full time tinkerer. I currently `}
        <Link href="/work">work</Link>
        {` at `}
        <span className="not-prose">
          <Badge href="https://www.musicmagpie.co.uk">
            <img
              alt="Music Magpie logomark"
              src="/MMfavicon.ico"
              className="!mr-1"
              width="14"
              height="14"
            />
            musicmagpie
          </Badge>
        </span>
        {`, where I lead a team of talented developers who build amazing web applications with `}
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
          This is my new <Link href="/blog">blog</Link>, where I'll share my thoughts and experiences on software development, C♯ and .NET, JavaScript and TypeScript, React and Next.js, and more.
          You’ll find content that reflects my current interests and challenges, as well as how I’m learning and improving as a developer and technical lead.
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
          <a className="block md:mx-auto mb-5 max-w-max" href="https://www.linkedin.com/in/samainsworth/">
            <div>
              <img className="bg-left-bottom h-20 w-20 rounded-full ring-2 ring-black dark:ring-white" src="images/home/avatar.jpg" alt="" />
            </div>
          </a>
        </div>
      </div>
    </section>
  );
}
