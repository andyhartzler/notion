'use client'

import dynamic from 'next/dynamic'
import { useRouter } from 'next/navigation'

// Import styles
import 'react-notion-x/src/styles.css'
import 'prismjs/themes/prism-tomorrow.css'

const NotionRenderer = dynamic(
  () => import('react-notion-x').then((m) => m.NotionRenderer),
  { ssr: false }
)

export default function NotionPage({ recordMap }: { recordMap: any }) {
  const router = useRouter()

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' })
    router.push('/login')
  }

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
        <span style={{ fontWeight: 600, fontSize: '1rem' }}>Together KC</span>
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
      <NotionRenderer
        recordMap={recordMap}
        fullPage={true}
        darkMode={false}
        mapPageUrl={(id) => `/p/${id}`}
      />
    </div>
  )
}
