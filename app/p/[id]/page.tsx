import { notFound } from 'next/navigation'
import { getPageData } from '@/lib/notion'
import NotionPageClient from './NotionPageClient'

export const revalidate = 60

interface PageProps {
  params: { id: string }
}

export default async function Page({ params }: PageProps) {
  const pageId = params.id.replace(/-/g, '')

  let recordMap: any
  try {
    recordMap = await getPageData(pageId)
  } catch (error: any) {
    console.error('Error loading page:', pageId, error?.message)
    notFound()
  }

  if (!recordMap?.block) {
    notFound()
  }

  // Serialize the recordMap to ensure it can be passed to client component
  const serializedRecordMap = JSON.parse(JSON.stringify(recordMap))

  return <NotionPageClient recordMap={serializedRecordMap} />
}
