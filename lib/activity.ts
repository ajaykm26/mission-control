import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';

export interface ActivityDay {
  date: string; // YYYY-MM-DD
  source: 'nightly' | 'memory' | 'report';
  title: string;
  summary: string;
  filePath: string;
}

function readDirSafe(dir: string): string[] {
  try {
    return fs.readdirSync(dir);
  } catch {
    return [];
  }
}

function loadDailyFiles(root: string, source: 'nightly' | 'memory' | 'report'): ActivityDay[] {
  const absRoot = path.resolve(process.cwd(), '..', root);
  const files = readDirSafe(absRoot).filter((f) => f.endsWith('.md'));

  const days: ActivityDay[] = files.map((file) => {
    const fullPath = path.join(absRoot, file);
    const raw = fs.readFileSync(fullPath, 'utf8');
    const { data, content } = matter(raw);

    const date = (data.date as string) || file.replace(/\.mdx?$/, '');
    const defaultTitlePrefix =
      source === 'nightly' ? 'Nightly' : source === 'memory' ? 'Memory' : 'Report';
    const title = (data.title as string) || `${defaultTitlePrefix} — ${date}`;

    // Take the first non-empty paragraph as a summary
    const lines = content.split(/\r?\n/).map((l) => l.trim());
    const firstParagraphLines: string[] = [];
    for (const line of lines) {
      if (!line) {
        if (firstParagraphLines.length > 0) break;
        continue;
      }
      // skip headings
      if (line.startsWith('#')) continue;
      firstParagraphLines.push(line);
    }
    const summary = firstParagraphLines.join(' ');

    return {
      date,
      source,
      title,
      summary,
      filePath: fullPath,
    };
  });

  return days;
}

export function getRecentActivity(limit = 10): ActivityDay[] {
  const nightly = loadDailyFiles('nightly', 'nightly');
  const memory = loadDailyFiles('memory', 'memory');
  const reports = loadDailyFiles('reports', 'report');

  const all = [...nightly, ...memory, ...reports];

  all.sort((a, b) => {
    if (a.date === b.date) {
      if (a.source === b.source) return 0;
      // Prefer nightly over memory over report when dates are equal
      const order: Record<ActivityDay['source'], number> = {
        nightly: 0,
        memory: 1,
        report: 2,
      };
      return order[a.source] - order[b.source];
    }
    return a.date < b.date ? 1 : -1;
  });

  return all.slice(0, limit);
}
