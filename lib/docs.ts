import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';

const BRAIN_DIR = path.join(process.cwd(), '..', 'brain');

export interface DocMeta {
  slug: string[];
  title: string;
  date: string;
  category: string;
  tags: string[];
  excerpt: string;
}

export interface Doc extends DocMeta {
  content: string;
}

function getAllMarkdownFiles(dir: string): string[] {
  const files: string[] = [];

  if (!fs.existsSync(dir)) return files;

  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...getAllMarkdownFiles(fullPath));
    } else if (entry.name.endsWith('.md')) {
      files.push(fullPath);
    }
  }
  return files;
}

function fileToSlug(filePath: string): string[] {
  const relative = path.relative(BRAIN_DIR, filePath);
  const withoutExt = relative.replace(/\.md$/, '');
  return withoutExt.split(path.sep);
}

function extractExcerpt(content: string): string {
  return content
    .replace(/^---[\s\S]*?---\n/, '')
    .replace(/#{1,6}\s+/g, '')
    .replace(/[*_`[\]()]/g, '')
    .replace(/\n+/g, ' ')
    .trim()
    .slice(0, 180);
}

export function getAllDocs(): DocMeta[] {
  const files = getAllMarkdownFiles(BRAIN_DIR);

  const docs = files.map((filePath) => {
    const raw = fs.readFileSync(filePath, 'utf-8');
    const { data, content } = matter(raw);
    const slug = fileToSlug(filePath);
    const filename = path.basename(filePath, '.md');

    return {
      slug,
      title: (data.title as string) || filename.replace(/[-_]/g, ' '),
      date: (data.date as string) || '',
      category: (data.category as string) || slug[0] || 'uncategorized',
      tags: (data.tags as string[]) || [],
      excerpt: extractExcerpt(content),
    };
  });

  return docs.sort((a, b) => {
    if (!a.date && !b.date) return 0;
    if (!a.date) return 1;
    if (!b.date) return -1;
    return new Date(b.date).getTime() - new Date(a.date).getTime();
  });
}

export function getDoc(slug: string[]): Doc | null {
  const filePath = path.join(BRAIN_DIR, ...slug) + '.md';

  if (!fs.existsSync(filePath)) return null;

  const raw = fs.readFileSync(filePath, 'utf-8');
  const { data, content } = matter(raw);
  const filename = path.basename(filePath, '.md');

  return {
    slug,
    title: (data.title as string) || filename.replace(/[-_]/g, ' '),
    date: (data.date as string) || '',
    category: (data.category as string) || slug[0] || 'uncategorized',
    tags: (data.tags as string[]) || [],
    excerpt: extractExcerpt(content),
    content,
  };
}
