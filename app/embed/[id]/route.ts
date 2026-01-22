import { NextRequest, NextResponse } from 'next/server'

export const runtime = 'edge'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const pageId = params.id
  const baseUrl = request.nextUrl.origin

  // Fetch directly from notion.so (exactly like embednotion.com does)
  const notionUrl = `https://www.notion.so/${pageId}`

  const response = await fetch(notionUrl, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      'Accept-Language': 'en-US,en;q=0.9',
    },
  })

  if (!response.ok) {
    return new NextResponse('Failed to fetch', { status: response.status })
  }

  let html = await response.text()

  // Rewrite ALL notion URLs to go through our proxy
  html = html.replace(/https:\/\/www\.notion\.so/g, baseUrl)
  html = html.replace(/https:\/\/notion\.so/g, baseUrl)

  // Build response with proper headers
  const res = new NextResponse(html, {
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Credentials': 'true',
    },
  })

  // Forward cookies with SameSite=None for iframe support
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
