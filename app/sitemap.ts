import { getBlogPosts } from '@/lib/content/blog';
import { postUrl } from '@/lib/content/post-links';
import { SITE_URL } from '@/lib/site';

export default async function sitemap() {
  const blogs = getBlogPosts().map((post) => ({
    url: postUrl(post),
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
