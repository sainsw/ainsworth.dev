import type { Route } from 'next';
import Link from 'next/link';
import { Icon } from '@/components/icon';

const navItems: Array<{ path: Route; name: string; prefetch: boolean }> = [
  {
    path: '/',
    name: 'home',
    prefetch: false, // already on home
  },
  {
    path: '/work',
    name: 'work',
    prefetch: true, // high priority content
  },
  {
    path: '/blog',
    name: 'blog',
    prefetch: true, // high priority content
  },
  {
    path: '/contact',
    name: 'contact',
    prefetch: false, // lower priority
  },
];

export function Navbar() {
  return (
    <aside className="-ml-[8px] mb-16 tracking-tight">
      <div className="lg:sticky lg:top-20">
        <nav
          className="flex flex-row items-start relative px-0 pb-0 fade md:overflow-auto scroll-pr-6 md:relative"
          id="nav"
        >
          <div className="flex flex-row space-x-0 pr-10">
            {navItems.map(({ path, name, prefetch }) => {
              return (
                <Link
                  key={path}
                  href={path}
                  prefetch={prefetch}
                  className="transition-colors hover:text-foreground text-muted-foreground flex align-middle relative py-1 px-2 text-base"
                >
                  {name}
                </Link>
              );
            })}
            {/* Off-site, so an icon rather than a fifth word. It sits on the
                row's own px-2 rhythm: the icon shape is what marks it as
                different, not a gap.

                18px is smaller than it sounds. The symbol inks 97.5% of its
                24x24 viewBox, so the disc renders at very close to this number,
                and it is measured against GeistSans at 16px, whose ascenders
                and caps are only 11.36px. Pure optical parity with the
                letterforms lands around 13px, but a mid-grey disc that size
                reads as a stray dot next to four words rather than a fifth
                item. 20px tips the other way and becomes the loudest thing in
                the nav, which is backwards for the one link that matters
                least. */}
            <a
              className="transition-colors text-muted-foreground hover:text-foreground flex items-center h-8 px-2"
              aria-label="find me on github"
              href="https://github.com/sainsw"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Icon id="github" size={18} decorative={true} />
            </a>
          </div>
        </nav>
      </div>
    </aside>
  );
}
