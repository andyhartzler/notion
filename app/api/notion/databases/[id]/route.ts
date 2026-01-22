import { NextRequest, NextResponse } from 'next/server'
import { getDatabase, queryDatabase } from '@/lib/notion'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const database = await getDatabase(params.id)
    const results = await queryDatabase(params.id)
    return NextResponse.json({ database, results: results.results })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
