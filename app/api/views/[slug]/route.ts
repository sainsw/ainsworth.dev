import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { getBlogPost } from '@/lib/content/blog';
import { recordView } from '@/lib/views';

const VIEW_COOKIE_MAX_AGE = 60 * 60 * 24;

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;
  if (!getBlogPost(slug)) {
    return new NextResponse(null, { status: 404 });
  }

  const cookieName = `viewed-${slug}`;
  if (request.cookies.has(cookieName)) {
    return new NextResponse(null, { status: 204 });
  }

  if ((await recordView(slug)) === 'unavailable') {
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
