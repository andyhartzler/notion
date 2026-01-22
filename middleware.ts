import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname

  // Proxy everything except /embed/* to Notion
  if (pathname.startsWith('/embed/')) {
    const response = NextResponse.next()
    response.headers.delete('X-Frame-Options')
    response.headers.set('Content-Security-Policy', 'frame-ancestors *')
    return response
  }

  // Proxy all other paths to Notion (API, assets, etc.)
  const notionUrl = `https://www.notion.so${pathname}${request.nextUrl.search}`
  const cookies = request.headers.get('cookie') || ''

  try {
    const response = await fetch(notionUrl, {
      method: request.method,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': request.headers.get('accept') || '*/*',
        'Accept-Language': 'en-US,en;q=0.9',
        'Content-Type': request.headers.get('content-type') || 'application/json',
        'Referer': 'https://www.notion.so/',
        'Origin': 'https://www.notion.so',
        'Cookie': cookies,
      },
      body: request.method !== 'GET' && request.method !== 'HEAD' ? await request.arrayBuffer() : undefined,
    })

    const contentType = response.headers.get('content-type') || 'application/octet-stream'

    // For text content, rewrite URLs
    if (contentType.includes('text') || contentType.includes('javascript') || contentType.includes('json') || contentType.includes('css')) {
      let text = await response.text()
      const baseUrl = request.nextUrl.origin
      text = text.replace(/https:\/\/www\.notion\.so/g, baseUrl)
      text = text.replace(/https:\/\/notion\.so/g, baseUrl)

      const res = new NextResponse(text, {
        status: response.status,
        headers: {
          'Content-Type': contentType,
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Credentials': 'true',
          'Cache-Control': response.headers.get('cache-control') || 'public, max-age=3600',
        },
      })

      // Forward cookies
      if (typeof response.headers.getSetCookie === 'function') {
        for (const cookie of response.headers.getSetCookie()) {
          let c = cookie.replace(/Domain=[^;]+;?/gi, '').replace(/SameSite=[^;]+/gi, 'SameSite=None')
          if (!c.includes('Secure')) c += '; Secure'
          res.headers.append('Set-Cookie', c)
        }
      }

      return res
    }

    // For binary content, pass through
    const body = await response.arrayBuffer()
    const res = new NextResponse(body, {
      status: response.status,
      headers: {
        'Content-Type': contentType,
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Credentials': 'true',
        'Cache-Control': response.headers.get('cache-control') || 'public, max-age=31536000',
      },
    })

    return res
  } catch (error: any) {
    return new NextResponse(`Error: ${error.message}`, { status: 500 })
  }
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}
