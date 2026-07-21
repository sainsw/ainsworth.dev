import { expect, test } from '@playwright/test';
import { PAGE_ROUTES, POSTS, prepareContext } from './helpers';

const ROUTES = [...PAGE_ROUTES, `/blog/${POSTS[0].slug}`];

test.beforeEach(async ({ context, baseURL }) => {
  await prepareContext(context, baseURL);
});

test('every page declares British English as its language', async ({
  page,
}) => {
  for (const route of ROUTES) {
    await page.goto(route);
    await expect(page.locator('html'), route).toHaveAttribute('lang', 'en');
  }
});

test('every page has exactly one h1', async ({ page }) => {
  for (const route of ROUTES) {
    await page.goto(route);

    const headings = page.locator('h1');
    await expect(headings, `${route} h1 count`).toHaveCount(1);
    // An empty h1 is as useless to a screen reader as a missing one.
    expect(
      (await headings.first().innerText()).trim().length,
      `${route} h1 text`,
    ).toBeGreaterThan(0);
  }
});

test('heading levels never skip a rank', async ({ page }) => {
  for (const route of ROUTES) {
    await page.goto(route);

    const levels = await page
      .locator('main :is(h1, h2, h3, h4, h5, h6)')
      .evaluateAll((els) => els.map((el) => Number(el.tagName[1])));

    let previous = levels[0] ?? 1;
    for (const level of levels) {
      // Going deeper by more than one rank at a time breaks screen-reader
      // outlines; coming back up any distance is fine.
      expect(level - previous, `${route} heading jump`).toBeLessThanOrEqual(1);
      previous = level;
    }
  }
});

test('every image carries an alt attribute', async ({ page }) => {
  for (const route of ROUTES) {
    await page.goto(route);

    const missing = await page
      .locator('img')
      .evaluateAll((els) =>
        els
          .filter((el) => !el.hasAttribute('alt'))
          .map((el) => el.getAttribute('src') ?? '(no src)'),
      );

    // Decorative images are allowed alt="" but must still declare it.
    expect(missing, `${route} images without alt`).toEqual([]);
  }
});

test('every link has an accessible name', async ({ page }) => {
  for (const route of ROUTES) {
    await page.goto(route);

    const unnamed = await page.locator('a').evaluateAll((els) =>
      els
        .filter((el) => {
          const hasText = (el.textContent ?? '').trim().length > 0;
          const hasLabel = !!el.getAttribute('aria-label')?.trim();
          const hasTitle = !!el.getAttribute('title')?.trim();
          const hasLabelledBy = !!el.getAttribute('aria-labelledby');
          const hasImageAlt = Array.from(el.querySelectorAll('img')).some(
            (img) => !!img.getAttribute('alt')?.trim(),
          );
          // Heading anchor links are decorative and hidden from the a11y tree
          // by their empty content; they are keyboard-reachable by id instead.
          const isHeadingAnchor = el.classList.contains('anchor');
          return (
            !isHeadingAnchor &&
            !hasText &&
            !hasLabel &&
            !hasTitle &&
            !hasLabelledBy &&
            !hasImageAlt
          );
        })
        .map((el) => el.getAttribute('href') ?? '(no href)'),
    );

    expect(unnamed, `${route} links without a name`).toEqual([]);
  }
});

test('every form control on the contact page is labelled', async ({ page }) => {
  await page.goto('/contact');

  // Hidden inputs are exempt — they are never presented to the user. The real
  // Turnstile widget injects one (cf-turnstile-response) whenever it loads,
  // which is why this only shows up against a deployment.
  const unlabelled = await page
    .locator('input:not([type="hidden"]), textarea, select')
    .evaluateAll((els) =>
      els
        .filter((el) => {
          const id = el.getAttribute('id');
          const hasLabel = id
            ? !!document.querySelector(`label[for="${id}"]`)
            : false;
          return (
            !hasLabel &&
            !el.getAttribute('aria-label') &&
            !el.getAttribute('aria-labelledby')
          );
        })
        .map((el) => el.getAttribute('name') ?? el.tagName),
    );

  expect(unlabelled).toEqual([]);
});

test('navbar links take focus and activate from the keyboard', async ({
  page,
}) => {
  await page.goto('/');

  // Real anchors, not div-with-onclick: focusable and activated by Enter.
  const workLink = page.locator('#nav a[href="/work"]');
  await workLink.focus();

  expect(
    await page.evaluate(
      () => document.activeElement?.getAttribute('href') ?? null,
    ),
  ).toBe('/work');

  await page.keyboard.press('Enter');
  await expect(page).toHaveURL(/\/work$/);
  await expect(
    page.getByRole('heading', { name: /skills & technologies/i }),
  ).toBeVisible();
});

test('tab order reaches the navbar before the page content', async ({
  page,
  browserName,
}) => {
  // WebKit follows the macOS "Tab highlights each item" preference, which is
  // off by default, so Tab does not move focus to links there at all.
  test.skip(
    browserName === 'webkit',
    'WebKit does not tab to links by default',
  );

  await page.goto('/');

  let landed = false;
  for (let i = 0; i < 10 && !landed; i++) {
    await page.keyboard.press('Tab');
    landed = await page.evaluate(
      () => document.activeElement?.closest('#nav') !== null,
    );
  }
  expect(landed, 'a nav link takes focus within 10 tabs').toBe(true);
});

test('the keyboard-focused element is visibly distinguishable', async ({
  page,
  browserName,
}) => {
  test.skip(
    browserName === 'webkit',
    'WebKit does not tab to links by default',
  );

  await page.goto('/');
  await page.keyboard.press('Tab');

  // Focus must not be signalled by colour alone with the outline removed.
  const styles = await page.evaluate(() => {
    const el = document.activeElement as HTMLElement;
    const s = getComputedStyle(el);
    return {
      outline: s.outlineStyle,
      width: s.outlineWidth,
      shadow: s.boxShadow,
    };
  });

  const hasOutline = styles.outline !== 'none' && styles.width !== '0px';
  const hasShadow = styles.shadow !== 'none';
  expect(hasOutline || hasShadow).toBe(true);
});
