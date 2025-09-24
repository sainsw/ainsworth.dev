import Link from 'next/link';

const navItems = {
  '/': {
    name: 'home',
    prefetch: false, // already on home
  },
  '/work': {
    name: 'work',
    prefetch: true, // high priority content
  },
  '/blog': {
    name: 'blog',
    prefetch: true, // high priority content
  },
  '/guestbook': {
    name: 'guestbook',
    prefetch: false, // lower priority
  },
};

export function Navbar() {
  return (
    <aside className="-ml-[8px] mb-16 tracking-tight">
      <div className="lg:sticky lg:top-20">
        <nav
          className="flex flex-row items-start relative px-0 pb-0 fade md:overflow-auto scroll-pr-6 md:relative"
          id="nav"
        >
          <div className="flex flex-row space-x-0 pr-10">
            {Object.entries(navItems).map(([path, { name, prefetch }]) => {
              return (
                <Link
                  key={path}
                  href={path}
                  prefetch={prefetch}
                  className="transition-colors hover:text-neutral-800 dark:hover:text-neutral-200 flex align-middle relative py-1 px-2"
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
