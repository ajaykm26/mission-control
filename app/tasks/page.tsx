import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import ReactMarkdown from 'react-markdown';

export const revalidate = 30;

function loadTaskBoardMarkdown(): string {
  try {
    const taskBoardPath = path.resolve(
      process.cwd(),
      '..',
      'brain',
      'projects',
      'task-board.md',
    );
    const raw = fs.readFileSync(taskBoardPath, 'utf8');
    const { content } = matter(raw);
    return content || '# Mission Control Task Board\n\nNo tasks found yet.';
  } catch {
    return '# Mission Control Task Board\n\nNo task board file found yet.';
  }
}

export default function TasksPage() {
  const content = loadTaskBoardMarkdown();

  return (
    <main className="mx-auto max-w-4xl px-4 py-8">
      <h1 className="mb-4 text-3xl font-bold">Task Board</h1>
      <p className="mb-6 text-sm text-gray-500">
        This board shows tasks for Ajay and Adi as tracked in
        <code className="mx-1">brain/projects/task-board.md</code>. All ongoing work should be
        represented here with a status and assignee.
      </p>
      <section className="prose max-w-none prose-sm">
        <ReactMarkdown>{content}</ReactMarkdown>
      </section>
    </main>
  );
}
