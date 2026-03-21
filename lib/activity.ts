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

// --- GitHub-backed memory loader ---

const GITHUB_OWNER = 'ajaykm26';
const GITHUB_REPO = 'brain';
const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const GITHUB_API = 'https://api.github.com';

async function githubFetch(pathname: string) {
  const headers: Record<string, string> = {
    Accept: 'application/vnd.github.v3+json',
  };
  if (GITHUB_TOKEN) {
    headers['Authorization'] = `Bearer ${GITHUB_TOKEN}`;
  }
  const res = await fetch(`${GITHUB_API}${pathname}`, {
    headers,
    // Memory/activity can be slightly stale; revalidate periodically.
    next: { revalidate: 60 },
  });
  if (!res.ok) throw new Error(`GitHub API error: ${res.status} ${pathname}`);
  return res.json();
}

async function loadGithubDailyFiles(
  dir: string,
  source: 'nightly' | 'memory' | 'report'
): Promise<ActivityDay[]> {
  try {
    const items = await githubFetch(
      `/repos/${GITHUB_OWNER}/${GITHUB_REPO}/contents/${dir}`
    );

    const files = (items as any[]).filter(
      (item) => item.type === 'file' && item.name.endsWith('.md')
    );

    const days: ActivityDay[] = [];

    for (const file of files) {
      const rawRes = await fetch(file.download_url);
      const raw = await rawRes.text();
      const { data, content } = matter(raw);

      const date = (data.date as string) || file.name.replace(/\.mdx?$/, '');
      const defaultTitlePrefix =
        source === 'nightly' ? 'Nightly' : source === 'memory' ? 'Memory' : 'Report';
      const title = (data.title as string) || `${defaultTitlePrefix} — ${date}`;

      const lines = content.split(/\r?\n/).map((l) => l.trim());
      const firstParagraphLines: string[] = [];
      for (const line of lines) {
        if (!line) {
          if (firstParagraphLines.length > 0) break;
          continue;
        }
        if (line.startsWith('#')) continue;
        firstParagraphLines.push(line);
      }
      const summary = firstParagraphLines.join(' ');

      days.push({
        date,
        source,
        title,
        summary,
        filePath: file.path,
      });
    }

    return days;
  } catch (e) {
    console.error('Failed to load GitHub-backed activity files', dir, e);
    return [];
  }
}

export async function getRecentActivity(limit = 10): Promise<ActivityDay[]> {
  // Nightly + reports still read from local filesystem (workspace checkout)
  const nightly = loadDailyFiles('nightly', 'nightly');
  const reports = loadDailyFiles('reports', 'report');

  // Memory comes from the GitHub brain repo mirror at brain/agent-memory
  const memory = await loadGithubDailyFiles('agent-memory', 'memory');

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
