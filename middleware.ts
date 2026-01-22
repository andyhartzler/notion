import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  // Skip auth for API routes, embed routes, and static files
  if (
    request.nextUrl.pathname.startsWith('/api/') ||
    request.nextUrl.pathname.startsWith('/embed/') ||
    request.nextUrl.pathname.startsWith('/_next') ||
    request.nextUrl.pathname === '/login'
  ) {
    // For embed routes, allow iframe embedding
    if (request.nextUrl.pathname.startsWith('/embed/')) {
      const response = NextResponse.next()
      response.headers.delete('X-Frame-Options')
      response.headers.set('Content-Security-Policy', "frame-ancestors *")
      return response
    }
    return NextResponse.next()
  }

  // Check for auth cookie
  const authCookie = request.cookies.get('site-auth')

  if (authCookie?.value === 'authenticated') {
    return NextResponse.next()
  }

  // Redirect to login
  return NextResponse.redirect(new URL('/login', request.url))
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}
