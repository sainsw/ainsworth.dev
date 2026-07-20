import { getBlogPosts } from '@/lib/content/blog';
import { SITE_URL } from '@/lib/site';

export default async function sitemap() {
  const blogs = getBlogPosts().map((post) => ({
    url: `${SITE_URL}/blog/${post.slug}`,
    lastModified: post.metadata.publishedAt,
  }));

  const routes = ['', '/blog', '/work', '/contact', '/privacy'].map(
    (route) => ({
      url: `${SITE_URL}${route}`,
      lastModified: new Date().toISOString().split('T')[0],
    }),
  );

  return [...routes, ...blogs];
}
