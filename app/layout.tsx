import type { Metadata } from 'next';
import './globals.css';
import Sidebar from '@/components/Sidebar';
import { getAllDocs } from '@/lib/docs';

export const metadata: Metadata = {
  title: 'Second Brain',
  description: 'Your personal knowledge base',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const docs = getAllDocs();

  return (
    <html lang="en">
      <body className="flex h-screen overflow-hidden bg-[#0f0f0f] text-[#e0e0e0]">
        <Sidebar docs={docs} />
        <main className="flex-1 overflow-y-auto">{children}</main>
      </body>
    </html>
  );
}
