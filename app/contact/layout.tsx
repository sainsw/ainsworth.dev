import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Contact',
  description: 'Get in touch with Sam Ainsworth - Send a message.',
};

export default function ContactLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <head>
        <link rel="preconnect" href="https://api.resend.com" />
      </head>
      <div>
        <h1 className="font-medium text-2xl mb-8 tracking-tighter">get in touch 👋</h1>
        {children}
      </div>
    </>
  );
}