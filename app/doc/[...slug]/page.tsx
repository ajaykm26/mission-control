import { getDoc, getAllDocs } from '@/lib/docs';
import DocContent from '@/components/DocContent';
import { notFound } from 'next/navigation';

interface PageProps {
  params: { slug: string[] };
}

export async function generateStaticParams() {
  const docs = getAllDocs();
  return docs.map((doc) => ({ slug: doc.slug }));
}

export async function generateMetadata({ params }: PageProps) {
  const doc = getDoc(params.slug);
  if (!doc) return { title: 'Not Found' };
  return { title: `${doc.title} — Second Brain` };
}

export default function DocPage({ params }: PageProps) {
  const doc = getDoc(params.slug);
  if (!doc) notFound();
  return <DocContent doc={doc!} />;
}
