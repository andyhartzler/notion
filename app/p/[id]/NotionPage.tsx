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
    console.log('Has collection:', !!recordMap.collection)
    console.log('Has collection_view:', !!recordMap.collection_view)
    console.log('Has collection_query:', !!recordMap.collection_query)

    if (recordMap.collection) {
      console.log('Collections:', Object.keys(recordMap.collection))
    }
    if (recordMap.collection_view) {
      console.log('Collection views:', Object.keys(recordMap.collection_view))
    }
  }, [recordMap])

  return (
    <NotionRenderer
      recordMap={recordMap}
      fullPage={true}
      darkMode={false}
      mapPageUrl={(id) => `/p/${id}`}
      components={{
        Collection,
      }}
    />
  )
}
