import './global.css';
import type { Metadata } from 'next';
import { GeistSans } from 'geist/font/sans';
import { GeistMono } from 'geist/font/mono';
import { Navbar } from './components/nav';
import { Footer } from './components/footer';
import { Suspense } from 'react';
import { SpeedInsights } from '@vercel/speed-insights/next';
import { DeferredAnalytics } from './components/deferred-analytics';
import { CookieConsent } from './components/cookie-banner';
import { AVATAR_VERSION } from '../lib/version';

// CSS_VERSION is available after build, fallback to dynamic loading
let CSS_VERSION = '';
try {
  const version = require('../lib/version');
  CSS_VERSION = version.CSS_VERSION || '';
} catch (e) {
  // CSS_VERSION not available yet
}

export const metadata: Metadata = {
  metadataBase: new URL('https://ainsworth.dev'),
  title: {
    default: 'Sam Ainsworth - Senior Software Developer & Cloud Engineer',
    template: '%s | Sam Ainsworth',
  },
  description: 'Senior Software Developer with 8+ years experience building scalable web applications, cloud architecture, and team leadership. Expertise in .NET, Azure, React, and modern development practices.',
  openGraph: {
    title: 'Sam Ainsworth - Senior Software Developer & Cloud Engineer',
    description: 'Senior Software Developer with 8+ years experience building scalable web applications, cloud architecture, and team leadership. Expertise in .NET, Azure, React, and modern development practices.',
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
    title: 'Sam Ainsworth - Senior Software Developer & Cloud Engineer',
    card: 'summary_large_image',
  },
  verification: {
    google: 'hej0QCp4EiTc0mN34JuMNlseT8_4jOGDLO79NcEAdWw',
  },
  alternates: {
    canonical: 'https://ainsworth.dev',
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
        <link rel="dns-prefetch" href="//ainsworth.dev" />
        {/**
         * Keep preconnects minimal to avoid Lighthouse warnings and unnecessary sockets.
         * We'll rely on first-use connection establishment for third parties.
         */}
        {/**
         * Avoid preconnecting to third‑party analytics or APIs globally to reduce
         * baseline connection overhead before consent or when unused.
         * - Cloudflare Insights is only enabled after consent via Zaraz.
         * - Resend is only used on the contact flow; that page preconnects locally.
         */}
        <meta property="og:logo" content="https://ainsworth.dev/favicon.ico" />
        {/**
         * Avoid overriding Next.js CSS loading. A previous non-blocking
         * CSS hack caused FOUC and cumulative layout shift, especially on
         * content‑heavy pages like /work. Next.js already optimizes CSS
         * delivery, so we keep default behavior to preserve layout stability.
         */}
        <link rel="preload" href={`/images/home/avatar-${AVATAR_VERSION}.webp`} as="image" type="image/webp" />
        <link rel="preload" href="/sprite.svg" as="image" type="image/svg+xml" />
        {/* Preload the main CSS so the browser fetches it earlier without changing render order */}
        {CSS_VERSION ? (
          <link
            rel="preload"
            as="style"
            href={`/_next/static/css/${CSS_VERSION}.css`}
            crossOrigin=""
          />
        ) : null}
      </head>
      <body className="antialiased text-black bg-white dark:text-white dark:bg-[#111010]">
        <div className="max-w-2xl mb-40 flex flex-col md:flex-row mx-4 mt-8 lg:mx-auto">
          <main className="flex-auto min-w-0 mt-6 flex flex-col px-2 md:px-0">
            <Navbar />
            {children}
            <Footer />
            <Suspense fallback={null}>
              <DeferredAnalytics />
            </Suspense>
          </main>
        </div>
        <CookieConsent variant="mini" learnMoreHref="/privacy" />
        {/* Load Speed Insights unconditionally (no cookies used) */}
        <SpeedInsights />
      </body>
    </html>
  );
}
