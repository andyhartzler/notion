import { NextResponse } from 'next/server'
import { NotionAPI } from 'notion-client'

const notion = new NotionAPI()

interface PageItem {
  id: string
  title: string
  icon: string | null
  children: PageItem[]
}

async function getPageWithChildren(pageId: string): Promise<PageItem[]> {
  try {
    const recordMap = await notion.getPage(pageId.replace(/-/g, ''), {
      fetchMissingBlocks: true,
      fetchCollections: true,
    })

    const blocks = recordMap.block || {}
    const pages: PageItem[] = []
    const processedIds = new Set<string>()

    const processBlock = (blockId: string): PageItem | null => {
      if (processedIds.has(blockId)) return null
      processedIds.add(blockId)

      const block = blocks[blockId]
      if (!block?.value) return null
      const value = block.value

      if (value.type !== 'page' && value.type !== 'collection_view_page') {
        return null
      }

      const title = value.properties?.title?.[0]?.[0] || 'Untitled'
      let icon = value.format?.page_icon || null

      const pageItem: PageItem = {
        id: blockId,
        title,
        icon,
        children: []
      }

      // Get children
      if (value.content && Array.isArray(value.content)) {
        for (const childId of value.content) {
          const childBlock = blocks[childId]
          if (childBlock?.value?.type === 'page' || childBlock?.value?.type === 'collection_view_page') {
            const childTitle = childBlock.value.properties?.title?.[0]?.[0] || 'Untitled'
            const childIcon = childBlock.value.format?.page_icon || null
            pageItem.children.push({
              id: childId,
              title: childTitle,
              icon: childIcon,
              children: []
            })
          }
        }
      }

      return pageItem
    }

    // Get the page content
    const rootBlock = blocks[pageId.replace(/-/g, '')]
    if (rootBlock?.value?.content) {
      for (const blockId of rootBlock.value.content) {
        const page = processBlock(blockId)
        if (page) {
          pages.push(page)
        }
      }
    }

    return pages
  } catch (error) {
    console.error('Error fetching page:', pageId, error)
    return []
  }
}

export async function GET() {
  try {
    const rootPageId = process.env.NOTION_ROOT_PAGE_ID || '2efc4b28b1ea8174b74fd0a4a148c5d0'

    // Fetch main command center page
    const mainRecordMap = await notion.getPage(rootPageId.replace(/-/g, ''), {
      fetchMissingBlocks: true,
      fetchCollections: true,
    })

    const blocks = mainRecordMap.block || {}
    const pages: PageItem[] = []
    const processedIds = new Set<string>()

    // Wiki page ID from the user's URL
    const wikiPageId = '2efc4b28b1ea81ada46bc5258a27893d'

    // Process main page content
    const rootBlock = blocks[rootPageId.replace(/-/g, '')]
    if (rootBlock?.value?.content) {
      for (const blockId of rootBlock.value.content) {
        if (processedIds.has(blockId)) continue
        processedIds.add(blockId)

        const block = blocks[blockId]
        if (!block?.value) continue
        const value = block.value

        // Handle alias/link blocks
        let targetId = blockId
        let targetBlock = block
        if (value.type === 'alias') {
          targetId = value.format?.alias_pointer?.id || blockId
          targetBlock = blocks[targetId] || block
        }

        const targetValue = targetBlock?.value
        if (!targetValue) continue

        if (targetValue.type === 'page' || targetValue.type === 'collection_view_page') {
          const title = targetValue.properties?.title?.[0]?.[0] || 'Untitled'
          const icon = targetValue.format?.page_icon || null

          const pageItem: PageItem = {
            id: targetId,
            title,
            icon,
            children: []
          }

          // Get direct children from the same recordMap
          if (targetValue.content && Array.isArray(targetValue.content)) {
            for (const childId of targetValue.content) {
              const childBlock = blocks[childId]
              if (childBlock?.value?.type === 'page' || childBlock?.value?.type === 'collection_view_page') {
                pageItem.children.push({
                  id: childId,
                  title: childBlock.value.properties?.title?.[0]?.[0] || 'Untitled',
                  icon: childBlock.value.format?.page_icon || null,
                  children: []
                })
              }
            }
          }

          // Special handling for wiki page - fetch its children separately
          if (targetId.replace(/-/g, '') === wikiPageId.replace(/-/g, '') ||
              title.toLowerCase().includes('wiki') ||
              title.toLowerCase().includes('reference')) {
            const wikiChildren = await getPageWithChildren(targetId)
            if (wikiChildren.length > 0) {
              // The wiki page itself was returned, get its children
              pageItem.children = wikiChildren
            }
          }

          pages.push(pageItem)
        }
      }
    }

    // If wiki not found in main page, fetch it directly
    const hasWiki = pages.some(p =>
      p.id.replace(/-/g, '') === wikiPageId.replace(/-/g, '') ||
      p.title.toLowerCase().includes('wiki')
    )

    if (!hasWiki) {
      try {
        const wikiRecordMap = await notion.getPage(wikiPageId, {
          fetchMissingBlocks: true,
        })
        const wikiBlocks = wikiRecordMap.block || {}
        const wikiBlock = wikiBlocks[wikiPageId]

        if (wikiBlock?.value) {
          const wikiPage: PageItem = {
            id: wikiPageId,
            title: wikiBlock.value.properties?.title?.[0]?.[0] || 'Campaign Reference Wiki',
            icon: wikiBlock.value.format?.page_icon || '📚',
            children: []
          }

          if (wikiBlock.value.content) {
            for (const childId of wikiBlock.value.content) {
              const childBlock = wikiBlocks[childId]
              if (childBlock?.value?.type === 'page' || childBlock?.value?.type === 'collection_view_page') {
                wikiPage.children.push({
                  id: childId,
                  title: childBlock.value.properties?.title?.[0]?.[0] || 'Untitled',
                  icon: childBlock.value.format?.page_icon || null,
                  children: []
                })
              }
            }
          }

          pages.push(wikiPage)
        }
      } catch (e) {
        console.error('Error fetching wiki:', e)
      }
    }

    return NextResponse.json({ pages })
  } catch (error: any) {
    console.error('Error fetching pages:', error)
    return NextResponse.json({ pages: [], error: error.message }, { status: 500 })
  }
}

export const dynamic = 'force-dynamic'
export const revalidate = 0
