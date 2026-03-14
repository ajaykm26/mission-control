import { getAllDocs } from '@/lib/docs';
import HomeView from '@/components/HomeView';

export const revalidate = 60;

export default async function HomePage() {
  const docs = await getAllDocs();
  return <HomeView docs={docs} />;
}
