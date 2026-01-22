'use client'

import dynamic from 'next/dynamic'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import Sidebar from './Sidebar'
import SearchBar from './SearchBar'

const NotionPage = dynamic(
  () => import('./NotionPage'),
  {
    ssr: false,
    loading: () => (
      <div style={{
        padding: '2rem',
        textAlign: 'center',
        color: 'rgba(255,255,255,0.5)'
      }}>
        Loading content...
      </div>
    )
  }
)

export default function NotionPageClient({ recordMap }: { recordMap: any }) {
  const router = useRouter()
  const [sidebarOpen, setSidebarOpen] = useState(true)

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' })
    router.push('/login')
  }

  return (
    <div style={{ background: '#191919', minHeight: '100vh' }}>
      {/* Sidebar */}
      <Sidebar isOpen={sidebarOpen} onToggle={() => setSidebarOpen(!sidebarOpen)} />

      {/* Main Content */}
      <div style={{
        marginLeft: sidebarOpen ? '240px' : '0',
        transition: 'margin-left 0.2s ease',
        minHeight: '100vh'
      }}>
        {/* Header */}
        <header style={{
          position: 'sticky',
          top: 0,
          zIndex: 100,
          background: '#191919',
          borderBottom: '1px solid rgba(255,255,255,0.1)',
          color: 'rgba(255,255,255,0.81)',
          padding: '0 24px',
          height: '45px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            {!sidebarOpen && (
              <button
                onClick={() => setSidebarOpen(true)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: 'rgba(255,255,255,0.6)',
                  cursor: 'pointer',
                  fontSize: '18px',
                  padding: '4px 8px'
                }}
              >
                ☰
              </button>
            )}
          </div>

          <SearchBar />

          <button onClick={handleLogout} style={{
            background: 'transparent',
            border: '1px solid rgba(255,255,255,0.2)',
            color: 'rgba(255,255,255,0.6)',
            padding: '4px 12px',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '14px'
          }}>
            Logout
          </button>
        </header>

        {/* Page Content */}
        <NotionPage recordMap={recordMap} />
      </div>
    </div>
  )
}
