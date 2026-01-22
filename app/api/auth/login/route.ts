import { NextRequest, NextResponse } from 'next/server'

const SITE_PASSWORD = process.env.SITE_PASSWORD || '1p4win'

export async function POST(request: NextRequest) {
  const { password } = await request.json()

  if (password === SITE_PASSWORD) {
    const response = NextResponse.json({ success: true })
    response.cookies.set('site-auth', 'authenticated', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 1 week
    })
    return response
  }

  return NextResponse.json({ success: false, error: 'Invalid password' }, { status: 401 })
}
