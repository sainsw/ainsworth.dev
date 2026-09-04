import type { Metadata } from 'next';
import { breadcrumbJsonLd } from '@/lib/content/post-links';
import { pageMetadata } from '@/lib/page-metadata';

export const metadata: Metadata = pageMetadata({
  title: 'Contact',
  description:
    'Get in touch with Sam Ainsworth, a Senior Software Developer in Manchester, about work, contract enquiries, side projects, or anything written on this site.',
  path: '/contact',
});

export default function ContactLayout({
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
            breadcrumbJsonLd([{ name: 'Contact', path: '/contact' }]),
          ),
        }}
      />
      <h1 className="font-medium text-2xl mb-8 tracking-tighter">
        get in touch <span aria-hidden="true">📮</span>
      </h1>
      {children}
    </div>
  );
}
