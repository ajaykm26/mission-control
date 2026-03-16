import { NextResponse } from 'next/server'

const GITHUB_OWNER = 'ajaykm26'
const GITHUB_REPO = 'brain'
const GITHUB_API = 'https://api.github.com'

function todayISODate(tzOffsetMinutes = -300) {
  // Default tzOffsetMinutes = -300 → America/New_York standard time (UTC-5)
  const now = new Date()
  const local = new Date(now.getTime() + tzOffsetMinutes * 60_000)
  return local.toISOString().slice(0, 10)
}

export async function POST(request: Request) {
  try {
    const token = process.env.GITHUB_TOKEN
    if (!token) {
      return NextResponse.json({ error: 'GITHUB_TOKEN is not configured' }, { status: 500 })
    }

    const body = await request.json().catch(() => ({})) as {
      kind?: 'daily' | 'research'
      title?: string
      slugSuffix?: string
    }

    const kind = body.kind === 'research' ? 'research' : 'daily'
    const today = todayISODate()

    let path: string
    let title: string
    let frontmatterCategory: string

    if (kind === 'daily') {
      path = `daily/${today}.md`
      title = body.title || `Daily Journal — ${today}`
      frontmatterCategory = 'daily'
    } else {
      const suffix = body.slugSuffix?.trim().toLowerCase().replace(/[^a-z0-9-]+/g, '-') || 'topic'
      path = `research/${today}-${suffix}.md`
      title = body.title || `Research — ${today}`
      frontmatterCategory = 'research'
    }

    // Check if file already exists
    const headRes = await fetch(
      `${GITHUB_API}/repos/${GITHUB_OWNER}/${GITHUB_REPO}/contents/${encodeURIComponent(path)}`,
      {
        headers: {
          Accept: 'application/vnd.github.v3+json',
          Authorization: `Bearer ${token}`,
        },
      },
    )

    if (headRes.ok) {
      // File already exists, just return its path
      return NextResponse.json({ ok: true, path })
    }

    const stub = `---\ntitle: "${title}"\ndate: "${today}"\ncategory: "${frontmatterCategory}"\ntags: []\n---\n\n# ${title}\n\n`;

    const encodedContent = Buffer.from(stub, 'utf-8').toString('base64')

    const res = await fetch(
      `${GITHUB_API}/repos/${GITHUB_OWNER}/${GITHUB_REPO}/contents/${encodeURIComponent(path)}`,
      {
        method: 'PUT',
        headers: {
          Accept: 'application/vnd.github.v3+json',
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: `Create ${kind} note ${path} from Mission Control`,
          content: encodedContent,
        }),
      },
    )

    if (!res.ok) {
      const text = await res.text()
      return NextResponse.json(
        { error: 'Failed to create note on GitHub', status: res.status, body: text },
        { status: 502 },
      )
    }

    return NextResponse.json({ ok: true, path })
  } catch (err: any) {
    console.error('new-note error', err)
    return NextResponse.json(
      { error: 'Unexpected error creating note', details: String(err?.message ?? err) },
      { status: 500 },
    )
  }
}
