import postgres from 'postgres';

export const sql = postgres(process.env.DATABASE_URL, {
  ssl: 'allow',
});

let withBundleAnalyzer = (config) => config;
if (process.env.ANALYZE === 'true') {
  const { default: bundleAnalyzer } = await import('@next/bundle-analyzer');
  withBundleAnalyzer = bundleAnalyzer({ enabled: true });
}

const nextConfig = {
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
  async redirects() {
    if (!process.env.DATABASE_URL) {
      return [];
    }

    let redirects = await sql`
      SELECT source, destination, permanent
      FROM redirects;
    `;

    return redirects.map(({ source, destination, permanent }) => ({
      source,
      destination,
      permanent: !!permanent,
    }));
  },
  async headers() {
    return [
      {
        source: '/images/:path*',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=31536000, immutable' },
        ],
      },
      {
        source: '/sprite.svg',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=31536000, immutable' },
        ],
      },
      {
        source: '/_next/static/:path*',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=31536000, immutable' },
        ],
      },
      {
        source: '/fonts/:path*',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=31536000, immutable' },
        ],
      },
      {
        source: '/files/cv-:version.pdf',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=31536000, immutable' }, // 1 year for versioned files
        ],
      },
      {
        source: '/files/:path*',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=86400, must-revalidate' }, // 24 hours for non-versioned files
        ],
      },
      {
        source: '/(.*)',
        headers: securityHeaders,
      },
    ];
  },
};

const unsafeEvalSource = process.env.NODE_ENV === 'development' ? " 'unsafe-eval'" : '';

const ContentSecurityPolicy = `
    default-src 'self' vercel.live;
    script-src 'self'${unsafeEvalSource} 'unsafe-inline' cdn.vercel-insights.com vercel.live va.vercel-scripts.com static.cloudflareinsights.com challenges.cloudflare.com;
    style-src 'self' 'unsafe-inline';
    img-src * blob: data:;
    media-src 'none';
    connect-src *;
    font-src 'self' data:;
    frame-src 'self' *.codesandbox.io vercel.live challenges.cloudflare.com;
`;

const securityHeaders = [
  {
    key: 'Content-Security-Policy',
    value: ContentSecurityPolicy.replace(/\n/g, ''),
  },
  {
    key: 'Referrer-Policy',
    value: 'origin-when-cross-origin',
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
