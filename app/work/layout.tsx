import type { Metadata } from 'next';
import { breadcrumbJsonLd } from '@/lib/content/post-links';
import { pageMetadata } from '@/lib/page-metadata';

export const metadata: Metadata = pageMetadata({
  title: 'Work & Experience',
  description:
    'Career history, skills, education, and technologies used by Sam Ainsworth, Senior Software Developer and Cloud Engineer.',
  path: '/work',
});

export default function WorkLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(
            breadcrumbJsonLd([{ name: 'Work & Experience', path: '/work' }]),
          ),
        }}
      />
      <h1 className="font-medium text-2xl mb-8 tracking-tighter">
        work & experience <span aria-hidden="true">💼</span>
      </h1>
      {children}
    </div>
  );
}
