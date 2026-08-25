import { describe, expect, it, vi } from 'vitest';

vi.unmock('../lib/content/blog');

import { parseHtmlMetadata, sortByPublishedAt } from '../lib/content/blog';

describe('parseHtmlMetadata', () => {
  it('parses required metadata and structurally removes the template', () => {
    const result = parseHtmlMetadata(`
      <template data-metadata data-version="1">
        <meta name="title" content="Example post">
        <meta name="publishedAt" content="2026-05-31">
        <meta name="summary" content="Example summary">
      </template>
      <p>Body</p>
    `);

    expect(result).toEqual({
      metadata: {
        title: 'Example post',
        publishedAt: '2026-05-31',
        summary: 'Example summary',
      },
      content: '<p>Body</p>',
    });
  });

  it('accepts an optional updatedAt', () => {
    const result = parseHtmlMetadata(`
      <template data-metadata>
        <meta name="title" content="Example post">
        <meta name="publishedAt" content="2026-05-31">
        <meta name="updatedAt" content="2026-08-25">
        <meta name="summary" content="Example summary">
      </template>
      <p>Body</p>
    `);

    expect(result.metadata.updatedAt).toBe('2026-08-25');
  });

  it('rejects a malformed updatedAt', () => {
    expect(() =>
      parseHtmlMetadata(
        `
        <template data-metadata>
          <meta name="title" content="Example post">
          <meta name="publishedAt" content="2026-05-31">
          <meta name="updatedAt" content="last Tuesday">
          <meta name="summary" content="Example summary">
        </template>
      `,
        'bad-update.html',
      ),
    ).toThrow('bad-update.html: invalid updatedAt date');
  });

  it('rejects an updatedAt that precedes publishedAt', () => {
    // Always a typo, and it would report a dateModified older than the
    // datePublished sitting next to it in the same schema block.
    expect(() =>
      parseHtmlMetadata(
        `
        <template data-metadata>
          <meta name="title" content="Example post">
          <meta name="publishedAt" content="2026-05-31">
          <meta name="updatedAt" content="2024-01-01">
          <meta name="summary" content="Example summary">
        </template>
      `,
        'backwards.html',
      ),
    ).toThrow('backwards.html: updatedAt is earlier than publishedAt');
  });

  it('requires a metadata template', () => {
    expect(() => parseHtmlMetadata('<p>Body</p>', 'missing.html')).toThrow(
      'missing.html: missing metadata template',
    );
  });

  it('requires each core metadata field', () => {
    expect(() =>
      parseHtmlMetadata(`
        <template data-metadata>
          <meta name="title" content="Example post">
          <meta name="publishedAt" content="2026-05-31">
        </template>
      `),
    ).toThrow('missing metadata field "summary"');
  });

  it('rejects unsupported metadata fields', () => {
    expect(() =>
      parseHtmlMetadata(`
        <template data-metadata>
          <meta name="title" content="Example post">
          <meta name="publishedAt" content="2026-05-31">
          <meta name="summary" content="Example summary">
          <meta name="unexpected" content="value">
        </template>
      `),
    ).toThrow('unsupported metadata field "unexpected"');
  });

  it('rejects malformed publication dates', () => {
    expect(() =>
      parseHtmlMetadata(`
        <template data-metadata>
          <meta name="title" content="Example post">
          <meta name="publishedAt" content="31/05/2026">
          <meta name="summary" content="Example summary">
        </template>
      `),
    ).toThrow('invalid publishedAt date');
  });
});

describe('sortByPublishedAt', () => {
  const post = (slug: string, publishedAt: string) => ({
    slug,
    metadata: { publishedAt },
  });

  it('orders newest first', () => {
    const sorted = sortByPublishedAt([
      post('older', '2024-01-10'),
      post('newest', '2024-01-20'),
      post('middle', '2024-01-15'),
    ]);

    expect(sorted.map((p) => p.slug)).toEqual(['newest', 'middle', 'older']);
  });

  it('leaves posts published on the same day in their existing order', () => {
    const sorted = sortByPublishedAt([
      post('first', '2024-01-10'),
      post('second', '2024-01-10'),
    ]);

    expect(sorted.map((p) => p.slug)).toEqual(['first', 'second']);
  });

  it('does not mutate the array it is given', () => {
    const posts = [post('older', '2024-01-10'), post('newer', '2024-01-20')];
    sortByPublishedAt(posts);

    expect(posts.map((p) => p.slug)).toEqual(['older', 'newer']);
  });
});
