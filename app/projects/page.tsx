import fs from "fs";
import path from "path";
import matter from "gray-matter";

interface Project {
  slug: string;
  title: string;
  status?: string;
  description?: string;
}

function getProjects(): Project[] {
  const brainRoot = path.resolve(process.cwd(), "..", "brain", "projects");

  if (!fs.existsSync(brainRoot)) {
    return [];
  }

  const files = fs
    .readdirSync(brainRoot)
    .filter((file) => file.endsWith(".md") || file.endsWith(".mdx"));

  const projects: Project[] = files.map((file) => {
    const fullPath = path.join(brainRoot, file);
    const raw = fs.readFileSync(fullPath, "utf8");
    const { data, content } = matter(raw);

    const slug = path.basename(file, path.extname(file));

    return {
      slug,
      title: (data.title as string) || slug,
      status:
        (data.status as string) || (data.milestones as string) || undefined,
      description: content.trim().split("\n").slice(0, 3).join(" "),
    };
  });

  // Sort by title for now
  projects.sort((a, b) => a.title.localeCompare(b.title));

  return projects;
}

export default function ProjectsPage() {
  const projects = getProjects();

  return (
    <main className="mx-auto max-w-4xl px-4 py-8">
      <h1 className="mb-4 text-3xl font-bold">Projects</h1>
      <p className="mb-8 text-sm text-gray-500">
        High-level view of active projects pulled from{" "}
        <code>brain/projects</code>.
      </p>

      {projects.length === 0 ? (
        <p className="text-gray-500">
          No projects found. Create markdown files in{" "}
          <code>brain/projects/</code> to see them here.
        </p>
      ) : (
        <div className="space-y-4">
          {projects.map((project) => (
            <div
              key={project.slug}
              className="rounded border border-gray-200 bg-white/40 p-4 shadow-sm"
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
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
