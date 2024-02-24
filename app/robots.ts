export default function robots() {
  return {
    rules: [
      {
        userAgent: '*',
      },
    ],
    sitemap: 'https://ainsworth.dev/sitemap.xml',
    host: 'https://ainsworth.dev',
  };
}
