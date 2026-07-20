import { readdirSync } from 'node:fs';
import { join } from 'node:path';
import { expect, test } from '@playwright/test';
import resumeData from '@/data/resume.json';
import { AVATAR_VERSION, CV_VERSION, SPRITE_VERSION } from '@/lib/version';

// The site references these by content hash, so a stale or missing file shows up
// as a broken icon or a dead CV link rather than a build failure.

// components/icon.tsx routes a few ids to standalone image files; everything
// else resolves through <use href="/sprite.svg#id"> and must exist as a symbol.
const NON_SPRITE_ICON_IDS = new Set([
  'westhill', // PNG_LOGOS
  'whsmith', // PNG_LOGOS
  'uol', // THEME_SVG_LOGOS
  'dotnet', // BRAND_COLOR_LOGOS
  'azure', // BRAND_COLOR_LOGOS
]);

const spriteIconIds = [
  // Inline tech badges on the home page.
  'ibm',
  'react',
  // Company and school logos on the work page.
  ...[...resumeData.experience, ...resumeData.education].map((e) => e.iconId),
].filter((id) => !NON_SPRITE_ICON_IDS.has(id));

test('the sprite defines a symbol for every icon the site renders', async ({
  request,
}) => {
  const res = await request.get(`/sprite.svg?v=${SPRITE_VERSION}`);
  expect(res.status()).toBe(200);
  expect(res.headers()['content-type'] || '').toContain('image/svg+xml');

  const body = await res.text();
  const defined = new Set(
    [...body.matchAll(/<symbol\b[^>]*\bid="([^"]+)"/g)].map((m) => m[1]),
  );

  expect(defined.size).toBeGreaterThan(0);
  for (const id of new Set(spriteIconIds)) {
    // A missing symbol renders an invisible icon rather than failing the build.
    expect(defined, `sprite symbol #${id}`).toContain(id);
  }
});

test('the hashed avatar is served in both formats', async ({ request }) => {
  const webp = await request.get(`/images/home/avatar-${AVATAR_VERSION}.webp`);
  expect(webp.status()).toBe(200);
  expect(webp.headers()['content-type'] || '').toContain('image/webp');

  const jpg = await request.get(`/images/home/avatar-${AVATAR_VERSION}.jpg`);
  expect(jpg.status()).toBe(200);
  expect(jpg.headers()['content-type'] || '').toContain('image/jpeg');
});

test('the hashed CV PDF is served', async ({ request }) => {
  const res = await request.get(`/files/cv-${CV_VERSION}.pdf`);
  expect(res.status()).toBe(200);
  expect(res.headers()['content-type'] || '').toContain('application/pdf');

  const body = await res.body();
  expect(body.subarray(0, 5).toString()).toBe('%PDF-');
});

test('every logo asset referenced from public/ is reachable', async ({
  request,
}) => {
  const logos = readdirSync(join(process.cwd(), 'public', 'images', 'logos'));
  expect(logos.length).toBeGreaterThan(0);

  for (const file of logos) {
    const res = await request.get(`/images/logos/${file}`);
    expect(res.status(), file).toBe(200);
  }
});

test('the favicon is served', async ({ request }) => {
  const res = await request.get('/favicon.ico');
  expect(res.status()).toBe(200);
  expect(res.headers()['content-type'] || '').toMatch(/icon|image/);
});
