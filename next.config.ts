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
  cacheComponents: true,
  experimental: {
    inlineCss: true,
  },
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },
  images: {
    formats: ['image/webp', 'image/avif'],
    minimumCacheTTL: 31536000, // 1 year
    dangerouslyAllowSVG: false,
  },
  async headers() {
    // ORDER MATTERS. Every matching rule is applied in turn, so for a repeated
    // key the LAST match wins. The broad directory rules must therefore come
    // first and the content-hashed exceptions after them — reversing this
    // silently downgrades the hashed assets to the 24h default.
    return [
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
        // Content-hashed by scripts/fetch-avatar.js — safe to keep forever.
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
        source: '/files/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=86400, must-revalidate',
          }, // 24 hours for non-versioned files
        ],
      },
      {
        // Content-hashed by scripts/build-cv.sh — safe to keep forever.
        source: '/files/cv-:version.pdf',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          }, // 1 year for versioned files
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
    script-src 'self'${unsafeEvalSource} 'unsafe-inline' cdn.vercel-insights.com vercel.live va.vercel-scripts.com challenges.cloudflare.com;
    style-src 'self' 'unsafe-inline';
    img-src 'self' data: blob: vercel.live;
    media-src 'none';
    connect-src 'self' vitals.vercel-insights.com vercel.live cdn.vercel-insights.com va.vercel-scripts.com challenges.cloudflare.com;
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
  /**
   * Content Signals, the HTTP form. Cloudflare's Managed robots.txt already
   * emits the robots.txt form of this on our behalf; this header states the
   * same policy on every response, including ones nobody read robots.txt for.
   *
   * The header name is singular (`Content-Signal`). It was `Content-Signals`
   * until 2026-08-25, which matched no spec and so said nothing to anybody.
   *
   * `ai-input=yes` is the load-bearing one and was the piece missing before:
   * it covers grounding a generative answer in the page, which is the thing
   * that produces a citation. Saying nothing is not the same as saying yes, so
   * the omission read as "no preference" on the one use the site wants.
   * Declaring it next to `ai-train=no` is the whole position in one line: read
   * my work to answer questions, don't train on it.
   *
   * Google has said no crawler currently acts on these, so treat it as a
   * declaration of intent rather than an enforcement mechanism.
   */
  {
    key: 'Content-Signal',
    value: 'search=yes, ai-input=yes, ai-train=no, use=reference',
  },
];

export default withBundleAnalyzer(nextConfig);
