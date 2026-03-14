import Link from 'next/link';
import type { DocMeta } from '@/lib/docs';

interface HomeViewProps {
  docs: DocMeta[];
}

const CATEGORY_COLORS: Record<string, string> = {
  daily: 'bg-sky-500/10 text-sky-400 border-sky-500/20',
  concepts: 'bg-violet-500/10 text-violet-400 border-violet-500/20',
  research: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  projects: 'bg-orange-500/10 text-orange-400 border-orange-500/20',
  conversations: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
};

function formatDate(date: string) {
  if (!date) return '';
  try {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  } catch {
    return date;
  }
}

function groupByCategory(docs: DocMeta[]) {
  const groups: Record<string, DocMeta[]> = {};
  for (const doc of docs) {
    if (!groups[doc.category]) groups[doc.category] = [];
    groups[doc.category].push(doc);
  }
  return groups;
}

export default function HomeView({ docs }: HomeViewProps) {
  const recent = docs.slice(0, 8);
  const groups = groupByCategory(docs);
  const categoryOrder = ['daily', 'concepts', 'research', 'projects', 'conversations'];
  const orderedCategories = [
    ...categoryOrder.filter((c) => groups[c]),
    ...Object.keys(groups).filter((c) => !categoryOrder.includes(c)),
  ];

  if (docs.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center px-8">
        <span className="text-5xl mb-4">🧠</span>
        <h1 className="text-xl font-semibold text-[#e0e0e0] mb-2">Second Brain</h1>
        <p className="text-sm text-[#555] max-w-sm">
          No documents found. Add Markdown files to the{' '}
          <code className="text-[#777] bg-[#1c1c1c] px-1.5 py-0.5 rounded text-xs">brain/</code>{' '}
          directory to get started.
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-8 py-10">
      {/* ── Hero ── */}
      <div className="mb-10">
        <div className="flex items-center gap-3 mb-1">
          <span className="text-2xl">🧠</span>
          <h1 className="text-2xl font-bold text-[#f0f0f0] tracking-tight">Second Brain</h1>
        </div>
        <p className="text-sm text-[#555] ml-[2.75rem]">
          {docs.length} document{docs.length !== 1 ? 's' : ''} across {orderedCategories.length} categor
          {orderedCategories.length !== 1 ? 'ies' : 'y'}
        </p>
      </div>

      {/* ── Recent ── */}
      <section className="mb-10">
        <h2 className="text-[11px] font-semibold text-[#444] uppercase tracking-widest mb-4">
          Recent
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
          {recent.map((doc) => {
            const catStyle = CATEGORY_COLORS[doc.category] ?? 'bg-zinc-500/10 text-zinc-400 border-zinc-500/20';
            return (
              <Link
                key={doc.slug.join('/')}
                href={`/doc/${doc.slug.join('/')}`}
                className="group p-4 rounded-lg border border-[#1e1e1e] bg-[#141414] hover:border-[#2e2e2e] hover:bg-[#191919] transition-all"
              >
                <div className="flex items-start justify-between gap-2 mb-1.5">
                  <h3 className="text-sm font-medium text-[#d0d0d0] group-hover:text-[#f0f0f0] transition-colors truncate flex-1">
                    {doc.title}
                  </h3>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full border flex-shrink-0 ${catStyle}`}>
                    {doc.category}
                  </span>
                </div>
                {doc.excerpt && (
                  <p className="text-xs text-[#4a4a4a] line-clamp-2 leading-relaxed mb-2">
                    {doc.excerpt}
                  </p>
                )}
                {doc.date && (
                  <p className="text-[10px] text-[#383838]">{formatDate(doc.date)}</p>
                )}
              </Link>
            );
          })}
        </div>
      </section>

      {/* ── By Category ── */}
      <section>
        <h2 className="text-[11px] font-semibold text-[#444] uppercase tracking-widest mb-4">
          By Category
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2.5">
          {orderedCategories.map((cat) => {
            const catStyle = CATEGORY_COLORS[cat] ?? 'bg-zinc-500/10 text-zinc-400 border-zinc-500/20';
            const catDocs = groups[cat];
            const mostRecent = catDocs[0];
            return (
              <Link
                key={cat}
                href={`/doc/${mostRecent.slug.join('/')}`}
                className="group p-4 rounded-lg border border-[#1e1e1e] bg-[#141414] hover:border-[#2e2e2e] hover:bg-[#191919] transition-all"
              >
                <div className={`text-xs px-2.5 py-1 rounded-full border inline-flex mb-2 ${catStyle}`}>
                  {cat}
                </div>
                <p className="text-lg font-bold text-[#e0e0e0] group-hover:text-white transition-colors">
                  {catDocs.length}
                </p>
                <p className="text-[11px] text-[#444]">
                  document{catDocs.length !== 1 ? 's' : ''}
                </p>
              </Link>
            );
          })}
        </div>
      </section>
    </div>
  );
}
