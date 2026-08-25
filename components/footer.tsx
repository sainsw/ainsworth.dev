import Link from 'next/link';
import { AVATAR_SRC } from '@/lib/avatar';
import { PrideAvatar } from './pride-avatar';

const year = new Date().getFullYear();

function getCopyrightString() {
  const range = year > 2024 ? `2024 - ${year}` : `${year}`;
  return `© Sam Ainsworth ${range}. All Rights Reserved.`;
}

export function Footer() {
  const copyrightString = getCopyrightString();
  return (
    <footer>
      <div className="relative h-64 ">
        <div className="absolute bottom-0 left-0 container mx-auto px-4">
          <div className="flex flex-col pb-5">
            {/* Avatar: left on mobile, center only on xl to match layout */}
            <div className="w-full">
              <a
                className="block mb-10 max-w-max xl:mx-auto"
                aria-label="find me on linkedin"
                href="https://linkedin.com/in/samainsworth"
                target="_blank"
                rel="noopener noreferrer"
              >
                <PrideAvatar>
                  <picture>
                    <source srcSet={AVATAR_SRC.webp} type="image/webp" />
                    <img
                      className="bg-left-bottom h-20 w-20 rounded-full"
                      src={AVATAR_SRC.jpg}
                      alt="my face"
                      width={80}
                      height={80}
                      loading="lazy"
                    />
                  </picture>
                </PrideAvatar>
              </a>
            </div>
            {/* Copyright: always left aligned */}
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-muted-foreground">
              <span>{copyrightString}</span>
              {/* The only other link to /privacy lives in the cookie banner,
                  which unmounts once consent is recorded. That left the page
                  orphaned: in the sitemap, but nothing pointing at it. */}
              <Link
                href="/privacy"
                className="hover:text-foreground transition-colors"
              >
                privacy
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
