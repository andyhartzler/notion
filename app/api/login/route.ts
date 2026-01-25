import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  const { password } = await request.json()

  // Check password against environment variable
  const correctPassword = process.env.SITE_PASSWORD

  if (!correctPassword) {
    // If no password is set, allow access
    const response = NextResponse.json({ success: true })
    response.cookies.set('auth', 'true', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 1 week
    })
    return response
  }

  if (password === correctPassword) {
    const response = NextResponse.json({ success: true })
    response.cookies.set('auth', 'true', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 1 week
    })
    return response
  }

  return NextResponse.json({ error: 'Incorrect password' }, { status: 401 })
}
