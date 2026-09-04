import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';
import { PAGE_ROUTES, POSTS, prepareContext } from './helpers';

/**
 * axe-core over every route, in both colour schemes.
 *
 * The hand-written assertions in a11y.spec.ts cover the things this repo has
 * decided about on purpose (one h1, a named skip target, aria-current). This
 * file is the broad sweep: contrast, landmark coverage, name/role/value, and
 * everything else axe has a rule for. The two overlap, and that is fine — this
 * one catches the regression nobody thought to write a test for.
 *
 * Chromium only. The rules read the DOM and computed styles, which do not
 * change between engines, so running it five times would cost four times the
 * wall clock for the same answer. The engine-specific behaviour that does
 * matter (WebKit tab order, Firefox scroller focus) is asserted in
 * a11y.spec.ts, which does run everywhere.
 */

const TAGS = [
  'wcag2a',
  'wcag2aa',
  'wcag21a',
  'wcag21aa',
  'wcag22aa',
  'best-practice',
];

// One post with code blocks and one with a diagram, rather than all sixteen:
// the post template is identical, so the extra fourteen runs prove nothing.
const POST_ROUTES = [
  POSTS[0].slug,
  ...POSTS.slice(1, 3).map((p) => p.slug),
].map((slug) => `/blog/${slug}`);

const ROUTES = [...PAGE_ROUTES, ...POST_ROUTES];

test.beforeEach(async ({ context, baseURL }) => {
  await prepareContext(context, baseURL);
});

/** Renders a failure that names the rule, the page and the offending markup. */
function formatViolations(
  violations: Awaited<ReturnType<AxeBuilder['analyze']>>['violations'],
) {
  return violations
    .map(
      (v) =>
        `${v.id} (${v.impact}) — ${v.help}\n` +
        v.nodes
          .map(
            (n) => `    ${n.target.join(' ')}\n      ${n.html.slice(0, 200)}`,
          )
          .join('\n'),
    )
    .join('\n\n');
}

for (const route of ROUTES) {
  test(`axe finds no violations on ${route}`, async ({ page }, testInfo) => {
    test.skip(
      testInfo.project.name !== 'chromium',
      'axe rules are engine-independent; chromium runs them once',
    );

    await page.goto(route);

    const { violations } = await new AxeBuilder({ page })
      .withTags(TAGS)
      .analyze();

    expect(formatViolations(violations), route).toBe('');
  });
}

test('axe finds no violations in dark mode', async ({ page }, testInfo) => {
  test.skip(
    testInfo.project.name !== 'chromium',
    'axe rules are engine-independent; chromium runs them once',
  );

  // Contrast is the only family of rules that can differ between the two
  // palettes, and it differs on every page, so this walks the same list.
  await page.emulateMedia({ colorScheme: 'dark' });

  for (const route of ROUTES) {
    await page.goto(route);
    const { violations } = await new AxeBuilder({ page })
      .withTags(TAGS)
      .analyze();
    expect(formatViolations(violations), `${route} (dark)`).toBe('');
  }
});

test('axe finds no violations while the cookie banner is up', async ({
  browser,
}, testInfo) => {
  test.skip(
    testInfo.project.name !== 'chromium',
    'axe rules are engine-independent; chromium runs them once',
  );

  // A fresh context: prepareContext answers the banner, and the banner is the
  // point here. It reveals itself two seconds after load.
  const context = await browser.newContext();
  const page = await context.newPage();
  await page.goto('/');
  await expect(page.getByRole('button', { name: /accept/i })).toBeVisible({
    timeout: 10_000,
  });

  // The banner fades in over 700ms, and axe reads the blended colour: measured
  // mid-transition it reports a contrast failure that the settled banner does
  // not have. Wait for the animation to land before measuring anything.
  await page.waitForFunction(() => {
    const el = document.querySelector('section[aria-label="Cookie consent"]');
    return !!el && getComputedStyle(el).opacity === '1';
  });

  const { violations } = await new AxeBuilder({ page })
    .withTags(TAGS)
    .analyze();
  expect(formatViolations(violations), 'cookie banner').toBe('');

  await context.close();
});
