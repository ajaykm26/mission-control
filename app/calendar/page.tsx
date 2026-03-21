import matter from 'gray-matter';
import ReactMarkdown from 'react-markdown';

export const revalidate = 60;

const GITHUB_OWNER = 'ajaykm26';
const GITHUB_REPO = 'brain';
const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const GITHUB_API = 'https://api.github.com';

async function fetchBrainFile(relPath: string): Promise<string> {
  const headers: Record<string, string> = {
    Accept: 'application/vnd.github.v3+json',
  };
  if (GITHUB_TOKEN) {
    headers['Authorization'] = `Bearer ${GITHUB_TOKEN}`;
  }

  const res = await fetch(
    `${GITHUB_API}/repos/${GITHUB_OWNER}/${GITHUB_REPO}/contents/${relPath}`,
    {
      headers,
      next: { revalidate: 60 },
    },
  );

  if (!res.ok) {
    throw new Error(`GitHub fetch failed for ${relPath}: ${res.status}`);
  }

  const data = (await res.json()) as { content: string };
  const raw = Buffer.from(data.content, 'base64').toString('utf-8');
  const { content } = matter(raw);
  return content;
}

async function loadCalendarMarkdown(): Promise<{ content: string; error?: string }> {
  try {
    const content = await fetchBrainFile('projects/calendar.md');
    return {
      content: content || '# Mission Control Calendar\n\nNo entries yet.',
    };
  } catch (e) {
    console.error('Failed to load calendar from GitHub', e);
    return {
      content: '# Mission Control Calendar\n\nNo calendar file found yet.',
      error:
        'Could not load calendar from GitHub. Check brain/projects/calendar.md and GITHUB_TOKEN.',
    };
  }
}

export default async function CalendarPage() {
  const { content, error } = await loadCalendarMarkdown();

  return (
    <main className="mx-auto max-w-4xl px-4 py-8">
      <h1 className="mb-4 text-3xl font-bold">Calendar</h1>
      <p className="mb-6 text-sm text-gray-500">
        This view shows Adi&apos;s scheduled tasks and cron-based automations as tracked in
        <code className="mx-1">brain/projects/calendar.md</code>. Whenever new cron jobs or
        scheduled tasks are created, they should be recorded there so this calendar stays in sync.
      </p>
      {error && (
        <div className="mb-4 rounded border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
          {error}
        </div>
      )}
      <section className="prose max-w-none prose-sm">
        <ReactMarkdown>{content}</ReactMarkdown>
      </section>
    </main>
  );
}
