import type { Metadata } from 'next';
import './globals.css';
import Sidebar from '@/components/Sidebar';
import { getAllDocs } from '@/lib/docs';

export const revalidate = 60;

export const metadata: Metadata = {
  title: 'Mission Control',
  description: 'Your personal knowledge base',
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const docs = await getAllDocs();

  return (
    <html lang="en">
      <body className="flex h-screen overflow-hidden bg-[#0f0f0f] text-[#e0e0e0]">
        <Sidebar docs={docs} />
        <main className="flex-1 overflow-y-auto">{children}</main>
      </body>
    </html>
  );
}
