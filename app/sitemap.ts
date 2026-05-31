import { getBlogPosts } from '@/lib/content/blog';

export default async function sitemap() {
  const blogs = getBlogPosts().map((post) => ({
    url: `https://ainsworth.dev/blog/${post.slug}`,
    lastModified: post.metadata.publishedAt,
  }));

  const routes = ['', '/blog', '/work', '/contact', '/privacy', '/uses'].map(
    (route) => ({
      url: `https://ainsworth.dev${route}`,
      lastModified: new Date().toISOString().split('T')[0],
    }),
  );

  return [...routes, ...blogs];
}
