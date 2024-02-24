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

export default function Page() {
  return (
    <section>
      <h1 className="font-medium text-2xl mb-8 tracking-tighter">hello, I'm Sam 👋</h1>
      <p className="prose prose-neutral dark:prose-invert">
        {`I'm a full stack developer, and full time tinkerer. I currently work at `}
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
          I’ve just started this blog, where I plan to share my insights and learnings on software development, C♯ and .NET, JavaScript and TypeScript, React and Next.js, and more.
          I like to keep things simple and practical.
          You’ll find content that reflects my current interests and challenges, as well as how I’m evolving and improving as a developer and technical lead.
        </p>
      </div>
    </section>
  );
}
