import { NextRequest, NextResponse } from 'next/server'
import { getPage, getBlocks, updatePageProperties } from '@/lib/notion'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const page = await getPage(params.id)
    const blocks = await getBlocks(params.id)
    return NextResponse.json({ page, blocks })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { properties } = await request.json()
    const result = await updatePageProperties(params.id, properties)
    return NextResponse.json(result)
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
