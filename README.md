# Mission Control

Mission Control is your web UI for the `brain` repo (`ajaykm26/brain`): a Next.js app that reads and writes Markdown notes (daily, research, projects, conversations) and presents them in a focused, dark, Obsidian/Linear‑style interface.

Key features:
- Reads documents from **GitHub** via the GitHub Contents API (no local DB).
- Inline editing with "Edit" / "Save" that writes changes back to `brain`.
- Quick actions to create new **daily** and **research** notes.
- "Last updated" metadata (author + timestamp) per document.
- Projects and Activity views for a higher‑level look at what’s going on.

---

## Local development

```bash
cd mission-control
npm install
npm run dev
```

By default the app expects:
- A `brain/` repo available (for local development this is typically `../brain`), and
- A GitHub token (`GITHUB_TOKEN`) in the environment when using the GitHub Contents API.

The dev server will print the local URL (for example `http://localhost:3000`).

---

## How it works

- Uses the GitHub Contents API to:
  - List Markdown docs in the `brain` repo.
  - Fetch individual doc contents.
  - Commit edits back via `/api/save-doc`.
- Parses YAML frontmatter for `title`, `date`, `category`, `tags` and passes that into the UI.
- Renders Markdown with GFM support and syntax‑highlighted code blocks.
- Groups docs into high‑level categories (daily, concepts, research, projects, conversations).
- Exposes project and activity pages that read from `brain/projects` and from the local `nightly/` + `memory/` logs in the OpenClaw workspace.

Example frontmatter:

```yaml
---
title: "Document Title"
date: "2026-03-13"
category: "daily|concepts|research|projects|conversations"
tags: ["tag1", "tag2"]
---

Your content here...
```

If frontmatter is missing, the filename is used as the title and the parent folder as the category.

---

## Routes

| Route                 | Description                                                     |
|-----------------------|-----------------------------------------------------------------|
| `/`                   | Home — recent docs + category overview                         |
| `/doc/[...slug]`      | Individual document viewer with inline editing                  |
| `/projects`           | List of project overview docs from `brain/projects`            |
| `/projects/[slug]`    | Single project detail page (e.g. Mission Control, PropPulse)   |
| `/activity`           | High‑level view of recent nightly + memory logs ("What Adi did") |

---

## Stack

- **Next.js 14** App Router
- **Tailwind CSS** + `@tailwindcss/typography`
- **gray-matter** — frontmatter parsing
- **react-markdown** + **remark-gfm** + **rehype-highlight** — Markdown rendering
- No database — data is Markdown in GitHub `brain` + local workspace logs
