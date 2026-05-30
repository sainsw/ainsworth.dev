import fs from 'fs';
import path from 'path';
import { parseHTML } from 'linkedom';

type Metadata = {
  title: string;
  publishedAt: string;
  summary: string;
  image?: string;
};

function parseHtmlMetadata(fileContent: string) {
  let { document } = parseHTML(fileContent);
  let template = document.querySelector('template[data-metadata]');
  let metadata: Partial<Metadata> = {};

  if (template) {
    for (let meta of Array.from(template.querySelectorAll('meta[name]'))) {
      let name = meta.getAttribute('name') as keyof Metadata;
      let value = meta.getAttribute('content') ?? '';
      metadata[name] = value;
    }
  }

  let content = fileContent.replace(/<template data-metadata>[\s\S]*?<\/template>\s*/, '').trim();
  return { metadata: metadata as Metadata, content };
}

function getContentFiles(dir: string) {
  return fs.readdirSync(dir).filter((file) => path.extname(file) === '.html');
}

function readContentFile(filePath: string) {
  let rawContent = fs.readFileSync(filePath, 'utf-8');
  return parseHtmlMetadata(rawContent);
}

function getContentData(dir: string) {
  let files = getContentFiles(dir);
  return files.map((file) => {
    let { metadata, content } = readContentFile(path.join(dir, file));
    let slug = path.basename(file, path.extname(file));
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
