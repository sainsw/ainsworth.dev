type PersonalProject = {
  title: string;
  emoji: string;
  description: string;
  href: string;
  number: string;
};

const projects: PersonalProject[] = [
  {
    number: '01',
    title: 'Framemoji',
    emoji: '🎬',
    description:
      'Decode the daily film in ten emoji clues. Built as a fast, joyful puzzle with shareable solve cards.',
    href: 'https://framemoji.ainsworth.dev',
  },
  {
    number: '02',
    title: 'BurnRate',
    emoji: '💸',
    description:
      'Privacy-first meeting cost tracker with a precise live timer, on-device math, and shareable recaps.',
    href: 'https://burnrate.ainsworth.dev',
  },
  {
    number: '03',
    title: 'Invoicer',
    emoji: '🧾',
    description:
      'Generate polished PDF invoices in-browser with weekday-aware work blocks, local defaults, and offline-ready exports.',
    href: 'https://invoicer.ainsworth.dev',
  },
];

export function PersonalProjects() {
  return (
    <section className="mt-6">
      <div className="flex flex-col gap-0">
        {projects.map((project, _index) => (
          <a
            key={project.title}
            href={project.href}
            target="_blank"
            rel="noreferrer"
            className="group relative flex items-start gap-4 border-t border-border px-4 py-6 transition-colors hover:bg-secondary first:border-t-0 -mx-4"
          >
            {/* Number */}
            <span className="font-mono text-xs text-muted-foreground tabular-nums">
              {project.number}
            </span>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-baseline gap-2">
                <h3 className="text-lg font-medium tracking-tight text-foreground group-hover:underline underline-offset-2">
                  {project.title}
                </h3>
                <span className="text-lg" aria-hidden="true">
                  {project.emoji}
                </span>
              </div>
              <p className="mt-1 text-base leading-relaxed text-muted-foreground">
                {project.description}
              </p>
            </div>

            {/* Arrow */}
            <span
              className="text-muted-foreground group-hover:text-foreground transition-all group-hover:translate-x-0.5"
              aria-hidden="true"
            >
              →
            </span>
          </a>
        ))}
      </div>
    </section>
  );
}
