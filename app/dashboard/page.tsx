'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

const PAGES = [
  {
    id: 'command-center',
    title: 'Command Center',
    notionUrl: 'https://andrewhartzler.notion.site/Together-KC-Command-Center-2efc4b28b1ea8174b74fd0a4a148c5d0',
    icon: '🎯'
  },
  {
    id: 'wiki',
    title: 'Campaign Reference Wiki',
    notionUrl: 'https://andrewhartzler.notion.site/Campaign-Reference-Wiki-2efc4b28b1ea81ada46bc5258a27893d',
    icon: '📚'
  }
]

export default function Dashboard() {
  const [activePage, setActivePage] = useState(PAGES[0])
  const router = useRouter()

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' })
    router.push('/login')
  }

  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <header style={{
        background: '#002855',
        color: 'white',
        padding: '0.75rem 1.5rem',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexShrink: 0
      }}>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          {PAGES.map((page) => (
            <button
              key={page.id}
              onClick={() => setActivePage(page)}
              style={{
                background: activePage.id === page.id ? 'rgba(255,255,255,0.2)' : 'transparent',
                border: 'none',
                color: 'white',
                padding: '0.5rem 1rem',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '0.9rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}
            >
              <span>{page.icon}</span>
              {page.title}
            </button>
          ))}
        </div>
        <button
          onClick={handleLogout}
          style={{
            background: 'transparent',
            border: '1px solid rgba(255,255,255,0.3)',
            color: 'white',
            padding: '0.5rem 1rem',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '0.875rem'
          }}
        >
          Logout
        </button>
      </header>

      {/* Notion Embed */}
      <iframe
        src={activePage.notionUrl}
        style={{
          flex: 1,
          width: '100%',
          border: 'none'
        }}
        allowFullScreen
      />
    </div>
  )
}
