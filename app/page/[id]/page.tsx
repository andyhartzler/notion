import { notFound } from 'next/navigation'
import { Metadata } from 'next'
import { getPage, getBlocks, getNavigation, getPageTitle, getPageIcon, getDatabase, queryDatabase } from '@/lib/notion'
import Header from '@/components/Header'
import Sidebar from '@/components/Sidebar'
import PageContent from './PageContent'
import DatabaseView from '@/components/DatabaseView'

interface PageProps {
  params: { id: string }
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  try {
    const page = await getPage(params.id)
    const title = getPageTitle(page)
    return {
      title: `${title} | Together KC`,
      description: `Together KC Campaign - ${title}`,
    }
  } catch {
    return {
      title: 'Together KC',
    }
  }
}

export default async function NotionPage({ params }: PageProps) {
  const rootPageId = process.env.NOTION_ROOT_PAGE_ID

  let page: any
  let blocks: any[] = []
  let navItems: any[] = []
  let isDatabase = false
  let databaseData: any = null

  try {
    // Try to get as page first
    page = await getPage(params.id)
    blocks = await getBlocks(params.id)
  } catch (error: any) {
    // If page fails, try as database
    try {
      const db = await getDatabase(params.id)
      const dbResults = await queryDatabase(params.id)
      isDatabase = true
      databaseData = { database: db, results: dbResults.results }
      page = { properties: { title: { type: 'title', title: [{ plain_text: (db as any).title?.[0]?.plain_text || 'Database' }] } }, icon: db.icon }
    } catch {
      notFound()
    }
  }

  // Get navigation from root page
  if (rootPageId) {
    try {
      navItems = await getNavigation(rootPageId)
    } catch {
      navItems = []
    }
  }

  const title = getPageTitle(page)
  const icon = getPageIcon(page)

  return (
    <>
      <Header />
      <div className="layout-with-sidebar">
        <Sidebar items={navItems} currentPageId={params.id} rootPageId={rootPageId || ''} />
        <main className="main-content">
          <div className="page-content">
            <h1 className="page-title">
              <span style={{ marginRight: '0.5rem' }}>{icon}</span>
              {title}
            </h1>
            {isDatabase ? (
              <DatabaseView data={databaseData} />
            ) : (
              <PageContent blocks={blocks} pageId={params.id} />
            )}
          </div>
        </main>
      </div>
    </>
  )
}
