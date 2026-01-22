'use client'

import dynamic from 'next/dynamic'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

const NotionRenderer = dynamic(
  () => import('react-notion-x').then((m) => m.NotionRenderer),
  { ssr: false }
)

const Collection = dynamic(
  () => import('react-notion-x/build/third-party/collection').then((m) => m.Collection),
  { ssr: false }
)

const Equation = dynamic(
  () => import('react-notion-x/build/third-party/equation').then((m) => m.Equation),
  { ssr: false }
)

const Code = dynamic(
  () => import('react-notion-x/build/third-party/code').then((m) => m.Code),
  { ssr: false }
)

export default function NotionPage({ recordMap, rootPageId }: { recordMap: any; rootPageId: string }) {
  const router = useRouter()

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' })
    router.push('/login')
  }

  const hasContent = recordMap?.block && Object.keys(recordMap.block).length > 0

  return (
    <div>
      {/* Custom Header */}
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
        <Link href="/" style={{ color: 'white', textDecoration: 'none', fontWeight: 600, fontSize: '1rem' }}>
          Together KC
        </Link>
        <button
          onClick={handleLogout}
          style={{
            background: 'transparent',
            border: '1px solid rgba(255,255,255,0.3)',
            color: 'white',
            padding: '0.4rem 0.8rem',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '0.8rem'
          }}
        >
          Logout
        </button>
      </header>

      {/* Notion Content */}
      {hasContent ? (
        <NotionRenderer
          recordMap={recordMap}
          fullPage={true}
          darkMode={false}
          showCollectionViewDropdown={true}
          linkTableTitleProperties={false}
          mapPageUrl={(id) => `/p/${id}`}
          components={{
            Collection,
            Equation,
            Code,
          }}
        />
      ) : (
        <div style={{ padding: '4rem 2rem', textAlign: 'center', color: '#6b6b6b' }}>
          <p>This page couldn't be loaded.</p>
          <Link href="/" style={{ display: 'inline-block', marginTop: '1.5rem', color: '#0077C8' }}>
            ← Back to Command Center
          </Link>
        </div>
      )}
    </div>
  )
}
