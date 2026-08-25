import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Suspense } from 'react';
import { BlogContent } from '@/components/blog-content';
import { ViewTracker } from '@/components/view-tracker';
import { fullName } from '@/lib/bio';
import { getBlogPost, getBlogPosts } from '@/lib/content/blog';
import {
  breadcrumbJsonLd,
  postJsonLd,
  postMetadata,
} from '@/lib/content/post-links';
import { formatLongDate } from '@/lib/date';
import { getViewCount } from '@/lib/views';
import { RelativeDate } from '../relative-date';
import ViewCounter from '../view-counter';

// No route-segment config: `cacheComponents` rejects `export const revalidate`
// at build time. Freshness moved to the read itself, which has a 60s window of
// its own; see lib/views-cache.ts. Without a window somewhere the count freezes
// at build time and only moves on redeploy.
//
// The page is still prerendered and CDN-cached, and must stay that way: bfcache
// is why `connection()` was removed. Do not reintroduce anything that opts this
// route into fully dynamic rendering.

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

function FormattedDate({ date, updated }: { date: string; updated?: string }) {
  return (
    <p className="text-sm text-muted-foreground">
      {formatLongDate(date)} (<RelativeDate date={date} />)
      {updated ? (
        <>
          {' · updated '}
          <RelativeDate date={updated} />
        </>
      ) : null}
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
        dangerouslySetInnerHTML={{
          __html: JSON.stringify([
            postJsonLd(post),
            breadcrumbJsonLd([
              { name: 'Blog', path: '/blog' },
              { name: post.metadata.title, path: `/blog/${post.slug}` },
            ]),
          ]),
        }}
      />
      <h1 className="title font-medium text-2xl tracking-tighter max-w-[650px]">
        {post.metadata.title}
      </h1>
      <div className="flex justify-between items-center mt-2 mb-8 text-sm max-w-[650px]">
        <Suspense fallback={<p className="h-5" />}>
          <FormattedDate
            date={post.metadata.publishedAt}
            updated={post.metadata.updatedAt}
          />
        </Suspense>
        <Suspense fallback={<p className="h-5" />}>
          <Views slug={post.slug} />
        </Suspense>
      </div>
      <article className="prose prose-quoteless dark:prose-invert">
        <BlogContent source={post.content} />
      </article>
      {/*
        The author was asserted in the JSON-LD and stated nowhere a reader could
        see it. On a single-author site that feels redundant from the inside,
        but a visible byline is what both E-E-A-T and entity resolution want
        attached to the writing.
      */}
      <p className="mt-10 pt-6 border-t border-border text-sm text-muted-foreground">
        Written by{' '}
        <Link href="/work" className="text-foreground hover:underline">
          {fullName}
        </Link>
        .
      </p>
      <ViewTracker slug={post.slug} />
    </section>
  );
}

async function Views({ slug }: { slug: string }) {
  const count = await getViewCount(slug);
  // A null count means the counter is down; say nothing rather than "0 views".
  return count === null ? null : <ViewCounter count={count} />;
}
