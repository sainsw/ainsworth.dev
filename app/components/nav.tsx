import Link from 'next/link';
import type { Route } from 'next';

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
    path: '/guestbook',
    name: 'guestbook',
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
                  className="transition-colors hover:text-foreground text-muted-foreground flex align-middle relative py-1 px-2 text-sm"
                >
                  {name}
                </Link>
              );
            })}
          </div>
        </nav>
      </div>
    </aside>
  );
}
