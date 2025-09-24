import Link from 'next/link';
import { Suspense } from 'react';
import ViewCounter from './view-counter';
import { getViewsCount } from 'app/db/queries';
import { getBlogPosts } from 'app/db/blog';

export const metadata = {
  title: 'Blog',
  description: 'Read my thoughts on software development, design, and more.',
};

export default function BlogPage() {
  let allBlogs = getBlogPosts();
  const isTest = process.env.NODE_ENV === 'test';

  return (
    <section>
      <h1 className="font-medium text-2xl mb-8 tracking-tighter">
        read my blog
      </h1>
      {allBlogs
        .sort((a, b) => {
          if (
            new Date(a.metadata.publishedAt) > new Date(b.metadata.publishedAt)
          ) {
            return -1;
          }
          return 1;
        })
        .map((post) => (
          <Link
            key={post.slug}
            className="flex flex-col space-y-1 mb-4"
            href={`/blog/${post.slug}`}
          >
            <div className="w-full flex flex-col">
              <p className="text-neutral-900 dark:text-neutral-100 tracking-tight">
                {post.metadata.title}
              </p>
              {isTest ? (
                <p className="h-6" data-testid="views-fallback" />
              ) : (
                <Suspense fallback={<p className="h-6" />}>
                  <Views slug={post.slug} />
                </Suspense>
              )}
            </div>
          </Link>
        ))}
    </section>
  );
}

// Async component to fetch and display view counts
async function Views({ slug }: { slug: string }) {
  try {
    let views = await getViewsCount();
    return <ViewCounter allViews={views} slug={slug} />;
  } catch (error) {
    console.error('Failed to load view count:', error);
    // Return empty view counter if database fails
    return <ViewCounter allViews={[]} slug={slug} />;
  }
}
