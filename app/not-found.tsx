import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center h-full text-center px-8">
      <span className="text-4xl mb-4">🔍</span>
      <h2 className="text-lg font-semibold text-[#e0e0e0] mb-2">Document not found</h2>
      <p className="text-sm text-[#555] mb-6">
        This document doesn&apos;t exist or has been moved.
      </p>
      <Link
        href="/"
        className="text-xs text-[#8b68e8] hover:underline underline-offset-2"
      >
        ← Back to home
      </Link>
    </div>
  );
}
