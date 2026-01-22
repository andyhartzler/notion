import { notFound } from 'next/navigation'
import { Suspense } from 'react'
import { getPage, getBlocks, getNavigation, getPageTitle, getPageIcon } from '@/lib/notion'
import Header from '@/components/Header'
import Sidebar from '@/components/Sidebar'
import { NotionBlockList } from '@/components/NotionBlock'

// Cache pages for 60 seconds, revalidate in background
export const revalidate = 60

interface PageProps {
  params: { id: string }
}

async function PageContent({ id }: { id: string }) {
  let page: any
  let blocks: any[] = []

  try {
    page = await getPage(id)
    blocks = await getBlocks(id)
  } catch (error) {
    notFound()
  }

  const title = getPageTitle(page)
  const icon = getPageIcon(page)

  return (
    <div className="page-content">
      <h1 className="page-title">
        <span style={{ marginRight: '0.5rem' }}>{icon}</span>
        {title}
      </h1>
      <NotionBlockList blocks={blocks} />
    </div>
  )
}

async function Nav({ rootPageId, currentPageId }: { rootPageId: string; currentPageId: string }) {
  let navItems: any[] = []
  try {
    navItems = await getNavigation(rootPageId)
  } catch {
    navItems = []
  }
  return <Sidebar items={navItems} currentPageId={currentPageId} rootPageId={rootPageId} />
}

export default async function NotionPage({ params }: PageProps) {
  const rootPageId = process.env.NOTION_ROOT_PAGE_ID || ''

  return (
    <>
      <Header />
      <div className="layout-with-sidebar">
        <Suspense fallback={<div className="sidebar" style={{ padding: '1rem' }}>Loading...</div>}>
          <Nav rootPageId={rootPageId} currentPageId={params.id} />
        </Suspense>
        <main className="main-content">
          <Suspense fallback={<div className="loading">Loading page...</div>}>
            <PageContent id={params.id} />
          </Suspense>
        </main>
      </div>
    </>
  )
}
