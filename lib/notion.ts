import { NotionAPI } from 'notion-client'
import { Client } from '@notionhq/client'

// Unofficial API for fast reading (used by react-notion-x)
const notionClient = new NotionAPI()

// Official API for writing/editing
const notion = new Client({
  auth: process.env.NOTION_API_KEY,
})

// Reading (fast, unofficial)
export async function getPageData(pageId: string) {
  const recordMap = await notionClient.getPage(pageId)
  return recordMap
}

export function getPageTitle(recordMap: any): string {
  const pageBlock = Object.values(recordMap.block)[0] as any
  return pageBlock?.value?.properties?.title?.[0]?.[0] || 'Untitled'
}

// Writing (official API)
export async function updateBlock(blockId: string, content: any) {
  return notion.blocks.update({
    block_id: blockId,
    ...content,
  })
}

export async function appendBlocks(pageId: string, children: any[]) {
  return notion.blocks.children.append({
    block_id: pageId,
    children,
  })
}

export async function updatePageProperties(pageId: string, properties: any) {
  return notion.pages.update({
    page_id: pageId,
    properties,
  })
}

export async function searchPages(query: string) {
  const response = await notion.search({
    query,
    filter: { property: 'object', value: 'page' },
    page_size: 20,
  })

  return response.results.map((page: any) => ({
    id: page.id,
    title: page.properties?.title?.title?.[0]?.plain_text || 'Untitled',
    icon: page.icon?.emoji || '📄',
  }))
}

export async function getDatabase(databaseId: string) {
  return notion.databases.retrieve({ database_id: databaseId })
}

export async function queryDatabase(databaseId: string) {
  return notion.databases.query({
    database_id: databaseId,
    page_size: 100,
  })
}
