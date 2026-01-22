'use client'

import { NotionRenderer } from 'react-notion-x'
import { Collection } from 'react-notion-x/build/third-party/collection'
import { useEffect, useState, useRef } from 'react'
import CalendarFallback from './CalendarFallback'

interface NotionPageProps {
  recordMap: any
}

export default function NotionPage({ recordMap }: NotionPageProps) {
  const [useCustomRenderer, setUseCustomRenderer] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  // Check if this is a collection/database page
  const blocks = recordMap.block || {}
  const firstBlockId = Object.keys(blocks)[0]
  const firstBlock = blocks[firstBlockId]
  const isCollectionPage = firstBlock?.value?.type === 'collection_view_page' || firstBlock?.value?.type === 'collection_view'

  // Get view type
  const collectionViewId = Object.keys(recordMap.collection_view || {})[0]
  const viewType = collectionViewId
    ? (recordMap.collection_view[collectionViewId] as any)?.value?.type
    : null

  useEffect(() => {
    // For collection pages, check if react-notion-x actually rendered content
    if (isCollectionPage && containerRef.current) {
      // Give react-notion-x time to render
      const timer = setTimeout(() => {
        const notionContent = containerRef.current?.querySelector('.notion-collection-view-body, .notion-calendar, .notion-table, .notion-board, .notion-gallery, .notion-list')
        const hasContent = notionContent && notionContent.children.length > 0

        if (!hasContent) {
          console.log('Collection view empty, switching to custom renderer')
          setUseCustomRenderer(true)
        }
      }, 1500)

      return () => clearTimeout(timer)
    }
  }, [isCollectionPage])

  useEffect(() => {
    console.log('NotionPage - Page type:', firstBlock?.value?.type, 'View type:', viewType)
  }, [firstBlock, viewType])

  // For collection pages with calendar/table/board views, use custom renderer directly
  // since react-notion-x has known issues with these
  if (isCollectionPage && (viewType === 'calendar' || useCustomRenderer)) {
    return <CalendarFallback recordMap={recordMap} />
  }

  return (
    <div ref={containerRef} className="notion-full-width">
      <NotionRenderer
        recordMap={recordMap}
        fullPage={true}
        darkMode={true}
        mapPageUrl={(id) => `/p/${id}`}
        showCollectionViewDropdown={true}
        disableHeader={false}
        components={{
          Collection,
        }}
      />
    </div>
  )
}
