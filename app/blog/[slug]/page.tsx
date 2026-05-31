import type { Metadata } from 'next';
import { Suspense, cache } from 'react';
import { notFound } from 'next/navigation';
import { BlogContent } from '@/components/blog-content';
import { getViewsCount } from 'app/db/queries';
import { getBlogPosts } from 'app/db/blog';
import ViewCounter from '../view-counter';
import { increment } from 'app/db/actions';
import { connection } from 'next/server';
import { ReactDebug } from '@/components/react-debug';
import { SandpackCSS } from './sandpack';
import { formatRelativeDate } from '@/lib/date';

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
    ? `https://ainsworth.dev${image}`
    : `https://ainsworth.dev/api/og/${post.slug}`;

  return {
    title,
    description,
    alternates: {
      canonical: `https://ainsworth.dev/blog/${post.slug}`,
    },
    openGraph: {
      title,
      description,
      type: 'article',
      publishedTime,
      url: `https://ainsworth.dev/blog/${post.slug}`,
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
  const targetDate = new Date(date.includes('T') ? date : `${date}T00:00:00`);
  const formattedDate = formatRelativeDate(date);

  const fullDate = targetDate.toLocaleString('en-us', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });

  return `${fullDate} (${formattedDate})`;
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
      {/* Inject Sandpack styles only on blog posts that may use it */}
      <SandpackCSS />
      <ReactDebug />
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
              ? `https://ainsworth.dev${post.metadata.image}`
              : `https://ainsworth.dev/api/og/${post.slug}`,
            url: `https://ainsworth.dev/blog/${post.slug}`,
            author: {
              '@type': 'Person',
              name: 'Sam Ainsworth',
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
    </section>
  );
}

const incrementViews = cache(increment);

async function Views({ slug }: { slug: string }) {
  try {
    const views = await getViewsCount();
    incrementViews(slug);
    return <ViewCounter allViews={views} slug={slug} />;
  } catch (error) {
    console.error('Failed to load view count:', error);
    // Return empty view counter if database fails
    return <ViewCounter allViews={[]} slug={slug} />;
  }
}
