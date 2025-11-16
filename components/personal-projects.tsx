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
    spanClass: 'md:col-span-3',
  },
  {
    title: 'BurnRate',
    emoji: '🔥',
    description:
      'Privacy-first meeting cost tracker with a precise live timer, on-device math, and shareable recaps.',
    href: 'https://burnrate.ainsworth.dev',
    accent:
      'from-sky-50 via-slate-50 to-indigo-100 dark:from-sky-900/30 dark:via-slate-900/10 dark:to-neutral-950',
    spanClass: 'md:col-span-2',
  },
];

export function PersonalProjects() {
  return (
    <section className="mt-12 overflow-visible">
      <div className="px-2 md:px-0">
        <div className="lg:ml-[calc(50%_-_50vw)] lg:mr-[calc(50%_-_50vw)] lg:px-0">
          <div className="mx-auto w-[90vw] max-w-[50.4rem]">
            <div className="grid gap-4 md:grid-cols-5 auto-rows-auto">
              {projects.map((project) => (
                <a
                  key={project.title}
                  href={project.href}
                  target="_blank"
                  rel="noreferrer"
                  className={`group relative flex flex-col justify-between overflow-hidden rounded-3xl border border-neutral-200 bg-gradient-to-br p-6 text-left shadow-[0_1px_0_rgba(15,23,42,0.04)] transition hover:-translate-y-0.5 hover:shadow-lg dark:border-neutral-800 dark:bg-gradient-to-br ${project.accent} ${project.spanClass}`}
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
          </div>
        </div>
      </div>
    </section>
  );
}
