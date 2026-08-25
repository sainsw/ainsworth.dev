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
import { AVATAR_SRC } from '@/lib/avatar';
import {
  currentEmployer,
  currentEmployerUrl,
  currentJobTitle,
  education,
  fullName,
  getYearsOfExperience,
  knowsAbout,
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
      '@id': `${SITE_URL}/#person`,
      name: fullName,
      url: SITE_URL,
      jobTitle: currentJobTitle,
      description:
        'Senior Software Developer working on web applications and cloud architecture, and leading engineering teams.',
      /**
       * No `email` here, deliberately. components/email-link.tsx builds the
       * address on click specifically to keep it out of the markup, and this
       * block used to hand it to every scraper in plain text on every page,
       * which made that effort pointless. The contact page is the published
       * route in, so it is the one advertised.
       */
      contactPoint: {
        '@type': 'ContactPoint',
        contactType: 'Enquiries',
        url: `${SITE_URL}/contact`,
      },
      sameAs: [
        'https://www.linkedin.com/in/samainsworth/',
        'https://github.com/sainsw',
      ],
      // Was /placeholder.jpg, which lives in app/ and so was never served at
      // all: Next only serves static files from public/. Every page carried a
      // Person whose image 404d. This one is real and content-hashed.
      image: `${SITE_URL}${AVATAR_SRC.jpg}`,
      worksFor: {
        '@type': 'Organization',
        name: currentEmployer,
        url: currentEmployerUrl,
      },
      hasOccupation: {
        '@type': 'Occupation',
        name: currentJobTitle,
      },
      // Both from data/resume.json, which already renders as HTML on /work but
      // reached no structured data before. This is the entity answer to "who is
      // this person and what do they know".
      alumniOf: education.map(({ name, url }) => ({
        '@type': 'EducationalOrganization',
        name,
        url,
      })),
      knowsAbout,
      address: {
        '@type': 'PostalAddress',
        addressLocality: location,
        addressCountry: 'GB',
      },
    },
    {
      '@type': 'WebSite',
      '@id': `${SITE_URL}/#website`,
      name: fullName,
      url: SITE_URL,
      inLanguage: 'en-GB',
      description:
        'Personal site of Sam Ainsworth: side projects, blog posts, and notes on building software for the cloud.',
      publisher: { '@id': `${SITE_URL}/#person` },
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
         * - Resend is only used on the contact flow; that page preconnects locally.
         */}
        <meta property="og:logo" content={`${SITE_URL}/favicon.ico`} />
        <link
          rel="alternate"
          type="application/rss+xml"
          title={`${fullName} - Blog`}
          href="/rss.xml"
        />
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
