import { expect, test } from '@playwright/test';

// Posts exercising the custom renderers in components/blog-content.tsx:
//   - api-design: heading anchors + sugar-high syntax highlighting + mermaid
//   - seasonal-avatar-borders: the <avatar-demo /> custom element

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
  await expect(page.getByText('Most of the year', { exact: true })).toBeVisible();
  await expect(page.getByText(/June & Manchester Pride week/i)).toBeVisible();
});
