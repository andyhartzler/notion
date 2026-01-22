import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname

  // Let /embed/* routes pass through to the route handler
  if (pathname.startsWith('/embed/')) {
    const response = NextResponse.next()
    response.headers.delete('X-Frame-Options')
    response.headers.set('Content-Security-Policy', 'frame-ancestors *')
    return response
  }

  // Determine cache time based on path type
  // Assets are immutable (hashed filenames), cache forever
  // API calls need fresh data, cache briefly
  const isAsset = pathname.startsWith('/_assets/') || pathname.startsWith('/images/') || pathname.startsWith('/icons/')
  const isApi = pathname.startsWith('/api/')
  const cacheTime = isAsset ? 31536000 : (isApi ? 60 : 3600)

  // Use notion.site which may have different rate limits
  const notionUrl = `https://andrewhartzler.notion.site${pathname}${request.nextUrl.search}`
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
      // @ts-ignore - Next.js extended fetch
      next: { revalidate: cacheTime }
    })

    const contentType = response.headers.get('content-type') || 'application/octet-stream'

    // For text content, rewrite URLs
    if (contentType.includes('text') || contentType.includes('javascript') || contentType.includes('json') || contentType.includes('css')) {
      let text = await response.text()
      const baseUrl = request.nextUrl.origin
      text = text.replace(/https:\/\/www\.notion\.so/g, baseUrl)
      text = text.replace(/https:\/\/notion\.so/g, baseUrl)
      text = text.replace(/https:\/\/andrewhartzler\.notion\.site/g, baseUrl)

      const res = new NextResponse(text, {
        status: response.status,
        headers: {
          'Content-Type': contentType,
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Credentials': 'true',
          'Cache-Control': `public, s-maxage=${cacheTime}, stale-while-revalidate=${cacheTime * 2}`,
        },
      })

      if (typeof response.headers.getSetCookie === 'function') {
        for (const cookie of response.headers.getSetCookie()) {
          let c = cookie.replace(/Domain=[^;]+;?/gi, '').replace(/SameSite=[^;]+/gi, 'SameSite=None')
          if (!c.includes('Secure')) c += '; Secure'
          res.headers.append('Set-Cookie', c)
        }
      }

      return res
    }

    // For binary content, pass through with aggressive caching
    const body = await response.arrayBuffer()
    const res = new NextResponse(body, {
      status: response.status,
      headers: {
        'Content-Type': contentType,
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Credentials': 'true',
        'Cache-Control': `public, s-maxage=${cacheTime}, stale-while-revalidate=${cacheTime * 2}`,
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
