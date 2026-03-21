import matter from "gray-matter";

interface Project {
  slug: string;
  title: string;
  status?: string;
  description?: string;
}

const GITHUB_OWNER = "ajaykm26";
const GITHUB_REPO = "brain";
const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const GITHUB_API = "https://api.github.com";

async function githubFetch(pathname: string) {
  const headers: Record<string, string> = {
    Accept: "application/vnd.github.v3+json",
  };
  if (GITHUB_TOKEN) {
    headers["Authorization"] = `Bearer ${GITHUB_TOKEN}`;
  }

  const res = await fetch(`${GITHUB_API}${pathname}`, {
    headers,
    next: { revalidate: 60 },
  });

  if (!res.ok) {
    throw new Error(`GitHub API error: ${res.status} ${pathname}`);
  }

  return res.json();
}

async function getProjects(): Promise<{ projects: Project[]; error?: string }> {
  // List files in brain/projects via GitHub contents API
  try {
    const items = (await githubFetch(
      `/repos/${GITHUB_OWNER}/${GITHUB_REPO}/contents/projects`
    )) as any[];

    const files = items.filter(
      (item) => item.type === "file" && item.name.endsWith(".md")
    );

    const projects: Project[] = [];

    for (const file of files) {
      const rawRes = await fetch(file.download_url);
      const raw = await rawRes.text();
      const { data, content } = matter(raw);

      const slug = file.name.replace(/\.md$/, "");

      projects.push({
        slug,
        title: (data.title as string) || slug,
        status:
          (data.status as string) || (data.milestones as string) || undefined,
        description: content.trim().split("\n").slice(0, 3).join(" "),
      });
    }

    projects.sort((a, b) => a.title.localeCompare(b.title));

    return { projects };
  } catch (e) {
    console.error("Failed to load projects from GitHub", e);
    return {
      projects: [],
      error:
        "Could not load projects from GitHub. Check brain/projects/* and GITHUB_TOKEN.",
    };
  }
}

export default async function ProjectsPage() {
  const { projects, error } = await getProjects();

  return (
    <main className="mx-auto max-w-4xl px-4 py-8">
      <h1 className="mb-4 text-3xl font-bold">Projects</h1>
      <p className="mb-2 text-sm text-gray-500">
        High-level view of active projects pulled from{" "}
        <code>brain/projects</code>.
      </p>

      {error && (
        <div className="mb-4 rounded border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
          {error}
        </div>
      )}

      {projects.length === 0 ? (
        <p className="text-gray-500">
          No projects found. Create markdown files in{" "}
          <code>brain/projects/</code> to see them here.
        </p>
      ) : (
        <div className="space-y-4">
          {projects.map((project) => (
            <a
              href={`/projects/${project.slug}`}
              key={project.slug}
              className="block rounded border border-gray-200 bg-white/40 p-4 shadow-sm transition hover:border-blue-300 hover:bg-white"
            >
              <h2 className="text-xl font-semibold">{project.title}</h2>
              {project.status && (
                <p className="mt-1 text-xs font-medium uppercase tracking-wide text-blue-600">
                  {project.status}
                </p>
              )}
              {project.description && (
                <p className="mt-2 text-sm text-gray-700 line-clamp-3">
                  {project.description}
                </p>
              )}
            </a>
          ))}
        </div>
      )}
    </main>
  );
}
