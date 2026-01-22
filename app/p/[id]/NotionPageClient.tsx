'use client'

import dynamic from 'next/dynamic'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useEffect, useState, Suspense } from 'react'

// Import NotionRenderer with SSR disabled
const NotionRenderer = dynamic(
  () => import('react-notion-x').then((m) => m.NotionRenderer),
  {
    ssr: false,
    loading: () => <div style={{padding: '2rem', textAlign: 'center'}}>Loading content...</div>
  }
)

// Import Collection component - required for database/collection views
const Collection = dynamic(
  () => import('react-notion-x/build/third-party/collection').then((m) => {
    console.log('Collection component loaded:', m.Collection)
    return m
  }).then((m) => m.Collection),
  {
    ssr: false,
  }
)

export default function NotionPageClient({ recordMap }: { recordMap: any }) {
  const router = useRouter()
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
    // Debug log
    console.log('RecordMap keys:', Object.keys(recordMap))
    console.log('Has collection:', !!recordMap.collection)
    console.log('Collection count:', Object.keys(recordMap.collection || {}).length)
    console.log('Collection view count:', Object.keys(recordMap.collection_view || {}).length)
  }, [recordMap])

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' })
    router.push('/login')
  }

  if (!isClient) {
    return <div style={{padding: '2rem', textAlign: 'center'}}>Loading...</div>
  }

  return (
    <div>
      <header style={{
        position: 'sticky',
        top: 0,
        zIndex: 100,
        background: '#002855',
        color: 'white',
        padding: '0.6rem 1.5rem',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
      }}>
        <Link href="/" style={{ color: 'white', textDecoration: 'none', fontWeight: 600 }}>
          Together KC
        </Link>
        <button onClick={handleLogout} style={{
          background: 'transparent',
          border: '1px solid rgba(255,255,255,0.3)',
          color: 'white',
          padding: '0.4rem 0.8rem',
          borderRadius: '4px',
          cursor: 'pointer'
        }}>
          Logout
        </button>
      </header>

      <NotionRenderer
        recordMap={recordMap}
        fullPage={true}
        darkMode={false}
        mapPageUrl={(id) => `/p/${id}`}
        components={{
          Collection,
        }}
      />
    </div>
  )
}
