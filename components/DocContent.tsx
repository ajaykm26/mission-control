'use client';

import { useState, useTransition } from 'react';
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

function formatDateTime(date: string) {
  if (!date) return '';
  try {
    return new Date(date).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return date;
  }
}

export default function DocContent({ doc }: DocContentProps) {
  const categoryStyle = (doc.category && CATEGORY_COLORS[doc.category]) || 'bg-zinc-500/10 text-zinc-400 border-zinc-500/20';

  const [isEditing, setIsEditing] = useState(false);
  const [draftContent, setDraftContent] = useState(doc.content);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  const canEdit = !!doc.path;

  async function handleSave() {
    if (!canEdit) return;

    setError(null);
    setSaved(false);
    const path = doc.path;

    startTransition(async () => {
      try {
        const res = await fetch('/api/save-doc', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ path, content: draftContent }),
        });

        if (!res.ok) {
          const body = await res.json().catch(() => ({}));
          throw new Error(body.error || `Save failed with status ${res.status}`);
        }

        setSaved(true);
        setIsEditing(false);
      } catch (e: any) {
        setError(e?.message || 'Failed to save changes');
      }
    });
  }

  return (
    <article className="max-w-3xl mx-auto px-8 py-10 min-h-full">
      {/* ── Header ── */}
      <header className="mb-4 pb-4 border-b border-[#1e1e1e] flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <h1 className="text-2xl font-bold text-[#f0f0f0] mb-2 leading-snug break-words">{doc.title}</h1>
          <div className="flex items-center gap-2.5 flex-wrap mb-1">
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
          {(doc.lastCommitAuthor || doc.lastCommitDate) && (
            <div className="text-[11px] text-[#444] flex flex-wrap gap-1">
              <span>Last updated</span>
              {doc.lastCommitDate && (
                <span>{formatDateTime(doc.lastCommitDate)}</span>
              )}
              {doc.lastCommitAuthor && (
                <span>
                  by <span className="text-[#777]">{doc.lastCommitAuthor}</span>
                </span>
              )}
            </div>
          )}
        </div>

        {canEdit && (
          <div className="flex flex-col items-end gap-1 min-w-[120px]">
            <button
              type="button"
              onClick={() => {
                setIsEditing((v) => !v);
                setSaved(false);
                setError(null);
                setDraftContent(doc.content);
              }}
              className="inline-flex items-center gap-1 rounded-md border border-[#303030] bg-[#141414] px-3 py-1.5 text-xs font-medium text-[#ddd] hover:bg-[#1a1a1a] disabled:opacity-60 disabled:cursor-not-allowed"
              disabled={isPending}
            >
              {isEditing ? 'Cancel' : 'Edit'}
            </button>
            {isEditing && (
              <button
                type="button"
                onClick={handleSave}
                className="inline-flex items-center gap-1 rounded-md border border-[#3d7cff] bg-[#1d2b4d] px-3 py-1.5 text-xs font-medium text-[#e5ecff] hover:bg-[#22345f] disabled:opacity-60 disabled:cursor-not-allowed"
                disabled={isPending}
              >
                {isPending ? 'Saving…' : 'Save'}
              </button>
            )}
            {saved && !error && (
              <span className="text-[10px] text-emerald-400/80">Saved</span>
            )}
            {error && (
              <span className="text-[10px] text-rose-400/80 max-w-[180px] text-right">{error}</span>
            )}
          </div>
        )}
      </header>

      {/* ── Body ── */}
      {isEditing ? (
        <div className="mt-2">
          <textarea
            className="w-full min-h-[400px] rounded-md bg-[#0c0c0c] border border-[#262626] px-3 py-2 text-sm text-[#e5e5e5] font-mono resize-vertical focus:outline-none focus:ring-1 focus:ring-[#3d7cff] focus:border-[#3d7cff]"
            value={draftContent}
            onChange={(e) => {
              setDraftContent(e.target.value);
              setSaved(false);
              setError(null);
            }}
            spellCheck={false}
          />
          <p className="mt-2 text-[11px] text-[#555]">
            Changes are saved back to the <code>brain</code> GitHub repo. The app may take up to a minute
            to revalidate and show updates everywhere.
          </p>
        </div>
      ) : (
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
      )}
    </article>
  );
}
