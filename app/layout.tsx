import './tw.css';
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
import { cn } from '../lib/utils';

export const metadata: Metadata = {
  metadataBase: new URL('https://ainsworth.dev'),
  title: {
    default: 'Sam Ainsworth - Senior Software Developer & Cloud Engineer',
    template: '%s | Sam Ainsworth',
  },
  description:
    'Senior Software Developer with 8+ years experience building scalable web applications, cloud architecture, and team leadership. Expertise in .NET, Azure, React, and modern development practices.',
  openGraph: {
    title: 'Sam Ainsworth - Senior Software Developer & Cloud Engineer',
    description:
      'Senior Software Developer with 8+ years experience building scalable web applications, cloud architecture, and team leadership. Expertise in .NET, Azure, React, and modern development practices.',
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
  // Avoid setting a site-wide canonical. Each route sets its own where needed.
};

const siteUrl = 'https://ainsworth.dev';

const structuredData = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'Person',
      name: 'Sam Ainsworth',
      url: siteUrl,
      jobTitle: 'Senior Software Developer',
      description:
        'Senior Software Developer focusing on scalable web applications, cloud architecture, and modern engineering leadership.',
      email: 'mailto:s@ainsworth.dev',
      sameAs: ['https://www.linkedin.com/in/samainsworth/'],
      image: `${siteUrl}/placeholder.jpg`,
      worksFor: {
        '@type': 'Organization',
        name: 'IBM',
        url: 'https://www.ibm.com',
      },
      address: {
        '@type': 'PostalAddress',
        addressLocality: 'Manchester',
        addressRegion: 'Greater Manchester',
        addressCountry: 'GB',
      },
    },
    {
      '@type': 'WebSite',
      name: 'Sam Ainsworth',
      url: siteUrl,
      inLanguage: 'en-GB',
      description:
        'Senior Software Developer sharing projects, blog posts, and practical insights on building reliable cloud-first software.',
      publisher: {
        '@type': 'Person',
        name: 'Sam Ainsworth',
      },
    },
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
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
        <link
          rel="preload"
          href="/sprite.svg"
          as="image"
          type="image/svg+xml"
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        />
      </head>
      <body className="antialiased font-sans text-foreground bg-background">
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
