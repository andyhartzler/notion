import { NextRequest, NextResponse } from 'next/server'
import { updateBlock, appendBlocks } from '@/lib/notion'

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const content = await request.json()
    const result = await updateBlock(params.id, content)
    return NextResponse.json(result)
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { children } = await request.json()
    const result = await appendBlocks(params.id, children)
    return NextResponse.json(result)
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
