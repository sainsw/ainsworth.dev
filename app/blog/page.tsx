import { Suspense } from 'react';
import { getBlogPosts, sortByPublishedAt } from '@/lib/content/blog';
import { getViewCounts } from '@/lib/views';
import { type BlogRowPost, BlogRow } from './blog-row';

export const metadata = {
  title: 'Blog',
  description:
    'Notes on software development, side projects, and the things I learn building them.',
};

// ISR so the per-row view counts refresh; see app/blog/[slug]/page.tsx.
export const revalidate = 60;

export default function BlogPage() {
  const allBlogs = sortByPublishedAt(getBlogPosts());

  return (
    <section>
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
