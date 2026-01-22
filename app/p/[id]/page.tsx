import { notFound } from 'next/navigation'
import { getPageData } from '@/lib/notion'
import NotionPage from '@/components/NotionPage'

export const revalidate = 60

interface PageProps {
  params: { id: string }
}

export default async function Page({ params }: PageProps) {
  // Clean up page ID - remove dashes and handle various formats
  const pageId = params.id.replace(/-/g, '')

  let recordMap: any
  try {
    recordMap = await getPageData(pageId)
  } catch (error: any) {
    console.error('Failed to load page:', pageId, error?.message || error)
    notFound()
  }

  if (!recordMap?.block || Object.keys(recordMap.block).length === 0) {
    console.error('Empty recordMap for page:', pageId)
    notFound()
  }

  return <NotionPage recordMap={recordMap} rootPageId={pageId} />
}
