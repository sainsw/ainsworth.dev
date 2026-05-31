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
});
