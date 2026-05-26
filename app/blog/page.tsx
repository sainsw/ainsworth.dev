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
  let allBlogs = getBlogPosts().sort((a, b) => {
    if (new Date(a.metadata.publishedAt) > new Date(b.metadata.publishedAt)) {
      return -1;
    }
    return 1;
  });
  const isTest = process.env.NODE_ENV === 'test';

  return (
    <section>
      <h1 className="font-medium text-2xl mb-8 tracking-tighter">
        read my blog
      </h1>
      {isTest ? (
        allBlogs.map((post) => <BlogRow key={post.slug} post={post} />)
      ) : (
        <Suspense fallback={allBlogs.map((post) => <BlogRow key={post.slug} post={post} />)}>
          <BlogListWithViews allBlogs={allBlogs} />
        </Suspense>
      )}
    </section>
  );
}

function BlogRow({
  post,
  allViews,
}: {
  post: { slug: string; metadata: { title: string } };
  allViews?: { slug: string; count: number }[];
}) {
  return (
    <Link
      key={post.slug}
      className="flex flex-col space-y-1 mb-4 group"
      href={`/blog/${post.slug}`}
    >
      <div className="w-full flex flex-col">
        <p className="text-foreground tracking-tight group-hover:text-muted-foreground transition-colors">
          {post.metadata.title}
        </p>
        {allViews ? (
          <ViewCounter allViews={allViews} slug={post.slug} />
        ) : (
          <p className="h-6" data-testid="views-fallback" />
        )}
      </div>
    </Link>
  );
}

async function BlogListWithViews({
  allBlogs,
}: {
  allBlogs: { slug: string; metadata: { title: string } }[];
}) {
  try {
    let views = await getViewsCount();
    return allBlogs.map((post) => (
      <BlogRow key={post.slug} post={post} allViews={views} />
    ));
  } catch (error) {
    console.error('Failed to load view count:', error);
    return allBlogs.map((post) => <BlogRow key={post.slug} post={post} />);
  }
}
