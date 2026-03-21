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

async function loadTaskBoardMarkdown(): Promise<{ content: string; error?: string }> {
  try {
    const content = await fetchBrainFile('projects/task-board.md');
    return {
      content: content || '# Mission Control Task Board\n\nNo tasks found yet.',
    };
  } catch (e) {
    console.error('Failed to load task board from GitHub', e);
    return {
      content: '# Mission Control Task Board\n\nNo task board file found yet.',
      error:
        'Could not load task board from GitHub. Check brain/projects/task-board.md and GITHUB_TOKEN.',
    };
  }
}

export default async function TasksPage() {
  const { content, error } = await loadTaskBoardMarkdown();

  return (
    <main className="mx-auto max-w-4xl px-4 py-8">
      <h1 className="mb-4 text-3xl font-bold">Task Board</h1>
      <p className="mb-6 text-sm text-gray-500">
        This board shows tasks for Ajay and Adi as tracked in
        <code className="mx-1">brain/projects/task-board.md</code>. All ongoing work should be
        represented here with a status and assignee.
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
