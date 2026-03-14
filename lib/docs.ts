const GITHUB_OWNER = 'ajaykm26'
const GITHUB_REPO = 'brain'
const GITHUB_TOKEN = process.env.GITHUB_TOKEN
const GITHUB_API = 'https://api.github.com'

export interface DocMeta {
  slug: string[]
  title: string
  date?: string
  category?: string
  tags?: string[]
  path: string
}

export interface Doc extends DocMeta {
  content: string
  frontmatter: Record<string, string>
}

async function githubFetch(path: string) {
  const headers: Record<string, string> = {
    Accept: 'application/vnd.github.v3+json',
  }
  if (GITHUB_TOKEN) {
    headers['Authorization'] = `Bearer ${GITHUB_TOKEN}`
  }
  const res = await fetch(`${GITHUB_API}${path}`, {
    headers,
    next: { revalidate: 60 }, // revalidate every 60 seconds
  })
  if (!res.ok) throw new Error(`GitHub API error: ${res.status} ${path}`)
  return res.json()
}

// Recursively get all .md files from the repo
async function getAllFiles(dir = ''): Promise<{ path: string; download_url: string }[]> {
  const items = await githubFetch(
    `/repos/${GITHUB_OWNER}/${GITHUB_REPO}/contents/${dir}`
  )
  const files: { path: string; download_url: string }[] = []
  for (const item of items) {
    if (item.type === 'file' && item.name.endsWith('.md') && item.name !== 'README.md') {
      files.push({ path: item.path, download_url: item.download_url })
    } else if (item.type === 'dir') {
      const sub = await getAllFiles(item.path)
      files.push(...sub)
    }
  }
  return files
}

function parseFrontmatter(raw: string): { frontmatter: Record<string, string>; content: string } {
  const frontmatter: Record<string, string> = {}
  let content = raw

  const match = raw.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n([\s\S]*)$/m)
  if (match) {
    const block = match[1]
    content = match[2]
    for (const line of block.split('\n')) {
      const idx = line.indexOf(':')
      if (idx === -1) continue
      const key = line.slice(0, idx).trim()
      const value = line
        .slice(idx + 1)
        .trim()
        .replace(/^["']|["']$/g, '')
        .replace(/^\[|\]$/g, '')
      frontmatter[key] = value
    }
  }

  return { frontmatter, content }
}

function pathToSlug(filePath: string): string[] {
  return filePath.replace(/\.md$/, '').split('/')
}

function titleFromSlug(slug: string[]): string {
  const last = slug[slug.length - 1]
  return last
    .replace(/-/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase())
}

export async function getAllDocs(): Promise<DocMeta[]> {
  try {
    const files = await getAllFiles()
    return files.map(({ path }) => {
      const slug = pathToSlug(path)
      return {
        slug,
        title: titleFromSlug(slug),
        path,
      }
    })
  } catch (e) {
    console.error('Failed to fetch docs:', e)
    return []
  }
}

export async function getDoc(slug: string[]): Promise<Doc | null> {
  const filePath = slug.join('/') + '.md'
  try {
    const items = await githubFetch(
      `/repos/${GITHUB_OWNER}/${GITHUB_REPO}/contents/${filePath}`
    )
    const raw = Buffer.from(items.content, 'base64').toString('utf-8')
    const { frontmatter, content } = parseFrontmatter(raw)

    const slugArr = pathToSlug(filePath)
    return {
      slug: slugArr,
      title: frontmatter.title || titleFromSlug(slugArr),
      date: frontmatter.date,
      category: frontmatter.category,
      tags: frontmatter.tags ? frontmatter.tags.split(',').map((t: string) => t.trim()) : [],
      path: filePath,
      content,
      frontmatter,
    }
  } catch (e) {
    console.error('Failed to fetch doc:', e)
    return null
  }
}
