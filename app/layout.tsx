import './global.css';
import type { Metadata } from 'next';
import { GeistSans } from 'geist/font/sans';
import { GeistMono } from 'geist/font/mono';
import { Navbar } from './components/nav';
import { Footer } from './components/footer';
import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/next';
import { SandpackCSS } from './blog/[slug]/sandpack';

export const metadata: Metadata = {
  metadataBase: new URL('https://ainsworth.dev'),
  title: {
    default: 'Sam Ainsworth',
    template: '%s | Sam Ainsworth',
  },
  description: 'Software Developer, tinkerer.',
  openGraph: {
    title: 'Sam Ainsworth',
    description: 'Software Developer, tinkerer.',
    url: 'https://ainsworth.dev',
    siteName: 'Sam Ainsworth',
    locale: 'en_GB',
    type: 'website',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  twitter: {
    title: 'Sam Ainsworth',
    card: 'summary_large_image',
  },
  verification: {
    google: 'hej0QCp4EiTc0mN34JuMNlseT8_4jOGDLO79NcEAdWw',
  },
};

const cx = (...classes) => classes.filter(Boolean).join(' ');

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={cx(
        'text-black bg-white dark:text-white dark:bg-[#111010]',
        GeistSans.variable,
        GeistMono.variable
      )}
    >
      <head>
        <SandpackCSS />
        <link rel="dns-prefetch" href="//cdn.vercel-insights.com" />
        <link rel="preconnect" href="https://vercel.live" />
        <link rel="dns-prefetch" href="//va.vercel-scripts.com" />
        <link rel="dns-prefetch" href="//static.cloudflareinsights.com" />
        <link rel="prefetch" href="/images/home/avatar.webp" />
        <link rel="prefetch" href="/sprite.svg" />
      </head>
      <body className="antialiased max-w-2xl mb-40 flex flex-col md:flex-row mx-4 mt-8 lg:mx-auto">
        <main className="flex-auto min-w-0 mt-6 flex flex-col px-2 md:px-0">
          <Navbar />
          {children}
          <Analytics />
          <SpeedInsights />
          <Footer />
        </main>
      </body>
    </html>
  );
}
