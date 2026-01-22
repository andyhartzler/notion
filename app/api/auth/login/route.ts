import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  const { password } = await request.json()
  const expected = process.env.SITE_PASSWORD?.trim() || '1p4win'

  if (password === expected) {
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
