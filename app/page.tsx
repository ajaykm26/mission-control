import { getAllDocs } from '@/lib/docs';
import HomeView from '@/components/HomeView';

export default function HomePage() {
  const docs = getAllDocs();
  return <HomeView docs={docs} />;
}
