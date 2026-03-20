'use client';

import { useState, useMemo } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import type { DocMeta } from '@/lib/docs';

interface SidebarProps {
  docs: DocMeta[];
}

const GROUP_ORDER = ['daily', 'concepts', 'research', 'projects', 'conversations'];

const GROUP_ICONS: Record<string, string> = {
  daily: '📅',
  concepts: '💡',
  research: '🔬',
  projects: '🚀',
  conversations: '💬',
};

function formatShortDate(date: string) {
  if (!date) return '';
  try {
    const d = new Date(date);
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  } catch {
    return '';
  }
}

export default function Sidebar({ docs }: SidebarProps) {
  const pathname = usePathname();
  const [search, setSearch] = useState('');
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});

  const filtered = useMemo(() => {
    if (!search.trim()) return docs;
    const q = search.toLowerCase();
    return docs.filter(
      (d) =>
        d.title.toLowerCase().includes(q) ||
        (d.category ?? '').toLowerCase().includes(q) ||
        (d.tags ?? []).some((t) => t.toLowerCase().includes(q)),
    );
  }, [docs, search]);

  const grouped = useMemo(() => {
    const groups: Record<string, DocMeta[]> = {};
    for (const doc of filtered) {
      const group = doc.slug[0] || 'other';
      if (!groups[group]) groups[group] = [];
      groups[group].push(doc);
    }
    return groups;
  }, [filtered]);

  const groupOrder = [
    ...GROUP_ORDER.filter((g) => grouped[g]),
    ...Object.keys(grouped).filter((g) => !GROUP_ORDER.includes(g)),
  ];

  function toggleGroup(group: string) {
    setCollapsed((prev) => ({ ...prev, [group]: !prev[group] }));
  }

  function isActive(doc: DocMeta) {
    return pathname === `/doc/${doc.slug.join('/')}`;
  }

  return (
    <aside className="w-[240px] flex-shrink-0 flex flex-col h-full bg-[#141414] border-r border-[#1e1e1e]">
      {/* ── Header ── */}
      <div className="px-3 pt-4 pb-3 border-b border-[#1e1e1e]">
        <Link
          href="/"
          className="flex items-center gap-2 mb-2 hover:opacity-75 transition-opacity"
        >
          <span className="text-lg leading-none">🧠</span>
          <span className="font-semibold text-[#e0e0e0] text-sm tracking-tight">Mission Control</span>
        </Link>
        <div className="flex items-center gap-2 mb-3 text-[11px] text-[#666]">
          <Link
            href="/projects"
            className={`px-2 py-1 rounded-md border text-[11px] transition-colors ${
              pathname === '/projects'
                ? 'border-[#6d4fc4] bg-[#1d1d1d] text-[#e0e0e0]'
                : 'border-[#2a2a2a] bg-[#1a1a1a] text-[#aaa] hover:border-[#3a3a3a] hover:text-[#e0e0e0]'
            }`}
          >
            Projects
          </Link>
        </div>
        <div className="relative">
          <svg
            className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3 h-3 text-[#444]"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
          <input
            type="text"
            placeholder="Search..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-[#1c1c1c] text-[#e0e0e0] text-xs placeholder-[#444] rounded-md pl-7 pr-3 py-1.5 border border-[#2a2a2a] outline-none focus:border-[#6d4fc4] transition-colors"
          />
        </div>
      </div>

      {/* ── Nav ── */}
      <nav className="flex-1 overflow-y-auto py-2">
        {groupOrder.length === 0 && (
          <p className="text-[#444] text-xs px-4 py-3">
            {search ? 'No results' : 'No documents'}
          </p>
        )}

        {groupOrder.map((group) => (
          <div key={group} className="mb-0.5">
            <button
              onClick={() => toggleGroup(group)}
              className="w-full flex items-center gap-1.5 px-3 py-1.5 text-[10px] font-semibold text-[#4a4a4a] hover:text-[#666] transition-colors uppercase tracking-widest"
            >
              <span className="text-xs leading-none">{GROUP_ICONS[group] || '📁'}</span>
              <span className="flex-1 text-left">{group}</span>
              <svg
                className={`w-2.5 h-2.5 transition-transform duration-150 ${collapsed[group] ? '-rotate-90' : ''}`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {!collapsed[group] && (
              <ul className="mb-1">
                {grouped[group].map((doc) => {
                  const active = isActive(doc);
                  return (
                    <li key={doc.slug.join('/')}>
                      <Link
                        href={`/doc/${doc.slug.join('/')}`}
                        className={`flex items-center justify-between px-3 py-1.5 text-xs transition-colors border-l-2 ${
                          active
                            ? 'bg-[#1d1d1d] text-[#e0e0e0] border-[#6d4fc4]'
                            : 'text-[#777] hover:bg-[#1a1a1a] hover:text-[#bbb] border-transparent'
                        }`}
                      >
                        <span className="truncate pl-2 flex-1">
                          {doc.title}
                        </span>
                        {doc.date && (
                          <span className="text-[10px] text-[#3a3a3a] ml-1.5 flex-shrink-0">
                            {formatShortDate(doc.date)}
                          </span>
                        )}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        ))}
      </nav>

      {/* ── Footer ── */}
      <div className="px-3 py-2.5 border-t border-[#1e1e1e]">
        <p className="text-[10px] text-[#333]">{docs.length} doc{docs.length !== 1 ? 's' : ''}</p>
      </div>
    </aside>
  );
}
