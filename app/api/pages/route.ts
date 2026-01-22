import { NextResponse } from 'next/server'
import { NotionAPI } from 'notion-client'

const notion = new NotionAPI()

interface PageItem {
  id: string
  title: string
  icon: string | null
  children: PageItem[]
}

async function getAllPages(rootPageId: string): Promise<PageItem[]> {
  const recordMap = await notion.getPage(rootPageId.replace(/-/g, ''), {
    fetchMissingBlocks: true,
    fetchCollections: true,
  })

  const blocks = recordMap.block || {}
  const pages: PageItem[] = []
  const processedIds = new Set<string>()

  // Helper to extract page info
  const getPageInfo = (blockId: string, block: any): PageItem | null => {
    if (!block?.value) return null
    const value = block.value

    if (value.type !== 'page' && value.type !== 'collection_view_page') {
      return null
    }

    const title = value.properties?.title?.[0]?.[0] || 'Untitled'
    let icon = null
    if (value.format?.page_icon) {
      icon = value.format.page_icon
    }

    return {
      id: blockId,
      title,
      icon,
      children: []
    }
  }

  // Recursively process blocks
  const processBlock = (blockId: string, depth: number = 0): PageItem | null => {
    if (processedIds.has(blockId) || depth > 5) return null
    processedIds.add(blockId)

    const block = blocks[blockId]
    if (!block?.value) return null

    const value = block.value

    // Handle page and collection_view_page
    if (value.type === 'page' || value.type === 'collection_view_page') {
      const pageInfo = getPageInfo(blockId, block)
      if (!pageInfo) return null

      // Process children
      if (value.content && Array.isArray(value.content)) {
        for (const childId of value.content) {
          const childPage = processBlock(childId, depth + 1)
          if (childPage) {
            pageInfo.children.push(childPage)
          }
        }
      }

      return pageInfo
    }

    // Handle alias/link_to_page
    if (value.type === 'alias') {
      const linkedId = value.format?.alias_pointer?.id
      if (linkedId && blocks[linkedId]) {
        return processBlock(linkedId, depth)
      }
    }

    return null
  }

  // Get root page content
  const rootBlock = blocks[rootPageId.replace(/-/g, '')]
  if (rootBlock?.value?.content) {
    for (const blockId of rootBlock.value.content) {
      const page = processBlock(blockId)
      if (page) {
        pages.push(page)
      }
    }
  }

  // Also find any pages that are direct children of space but linked from root
  for (const [blockId, blockData] of Object.entries(blocks)) {
    const block = blockData as any
    if (processedIds.has(blockId)) continue

    if (block?.value?.type === 'page' || block?.value?.type === 'collection_view_page') {
      // Check if it's a top-level page that we haven't processed
      const parentId = block.value.parent_id?.replace(/-/g, '')
      const rootId = rootPageId.replace(/-/g, '')

      if (parentId === rootId) {
        const page = processBlock(blockId)
        if (page) {
          pages.push(page)
        }
      }
    }
  }

  return pages
}

export async function GET() {
  try {
    const rootPageId = process.env.NOTION_ROOT_PAGE_ID || '2efc4b28b1ea8174b74fd0a4a148c5d0'
    const pages = await getAllPages(rootPageId)

    return NextResponse.json({ pages })
  } catch (error: any) {
    console.error('Error fetching pages:', error)
    return NextResponse.json({ pages: [], error: error.message }, { status: 500 })
  }
}

export const dynamic = 'force-dynamic'
export const revalidate = 0
