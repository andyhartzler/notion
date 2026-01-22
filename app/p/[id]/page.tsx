import { notFound } from 'next/navigation'
import { getPageData } from '@/lib/notion'
import NotionPage from '@/components/NotionPage'

export const revalidate = 60

interface PageProps {
  params: { id: string }
}

export default async function Page({ params }: PageProps) {
  const pageId = params.id.replace(/-/g, '')

  let recordMap: any
  try {
    recordMap = await getPageData(pageId)
  } catch (error) {
    console.error('Failed to load page:', error)
    notFound()
  }

  if (!recordMap || !recordMap.block) {
    notFound()
  }

  return <NotionPage recordMap={recordMap} />
}
