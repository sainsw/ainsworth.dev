import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { connection } from 'next/server';
import { Suspense } from 'react';
import { BlogContent } from '@/components/blog-content';
import { ViewTracker } from '@/components/view-tracker';
import { getBlogPosts } from '@/lib/content/blog';
import { formatLongDate, formatRelativeDate } from '@/lib/date';
import { getViewsCount } from '@/lib/db/queries';
import { SITE_NAME, SITE_URL } from '@/lib/site';
import ViewCounter from '../view-counter';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata | undefined> {
  const { slug } = await params;
  const post = getBlogPosts().find((post) => post.slug === slug);
  if (!post) {
    return;
  }

  const {
    title,
    publishedAt: publishedTime,
    summary: description,
    image,
  } = post.metadata;
  const ogImage = image
    ? `${SITE_URL}${image}`
    : `${SITE_URL}/api/og/${post.slug}`;

  return {
    title,
    description,
    alternates: {
      canonical: `${SITE_URL}/blog/${post.slug}`,
    },
    openGraph: {
      title,
      description,
      type: 'article',
      publishedTime,
      url: `${SITE_URL}/blog/${post.slug}`,
      images: [
        {
          url: ogImage,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [ogImage],
    },
  };
}

async function formatDate(date: string) {
  await connection();
  return `${formatLongDate(date)} (${formatRelativeDate(date)})`;
}

async function FormattedDate({ date }: { date: string }) {
  return (
    <p className="text-sm text-muted-foreground">{await formatDate(date)}</p>
  );
}

export default async function Blog({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = getBlogPosts().find((post) => post.slug === slug);

  if (!post) {
    notFound();
  }

  return (
    <section>
      <script
        type="application/ld+json"
        suppressHydrationWarning
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'BlogPosting',
            headline: post.metadata.title,
            datePublished: post.metadata.publishedAt,
            dateModified: post.metadata.publishedAt,
            description: post.metadata.summary,
            image: post.metadata.image
              ? `${SITE_URL}${post.metadata.image}`
              : `${SITE_URL}/api/og/${post.slug}`,
            url: `${SITE_URL}/blog/${post.slug}`,
            author: {
              '@type': 'Person',
              name: SITE_NAME,
            },
          }),
        }}
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
  try {
    const views = await getViewsCount();
    return <ViewCounter allViews={views} slug={slug} />;
  } catch (error) {
    console.error('Failed to load view count:', error);
    // Return empty view counter if database fails
    return <ViewCounter allViews={[]} slug={slug} />;
  }
}
