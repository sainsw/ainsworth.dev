import './tw.css';
import './global.css';
import { SpeedInsights } from '@vercel/speed-insights/next';
import { GeistMono } from 'geist/font/mono';
import { GeistSans } from 'geist/font/sans';
import type { Metadata } from 'next';
import { Suspense } from 'react';
import { preload } from 'react-dom';
import { CookieConsent } from '@/components/cookie-banner';
import { DeferredAnalytics } from '@/components/deferred-analytics';
import { Footer } from '@/components/footer';
import { Navbar } from '@/components/nav';
import {
  email as authorEmail,
  currentEmployer,
  currentJobTitle,
  fullName,
  getYearsOfExperience,
  location,
} from '@/lib/bio';
import { SITE_URL } from '@/lib/site';
import { cn } from '@/lib/utils';

// Evaluated once, at build. Unlike the home page's visible copy, which reads a
// cached clock, static `metadata` has no request to hang off, and the number
// moves at most once a year. The site redeploys far more often than that.
const siteDescription = `Senior Software Developer with ${getYearsOfExperience(new Date())}+ years experience, working in .NET, Azure, React, and cloud architecture. Notes on the things I build.`;

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: `${fullName} - Senior Software Developer & Cloud Engineer`,
    template: `%s | ${fullName}`,
  },
  description: siteDescription,
  openGraph: {
    title: `${fullName} - Senior Software Developer & Cloud Engineer`,
    description: siteDescription,
    url: SITE_URL,
    siteName: fullName,
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
    title: `${fullName} - Senior Software Developer & Cloud Engineer`,
    card: 'summary_large_image',
  },
  verification: {
    google: 'hej0QCp4EiTc0mN34JuMNlseT8_4jOGDLO79NcEAdWw',
  },
};

const structuredData = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'Person',
      name: fullName,
      url: SITE_URL,
      jobTitle: currentJobTitle,
      description:
        'Senior Software Developer working on web applications and cloud architecture, and leading engineering teams.',
      email: `mailto:${authorEmail}`,
      sameAs: [
        'https://www.linkedin.com/in/samainsworth/',
        'https://github.com/sainsw',
      ],
      image: `${SITE_URL}/placeholder.jpg`,
      worksFor: {
        '@type': 'Organization',
        name: currentEmployer,
      },
      address: {
        '@type': 'PostalAddress',
        addressLocality: location,
        addressCountry: 'GB',
      },
    },
    {
      '@type': 'WebSite',
      name: fullName,
      url: SITE_URL,
      inLanguage: 'en-GB',
      description:
        'Personal site of Sam Ainsworth: side projects, blog posts, and notes on building software for the cloud.',
      publisher: {
        '@type': 'Person',
        name: fullName,
      },
    },
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Every page renders icons from the sprite. preload() dedupes by href; a JSX
  // <link rel="preload"> gets hoisted into <head> while the authored copy stays
  // put, so the tag shipped twice on every page.
  preload('/sprite.svg', { as: 'image', type: 'image/svg+xml' });

  return (
    <html
      lang="en"
      className={cn(
        'text-foreground bg-background',
        GeistSans.variable,
        GeistMono.variable,
      )}
    >
      <head>
        <link rel="dns-prefetch" href={`//${new URL(SITE_URL).host}`} />
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
        <meta property="og:logo" content={`${SITE_URL}/favicon.ico`} />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        />
      </head>
      <body className="antialiased font-sans text-foreground bg-background">
        <div className="max-w-2xl mb-40 flex flex-col md:flex-row mx-4 mt-8 lg:mx-auto overflow-hidden">
          <main className="flex-auto min-w-0 mt-6 flex flex-col px-2 md:px-0">
            <Navbar />
            {children}
            <Footer />
            <Suspense fallback={null}>
              <DeferredAnalytics />
            </Suspense>
          </main>
        </div>
        <CookieConsent />
        {/* Load Speed Insights unconditionally (no cookies used) */}
        <SpeedInsights />
      </body>
    </html>
  );
}
