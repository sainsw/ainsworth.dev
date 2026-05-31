import fs from 'node:fs';
import path from 'node:path';
import { parseHTML } from 'linkedom';

type Metadata = {
  title: string;
  publishedAt: string;
  summary: string;
  image?: string;
};

function parseHtmlMetadata(fileContent: string) {
  const { document } = parseHTML(fileContent);
  const template = document.querySelector('template[data-metadata]');
  const metadata: Partial<Metadata> = {};

  if (template) {
    for (const meta of Array.from(template.querySelectorAll('meta[name]'))) {
      const name = meta.getAttribute('name') as keyof Metadata;
      const value = meta.getAttribute('content') ?? '';
      metadata[name] = value;
    }
  }

  const content = fileContent
    .replace(/<template data-metadata>[\s\S]*?<\/template>\s*/, '')
    .trim();
  return { metadata: metadata as Metadata, content };
}

function getContentFiles(dir: string) {
  return fs.readdirSync(dir).filter((file) => path.extname(file) === '.html');
}

function readContentFile(filePath: string) {
  const rawContent = fs.readFileSync(filePath, 'utf-8');
  return parseHtmlMetadata(rawContent);
}

function getContentData(dir: string) {
  const files = getContentFiles(dir);
  return files.map((file) => {
    const { metadata, content } = readContentFile(path.join(dir, file));
    const slug = path.basename(file, path.extname(file));
    return {
      metadata,
      slug,
      content,
    };
  });
}

export function getBlogPosts() {
  return getContentData(path.join(process.cwd(), 'content'));
}
