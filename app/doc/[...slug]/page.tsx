import { getDoc, getAllDocs } from '@/lib/docs';
import DocContent from '@/components/DocContent';
import { notFound } from 'next/navigation';

export const revalidate = 60;

interface PageProps {
  params: { slug: string[] };
}

export async function generateStaticParams() {
  const docs = await getAllDocs();
  return docs.map((doc) => ({ slug: doc.slug }));
}

export async function generateMetadata({ params }: PageProps) {
  const doc = await getDoc(params.slug);
  if (!doc) return { title: 'Not Found' };
  return { title: `${doc.title} — Mission Control` };
}

export default async function DocPage({ params }: PageProps) {
  const doc = await getDoc(params.slug);
  if (!doc) notFound();
  return <DocContent doc={doc!} />;
}
