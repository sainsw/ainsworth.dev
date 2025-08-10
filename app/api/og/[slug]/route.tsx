import { ImageResponse } from 'next/og';
import type { NextRequest } from 'next/server';
import { getBlogPosts } from 'app/db/blog';

// Use Node.js runtime since we read MDX via fs in getBlogPosts
export const runtime = 'nodejs';

export async function GET(
  _req: NextRequest,
  { params }: { params: { slug: string } }
) {
  const all = getBlogPosts();
  const post = all.find((p) => p.slug === params.slug);

  if (!post) {
    return new Response('Not found', { status: 404 });
  }

  const { title, summary, publishedAt } = post.metadata;

  // Basic, legible card per article description
  return new ImageResponse(
    (
      <div
        style={{
          width: 1200,
          height: 630,
          display: 'flex',
          flexDirection: 'column',
          padding: 64,
          gap: 28,
          background: '#0b1220',
          color: '#e5e7eb',
        }}
      >
        <div
          style={{
            fontSize: 56,
            lineHeight: 1.05,
            letterSpacing: -0.5,
            maxWidth: 1000,
            whiteSpace: 'pre-wrap',
          }}
        >
          {title}
        </div>
        <div style={{ fontSize: 28, opacity: 0.9, maxWidth: 960 }}>{summary}</div>
        <div style={{ marginTop: 'auto', fontSize: 24, opacity: 0.8 }}>
          {new Date(publishedAt).toLocaleDateString('en-GB', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
          })}
        </div>
      </div>
    ),
    { width: 1200, height: 630 }
  );
}

