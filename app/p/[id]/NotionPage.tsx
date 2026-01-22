'use client'

import { NotionRenderer } from 'react-notion-x'
import { Collection } from 'react-notion-x/build/third-party/collection'
import { useEffect } from 'react'

interface NotionPageProps {
  recordMap: any
}

export default function NotionPage({ recordMap }: NotionPageProps) {
  useEffect(() => {
    // Debug log
    console.log('NotionPage mounted')
    console.log('RecordMap keys:', Object.keys(recordMap))
    console.log('Has collection:', !!recordMap.collection, 'count:', Object.keys(recordMap.collection || {}).length)
    console.log('Has collection_view:', !!recordMap.collection_view, 'count:', Object.keys(recordMap.collection_view || {}).length)
    console.log('Has collection_query:', !!recordMap.collection_query, 'count:', Object.keys(recordMap.collection_query || {}).length)

    if (recordMap.collection_view) {
      for (const [id, view] of Object.entries(recordMap.collection_view as Record<string, any>)) {
        console.log('View:', id, 'type:', view?.value?.type, 'name:', view?.value?.name)
      }
    }
  }, [recordMap])

  return (
    <NotionRenderer
      recordMap={recordMap}
      fullPage={true}
      darkMode={false}
      mapPageUrl={(id) => `/p/${id}`}
      showCollectionViewDropdown={true}
      components={{
        Collection,
      }}
    />
  )
}
