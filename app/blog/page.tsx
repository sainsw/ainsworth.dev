import { Suspense } from 'react';
import { getBlogPosts, sortByPublishedAt } from '@/lib/content/blog';
import { blogIndexJsonLd, breadcrumbJsonLd } from '@/lib/content/post-links';
import { pageMetadata } from '@/lib/page-metadata';
import { getViewCounts } from '@/lib/views';
import { BlogRow, type BlogRowPost } from './blog-row';

export const metadata = pageMetadata({
  title: 'Blog',
  description:
    'Notes on software development, side projects, and the things I learn building them.',
  path: '/blog',
});

// No route-segment config: `cacheComponents` rejects `export const revalidate`
// at build time. The counts stay fresh because the read behind them has its own
// cache window; see lib/views-cache.ts.

export default function BlogPage() {
  const allBlogs = sortByPublishedAt(getBlogPosts());

  return (
    <section>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify([
            blogIndexJsonLd(allBlogs),
            breadcrumbJsonLd([{ name: 'Blog', path: '/blog' }]),
          ]),
        }}
      />
      <h1 className="font-medium text-2xl mb-8 tracking-tighter">
        read my blog
      </h1>
      {/* The titles paint immediately; only the counts wait on the database. */}
      <Suspense
        fallback={allBlogs.map((post) => (
          <BlogRow key={post.slug} post={post} />
        ))}
      >
        <BlogListWithViews allBlogs={allBlogs} />
      </Suspense>
    </section>
  );
}

async function BlogListWithViews({ allBlogs }: { allBlogs: BlogRowPost[] }) {
  const counts = await getViewCounts(allBlogs.map((post) => post.slug));
  return allBlogs.map((post) => (
    <BlogRow
      key={post.slug}
      post={post}
      viewCount={counts.get(post.slug) ?? null}
    />
  ));
}
