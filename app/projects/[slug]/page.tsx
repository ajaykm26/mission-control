import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import DocContent from '@/components/DocContent';

interface ProjectFrontmatter {
  title?: string;
  status?: string;
  description?: string;
  repos?: string | string[];
  owner?: string;
  milestones?: string;
}

function getBrainProjectsRoot() {
  return path.resolve(process.cwd(), '..', 'brain', 'projects');
}

function getProjectFile(slug: string): string | null {
  const root = getBrainProjectsRoot();
  if (!fs.existsSync(root)) return null;

  const mdPath = path.join(root, `${slug}.md`);
  const mdxPath = path.join(root, `${slug}.mdx`);

  if (fs.existsSync(mdPath)) return mdPath;
  if (fs.existsSync(mdxPath)) return mdxPath;
  return null;
}

function getAllProjectSlugs(): string[] {
  const root = getBrainProjectsRoot();
  if (!fs.existsSync(root)) return [];
  return fs
    .readdirSync(root)
    .filter((file) => file.endsWith('.md') || file.endsWith('.mdx'))
    .map((file) => path.basename(file, path.extname(file)));
}

export async function generateStaticParams() {
  const slugs = getAllProjectSlugs();
  return slugs.map((slug) => ({ slug }));
}

export default function ProjectPage({ params }: { params: { slug: string } }) {
  const filePath = getProjectFile(params.slug);

  if (!filePath) {
    return (
      <main className="mx-auto max-w-4xl px-4 py-8">
        <h1 className="mb-4 text-3xl font-bold">Project not found</h1>
        <p className="text-sm text-gray-500">
          No project markdown file found for slug <code>{params.slug}</code> in
          <code> brain/projects/</code>.
        </p>
      </main>
    );
  }

  const raw = fs.readFileSync(filePath, 'utf8');
  const { data, content } = matter(raw);
  const frontmatter = data as ProjectFrontmatter;

  const repos = Array.isArray(frontmatter.repos)
    ? frontmatter.repos
    : frontmatter.repos
    ? [frontmatter.repos]
    : [];

  return (
    <main className="mx-auto max-w-4xl px-4 py-8">
      <header className="mb-6 border-b border-gray-200 pb-4">
        <h1 className="text-3xl font-bold">
          {frontmatter.title || params.slug}
        </h1>
        <div className="mt-2 flex flex-wrap items-center gap-3 text-sm text-gray-600">
          {frontmatter.status && (
            <span className="rounded-full bg-blue-50 px-2 py-0.5 text-xs font-medium uppercase tracking-wide text-blue-700">
              {frontmatter.status}
            </span>
          )}
          {frontmatter.owner && (
            <span>
              Owner: <span className="font-medium">{frontmatter.owner}</span>
            </span>
          )}
        </div>

        {repos.length > 0 && (
          <div className="mt-3 space-y-1 text-sm">
            <div className="font-medium text-gray-700">Repos</div>
            <ul className="list-inside list-disc text-blue-700">
              {repos.map((repo) => (
                <li key={repo}>
                  <a
                    href={repo}
                    target="_blank"
                    rel="noreferrer"
                    className="hover:underline"
                  >
                    {repo}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        )}
      </header>

      <section className="prose max-w-none">
        {/* Render markdown content for this project. We pass a minimal Doc-like object to DocContent. */}
        <DocContent
          doc={{
            slug: [params.slug],
            title: frontmatter.title || params.slug,
            date: undefined,
            category: 'projects',
            tags: [],
            path: `projects/${params.slug}.md`,
            content,
            frontmatter: {},
          }}
        />
      </section>
    </main>
  );
}
