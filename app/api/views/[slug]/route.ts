import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { getBlogPosts } from '@/lib/content/blog';
import { incrementView } from '@/lib/db/views';

const VIEW_COOKIE_MAX_AGE = 60 * 60 * 24;

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;
  const postExists = getBlogPosts().some((post) => post.slug === slug);

  if (!postExists) {
    return new NextResponse(null, { status: 404 });
  }

  const cookieName = `viewed-${slug}`;
  if (request.cookies.has(cookieName)) {
    return new NextResponse(null, { status: 204 });
  }

  try {
    await incrementView(slug);
  } catch (error) {
    console.error('Failed to increment view count:', error);
    return new NextResponse(null, { status: 503 });
  }

  const response = new NextResponse(null, { status: 204 });
  response.cookies.set(cookieName, '1', {
    httpOnly: true,
    maxAge: VIEW_COOKIE_MAX_AGE,
    path: '/',
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
  });
  return response;
}
