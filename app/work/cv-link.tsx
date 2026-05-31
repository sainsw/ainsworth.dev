'use client';

import { usePrefetchOnView } from '@/app/hooks/use-prefetch-on-view';
import { ArrowIcon } from '@/components/arrow-icon';

export function CvLink({ cvUrl }: { cvUrl: string }) {
  const ref = usePrefetchOnView(cvUrl);

  return (
    <ul className="flex flex-col md:flex-row mt-8 space-x-0 md:space-x-4 space-y-2 md:space-y-0 font-sm text-muted-foreground">
      <li ref={ref}>
        <a
          className="flex items-center hover:text-foreground transition-colors"
          rel="noopener noreferrer"
          target="_blank"
          href={cvUrl}
        >
          <ArrowIcon />
          <p className="h-7 ml-2">Open PDF Version</p>
        </a>
      </li>
    </ul>
  );
}
