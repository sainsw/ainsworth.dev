import bundleAnalyzer from '@next/bundle-analyzer';
import type { NextConfig } from 'next';

// No-op passthrough unless ANALYZE=true (avoids top-level await, which
// next.config.ts does not support).
const withBundleAnalyzer = bundleAnalyzer({
  enabled: process.env.ANALYZE === 'true',
});

const nextConfig: NextConfig = {
  trailingSlash: false,
  pageExtensions: ['js', 'jsx', 'ts', 'tsx'],
  typedRoutes: true,
  experimental: {
    inlineCss: true,
  },
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },
  turbopack: {},
  images: {
    formats: ['image/webp', 'image/avif'],
    minimumCacheTTL: 31536000, // 1 year
    dangerouslyAllowSVG: false,
  },
  async headers() {
    return [
      {
        source: '/images/home/avatar-:version.:extension',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      {
        source: '/sprite.svg',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=86400, must-revalidate',
          },
        ],
      },
      {
        source: '/fonts/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      {
        source: '/images/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=86400, must-revalidate',
          },
        ],
      },
      {
        source: '/files/cv-:version.pdf',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          }, // 1 year for versioned files
        ],
      },
      {
        source: '/files/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=86400, must-revalidate',
          }, // 24 hours for non-versioned files
        ],
      },
      {
        source: '/(.*)',
        headers: securityHeaders,
      },
    ];
  },
};

const unsafeEvalSource =
  process.env.NODE_ENV === 'development' ? " 'unsafe-eval'" : '';

const ContentSecurityPolicy = `
    default-src 'self' vercel.live;
    base-uri 'self';
    form-action 'self';
    frame-ancestors 'none';
    object-src 'none';
    script-src 'self'${unsafeEvalSource} 'unsafe-inline' cdn.vercel-insights.com vercel.live va.vercel-scripts.com static.cloudflareinsights.com challenges.cloudflare.com;
    style-src 'self' 'unsafe-inline';
    img-src 'self' data: blob: vercel.live;
    media-src 'none';
    connect-src 'self' vitals.vercel-insights.com vercel.live cdn.vercel-insights.com va.vercel-scripts.com static.cloudflareinsights.com challenges.cloudflare.com;
    font-src 'self' data:;
    frame-src 'self' vercel.live challenges.cloudflare.com;
`;

const securityHeaders = [
  {
    key: 'Content-Security-Policy',
    value: ContentSecurityPolicy.replace(/\n/g, ''),
  },
  {
    key: 'Referrer-Policy',
    value: 'strict-origin-when-cross-origin',
  },
  {
    key: 'X-Frame-Options',
    value: 'DENY',
  },
  {
    key: 'X-Content-Type-Options',
    value: 'nosniff',
  },
  {
    key: 'X-DNS-Prefetch-Control',
    value: 'on',
  },
  {
    key: 'Strict-Transport-Security',
    value: 'max-age=31536000; includeSubDomains; preload',
  },
  {
    key: 'Permissions-Policy',
    value: 'camera=(), microphone=(), geolocation=()',
  },
  // Express the site's content preferences via HTTP header instead of robots.txt
  {
    key: 'Content-Signals',
    value: 'search=yes, ai-train=no',
  },
];

export default withBundleAnalyzer(nextConfig);
