import { NextRequest, NextResponse } from 'next/server'

function parseCookies(cookieHeader: string | null) {
  if (!cookieHeader) return {}
  return Object.fromEntries(cookieHeader.split(';').map(s => s.trim().split('=').map(decodeURIComponent)))
}

export async function GET(request: NextRequest) {
  try {
    const headersObj: Record<string, string | null> = {}
    for (const [k, v] of request.headers.entries()) {
      headersObj[k] = v
    }

    const cookies = parseCookies(request.headers.get('cookie'))

    return NextResponse.json({ headers: headersObj, cookies })
  } catch (err) {
    console.error('Debug headers error', err)
    return NextResponse.json({ error: 'failed' }, { status: 500 })
  }
}
