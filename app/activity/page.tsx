import { getRecentActivity } from '@/lib/activity';

export const revalidate = 60;

export default async function ActivityPage() {
  const activity = await getRecentActivity(14);

  return (
    <main className="mx-auto max-w-4xl px-4 py-8">
      <h1 className="mb-4 text-3xl font-bold">What Adi Worked On</h1>
      <p className="mb-8 text-sm text-gray-500">
        Recent activity pulled from <code>nightly/</code>, <code>memory/</code>, and{' '}
        <code>reports/</code> in the OpenClaw workspace / brain repo. This is a high-level log of
        what the agent has been doing and what needs attention.
      </p>

      {activity.length === 0 ? (
        <p className="text-gray-500">
          No activity files found yet. Nightly summaries in <code>nightly/</code>, daily memory logs
          mirrored into <code>brain/agent-memory/</code>, and daily reports in <code>reports/</code>{' '}
          will show up here automatically.
        </p>
      ) : (
        <div className="space-y-4">
          {activity.map((day) => (
            <article
              key={`${day.source}-${day.date}`}
              className="rounded border border-gray-200 bg-white/40 p-4 shadow-sm"
            >
              <header className="mb-2 flex items-baseline justify-between gap-2">
                <h2 className="text-lg font-semibold">{day.title}</h2>
                <span className="text-xs uppercase tracking-wide text-gray-500">
                  {day.date} ·{' '}
                  {day.source === 'nightly'
                    ? 'Nightly summary'
                    : day.source === 'memory'
                    ? 'Memory log'
                    : 'Report'}
                </span>
              </header>
              {day.summary && (
                <p className="text-sm text-gray-700 line-clamp-3">{day.summary}</p>
              )}
            </article>
          ))}
        </div>
      )}
    </main>
  );
}
