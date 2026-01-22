import { Client } from '@notionhq/client'
import type {
  BlockObjectResponse,
  PageObjectResponse,
  DatabaseObjectResponse,
  QueryDatabaseResponse,
} from '@notionhq/client/build/src/api-endpoints'

const notion = new Client({
  auth: process.env.NOTION_API_KEY,
})

export async function getPage(pageId: string): Promise<PageObjectResponse> {
  const response = await notion.pages.retrieve({ page_id: pageId })
  return response as PageObjectResponse
}

export async function getDatabase(databaseId: string): Promise<DatabaseObjectResponse> {
  const response = await notion.databases.retrieve({ database_id: databaseId })
  return response as DatabaseObjectResponse
}

export async function queryDatabase(databaseId: string): Promise<QueryDatabaseResponse> {
  const response = await notion.databases.query({
    database_id: databaseId,
    page_size: 100,
  })
  return response
}

export async function getBlocks(blockId: string): Promise<BlockObjectResponse[]> {
  const blocks: BlockObjectResponse[] = []
  let cursor: string | undefined

  while (true) {
    const response = await notion.blocks.children.list({
      block_id: blockId,
      start_cursor: cursor,
      page_size: 100,
    })

    for (const block of response.results) {
      if ('type' in block) {
        blocks.push(block as BlockObjectResponse)

        // Recursively get children for blocks that have them
        if (block.has_children && block.type !== 'child_page' && block.type !== 'child_database') {
          const children = await getBlocks(block.id)
          ;(block as any).children = children
        }
      }
    }

    if (!response.has_more) break
    cursor = response.next_cursor ?? undefined
  }

  return blocks
}

export async function getNavigation(rootPageId: string): Promise<NavItem[]> {
  const blocks = await notion.blocks.children.list({
    block_id: rootPageId,
    page_size: 100,
  })

  const navItems: NavItem[] = []

  for (const block of blocks.results) {
    if ('type' in block) {
      if (block.type === 'child_page') {
        navItems.push({
          id: block.id,
          title: (block as any).child_page?.title || 'Untitled',
          type: 'page',
          icon: '📄',
        })
      } else if (block.type === 'child_database') {
        navItems.push({
          id: block.id,
          title: (block as any).child_database?.title || 'Database',
          type: 'database',
          icon: '📊',
        })
      }
    }
  }

  return navItems
}

export interface NavItem {
  id: string
  title: string
  type: 'page' | 'database'
  icon: string
}

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
    title: getPageTitle(page),
    icon: page.icon?.emoji || '📄',
  }))
}

export function getPageTitle(page: any): string {
  if (!page?.properties) return 'Untitled'

  const titleProp = Object.values(page.properties).find(
    (prop: any) => prop.type === 'title'
  ) as any

  if (titleProp?.title?.[0]?.plain_text) {
    return titleProp.title.map((t: any) => t.plain_text).join('') || 'Untitled'
  }

  return 'Untitled'
}

export function getPageIcon(page: any): string {
  if (page?.icon?.emoji) return page.icon.emoji
  return '📄'
}

export function getDatabasePropertyValue(property: any): string {
  if (!property) return ''

  switch (property.type) {
    case 'title':
      return property.title?.map((t: any) => t.plain_text).join('') || ''
    case 'rich_text':
      return property.rich_text?.map((t: any) => t.plain_text).join('') || ''
    case 'number':
      return property.number?.toString() || ''
    case 'select':
      return property.select?.name || ''
    case 'multi_select':
      return property.multi_select?.map((s: any) => s.name).join(', ') || ''
    case 'date':
      return property.date?.start || ''
    case 'checkbox':
      return property.checkbox ? '✓' : ''
    case 'url':
      return property.url || ''
    case 'email':
      return property.email || ''
    case 'phone_number':
      return property.phone_number || ''
    case 'status':
      return property.status?.name || ''
    case 'people':
      return property.people?.map((p: any) => p.name).join(', ') || ''
    case 'relation':
      return `${property.relation?.length || 0} linked`
    default:
      return ''
  }
}

export { notion }
