import type { Metadata } from 'next';
import { GeistSans } from 'geist/font/sans';
import { GeistMono } from 'geist/font/mono';
import { Navbar } from './components/nav';
import { Footer } from './components/footer';
import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/next';
import { SandpackCSS } from './blog/[slug]/sandpack';
import { CriticalCSS } from './components/critical-css';
import { AVATAR_VERSION } from '../lib/version';

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
  other: {
    'dns-prefetch': 'https://cdn.vercel-insights.com https://vercel.live https://va.vercel-scripts.com https://static.cloudflareinsights.com https://api.resend.com',
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
        <CriticalCSS />
        <SandpackCSS />
        <link rel="preload" href={`/images/home/avatar-${AVATAR_VERSION}.webp`} as="image" type="image/webp" />
        <link rel="preload" href="/sprite.svg" as="image" type="image/svg+xml" />
        <script dangerouslySetInnerHTML={{
          __html: `
            // Add preconnect hints dynamically
            ['https://cdn.vercel-insights.com','https://vercel.live','https://va.vercel-scripts.com','https://static.cloudflareinsights.com','https://api.resend.com'].forEach(function(url){
              var link = document.createElement('link');
              link.rel = 'preconnect';
              link.href = url;
              document.head.appendChild(link);
            });
            // Load CSS asynchronously
            var cssLink = document.createElement('link');
            cssLink.rel = 'stylesheet';
            cssLink.href = '/global.css';
            cssLink.media = 'print';
            cssLink.onload = function(){this.media='all'};
            document.head.appendChild(cssLink);
          `
        }} />
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
