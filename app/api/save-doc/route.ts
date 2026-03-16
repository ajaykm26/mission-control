import { NextResponse } from 'next/server'

const GITHUB_OWNER = 'ajaykm26'
const GITHUB_REPO = 'brain'
const GITHUB_API = 'https://api.github.com'

export async function POST(request: Request) {
  try {
    const token = process.env.GITHUB_TOKEN
    if (!token) {
      return NextResponse.json({ error: 'GITHUB_TOKEN is not configured' }, { status: 500 })
    }

    const body = await request.json()
    const { path, content, message } = body as {
      path?: string
      content?: string
      message?: string
    }

    if (!path || typeof path !== 'string') {
      return NextResponse.json({ error: 'Missing or invalid path' }, { status: 400 })
    }
    if (typeof content !== 'string') {
      return NextResponse.json({ error: 'Missing or invalid content' }, { status: 400 })
    }

    const commitMessage = message && typeof message === 'string' && message.trim().length > 0
      ? message.trim()
      : `Update ${path} from Mission Control`

    // 1) Get the current file to obtain its SHA
    const getRes = await fetch(
      `${GITHUB_API}/repos/${GITHUB_OWNER}/${GITHUB_REPO}/contents/${encodeURIComponent(path)}`,
      {
        headers: {
          Accept: 'application/vnd.github.v3+json',
          Authorization: `Bearer ${token}`,
        },
        cache: 'no-store',
      },
    )

    if (!getRes.ok) {
      const text = await getRes.text()
      return NextResponse.json(
        { error: `Failed to fetch file metadata`, status: getRes.status, body: text },
        { status: 502 },
      )
    }

    const fileJson = (await getRes.json()) as { sha?: string }
    if (!fileJson.sha) {
      return NextResponse.json({ error: 'File SHA not found in GitHub response' }, { status: 502 })
    }

    const sha = fileJson.sha
    const encodedContent = Buffer.from(content, 'utf-8').toString('base64')

    // 2) PUT updated content back to GitHub
    const putRes = await fetch(
      `${GITHUB_API}/repos/${GITHUB_OWNER}/${GITHUB_REPO}/contents/${encodeURIComponent(path)}`,
      {
        method: 'PUT',
        headers: {
          Accept: 'application/vnd.github.v3+json',
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: commitMessage,
          content: encodedContent,
          sha,
        }),
      },
    )

    const putBody = await putRes.text()

    if (!putRes.ok) {
      return NextResponse.json(
        { error: 'Failed to update file on GitHub', status: putRes.status, body: putBody },
        { status: 502 },
      )
    }

    return NextResponse.json({ ok: true })
  } catch (err: any) {
    console.error('save-doc error', err)
    return NextResponse.json(
      { error: 'Unexpected error saving document', details: String(err?.message ?? err) },
      { status: 500 },
    )
  }
}
