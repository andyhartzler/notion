'use client'

import { NotionRenderer } from 'react-notion-x'
import { Collection } from 'react-notion-x/build/third-party/collection'
import { useEffect, Component, ReactNode } from 'react'

interface NotionPageProps {
  recordMap: any
}

// Error boundary to catch rendering errors
class ErrorBoundary extends Component<
  { children: ReactNode; fallback: ReactNode },
  { hasError: boolean; error: Error | null }
> {
  constructor(props: { children: ReactNode; fallback: ReactNode }) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: any) {
    console.error('NotionRenderer error:', error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: '2rem', color: '#666' }}>
          <h2>Error rendering page</h2>
          <p>{this.state.error?.message}</p>
          <pre style={{ fontSize: '12px', overflow: 'auto' }}>
            {this.state.error?.stack}
          </pre>
        </div>
      )
    }
    return this.props.children
  }
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

    // Log first block type
    const blocks = recordMap.block || {}
    const firstBlockId = Object.keys(blocks)[0]
    if (firstBlockId) {
      console.log('First block type:', blocks[firstBlockId]?.value?.type)
    }
  }, [recordMap])

  // Check if this is a collection/database page
  const blocks = recordMap.block || {}
  const firstBlockId = Object.keys(blocks)[0]
  const firstBlock = blocks[firstBlockId]
  const isCollectionPage = firstBlock?.value?.type === 'collection_view_page' || firstBlock?.value?.type === 'collection_view'

  // Get page title for collection pages
  const collectionIds = Object.keys(recordMap.collection || {})
  const collectionName = collectionIds.length > 0
    ? recordMap.collection[collectionIds[0]]?.value?.name?.[0]?.[0]
    : 'Database'

  return (
    <ErrorBoundary
      fallback={
        <div style={{ padding: '2rem', color: '#666' }}>
          <p>Unable to render this page. Check browser console for errors.</p>
        </div>
      }
    >
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

      {/* Debug info for collection pages - remove after testing */}
      {isCollectionPage && (
        <div style={{
          padding: '1rem',
          margin: '1rem',
          background: '#f0f0f0',
          borderRadius: '4px',
          fontSize: '12px'
        }}>
          <strong>Debug Info:</strong>
          <br />Page Type: {firstBlock?.value?.type}
          <br />Collection: {collectionName}
          <br />Block Count: {Object.keys(blocks).length}
          <br />Collection Views: {Object.keys(recordMap.collection_view || {}).length}
          <br />Collection Query Items: {
            Object.values(recordMap.collection_query || {})
              .flatMap((coll: any) => Object.values(coll))
              .reduce((sum: number, view: any) => sum + (view?.collection_group_results?.blockIds?.length || 0), 0)
          }
        </div>
      )}
    </ErrorBoundary>
  )
}
