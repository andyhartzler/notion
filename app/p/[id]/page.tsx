import { notFound } from 'next/navigation'
import { getPageData } from '@/lib/notion'
import NotionPage from '@/components/NotionPage'

export const revalidate = 60
export const dynamic = 'force-dynamic'

interface PageProps {
  params: { id: string }
}

export default async function Page({ params }: PageProps) {
  const pageId = params.id.replace(/-/g, '')

  console.log('[Page] Loading page:', pageId)

  let recordMap: any
  try {
    recordMap = await getPageData(pageId)
    console.log('[Page] Got recordMap, blocks:', Object.keys(recordMap?.block || {}).length)
  } catch (error: any) {
    console.error('[Page] Error loading page:', pageId, error?.message || error)
    notFound()
  }

  if (!recordMap?.block) {
    console.error('[Page] No blocks in recordMap for:', pageId)
    notFound()
  }

  return <NotionPage recordMap={recordMap} rootPageId={pageId} />
}
