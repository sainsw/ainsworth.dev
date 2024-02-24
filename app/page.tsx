import { Suspense } from 'react';
import { unstable_noStore as noStore } from 'next/cache';
import Link from 'next/link';
import Image from 'next/image';
import mm from 'public/images/home/MMfavicon.ico';
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
      <h1 className="font-medium text-2xl mb-8 tracking-tighter">Hi, I'm Sam 👋</h1>
      <p className="prose prose-neutral dark:prose-invert">
        {`I'm a full stack developer, and full time tinkerer. I am currently a technical lead at `}
        <span className="not-prose">
          <Badge href="https://www.musicmagpie.co.uk">
            <svg
              width="13"
              height="11"
              role="img"
              aria-label="MusicMagpie logo"
              className="inline-flex mr-1"
            >
              <use href="/sprite.svg#mm" />
            </svg>
            Vercel
          </Badge>
        </span>
      </p>
    </section>
  );
}
