import fs from 'fs';
import path from 'path';

type Metadata = {
  title: string;
  publishedAt: string;
  summary: string;
  image?: string;
};

function parseHtmlMetadata(fileContent: string) {
  let templateRegex = /<template data-metadata>\s*([\s\S]*?)\s*<\/template>/;
  let match = templateRegex.exec(fileContent);
  let metadata: Partial<Metadata> = {};

  if (match) {
    let metaBlock = match[1];
    let metaTagRegex = /<meta\s+name="([^"]+)"\s+content="([^"]*)"[^>]*>/g;
    let metaMatch;
    while ((metaMatch = metaTagRegex.exec(metaBlock)) !== null) {
      metadata[metaMatch[1] as keyof Metadata] = metaMatch[2];
    }
  }

  let content = fileContent.replace(templateRegex, '').trim();
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
