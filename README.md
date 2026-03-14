# Second Brain

A beautiful Markdown document viewer built with Next.js 14, styled like a mix of Obsidian and Linear. Dark theme, minimal, fast.

## Setup

```bash
cd second-brain
npm install
npm run dev
```

Opens at [http://localhost:3001](http://localhost:3001).

## How it works

- Reads all `.md` files from `../brain/` recursively (relative to this directory)
- Parses YAML frontmatter for title, date, category, tags
- Renders Markdown with GFM support and syntax-highlighted code blocks

## Document format

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

## Routes

| Route | Description |
|-------|-------------|
| `/` | Home — recent docs + category overview |
| `/doc/[...slug]` | Individual document viewer |

## Stack

- **Next.js 14** App Router
- **Tailwind CSS** + `@tailwindcss/typography`
- **gray-matter** — frontmatter parsing
- **react-markdown** + **remark-gfm** + **rehype-highlight** — Markdown rendering
- No database — reads files directly from the filesystem
