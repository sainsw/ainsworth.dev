import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';

vi.mock('@vercel/speed-insights/next', () => ({
  SpeedInsights: () => React.createElement('div', { 'data-testid': 'speed' }),
}));

describe('RootLayout', () => {
  it('renders children, navbar, and cookie banner, and preloads assets', async () => {
    vi.resetModules();
    vi.doMock('geist/font/sans', () => ({
      GeistSans: { variable: 'geist-sans' },
    }));
    vi.doMock('geist/font/mono', () => ({
      GeistMono: { variable: 'geist-mono' },
    }));
    vi.doMock('@/components/footer', () => ({
      Footer: () => React.createElement('footer', { 'data-testid': 'footer' }),
    }));
    vi.doMock('@/components/cookie-banner', () => ({
      CookieConsent: () =>
        React.createElement('div', { 'data-testid': 'cookie-banner' }),
    }));
    vi.doMock('../app/tw.css', () => ({}));
    vi.doMock('../app/global.css', () => ({}));
    const RootLayout = (await import('../app/layout')).default;
    const markup = renderToStaticMarkup(
      <RootLayout>
        <div data-testid="child">content</div>
      </RootLayout>,
    );
    document.open();
    document.write(`<!doctype html>${markup}`);
    document.close();

    // Child content present
    expect(document.querySelector('[data-testid="child"]')).not.toBeNull();

    // Navbar link present
    expect(document.querySelector('a[href="/"]')).not.toBeNull();

    // Cookie banner wiring is present; banner behavior has dedicated tests
    expect(
      document.querySelector('[data-testid="cookie-banner"]'),
    ).not.toBeNull();

    // Preload links in <head>
    const spritePreload = document.querySelector(
      'link[rel="preload"][href="/sprite.svg"]',
    );
    expect(spritePreload).not.toBeNull();
    // Avatar preload is now scoped to the Home page only
  });

  it('exposes a skip link, a banner header and a labelled main', async () => {
    vi.resetModules();
    vi.doMock('geist/font/sans', () => ({
      GeistSans: { variable: 'geist-sans' },
    }));
    vi.doMock('geist/font/mono', () => ({
      GeistMono: { variable: 'geist-mono' },
    }));
    vi.doMock('@/components/footer', () => ({
      Footer: () => React.createElement('footer', { 'data-testid': 'footer' }),
    }));
    vi.doMock('@/components/cookie-banner', () => ({
      CookieConsent: () =>
        React.createElement('div', { 'data-testid': 'cookie-banner' }),
    }));
    vi.doMock('../app/tw.css', () => ({}));
    vi.doMock('../app/global.css', () => ({}));
    const RootLayout = (await import('../app/layout')).default;
    const markup = renderToStaticMarkup(
      <RootLayout>
        <div data-testid="child">content</div>
      </RootLayout>,
    );
    document.open();
    document.write(`<!doctype html>${markup}`);
    document.close();

    const skip = document.querySelector('a[href="#main-content"]');
    expect(skip?.textContent).toBe('Skip to content');

    const main = document.querySelector('main#main-content');
    expect(main).not.toBeNull();

    // A <header> nested inside <main> is not a banner landmark, which is the
    // whole reason <main> stopped wrapping the nav.
    const header = document.querySelector('header');
    expect(header).not.toBeNull();
    expect(header?.closest('main')).toBeNull();
    expect(main?.querySelector('[data-testid="child"]')).not.toBeNull();
  });

  it('advertises the feed and llms.txt, and prefetches over https', async () => {
    vi.resetModules();
    vi.doMock('geist/font/sans', () => ({
      GeistSans: { variable: 'geist-sans' },
    }));
    vi.doMock('geist/font/mono', () => ({
      GeistMono: { variable: 'geist-mono' },
    }));
    vi.doMock('@/components/footer', () => ({ Footer: () => null }));
    vi.doMock('@/components/cookie-banner', () => ({
      CookieConsent: () => null,
    }));
    vi.doMock('../app/tw.css', () => ({}));
    vi.doMock('../app/global.css', () => ({}));
    const RootLayout = (await import('../app/layout')).default;
    const markup = renderToStaticMarkup(
      <RootLayout>
        <div />
      </RootLayout>,
    );

    expect(markup).toContain('rel="alternate"');
    expect(markup).toContain('href="/rss.xml"');
    expect(markup).toContain('rel="llms"');
    expect(markup).toContain('href="/llms.txt"');
    // Protocol-relative would resolve to whatever scheme served the page.
    expect(markup).toContain('rel="dns-prefetch" href="https://ainsworth.dev"');
    expect(markup).not.toContain('href="//ainsworth.dev"');
  });
});
