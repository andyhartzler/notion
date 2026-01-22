import { notFound } from 'next/navigation'
import { NotionAPI } from 'notion-client'
import NotionEmbed from './NotionEmbed'

export const revalidate = 60

const notion = new NotionAPI()

interface PageProps {
  params: { id: string }
}

export default async function EmbedPage({ params }: PageProps) {
  const pageId = params.id.replace(/-/g, '')

  let recordMap: any
  try {
    recordMap = await notion.getPage(pageId, {
      fetchMissingBlocks: true,
      fetchCollections: true,
    })
  } catch (error: any) {
    console.error('Error loading page:', pageId, error?.message)
    notFound()
  }

  if (!recordMap?.block) {
    notFound()
  }

  const serializedRecordMap = JSON.parse(JSON.stringify(recordMap))

  return <NotionEmbed recordMap={serializedRecordMap} pageId={pageId} />
}
