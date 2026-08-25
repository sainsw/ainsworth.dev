import type { Metadata } from 'next';
import { SITE_URL } from '@/lib/site';

export const metadata: Metadata = {
  title: 'Contact',
  description: 'Send Sam Ainsworth a message.',
  alternates: { canonical: `${SITE_URL}/contact` },
};

export default function ContactLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div>
      <h1 className="font-medium text-2xl mb-8 tracking-tighter">
        get in touch 📮
      </h1>
      {children}
    </div>
  );
}
