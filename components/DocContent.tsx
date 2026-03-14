'use client';

import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';
import type { Doc } from '@/lib/docs';

interface DocContentProps {
  doc: Doc;
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
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  } catch {
    return date;
  }
}

export default function DocContent({ doc }: DocContentProps) {
  const categoryStyle = (doc.category && CATEGORY_COLORS[doc.category]) || 'bg-zinc-500/10 text-zinc-400 border-zinc-500/20';

  return (
    <article className="max-w-3xl mx-auto px-8 py-10 min-h-full">
      {/* ── Header ── */}
      <header className="mb-8 pb-6 border-b border-[#1e1e1e]">
        <h1 className="text-2xl font-bold text-[#f0f0f0] mb-4 leading-snug">{doc.title}</h1>
        <div className="flex items-center gap-2.5 flex-wrap">
          {doc.date && (
            <span className="text-xs text-[#555]">{formatDate(doc.date)}</span>
          )}
          {doc.date && doc.category && (
            <span className="text-[#2a2a2a]">·</span>
          )}
          {doc.category && (
            <span className={`text-xs px-2.5 py-0.5 rounded-full border ${categoryStyle}`}>
              {doc.category}
            </span>
          )}
          {(doc.tags ?? []).map((tag) => (
            <span
              key={tag}
              className="text-xs px-2 py-0.5 rounded-full bg-[#1c1c1c] text-[#555] border border-[#282828]"
            >
              #{tag}
            </span>
          ))}
        </div>
      </header>

      {/* ── Body ── */}
      <div
        className="
          prose prose-sm max-w-none
          prose-headings:text-[#e8e8e8] prose-headings:font-semibold prose-headings:tracking-tight
          prose-h1:text-xl prose-h2:text-lg prose-h2:mt-8 prose-h3:text-base
          prose-p:text-[#aaa] prose-p:leading-7
          prose-a:text-[#8b68e8] prose-a:no-underline hover:prose-a:underline prose-a:underline-offset-2
          prose-strong:text-[#e0e0e0] prose-strong:font-semibold
          prose-em:text-[#bbb]
          prose-code:text-[#e0e0e0] prose-code:bg-[#1c1c1c] prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded
          prose-code:text-[0.8em] prose-code:font-mono prose-code:before:content-none prose-code:after:content-none
          prose-pre:bg-transparent prose-pre:p-0 prose-pre:border-none
          prose-blockquote:border-l-[#6d4fc4] prose-blockquote:border-l-2 prose-blockquote:bg-[#161616]
          prose-blockquote:rounded-r-md prose-blockquote:text-[#888] prose-blockquote:not-italic
          prose-blockquote:px-4 prose-blockquote:py-3
          prose-hr:border-[#1e1e1e]
          prose-table:text-sm
          prose-th:text-[#ccc] prose-th:font-semibold prose-th:border-[#2a2a2a] prose-th:bg-[#161616]
          prose-td:text-[#999] prose-td:border-[#222]
          prose-thead:border-[#2a2a2a]
          prose-ul:text-[#aaa] prose-ol:text-[#aaa]
          prose-li:text-[#aaa] prose-li:marker:text-[#444]
          prose-img:rounded-lg prose-img:border prose-img:border-[#2a2a2a]
        "
      >
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          rehypePlugins={[rehypeHighlight]}
        >
          {doc.content}
        </ReactMarkdown>
      </div>
    </article>
  );
}
