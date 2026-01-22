import { NextResponse } from 'next/server'
import { NotionAPI } from 'notion-client'

const notion = new NotionAPI()

export async function GET() {
  try {
    // Fetch the root page to get all linked pages
    const rootPageId = process.env.NOTION_ROOT_PAGE_ID || '2efc4b28b1ea8174b74fd0a4a148c5d0'
    const recordMap = await notion.getPage(rootPageId.replace(/-/g, ''))

    const pages: Array<{
      id: string
      title: string
      icon: string | null
      children: Array<{ id: string; title: string; icon: string | null }>
    }> = []

    // Extract pages from the recordMap
    const blocks = recordMap.block || {}

    // Get the root page's content blocks
    const rootBlock = blocks[Object.keys(blocks)[0]]?.value
    const contentIds = rootBlock?.content || []

    // Process each block in the root page
    for (const blockId of contentIds) {
      const block = blocks[blockId]?.value
      if (!block) continue

      // Handle page links and child pages
      if (block.type === 'page' || block.type === 'collection_view_page') {
        const title = block.properties?.title?.[0]?.[0] || 'Untitled'
        let icon = null

        // Get icon - can be emoji or external URL
        if (block.format?.page_icon) {
          icon = block.format.page_icon
        }

        const pageItem: any = {
          id: blockId,
          title,
          icon,
          children: []
        }

        // Check for nested pages
        if (block.content) {
          for (const childId of block.content) {
            const childBlock = blocks[childId]?.value
            if (childBlock && (childBlock.type === 'page' || childBlock.type === 'collection_view_page')) {
              const childTitle = childBlock.properties?.title?.[0]?.[0] || 'Untitled'
              let childIcon = null
              if (childBlock.format?.page_icon) {
                childIcon = childBlock.format.page_icon
              }
              pageItem.children.push({
                id: childId,
                title: childTitle,
                icon: childIcon
              })
            }
          }
        }

        pages.push(pageItem)
      }

      // Handle link_to_page blocks (alias type)
      if ((block.type as string) === 'link_to_page' || block.type === 'alias') {
        const linkedPageId = (block as any).format?.alias_pointer?.id || (block as any).page_id
        if (linkedPageId && blocks[linkedPageId]) {
          const linkedBlock = (blocks[linkedPageId] as any).value
          const title = linkedBlock?.properties?.title?.[0]?.[0] || 'Untitled'
          let icon = null
          if (linkedBlock?.format?.page_icon) {
            icon = linkedBlock.format.page_icon
          }
          pages.push({
            id: linkedPageId,
            title,
            icon,
            children: []
          })
        }
      }
    }

    // Also scan for any page blocks that might be linked
    for (const [blockId, blockData] of Object.entries(blocks)) {
      const block = (blockData as any)?.value
      if (!block) continue

      // Skip if already added
      if (pages.find(p => p.id === blockId)) continue

      // Only include top-level pages (parent is the root or space)
      if (block.type === 'page' || block.type === 'collection_view_page') {
        if (block.parent_id === rootPageId.replace(/-/g, '') || block.parent_table === 'space') {
          const title = block.properties?.title?.[0]?.[0] || 'Untitled'
          let icon = null
          if (block.format?.page_icon) {
            icon = block.format.page_icon
          }

          // Skip if no title or is the root page itself
          if (title && blockId !== rootPageId.replace(/-/g, '')) {
            pages.push({
              id: blockId,
              title,
              icon,
              children: []
            })
          }
        }
      }
    }

    return NextResponse.json({ pages })
  } catch (error: any) {
    console.error('Error fetching pages:', error)
    return NextResponse.json({ pages: [], error: error.message }, { status: 500 })
  }
}
