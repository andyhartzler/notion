import { NextRequest, NextResponse } from 'next/server'

export const runtime = 'edge'

// Cache pages for 5 minutes to avoid rate limiting
export const revalidate = 300

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const pageId = params.id
  const baseUrl = request.nextUrl.origin

  // Use notion.site which may have different rate limits
  const notionUrl = `https://andrewhartzler.notion.site/${pageId}`

  const response = await fetch(notionUrl, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      'Accept-Language': 'en-US,en;q=0.9',
    },
    // Cache at the fetch level too
    next: { revalidate: 300 }
  })

  if (!response.ok) {
    return new NextResponse('Failed to fetch', { status: response.status })
  }

  let html = await response.text()

  html = html.replace(/https:\/\/www\.notion\.so/g, baseUrl)
  html = html.replace(/https:\/\/notion\.so/g, baseUrl)
  html = html.replace(/https:\/\/andrewhartzler\.notion\.site/g, baseUrl)

  const res = new NextResponse(html, {
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Credentials': 'true',
      'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
    },
  })

  if (typeof response.headers.getSetCookie === 'function') {
    for (const cookie of response.headers.getSetCookie()) {
      let c = cookie
        .replace(/Domain=[^;]+;?/gi, '')
        .replace(/SameSite=[^;]+/gi, 'SameSite=None')
      if (!c.includes('Secure')) c += '; Secure'
      res.headers.append('Set-Cookie', c)
    }
  }

  return res
}
