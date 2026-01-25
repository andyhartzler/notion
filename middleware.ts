import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Allow access to login page, API, and countdown widget
  if (pathname === '/' || pathname.startsWith('/api/') || pathname === '/countdown') {
    const response = NextResponse.next()
    // Allow iframe embedding for countdown
    if (pathname === '/countdown') {
      response.headers.delete('X-Frame-Options')
      response.headers.set('Content-Security-Policy', 'frame-ancestors *')
    }
    return response
  }

  // Check for auth cookie
  const isAuthenticated = request.cookies.get('auth')?.value === 'true'

  if (!isAuthenticated) {
    // Redirect to login
    return NextResponse.redirect(new URL('/', request.url))
  }

  // Allow iframe embedding for embed routes
  if (pathname.startsWith('/embed/')) {
    const response = NextResponse.next()
    response.headers.delete('X-Frame-Options')
    response.headers.set('Content-Security-Policy', 'frame-ancestors *')
    return response
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}
