import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { Suspense } from 'react';
import { BlogContent } from '@/components/blog-content';
import { ViewTracker } from '@/components/view-tracker';
import { getBlogPost, getBlogPosts } from '@/lib/content/blog';
import { postJsonLd, postMetadata } from '@/lib/content/post-links';
import { formatLongDate, formatRelativeDate } from '@/lib/date';
import { getViewCount } from '@/lib/views';
import ViewCounter from '../view-counter';

// Render as ISR, not fully static. The page is still prerendered and CDN-cached
// (so bfcache stays intact — that is why `connection()` was removed), but it now
// regenerates at most once a minute and re-reads the view count. Without this
// the count is frozen at build time and only moves on redeploy.
export const revalidate = 60;

export async function generateStaticParams() {
  return getBlogPosts().map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata | undefined> {
  const { slug } = await params;
  const post = getBlogPost(slug);
  return post ? postMetadata(post) : undefined;
}

function FormattedDate({ date }: { date: string }) {
  return (
    <p className="text-sm text-muted-foreground">
      {formatLongDate(date)} ({formatRelativeDate(date)})
    </p>
  );
}

export default async function Blog({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = getBlogPost(slug);

  if (!post) {
    notFound();
  }

  return (
    <section>
      <script
        type="application/ld+json"
        suppressHydrationWarning
        dangerouslySetInnerHTML={{ __html: JSON.stringify(postJsonLd(post)) }}
      />
      <h1 className="title font-medium text-2xl tracking-tighter max-w-[650px]">
        {post.metadata.title}
      </h1>
      <div className="flex justify-between items-center mt-2 mb-8 text-sm max-w-[650px]">
        <Suspense fallback={<p className="h-5" />}>
          <FormattedDate date={post.metadata.publishedAt} />
        </Suspense>
        <Suspense fallback={<p className="h-5" />}>
          <Views slug={post.slug} />
        </Suspense>
      </div>
      <article className="prose prose-quoteless dark:prose-invert">
        <BlogContent source={post.content} />
      </article>
      <ViewTracker slug={post.slug} />
    </section>
  );
}

async function Views({ slug }: { slug: string }) {
  const count = await getViewCount(slug);
  // A null count means the counter is down; say nothing rather than "0 views".
  return count === null ? null : <ViewCounter count={count} />;
}
