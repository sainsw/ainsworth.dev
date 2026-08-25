import { ImageResponse } from 'next/og';
import { currentJobTitle, fullName } from '@/lib/bio';

// Sibling to /api/og/[slug], which cards a single post. This one cards the
// site, for the routes that are not posts: home, blog index, work, contact,
// privacy. Those pages had no og:image at all, so a shared link rendered as a
// bare text stub.
//
// Deliberately takes no query parameters. A ?title= would make this an open
// text-rendering endpoint that anyone could point at anything, and there are
// only five pages to serve.

export async function GET() {
  return new ImageResponse(
    <div
      style={{
        width: 1200,
        height: 630,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        padding: 64,
        gap: 24,
        // Matches the post card so the two read as one set.
        background: '#0b1220',
        color: '#e5e7eb',
      }}
    >
      <div style={{ fontSize: 72, lineHeight: 1.05, letterSpacing: -1 }}>
        {fullName}
      </div>
      <div style={{ fontSize: 34, opacity: 0.9 }}>{currentJobTitle}</div>
      <div style={{ marginTop: 'auto', fontSize: 26, opacity: 0.75 }}>
        ainsworth.dev
      </div>
    </div>,
    { width: 1200, height: 630 },
  );
}
