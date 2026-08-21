import fs from 'node:fs';
import path from 'node:path';
import { parseHTML } from 'linkedom';

type Metadata = {
  title: string;
  publishedAt: string;
  summary: string;
  image?: string;
};

const REQUIRED_METADATA = ['title', 'publishedAt', 'summary'] as const;
const ALLOWED_METADATA = new Set<keyof Metadata>([
  ...REQUIRED_METADATA,
  'image',
]);

export function parseHtmlMetadata(fileContent: string, source = 'blog post') {
  const { document } = parseHTML(fileContent);
  const template = document.querySelector('template[data-metadata]');
  const metadata: Partial<Metadata> = {};

  if (!template) {
    throw new Error(`${source}: missing metadata template`);
  }

  for (const meta of Array.from(template.querySelectorAll('meta[name]'))) {
    const name = meta.getAttribute('name');
    if (!name || !ALLOWED_METADATA.has(name as keyof Metadata)) {
      throw new Error(`${source}: unsupported metadata field "${name}"`);
    }
    metadata[name as keyof Metadata] =
      meta.getAttribute('content')?.trim() ?? '';
  }

  for (const field of REQUIRED_METADATA) {
    if (!metadata[field]) {
      throw new Error(`${source}: missing metadata field "${field}"`);
    }
  }

  if (!/^\d{4}-\d{2}-\d{2}(?:T.*)?$/.test(metadata.publishedAt ?? '')) {
    throw new Error(`${source}: invalid publishedAt date`);
  }

  const content = fileContent
    .replace(
      /<template\b[^>]*\bdata-metadata(?:=(?:"[^"]*"|'[^']*'|[^\s>]+))?[^>]*>[\s\S]*?<\/template>\s*/i,
      '',
    )
    .trim();
  return { metadata: metadata as Metadata, content };
}

function getContentFiles(dir: string) {
  return fs.readdirSync(dir).filter((file) => path.extname(file) === '.html');
}

function readContentFile(filePath: string) {
  const rawContent = fs.readFileSync(filePath, 'utf-8');
  return parseHtmlMetadata(rawContent, filePath);
}

export type BlogPost = {
  metadata: Metadata;
  slug: string;
  content: string;
};

let cachedPosts: BlogPost[] | null = null;
let slugIndex: Map<string, BlogPost> | null = null;

function loadPosts(): BlogPost[] {
  if (cachedPosts) return cachedPosts;

  const dir = path.join(process.cwd(), 'content');
  const files = getContentFiles(dir);
  cachedPosts = files.map((file) => {
    const { metadata, content } = readContentFile(path.join(dir, file));
    const slug = path.basename(file, path.extname(file));
    return { metadata, slug, content };
  });
  slugIndex = new Map(cachedPosts.map((post) => [post.slug, post]));
  return cachedPosts;
}

export function getBlogPosts(): BlogPost[] {
  return loadPosts();
}

/** Newest first. Posts sharing a date keep their existing order. */
export function sortByPublishedAt<
  T extends { metadata: { publishedAt: string } },
>(posts: T[]): T[] {
  return [...posts].sort(
    (a, b) =>
      new Date(b.metadata.publishedAt).getTime() -
      new Date(a.metadata.publishedAt).getTime(),
  );
}

export function getBlogPost(slug: string): BlogPost | undefined {
  loadPosts();
  return slugIndex?.get(slug);
}
