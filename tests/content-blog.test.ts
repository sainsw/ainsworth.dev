import { describe, expect, it, vi } from 'vitest';

vi.unmock('../lib/content/blog');

import { parseHtmlMetadata } from '../lib/content/blog';

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
