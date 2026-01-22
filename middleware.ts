import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  // Allow iframe embedding for embed routes
  if (request.nextUrl.pathname.startsWith('/embed/')) {
    const response = NextResponse.next()
    response.headers.delete('X-Frame-Options')
    response.headers.set('Content-Security-Policy', 'frame-ancestors *')
    return response
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/embed/:path*'],
}
