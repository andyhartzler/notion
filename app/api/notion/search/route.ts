import { NextRequest, NextResponse } from 'next/server'
import { searchPages } from '@/lib/notion'

export async function GET(request: NextRequest) {
  const query = request.nextUrl.searchParams.get('q') || ''

  try {
    const results = await searchPages(query)
    return NextResponse.json(results)
  } catch (error: any) {
    console.error('Search error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
