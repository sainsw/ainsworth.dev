'use client';

import { useEffect, useLayoutEffect, useRef, useState } from 'react';

type PersonalProject = {
  title: string;
  emoji: string;
  description: string;
  href: string;
  accent: string;
  spanClass: string;
};

const projects: PersonalProject[] = [
  {
    title: 'Framemoji',
    emoji: '🎬',
    description:
      'Decode the daily film in ten emoji clues. Built as a fast, joyful puzzle with shareable solve cards.',
    href: 'https://framemoji.ainsworth.dev',
    accent:
      'from-amber-50 via-orange-50 to-rose-50 dark:from-amber-900/30 dark:via-orange-900/20 dark:to-neutral-950',
    spanClass: '',
  },
  {
    title: 'BurnRate',
    emoji: '💸',
    description:
      'Privacy-first meeting cost tracker with a precise live timer, on-device math, and shareable recaps.',
    href: 'https://burnrate.ainsworth.dev',
    accent:
      'from-sky-50 via-slate-50 to-indigo-100 dark:from-sky-900/30 dark:via-slate-900/10 dark:to-neutral-950',
    spanClass: '',
  },
  {
    title: 'Invoicer',
    emoji: '🧾',
    description:
      'Generate polished PDF invoices in-browser with weekday-aware work blocks, local defaults, and offline-ready exports.',
    href: 'https://invoicer.ainsworth.dev',
    accent:
      'from-emerald-50 via-green-50 to-sky-50 dark:from-emerald-900/20 dark:via-green-900/20 dark:to-neutral-950',
    spanClass: '',
  },
];

export function PersonalProjects() {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [showLeftFade, setShowLeftFade] = useState(false);
  const [showRightFade, setShowRightFade] = useState(false);
  const [isOverflowing, setIsOverflowing] = useState(false);

  useLayoutEffect(() => {
    const el = scrollRef.current;
    if (!el) return;

    const update = () => {
      const maxScroll = el.scrollWidth - el.clientWidth;
      const hasOverflow = maxScroll > 0.5;
      setIsOverflowing(hasOverflow);
      setShowLeftFade(hasOverflow && el.scrollLeft > 0);
      setShowRightFade(hasOverflow && el.scrollLeft < maxScroll - 1);
    };

    // Run once after layout (covers initial load and font swaps).
    const raf = requestAnimationFrame(update);

    el.addEventListener('scroll', update);
    window.addEventListener('resize', update);

    const resizeObserver = new ResizeObserver(() => update());
    resizeObserver.observe(el);

    return () => {
      cancelAnimationFrame(raf);
      el.removeEventListener('scroll', update);
      window.removeEventListener('resize', update);
      resizeObserver.disconnect();
    };
  }, []);

  return (
    <section className="mt-4 overflow-visible">
      <div className="px-2 md:px-0">
        <div className="lg:ml-[calc(50%_-_50vw)] lg:mr-[calc(50%_-_50vw)] lg:px-0">
          <div
            className="relative mx-auto -my-2 -mx-2 w-full max-w-[64rem] overflow-visible py-2 md:mx-auto md:w-[94vw]"
            suppressHydrationWarning
          >
            <div
              ref={scrollRef}
              className={`bento-scroll flex flex-row flex-nowrap gap-4 px-0 sm:px-1 md:px-2 py-2 pb-2 scrollbar-hide ${
                isOverflowing ? 'overflow-x-auto overflow-y-visible' : 'overflow-visible'
              }`}
            >
              {projects.map((project) => (
                <a
                  key={project.title}
                  href={project.href}
                  target="_blank"
                  rel="noreferrer"
                  className={`group relative flex min-w-[320px] basis-[320px] flex-none flex-col justify-between overflow-hidden rounded-3xl border border-neutral-200 bg-gradient-to-br p-6 text-left shadow-[0_1px_0_rgba(15,23,42,0.04)] transition hover:-translate-y-0.5 hover:shadow-lg dark:border-neutral-800 dark:bg-gradient-to-br lg:min-w-[320px] lg:basis-[320px] lg:flex-none ${project.accent} ${project.spanClass}`}
                >
                  <div className="mt-4 space-y-3">
                    <h3 className="text-2xl font-semibold tracking-tight text-neutral-900 dark:text-neutral-50">
                      {project.title} <span aria-hidden="true">{project.emoji}</span>
                    </h3>
                    <p className="text-sm leading-relaxed text-neutral-600 dark:text-neutral-300">
                      {project.description}
                    </p>
                  </div>
                  <div className="mt-6 flex items-center text-sm font-semibold text-neutral-700 dark:text-neutral-200">
                    explore project
                    <span className="ml-2 inline-flex h-6 w-6 items-center justify-center rounded-full border border-neutral-300 text-xs transition group-hover:translate-x-1 dark:border-neutral-700 dark:text-neutral-200">
                      ↗
                    </span>
                  </div>
                  <div
                    className="pointer-events-none absolute inset-0 border border-white/40 opacity-0 transition group-hover:opacity-100 dark:border-white/5"
                    aria-hidden="true"
                  />
                </a>
              ))}
            </div>
            <div
              aria-hidden="true"
              className={`pointer-events-none absolute inset-y-0 left-0 w-10 bg-gradient-to-r from-white via-white/90 to-transparent transition-opacity duration-500 ease-out dark:from-[#111010]/80 dark:via-[#111010]/55 ${
                showLeftFade ? 'opacity-90' : 'opacity-0'
              }`}
            />
            <div
              aria-hidden="true"
              className={`pointer-events-none absolute inset-y-0 right-0 w-10 bg-gradient-to-l from-white via-white/90 to-transparent transition-opacity duration-500 ease-out dark:from-[#111010]/80 dark:via-[#111010]/55 ${
                showRightFade ? 'opacity-90' : 'opacity-0'
              }`}
            />
          </div>
        </div>
      </div>
    </section>
  );
}
