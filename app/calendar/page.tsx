import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import ReactMarkdown from 'react-markdown';

export const revalidate = 60;

function loadCalendarMarkdown(): string {
  try {
    const calendarPath = path.resolve(
      process.cwd(),
      '..',
      'brain',
      'projects',
      'calendar.md',
    );
    const raw = fs.readFileSync(calendarPath, 'utf8');
    const { content } = matter(raw);
    return content || '# Mission Control Calendar\n\nNo entries yet.';
  } catch {
    return '# Mission Control Calendar\n\nNo calendar file found yet.';
  }
}

export default function CalendarPage() {
  const content = loadCalendarMarkdown();

  return (
    <main className="mx-auto max-w-4xl px-4 py-8">
      <h1 className="mb-4 text-3xl font-bold">Calendar</h1>
      <p className="mb-6 text-sm text-gray-500">
        This view shows Adi&apos;s scheduled tasks and cron-based automations as tracked in
        <code className="mx-1">brain/projects/calendar.md</code>. Whenever new cron jobs or
        scheduled tasks are created, they should be recorded there so this calendar stays in sync.
      </p>
      <section className="prose max-w-none prose-sm">
        <ReactMarkdown>{content}</ReactMarkdown>
      </section>
    </main>
  );
}
