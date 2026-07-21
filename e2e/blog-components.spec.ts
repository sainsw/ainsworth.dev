import { expect, test } from '@playwright/test';
import { POSTS_WITH_CODE, POSTS_WITH_MERMAID, prepareContext } from './helpers';

// Posts exercising the custom renderers in components/blog-content.tsx:
//   - api-design: heading anchors + sugar-high syntax highlighting + mermaid
//   - seasonal-avatar-borders: the <avatar-demo /> custom element

test.beforeEach(async ({ context, baseURL }) => {
  await prepareContext(context, baseURL);
});

test('code-heavy post renders anchors, highlighted code, and mermaid', async ({
  page,
}) => {
  await page.goto('/blog/api-design');

  // Heading anchors: addHeadingAnchors() prepends <a class="anchor"> to each h2+
  const anchors = page.locator('h2 > a.anchor, h3 > a.anchor');
  expect(await anchors.count()).toBeGreaterThan(0);
  await expect(anchors.first()).toHaveAttribute('href', /^#/);

  // Sugar-high wraps tokens with class="sh__line" / "sh__token--*"
  await expect(page.locator('.sh__line').first()).toBeVisible();

  // Mermaid renders one SVG per diagram once the module loads;
  // this post has multiple, so wait for at least one and count from there.
  const mermaidSvg = page.locator('svg[id^="mermaid"]');
  await expect(mermaidSvg.first()).toBeVisible({ timeout: 15000 });
  expect(await mermaidSvg.count()).toBeGreaterThan(0);
});

test('avatar-demo post renders the AvatarDemo component', async ({ page }) => {
  await page.goto('/blog/seasonal-avatar-borders');

  // "Normal Border" / "Pride Border" also appear as mermaid diagram labels in this post,
  // so assert on AvatarDemo's descriptive captions instead — they exist nowhere else.
  await expect(
    page.getByText('Most of the year', { exact: true }),
  ).toBeVisible();
  await expect(page.getByText(/June & Manchester Pride week/i)).toBeVisible();
});

test('every heading anchor targets a unique heading on the page', async ({
  page,
}) => {
  await page.goto('/blog/api-design');

  const headings = page.locator('article :is(h2, h3, h4, h5, h6)');
  const anchored = await headings.evaluateAll((els) =>
    els.map((el) => ({
      id: el.id,
      href: el.querySelector(':scope > a.anchor')?.getAttribute('href') ?? '',
    })),
  );

  expect(anchored.length).toBeGreaterThan(1);
  for (const { id, href } of anchored) {
    // addHeadingAnchors() sets the id and prepends an anchor pointing at it.
    expect(id, JSON.stringify({ id, href })).not.toBe('');
    expect(href).toBe(`#${id}`);
  }

  // Ids are de-duplicated with a -2, -3, ... suffix, so a repeated heading
  // title still yields a working link.
  const ids = anchored.map((a) => a.id);
  expect(new Set(ids).size).toBe(ids.length);
});

test('linking to a heading id scrolls that section into view', async ({
  page,
}) => {
  await page.goto('/blog/api-design');

  const target = await page
    .locator('article :is(h2, h3) > a.anchor')
    .nth(3)
    .evaluate((el) => el.getAttribute('href') ?? '');
  expect(target).toMatch(/^#.+/);

  await page.goto(`/blog/api-design${target}`);
  await expect(page.locator(`article ${target}`)).toBeInViewport();
});

for (const slug of POSTS_WITH_MERMAID) {
  test(`mermaid diagrams render in "${slug}"`, async ({ page }) => {
    await page.goto(`/blog/${slug}`);

    // components/mermaid-client.tsx swaps each fenced block for an inline SVG.
    const svg = page.locator('svg[id^="mermaid"]');
    await expect(svg.first()).toBeVisible({ timeout: 30000 });

    // Mermaid inserts the <svg> shell first and fills it in asynchronously, so
    // poll for a populated diagram rather than measuring the empty placeholder.
    await expect
      .poll(
        () =>
          svg.first().evaluate((el) => el.querySelectorAll('g, path').length),
        { timeout: 30000 },
      )
      .toBeGreaterThan(0);

    // A diagram that failed to parse renders an error SVG instead.
    await expect(page.getByText(/syntax error/i)).toHaveCount(0);
  });
}

test('non-mermaid code blocks are syntax highlighted', async ({ page }) => {
  expect(POSTS_WITH_CODE.length).toBeGreaterThan(0);

  for (const slug of POSTS_WITH_CODE) {
    await page.goto(`/blog/${slug}`);
    await expect(page.locator('.sh__line').first(), slug).toBeVisible();
  }
});

test('mermaid blocks are not passed through the syntax highlighter', async ({
  page,
}) => {
  await page.goto('/blog/github-image-sync');

  // highlightCodeBlocks() skips language-mermaid so the client renderer still
  // sees the raw chart source.
  await expect(page.locator('svg[id^="mermaid"]').first()).toBeVisible({
    timeout: 30000,
  });
  await expect(page.locator('code.language-mermaid')).toHaveCount(0);
});
